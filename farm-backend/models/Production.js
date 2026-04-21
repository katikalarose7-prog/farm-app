// farm-backend/models/Production.js
const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  categoryId:   { type: mongoose.Schema.Types.ObjectId, ref: 'ProductionCategory' },
  categoryName: { type: String },
  unit:         { type: String },
  emoji:        { type: String },
  value:        { type: Number, default: 0, min: 0 }
}, { _id: false }); // _id: false keeps entries clean

const productionSchema = new mongoose.Schema({
  date:       { type: Date, required: true, default: Date.now },
  milkLiters: { type: Number, default: 0, min: 0 },
  eggsCount:  { type: Number, default: 0, min: 0 },
  entries:    [entrySchema],
  notes:      { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Production', productionSchema);