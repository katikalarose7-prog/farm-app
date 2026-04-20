// controllers/workerController.js
const Worker = require('../models/Worker');

// GET all workers
exports.getAllWorkers = async (req, res) => {
  try {
    const workers = await Worker.find().sort({ createdAt: -1 });
    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST add worker
exports.addWorker = async (req, res) => {
  try {
    const worker = new Worker(req.body);
    const saved = await worker.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
};

// PUT update worker details
exports.updateWorker = async (req, res) => {
  try {
    const updated = await Worker.findByIdAndUpdate(
      req.params.id, req.body, { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Worker not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Update error' });
  }
};

// DELETE worker
exports.deleteWorker = async (req, res) => {
  try {
    await Worker.findByIdAndDelete(req.params.id);
    res.json({ message: 'Worker deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Delete error' });
  }
};

// POST mark attendance for a worker
// Called when: POST /api/workers/:id/attendance
exports.markAttendance = async (req, res) => {
  try {
    const { date, present } = req.body;
    const worker = await Worker.findById(req.params.id);
    if (!worker) return res.status(404).json({ message: 'Worker not found' });

    // Check if attendance for this date already exists
    const existingIndex = worker.attendance.findIndex(
      a => new Date(a.date).toDateString() === new Date(date).toDateString()
    );

    if (existingIndex > -1) {
      // Update existing entry
      worker.attendance[existingIndex].present = present;
    } else {
      // Add new entry
      worker.attendance.push({ date, present });
    }

    await worker.save();
    res.json(worker);
  } catch (error) {
    res.status(500).json({ message: 'Attendance error', error: error.message });
  }
};