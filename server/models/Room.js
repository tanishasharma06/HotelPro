const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    number: { type: String, required: true, unique: true },
    type: { type: String, enum: ['single', 'double', 'deluxe', 'suite'], required: true },
    pricePerNight: { type: Number, required: true, min: 0 },
    capacity: { type: Number, required: true, min: 1 },
    description: { type: String, default: '' },
    amenities: [String],
    image: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Room', roomSchema);
