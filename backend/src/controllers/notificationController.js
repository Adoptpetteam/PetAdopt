const Notification = require('../models/Notification');

// GET /api/notifications & /api/notifications/me
exports.getMyNotifications = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { page = 1, limit = 20, isRead } = req.query;
    const filter = { user: userId };
    if (isRead !== undefined) filter.isRead = isRead === 'true';

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean();

    return res.status(200).json({ success: true, data: notifications, unreadCount,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/notifications/unread-count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });
    return res.status(200).json({ success: true, unreadCount });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    if (!notification) return res.status(404).json({ success: false, message: 'Không tìm thấy thông báo' });

    return res.status(200).json({ success: true, message: 'Đã đánh dấu đã đọc', data: notification });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const result = await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    return res.status(200).json({ success: true, message: `Đã đánh dấu ${result.modifiedCount} thông báo là đã đọc`, modifiedCount: result.modifiedCount });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/notifications/:id
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const notification = await Notification.findOneAndDelete({ _id: req.params.id, user: userId });
    if (!notification) return res.status(404).json({ success: false, message: 'Không tìm thấy thông báo' });

    return res.status(200).json({ success: true, message: 'Đã xóa thông báo' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/notifications/clear-all
exports.clearAllRead = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const result = await Notification.deleteMany({ user: userId, isRead: true });
    return res.status(200).json({ success: true, message: `Đã xóa ${result.deletedCount} thông báo đã đọc`, deletedCount: result.deletedCount });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/notifications/recent
exports.getRecentNotifications = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(5).lean();
    const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });
    return res.status(200).json({ success: true, data: notifications, unreadCount });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// HELPER: Tạo notification (dùng nội bộ)
exports.createNotification = async ({ userId, type, title, message, orderId, refundRequestId, metadata, actionUrl, actionLabel }) => {
  try {
    return await Notification.create({
      user: userId,
      type, title, message,
      order: orderId || null,
      refundRequest: refundRequestId || null,
      metadata: metadata || {},
      actionUrl: actionUrl || null,
      actionLabel: actionLabel || null,
    });
  } catch (err) {
    console.error('[Notification] Create failed:', err.message);
    return null;
  }
};
