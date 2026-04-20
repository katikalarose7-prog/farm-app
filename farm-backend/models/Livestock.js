// models/Livestock.js
// Defines what a "livestock animal" looks like in our database

const mongoose = require('mongoose');

const livestockSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,      // Can't be empty
    trim: true           // Removes extra spaces
  },
  type: {
    type: String,
    required: true,
    enum: ['goat', 'buffalo', 'hen', 'cow', 'other'] // Only these values allowed
  },
  count: {
    type: Number,
    required: true,
    min: 1               // Must be at least 1
  },
  breed: {
    type: String,
    default: 'Local'     // Default value if not provided
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true       // Auto-adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Livestock', livestockSchema);