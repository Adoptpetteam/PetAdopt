const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');
const {
    createPayment, vnpayReturn, vnpayIPN,
    getSupporters, adminListDonations, adminDeleteDonation,
} = require('../controllers/donateController');

router.post('/create-payment', createPayment);
router.get('/vnpay-return', vnpayReturn);
router.get('/vnpay-ipn', vnpayIPN);

// Public: danh sách người ủng hộ cho marquee
router.get('/supporters', getSupporters);

// Admin
router.get('/admin/list', authenticate, isAdmin, adminListDonations);
router.delete('/admin/:id', authenticate, isAdmin, adminDeleteDonation);

module.exports = router;
