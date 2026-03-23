const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getAllUsers } = require('../controllers/userController');

router.get('/', protect, adminOnly, getAllUsers);

module.exports = router;