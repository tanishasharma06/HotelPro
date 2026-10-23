// Run once:  npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Room = require('./models/Room');
const Booking = require('./models/Booking');

const rooms = [
  { number: '101', type: 'single', pricePerNight: 1800, capacity: 1, amenities: ['Wi-Fi', 'AC', 'Desk'], description: 'A quiet single room for solo travellers.' },
  { number: '102', type: 'double', pricePerNight: 2800, capacity: 2, amenities: ['Wi-Fi', 'AC', 'TV'], description: 'Queen bed with a garden-facing window.' },
  { number: '201', type: 'deluxe', pricePerNight: 4200, capacity: 3, amenities: ['Wi-Fi', 'AC', 'Mini bar', 'Balcony'], description: 'Spacious room with a private balcony.' },
  { number: '301', type: 'suite', pricePerNight: 7500, capacity: 4, amenities: ['Wi-Fi', 'AC', 'Mini bar', 'Lounge', 'Bathtub'], description: 'Top-floor suite with a separate lounge.' },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User.deleteMany(), Room.deleteMany(), Booking.deleteMany()]);
  await User.create({ name: 'Admin', email: 'admin@hotelpro.com', password: 'admin123', role: 'admin' });
  await User.create({ name: 'Front Desk', email: 'staff@hotelpro.com', password: 'staff123', role: 'staff' });
  await User.create({ name: 'Demo Guest', email: 'guest@hotelpro.com', password: 'guest123' });
  await Room.insertMany(rooms);
  console.log('Seeded. Admin: admin@hotelpro.com / admin123');
  process.exit(0);
})();
