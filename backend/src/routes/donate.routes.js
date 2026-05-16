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
    adminDeleteDonation,
    sendVoucherEmail,
} = require('../controllers/donateController');

router.post('/create-payment', createPayment);
router.get('/vnpay-return', vnpayReturn);
router.get('/vnpay-ipn', vnpayIPN);

// Public
router.get('/supporters', getSupporters);
router.get('/top-supporters', getTopSupporters);
router.get('/statistics', getDonationStatistics);

// Admin
router.get('/admin/list', authenticate, isAdmin, adminListDonations);
router.delete('/admin/:id', authenticate, isAdmin, adminDeleteDonation);
router.post('/admin/send-voucher-email', authenticate, isAdmin, sendVoucherEmail);

module.exports = router;
