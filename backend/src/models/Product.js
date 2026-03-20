const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    trim: true,
  },
  imageUrl: {
    type: String,
    default: 'https://placehold.co/150x150?text=Not+Available',
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  stock: {
    type: Number,
    default: 100,
    min: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);