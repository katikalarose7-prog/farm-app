// farm-backend/routes/auth.js
const express = require('express');
const router  = express.Router();

const {
  register,
  login,
  customerRegister,
  customerLogin,
  getProfile,
  updateProfile,
  getAllUsers,
  updateUserRole
} = require('../controllers/authController');

const { protect, adminOnly } = require('../middleware/auth');

// ---- Admin auth ----
router.post('/register', register);
router.post('/login',    login);

// ---- Customer auth ----
router.post('/customer/register', customerRegister);
router.post('/customer/login',    customerLogin);

// ---- Profile ----
router.get('/profile',  protect, getProfile);
router.put('/profile',  protect, updateProfile);

// ---- Admin user management ----
router.get('/users',           protect, adminOnly, getAllUsers);
router.put('/users/:id/role',  protect, adminOnly, updateUserRole);

module.exports = router;