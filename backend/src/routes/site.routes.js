const express = require('express');
const router = express.Router();

const siteController = require('../controllers/siteController');
const { authenticate } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

// Public routes
router.get('/content', siteController.getSiteContent);
router.post('/contact', siteController.submitContactMessage);
router.post('/volunteer-applications', siteController.submitVolunteerApplication);
router.post('/donations', siteController.submitDonationIntent);

// Admin routes
router.get('/admin/inbox', authenticate, isAdmin, siteController.getAdminInbox);

router.patch(
  '/admin/volunteer-applications/:id/review',
  authenticate,
  isAdmin,
  siteController.reviewVolunteerApplication
);

module.exports = router;