// models/Worker.js
// Stores worker info, salary, and attendance records

const mongoose = require('mongoose');

// Sub-schema for individual attendance entries
const attendanceSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  present: { type: Boolean, default: true }
});

const workerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    default: 'Farm Worker'
  },
  monthlySalary: {
    type: Number,
    required: true,
    min: 0
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  attendance: [attendanceSchema]  // Array of attendance records
}, {
  timestamps: true
});

module.exports = mongoose.model('Worker', workerSchema);