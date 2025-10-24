const mongoose = require('mongoose');

// This is a "sub-document" schema
const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu',
    required: true,
  },
  qty: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'ready', 'served'],
    default: 'pending',
  },
});

const orderSchema = new mongoose.Schema(
  {
    tableId: {
      type: String, // e.g., "5"
      required: true,
    },
    items: [orderItemSchema], // An array of the schema above
    total: {
      type: Number,
      required: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
); // Adds createdAt and updatedAt

module.exports = mongoose.model('Order', orderSchema);