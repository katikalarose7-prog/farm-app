// farm-backend/controllers/categoryController.js
const ProductionCategory = require('../models/ProductionCategory');

exports.getCategories = async (req, res) => {
  try {
    const cats = await ProductionCategory.find().sort({ createdAt: 1 });
    if (cats.length === 0) {
      const defaults = await ProductionCategory.insertMany([
        { name: 'Milk', unit: 'liters', emoji: '🥛', isDefault: true },
        { name: 'Eggs', unit: 'count',  emoji: '🥚', isDefault: true },
      ]);
      return res.json(defaults);
    }
    res.json(cats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

exports.addCategory = async (req, res) => {
  try {
    const { name, unit, emoji } = req.body;
    if (!name || !unit) {
      return res.status(400).json({ message: 'Name and unit are required.' });
    }
    const exists = await ProductionCategory.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
    if (exists) {
      return res.status(400).json({ message: `Category "${name}" already exists.` });
    }
    const cat = await ProductionCategory.create({ name, unit, emoji: emoji || '📦' });
    res.status(201).json(cat);
  } catch (error) {
    res.status(400).json({ message: 'Error creating category', error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const cat = await ProductionCategory.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Category not found.' });
    if (cat.isDefault) {
      return res.status(400).json({ message: 'Cannot delete built-in categories.' });
    }
    await ProductionCategory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category' });
  }
};