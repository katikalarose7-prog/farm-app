// farm-backend/routes/orders.js
const express = require('express');
const router  = express.Router();
const orderController = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

// Customer
router.post('/',    protect, orderController.placeOrder);
router.get('/mine', protect, orderController.getMyOrders);

// Admin
router.get('/revenue',       protect, adminOnly, orderController.getRevenue);
router.get('/unread-count',  protect, adminOnly, orderController.getUnreadCount);
router.put('/mark-all-read', protect, adminOnly, orderController.markAllRead);
router.get('/',              protect, adminOnly, orderController.getAllOrders);
router.put('/:id/read',      protect, adminOnly, orderController.markOrderRead);
router.put('/:id/status',    protect, adminOnly, orderController.updateOrderStatus);

module.exports = router;