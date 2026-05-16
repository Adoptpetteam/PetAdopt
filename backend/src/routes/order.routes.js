const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

const orderController = require('../controllers/orderController');

// User routes
router.post('/checkout', authenticate, orderController.checkoutOrder);
router.get('/me', authenticate, orderController.listMyOrders);
router.get('/me/:id', authenticate, orderController.getMyOrderById);
router.put('/me/:id/request-cancel', authenticate, orderController.requestCancelOrder);
router.put('/me/:id/cancel', authenticate, orderController.cancelMyOrder);

// User refund/return/exchange routes
router.post('/:id/request-refund', authenticate, orderController.requestRefund);
router.post('/:id/request-return-exchange', authenticate, orderController.requestReturnExchange);

// VNPay return (GET - VNPay redirect về)
router.get('/vnpay-return', orderController.vnpayReturn);

// Admin routes
router.get('/statistics', authenticate, isAdmin, orderController.getOrderStatistics);
router.get('/', authenticate, isAdmin, orderController.listAllOrders);
router.put('/:id/status', authenticate, isAdmin, orderController.updateOrderStatus);
router.delete('/:id', authenticate, isAdmin, orderController.deleteOrder);

// Admin refund/return/exchange processing routes
router.post('/:id/process-refund', authenticate, isAdmin, orderController.processRefund);
router.post('/:id/process-return', authenticate, isAdmin, orderController.processReturn);
router.post('/:id/process-exchange', authenticate, isAdmin, orderController.processExchange);
router.post('/:id/update-return-status', authenticate, isAdmin, orderController.updateReturnStatus);

module.exports = router;
