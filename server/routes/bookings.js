const router = require('express').Router();
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');

const NIGHT = 1000 * 60 * 60 * 24;

// POST /api/bookings  - guest books a room
router.post('/', protect, async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, guests } = req.body;
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);

    if (isNaN(inDate) || isNaN(outDate) || outDate <= inDate) {
      return res.status(400).json({ message: 'Check-out must be after check-in' });
    }
    const today = new Date().setHours(0, 0, 0, 0);
    if (inDate < today) return res.status(400).json({ message: 'Check-in cannot be in the past' });

    const room = await Room.findById(roomId);
    if (!room || !room.isActive) return res.status(404).json({ message: 'Room not found' });
    if (guests > room.capacity) {
      return res.status(400).json({ message: `This room sleeps up to ${room.capacity} guests` });
    }

    // Double-booking guard: any non-cancelled booking that overlaps the dates
    const clash = await Booking.findOne({
      room: room._id,
      status: { $ne: 'cancelled' },
      checkIn: { $lt: outDate },
      checkOut: { $gt: inDate },
    });
    if (clash) return res.status(409).json({ message: 'Room is already booked for those dates' });

    const nights = Math.round((outDate - inDate) / NIGHT);
    const booking = await Booking.create({
      user: req.user._id,
      room: room._id,
      checkIn: inDate,
      checkOut: outDate,
      guests,
      totalPrice: nights * room.pricePerNight,
      paymentStatus: 'paid', // demo: swap for Stripe/Razorpay confirmation
    });
    res.status(201).json(await booking.populate('room'));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/bookings/mine
router.get('/mine', protect, async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id }).populate('room').sort('-createdAt');
  res.json(bookings);
});

// PATCH /api/bookings/:id/cancel  - owner or staff/admin
router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const isOwner = String(booking.user) === String(req.user._id);
    if (!isOwner && !['staff', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not allowed' });
    }
    if (booking.status !== 'confirmed') {
      return res.status(400).json({ message: 'Only confirmed bookings can be cancelled' });
    }
    booking.status = 'cancelled';
    if (booking.paymentStatus === 'paid') booking.paymentStatus = 'refunded';
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---- Staff / admin ----

// GET /api/bookings  - all bookings
router.get('/', protect, authorize('staff', 'admin'), async (req, res) => {
  const bookings = await Booking.find().populate('room').populate('user', 'name email phone').sort('-createdAt');
  res.json(bookings);
});

// PATCH /api/bookings/:id/status  - check-in / check-out
router.patch('/:id/status', protect, authorize('staff', 'admin'), async (req, res) => {
  const { status } = req.body;
  if (!['checked-in', 'checked-out'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  res.json(booking);
});

// GET /api/bookings/stats/summary  - dashboard numbers
router.get('/stats/summary', protect, authorize('staff', 'admin'), async (req, res) => {
  const [rooms, active, revenue, checkedIn] = await Promise.all([
    Room.countDocuments({ isActive: true }),
    Booking.countDocuments({ status: { $in: ['confirmed', 'checked-in'] } }),
    Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    Booking.countDocuments({ status: 'checked-in' }),
  ]);
  res.json({
    rooms,
    activeBookings: active,
    revenue: revenue[0]?.total || 0,
    occupancy: rooms ? Math.round((checkedIn / rooms) * 100) : 0,
  });
});

module.exports = router;
