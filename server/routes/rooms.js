const router = require('express').Router();
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');

// GET /api/rooms?checkIn=&checkOut=&guests=&type=
// With dates, only rooms that are free for the whole stay are returned.
router.get('/', async (req, res) => {
  try {
    const { checkIn, checkOut, guests, type } = req.query;
    const filter = { isActive: true };
    if (type) filter.type = type;
    if (guests) filter.capacity = { $gte: Number(guests) };

    let rooms = await Room.find(filter).sort('pricePerNight');

    if (checkIn && checkOut) {
      const busy = await Booking.find({
        status: { $ne: 'cancelled' },
        checkIn: { $lt: new Date(checkOut) },
        checkOut: { $gt: new Date(checkIn) },
      }).distinct('room');
      const busySet = new Set(busy.map(String));
      rooms = rooms.filter((r) => !busySet.has(String(r._id)));
    }
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch {
    res.status(404).json({ message: 'Room not found' });
  }
});

// Admin-only management
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    res.status(201).json(await Room.create(req.body));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Room.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Room removed from listings' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
