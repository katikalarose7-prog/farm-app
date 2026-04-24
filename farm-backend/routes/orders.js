// farm-backend/routes/orders.js
const express = require('express');
const router  = express.Router();
const {
  placeOrder, getMyOrders,
  getAllOrders, getUnreadCount,
  markOrderRead, markAllRead,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

// Customer routes — must be logged in
router.post('/',        protect, placeOrder);   // Place order
router.get('/mine',     protect, getMyOrders);  // My orders

// Admin routes
router.get('/',              protect, adminOnly, getAllOrders);
router.get('/unread-count',  protect, adminOnly, getUnreadCount);
router.put('/mark-all-read', protect, adminOnly, markAllRead);
router.put('/:id/read',      protect, adminOnly, markOrderRead);
router.put('/:id/status',    protect, adminOnly, updateOrderStatus);

module.exports = router;