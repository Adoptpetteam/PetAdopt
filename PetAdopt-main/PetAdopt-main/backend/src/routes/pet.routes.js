const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');
const { optionalAuthenticate } = require('../middleware/authMiddleware');

router.get('/', optionalAuthenticate, petController.getAllPets);
router.get('/:id', optionalAuthenticate, petController.getPetById);
router.post('/', optionalAuthenticate, petController.createPet);
router.put('/:id', optionalAuthenticate, petController.updatePet);
router.delete('/:id', optionalAuthenticate, petController.deletePet);

module.exports = router;
