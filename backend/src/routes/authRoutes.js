const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');


router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user });   // or fetch full user if needed
});


module.exports = router;