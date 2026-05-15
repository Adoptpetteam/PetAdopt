const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

// Admin routes (PHẢI ĐẶT TRƯỚC các routes có params)
router.get('/admin/all', authenticate, isAdmin, reviewController.getAllReviews);
router.post('/:id/response', authenticate, isAdmin, reviewController.adminResponse);

// Public routes
router.get('/:type/:id', reviewController.getReviews);

// Protected routes (require login)
router.post('/', authenticate, reviewController.createReview);
router.put('/:id', authenticate, reviewController.updateReview);
router.delete('/:id', authenticate, reviewController.deleteReview);
router.post('/:id/helpful', authenticate, reviewController.voteHelpful);

module.exports = router;
