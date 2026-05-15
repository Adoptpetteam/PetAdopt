const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const {
  getHealthRecords,
  getHealthStats,
  getPetHealthProfile,
  createHealthRecord,
  updateHealthRecord,
  deleteHealthRecord
} = require('../controllers/healthRecordController');

// Get comprehensive pet health profile
router.get('/pet/:petId/profile', authenticate, getPetHealthProfile);

// Get health statistics for a pet (must be before /pet/:petId)
router.get('/pet/:petId/stats', authenticate, getHealthStats);

// Get health records for a pet
router.get('/pet/:petId', authenticate, getHealthRecords);

// Create health record
router.post('/pet/:petId', authenticate, createHealthRecord);

// Update health record
router.put('/:recordId', authenticate, updateHealthRecord);

// Delete health record
router.delete('/:recordId', authenticate, deleteHealthRecord);

module.exports = router;
