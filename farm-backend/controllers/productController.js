// farm-backend/controllers/productController.js
const Product = require('../models/Product');

// GET published products only (customer shop)
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({
      published: true,
      available: true
    }).sort({ createdAt: 1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products.', error: error.message });
  }
};

// GET all products including unpublished (admin)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products.' });
  }
};

// POST add product (admin)
exports.addProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: 'Error adding product.', error: error.message });
  }
};

// PUT update product (admin)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: 'Error updating product.' });
  }
};

// DELETE product (admin)
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product.' });
  }
};