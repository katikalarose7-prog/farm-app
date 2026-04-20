// farm-backend/controllers/authController.js
const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// Helper to generate a JWT token for a user id
function generateToken(id) {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }   // Token valid for 30 days
  );
}

// ---- REGISTER ----
// POST /api/auth/register
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please fill all fields.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  try {
    // Check if email already used
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // Create user — password is auto-hashed by the model's pre-save hook
    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      token: generateToken(user._id),  // Send token immediately after register
    });
  } catch (error) {
      console.error("🔥 REGISTER ERROR FULL:", error); // 👈 ADD THIS

  res.status(500).json({
    message: 'Registration failed.',
    error: error.message
  });  }
};

// ---- LOGIN ----
// POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter email and password.' });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'No account found with this email.' });
    }

    // Check password using our model method
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    res.json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed.', error: error.message });
  }
};

// ---- GET PROFILE ----
// GET /api/auth/profile  (protected)
exports.getProfile = async (req, res) => {
  // req.user is set by the protect middleware
  res.json({
    _id:   req.user._id,
    name:  req.user.name,
    email: req.user.email,
    role:  req.user.role,
  });
};