// farm-backend/controllers/productionController.js
const Production = require('../models/Production');

// GET all production records
exports.getAllProduction = async (req, res) => {
  try {
    const records = await Production.find().sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST add production entry
exports.addProduction = async (req, res) => {
  try {
    const record = new Production(req.body);
    const saved  = await record.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
};

// GET today's production
exports.getTodayProduction = async (req, res) => {
  try {
    const today    = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const record   = await Production.findOne({ date: { $gte: today, $lt: tomorrow } });
    res.json(record || { milkLiters: 0, eggsCount: 0, entries: [] });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching today production' });
  }
};

// DELETE a record
exports.deleteProduction = async (req, res) => {
  try {
    await Production.findByIdAndDelete(req.params.id);
    res.json({ message: 'Record deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Delete error' });
  }
};

// GET last 7 days — for dashboard chart
exports.getLast7Days = async (req, res) => {
  try {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date    = new Date(); date.setDate(date.getDate() - i); date.setHours(0,0,0,0);
      const nextDay = new Date(date); nextDay.setDate(nextDay.getDate() + 1);
      const record  = await Production.findOne({ date: { $gte: date, $lt: nextDay } });
      days.push({
        day:  date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
        milk: record?.milkLiters || 0,
        eggs: record?.eggsCount  || 0,
      });
    }
    res.json(days);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chart data' });
  }
};