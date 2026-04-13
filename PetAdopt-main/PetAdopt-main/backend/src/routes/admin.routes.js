const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

router.get('/dashboard', authenticate, isAdmin, adminController.getDashboardStats);
router.get('/pets', authenticate, isAdmin, adminController.getAllPetsAdmin);
router.put('/pets/:id/approve', authenticate, isAdmin, adminController.approvePet);
router.put('/pets/:id/reject', authenticate, isAdmin, adminController.rejectPet);
router.get('/users', authenticate, isAdmin, adminController.getAllUsers);
router.put('/users/:id/ban', authenticate, isAdmin, adminController.banUser);
router.put('/users/:id/unban', authenticate, isAdmin, adminController.unbanUser);

module.exports = router;
