// farm-backend/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type:     String,
    required: true,
    trim:     true
  },
  description: {
    type:    String,
    default: ''
  },
  emoji: {
    type:    String,
    default: '📦'
  },
  unit: {
    type:     String,
    required: true
  },
  pricePerUnit: {
    type:     Number,
    required: true,
    min:      0
  },
  stock: {
    type:    Number,
    default: 0,
    min:     0
  },
  minOrderQty: {
    type:    Number,
    default: 1,
    min:     1
  },
  published: {
    type:    Boolean,
    default: false   // Admin must explicitly publish
  },
  available: {
    type:    Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);