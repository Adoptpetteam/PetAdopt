const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');
const { 
    createPayment, 
    vnpayReturn, 
    vnpayIPN,
    getSupporters,
    getTopSupporters,
    getDonationStatistics,
    adminListDonations, 
    adminDeleteDonation
} = require('../controllers/donateController');

router.post('/create-payment', createPayment);
router.get('/vnpay-return', vnpayReturn);
router.get('/vnpay-ipn', vnpayIPN);

// Public
router.get('/top-supporters', getTopSupporters);
router.get('/supporters', getSupporters);

// Admin
router.get('/admin/supporters', authenticate, isAdmin, getSupporters);
router.get('/admin/donations', authenticate, isAdmin, adminListDonations);
router.delete('/admin/donations/:id', authenticate, isAdmin, adminDeleteDonation);
router.get('/statistics', authenticate, isAdmin, getDonationStatistics);

// Admin
router.get('/admin/list', authenticate, isAdmin, adminListDonations);
router.delete('/admin/:id', authenticate, isAdmin, adminDeleteDonation);
>>>>>>> 18e2d00a5209c25c7802923905918c9d4ecb2989

module.exports = router;
