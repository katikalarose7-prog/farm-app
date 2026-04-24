// farm-backend/routes/products.js
const express = require('express');
const router  = express.Router();
const {
  getProducts, getAllProducts, addProduct, updateProduct
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');

// Public
router.get('/', getProducts);

// Admin
router.get('/all',   protect, getAllProducts);
router.post('/',     protect, addProduct);
router.put('/:id',   protect, updateProduct);

module.exports = router;