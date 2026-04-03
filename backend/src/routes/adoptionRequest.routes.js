const express = require('express');
const router = express.Router();
const adoptionRequestController = require('../controllers/adoptionRequestController');
const { authenticate } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

router.post('/', authenticate, adoptionRequestController.createAdoptionRequest);
router.get('/me', authenticate, adoptionRequestController.getMyAdoptionRequests);
router.patch('/me/:id/cancel', authenticate, adoptionRequestController.cancelMyAdoptionRequest);

router.get('/admin/all', authenticate, isAdmin, adoptionRequestController.getAllAdoptionRequests);
router.patch('/admin/:id/process', authenticate, isAdmin, adoptionRequestController.processAdoptionRequest);

module.exports = router;
