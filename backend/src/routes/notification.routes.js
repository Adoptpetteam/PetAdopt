const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');

// Tất cả routes đều cần authenticate
router.use(authenticate);

// GET /api/notifications - Lấy danh sách thông báo
router.get('/', notificationController.getMyNotifications);

// GET /api/notifications/unread-count - Đếm số thông báo chưa đọc
router.get('/unread-count', notificationController.getUnreadCount);

// GET /api/notifications/recent - Lấy 5 thông báo gần nhất
router.get('/recent', notificationController.getRecentNotifications);

// PUT /api/notifications/read-all - Đánh dấu tất cả đã đọc
router.put('/read-all', notificationController.markAllAsRead);

// PUT /api/notifications/:id/read - Đánh dấu 1 thông báo đã đọc
router.put('/:id/read', notificationController.markAsRead);

// DELETE /api/notifications/clear-all - Xóa tất cả thông báo đã đọc
router.delete('/clear-all', notificationController.clearAllRead);

// DELETE /api/notifications/:id - Xóa 1 thông báo
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
