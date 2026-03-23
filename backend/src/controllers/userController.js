const User = require('../models/User');

const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;

    const filter = role ? { role } : {};
    
    const users = await User.find(filter)
      .select('-password -__v')
      .sort({ createdAt: -1 })
      .lean();

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

module.exports = { getAllUsers };