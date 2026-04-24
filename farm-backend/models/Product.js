// farm-backend/models/Product.js
// Products available for customers to order

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String, default: ''    },
  emoji:       { type: String, default: '📦'  },
  unit:        { type: String, required: true }, // e.g. "dozen", "liter", "kg"
  pricePerUnit:{ type: Number, required: true },
  available:   { type: Boolean, default: true },
  stock:       { type: Number, default: 0     }, // 0 = unlimited
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);