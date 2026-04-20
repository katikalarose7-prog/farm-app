// routes/workers.js
const express = require('express');
const router = express.Router();
const {
  getAllWorkers,
  addWorker,
  updateWorker,
  deleteWorker,
  markAttendance
} = require('../controllers/workerController');

router.get('/', getAllWorkers);                       // GET /api/workers
router.post('/', addWorker);                          // POST /api/workers
router.put('/:id', updateWorker);                     // PUT /api/workers/:id
router.delete('/:id', deleteWorker);                  // DELETE /api/workers/:id
router.post('/:id/attendance', markAttendance);       // POST /api/workers/:id/attendance

module.exports = router;