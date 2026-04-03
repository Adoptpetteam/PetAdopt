const express = require('express');
const router = express.Router();
const adoptionRequestController = require('../controllers/adoptionRequestController');
const { optionalAuthenticate } = require('../middleware/authMiddleware');

router.get('/', optionalAuthenticate, adoptionRequestController.getAllAdoptionRequests);
router.get('/:id', optionalAuthenticate, adoptionRequestController.getAdoptionRequestById);
router.post('/', optionalAuthenticate, adoptionRequestController.createAdoptionRequest);
router.patch('/:id', optionalAuthenticate, adoptionRequestController.updateAdoptionRequest);
router.put('/:id', optionalAuthenticate, adoptionRequestController.updateAdoptionRequest);
router.delete('/:id', optionalAuthenticate, adoptionRequestController.deleteAdoptionRequest);

module.exports = router;
