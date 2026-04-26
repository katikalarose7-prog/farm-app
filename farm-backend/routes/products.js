// farm-backend/routes/products.js
const express = require('express');
const router  = express.Router();
const productController = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');

// ✅ PUBLIC — no protect middleware
router.get('/', productController.getProducts);

// Admin only
router.get('/all',    protect, adminOnly, productController.getAllProducts);
router.post('/',      protect, adminOnly, productController.addProduct);
router.put('/:id',    protect, adminOnly, productController.updateProduct);
router.delete('/:id', protect, adminOnly, productController.deleteProduct);

module.exports = router;