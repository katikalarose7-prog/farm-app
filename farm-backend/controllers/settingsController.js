// farm-backend/controllers/settingsController.js
const Settings = require('../models/Settings');

exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ milkPrice: 40, eggPrice: 6 });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { milkPrice, eggPrice } = req.body;
    if (milkPrice <= 0 || eggPrice <= 0) {
      return res.status(400).json({ message: 'Prices must be greater than 0.' });
    }
    const settings = await Settings.findOneAndUpdate(
      {},
      { milkPrice, eggPrice },
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error saving settings', error: error.message });
  }
};