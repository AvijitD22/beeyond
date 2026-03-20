const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET all available products (public)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ isAvailable: true }).select('-__v');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;