const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');
const { authenticate } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');
const multer = require('multer');

// 📁 cấu hình upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// ===== PUBLIC =====
router.get('/', petController.getAllPets);
router.get('/:id', petController.getPetById);

// ===== PROTECTED =====

// 👉 TEST trước: chỉ cần login
router.post(
  '/',
  authenticate,
  upload.array('images', 10),
  petController.createPet
);

// 👉 Sau khi OK thì bật lại admin
// router.post('/', authenticate, isAdmin, upload.array('images', 10), petController.createPet);

router.put(
  '/:id',
  authenticate,
  upload.array('images', 10),
  petController.updatePet
);

router.delete(
  '/:id',
  authenticate,
  petController.deletePet
);

module.exports = router;