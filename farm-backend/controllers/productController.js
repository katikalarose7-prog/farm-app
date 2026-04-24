// farm-backend/controllers/productController.js
const Product = require('../models/Product');

// GET all available products (public)
exports.getProducts = async (req, res) => {
  try {
    let products = await Product.find({ available: true }).sort({ createdAt: 1 });

    // Seed default products if none exist
    if (products.length === 0) {
      products = await Product.insertMany([
        { name: 'Fresh Milk',    emoji: '🥛', unit: 'liter',  pricePerUnit: 50,  description: 'Pure fresh buffalo milk, delivered daily', available: true },
        { name: 'Farm Eggs',     emoji: '🥚', unit: 'dozen',  pricePerUnit: 80,  description: 'Free-range country eggs, pack of 12',      available: true },
        { name: 'Country Ghee',  emoji: '🫙', unit: '500g',   pricePerUnit: 350, description: 'Pure hand-churned desi ghee',               available: true },
        { name: 'Goat Milk',     emoji: '🐐', unit: 'liter',  pricePerUnit: 70,  description: 'Nutritious fresh goat milk',                available: true },
      ]);
    }
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products.' });
  }
};

// GET all products including unavailable (admin)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: 1 });
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
      req.params.id, req.body, { new: true }
    );
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: 'Error updating product.' });
  }
};