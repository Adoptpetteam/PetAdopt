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
    getDonationStatistics
} = require('../controllers/donateController');

router.post('/create-payment', createPayment);
router.get('/vnpay-return', vnpayReturn);
router.get('/vnpay-ipn', vnpayIPN);

// Public
router.get('/top-supporters', getTopSupporters);
router.get('/supporters', getSupporters);

// Admin
router.get('/admin/supporters', authenticate, isAdmin, getSupporters);
router.get('/statistics', authenticate, isAdmin, getDonationStatistics);

module.exports = router;
