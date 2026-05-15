const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');
const { authenticate } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');
const { 
  petValidation, 
  handleValidationErrors, 
  sanitizeInput,
  generalRateLimit 
} = require('../middleware/validation');
const multer = require('multer');
const path = require('path');

// Apply rate limiting and input sanitization
router.use(generalRateLimit);
router.use(sanitizeInput);

// 📁 Secure file upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/pets/');
  },
  filename: (req, file, cb) => {
    // Generate secure filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'pet-' + uniqueSuffix + ext);
  }
});

// File filter for security
const fileFilter = (req, file, cb) => {
  // Allow only image files
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép upload file ảnh (JPEG, JPG, PNG, GIF, WebP)'));
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 files
  }
});

// ===== PUBLIC =====
router.get('/', petController.getAllPets);
router.get('/:id', petController.getPetById);

// ===== PROTECTED =====
router.post('/', 
  authenticate, 
  upload.array('images', 5),
  petValidation.create,
  handleValidationErrors,
  petController.createPet
);

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
