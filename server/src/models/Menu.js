const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  photoUrl: { type: String },
  kitchen_id: {
    type: Number,
    required: true,
    enum: [1, 2], // Enforces that it can only be Kitchen 1 or 2
  },
  isSuspended: { type: Boolean, default: false }, // New field for suspension status
});

module.exports = mongoose.model('Menu', menuSchema);