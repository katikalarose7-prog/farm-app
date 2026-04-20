// controllers/livestockController.js
const Livestock = require('../models/Livestock');

// GET all livestock
// Called when: GET /api/livestock
exports.getAllLivestock = async (req, res) => {
  try {
    const animals = await Livestock.find().sort({ createdAt: -1 });
    res.json(animals);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST add new livestock
// Called when: POST /api/livestock
exports.addLivestock = async (req, res) => {
  try {
    const animal = new Livestock(req.body); // req.body = data sent from React
    const saved = await animal.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
};

// PUT update livestock
// Called when: PUT /api/livestock/:id
exports.updateLivestock = async (req, res) => {
  try {
    const updated = await Livestock.findByIdAndUpdate(
      req.params.id,  // The ID from the URL
      req.body,
      { new: true }   // Return the updated document
    );
    if (!updated) return res.status(404).json({ message: 'Animal not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Update error', error: error.message });
  }
};

// DELETE livestock
// Called when: DELETE /api/livestock/:id
exports.deleteLivestock = async (req, res) => {
  try {
    const deleted = await Livestock.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Animal not found' });
    res.json({ message: 'Animal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Delete error', error: error.message });
  }
};

// GET summary (total animals per type) — used for dashboard
exports.getLivestockSummary = async (req, res) => {
  try {
    const summary = await Livestock.aggregate([
      {
        $group: {
          _id: '$type',
          totalCount: { $sum: '$count' }
        }
      }
    ]);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching summary' });
  }
};