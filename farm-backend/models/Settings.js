// farm-backend/models/Settings.js
const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  milkPrice: { type: Number, default: 40 },
  eggPrice:  { type: Number, default: 6  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);