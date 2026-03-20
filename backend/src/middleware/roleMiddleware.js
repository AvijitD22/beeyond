const deliveryOnly = (req, res, next) => {
  if (req.user && req.user.role === 'delivery') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied: Delivery partners only' });
  }
};

module.exports = { deliveryOnly };