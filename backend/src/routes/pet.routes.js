const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');
const { authenticate } = require('../middleware/authMiddleware');  
const { isAdmin } = require('../middleware/adminMiddleware');

router.get('/', petController.getAllPets);           
router.get('/:id', petController.getPetById);        


router.post('/', authenticate, petController.createPet);      
router.put('/:id', authenticate, isAdmin, petController.updatePet);    
router.delete('/:id', authenticate, isAdmin, petController.deletePet); 

module.exports = router;
