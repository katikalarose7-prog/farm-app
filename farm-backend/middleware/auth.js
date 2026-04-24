// farm-backend/middleware/auth.js
const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token — used on all protected routes
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ message: 'Not authorized. Please log in.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user      = await User.findById(decoded.id).select('-password');
    next();
  } catch {
    return res.status(401).json({ message: 'Token invalid or expired.' });
  }
};

// Admin only — use after protect
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required.' });
  }
};

module.exports = { protect, adminOnly };