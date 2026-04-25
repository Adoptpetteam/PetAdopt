const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orderController');

// Demo mode: order endpoints don't require JWT.
router.post('/checkout', orderController.createCheckoutOrder);
router.get('/me', orderController.getMyOrders);

module.exports = router;

