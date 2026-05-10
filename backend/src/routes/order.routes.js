const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');

const orderController = require('../controllers/orderController');

router.post('/checkout', authenticate, orderController.checkoutOrder);
router.get('/me', authenticate, orderController.listMyOrders);

module.exports = router;

