// farm-backend/models/ProductionCategory.js
const mongoose = require('mongoose');


const productionCategorySchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  unit:      { type: String, required: true, trim: true },
  emoji:     { type: String, default: '📦' },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });


module.exports = mongoose.model('ProductionCategory', productionCategorySchema);