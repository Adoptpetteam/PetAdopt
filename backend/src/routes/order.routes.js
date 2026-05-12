const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

const orderController = require('../controllers/orderController');

// User routes
router.post('/checkout', authenticate, orderController.checkoutOrder);
router.get('/me', authenticate, orderController.listMyOrders);
router.get('/me/:id', authenticate, orderController.getMyOrderById);

// VNPay return (GET - VNPay redirect về)
router.get('/vnpay-return', orderController.vnpayReturn);

// Admin routes
router.get('/', authenticate, isAdmin, orderController.listAllOrders);
router.put('/:id/status', authenticate, isAdmin, orderController.updateOrderStatus);

module.exports = router;
