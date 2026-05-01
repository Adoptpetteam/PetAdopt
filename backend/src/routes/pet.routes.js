const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');
const { authenticate } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

router.get('/', petController.getAllPets);
router.get('/:id', petController.getPetById);

router.post('/', authenticate, isAdmin, upload.array('images', 10), petController.createPet);
router.put('/:id', authenticate, isAdmin, upload.array('images', 10), petController.updatePet);
router.delete('/:id', authenticate, isAdmin, petController.deletePet);

module.exports = router;