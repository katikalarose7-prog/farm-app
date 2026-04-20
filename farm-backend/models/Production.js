// models/Production.js
// Tracks daily milk and egg production

const mongoose = require('mongoose');

const productionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  milkLiters: {
    type: Number,
    default: 0,
    min: 0
  },
  eggsCount: {
    type: Number,
    default: 0,
    min: 0
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Production', productionSchema);