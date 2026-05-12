const express = require('express');
const router = express.Router();
const { authenticate } = require('./src/middleware/authMiddleware');
const { isAdmin } = require('./src/middleware/adminMiddleware');

const statisticsController = require('./statisticsController');

// Tất cả routes thống kê đều yêu cầu admin
router.use(authenticate, isAdmin);

// Tổng quan thống kê
router.get('/overview', statisticsController.getOrderOverview);

// Doanh thu theo thời gian
router.get('/revenue-by-time', statisticsController.getRevenueByTime);

// Top sản phẩm bán chạy
router.get('/top-products', statisticsController.getTopProducts);

// Thống kê khách hàng
router.get('/customer-stats', statisticsController.getCustomerStats);

// Đơn hàng gần đây
router.get('/recent-orders', statisticsController.getRecentOrders);

// So sánh giữa 2 khoảng thời gian
router.get('/comparison', statisticsController.getComparison);

// Tồn kho sản phẩm
router.get('/inventory', statisticsController.getInventory);

module.exports = router;
