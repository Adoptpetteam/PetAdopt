const express = require('express');
const router = express.Router();
const { createPayment, vnpayReturn, vnpayIPN } = require('../controllers/donateController');

router.post('/create-payment', createPayment);
router.get('/vnpay-return', vnpayReturn);
router.get('/vnpay-ipn', vnpayIPN);

module.exports = router;
