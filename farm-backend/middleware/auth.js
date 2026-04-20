// farm-backend/middleware/auth.js
// This function runs BEFORE any protected route
// It checks that the request has a valid JWT token

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // JWT is sent in the Authorization header as: "Bearer <token>"
  if (req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized. Please log in.' });
  }

  try {
    // Verify token using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user to the request object
    // Now any controller can access req.user
    req.user = await User.findById(decoded.id).select('-password');

    next(); // ✅ Token valid — proceed to the route
  } catch (error) {
    return res.status(401).json({ message: 'Token invalid or expired. Please log in again.' });
  }
};

module.exports = { protect };