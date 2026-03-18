const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/', petController.getAllPets);           
router.get('/:id', petController.getPetById);        

router.post('/', authenticate, petController.createPet);      
router.put('/:id', authenticate, petController.updatePet);    
router.delete('/:id', authenticate, petController.deletePet); 

module.exports = router;