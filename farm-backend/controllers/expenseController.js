// controllers/expenseController.js
const Expense = require('../models/Expense');

// GET all expenses
exports.getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST add expense
exports.addExpense = async (req, res) => {
  try {
    const expense = new Expense(req.body);
    const saved = await expense.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
};

// DELETE expense
exports.deleteExpense = async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Delete error' });
  }
};

// GET total expenses this month
exports.getMonthlyTotal = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const result = await Expense.aggregate([
      { $match: { date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({ total: result[0]?.total || 0 });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating total' });
  }
};