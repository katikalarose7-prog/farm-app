// routes/livestock.js
const express = require('express');
const router = express.Router();
const {
  getAllLivestock,
  addLivestock,
  updateLivestock,
  deleteLivestock,
  getLivestockSummary
} = require('../controllers/livestockController');

router.get('/summary', getLivestockSummary);  // GET /api/livestock/summary
router.get('/', getAllLivestock);              // GET /api/livestock
router.post('/', addLivestock);               // POST /api/livestock
router.put('/:id', updateLivestock);          // PUT /api/livestock/:id
router.delete('/:id', deleteLivestock);       // DELETE /api/livestock/:id

module.exports = router;