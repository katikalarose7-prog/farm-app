// farm-backend/controllers/authController.js
const jwt  = require('jsonwebtoken');
const User = require('../models/User');

function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

// ---- CUSTOMER REGISTER ----
// POST /api/auth/customer/register
exports.customerRegister = async (req, res) => {
    console.log('📥 Body received:', req.body); // ← ADD THIS

  const { name, email, password, phone, address } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please fill all required fields.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // Customers are always role: customer — no way to register as admin
    const user = await User.create({
      name, email, password,
      phone:   phone   || '',
      address: address || '',
      role:    'customer'
    });

    res.status(201).json({
      _id:     user._id,
      name:    user.name,
      email:   user.email,
      phone:   user.phone,
      address: user.address,
      role:    user.role,
      token:   generateToken(user._id),
    });
  } catch (error) {
        console.log('❌ FULL ERROR:', error.message);

    res.status(500).json({ message: 'Registration failed.', error: error.message });
  }
};

// ---- CUSTOMER LOGIN ----
// POST /api/auth/customer/login
exports.customerLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter email and password.' });
  }
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'No account found with this email.' });
    }

    // Make sure they are logging in as a customer
    if (user.role !== 'customer') {
      return res.status(403).json({
        message: 'Please use the Admin login page.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    res.json({
      _id:     user._id,
      name:    user.name,
      email:   user.email,
      phone:   user.phone,
      address: user.address,
      role:    user.role,
      token:   generateToken(user._id),
    });
  } catch (error) {
        console.log('❌ Login error:', error.message);

    res.status(500).json({ message: 'Login failed.', error: error.message });
  }
};

// ---- ADMIN REGISTER ----
// POST /api/auth/register
exports.register = async (req, res) => {
    console.log('📥 Register request body:', req.body); // ← see what's coming in

  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please fill all fields.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const userCount    = await User.countDocuments({ role: { $in: ['admin','guest'] } });
    const assignedRole = userCount === 0 ? 'admin' : 'guest';

    const user = await User.create({ name, email, password, role: assignedRole });

    res.status(201).json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
        console.log('❌ Customer register error:', error); // ← full error details

    res.status(500).json({ message: 'Registration failed.', error: error.message });
  }
};

// ---- ADMIN LOGIN ----
// POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter email and password.' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'No account found with this email.' });
    }

    // Block customers from admin login
    if (user.role === 'customer') {
      return res.status(403).json({
        message: 'Please use the Customer login page.'
      });
    }

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
exports.getProfile = async (req, res) => {
  res.json({
    _id:     req.user._id,
    name:    req.user.name,
    email:   req.user.email,
    phone:   req.user.phone,
    address: req.user.address,
    role:    req.user.role,
  });
};

// ---- UPDATE PROFILE (customer) ----
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Could not update profile.' });
  }
};

// ---- GET ALL USERS (admin) ----
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users.' });
  }
};

// ---- UPDATE USER ROLE (admin) ----
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'guest', 'customer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id, { role }, { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating role.' });
  }
};