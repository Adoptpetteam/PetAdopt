const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

// Public routes
router.get('/:type/:id', reviewController.getReviews);

// Protected routes (require login)
router.post('/', authenticate, reviewController.createReview);
router.put('/:id', authenticate, reviewController.updateReview);
router.delete('/:id', authenticate, reviewController.deleteReview);
router.post('/:id/helpful', authenticate, reviewController.voteHelpful);

// Admin routes
router.get('/admin/all', authenticate, isAdmin, reviewController.getAllReviews);
router.post('/:id/response', authenticate, isAdmin, reviewController.adminResponse);

module.exports = router;
