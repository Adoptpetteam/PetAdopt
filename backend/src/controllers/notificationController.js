const Notification = require('../models/Notification');

// ===============================
// GET /api/notifications - Lấy danh sách thông báo của user
// ===============================
exports.getMyNotifications = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { page = 1, limit = 20, isRead } = req.query;
    const filter = { user: userId };
    
    // Filter theo trạng thái đã đọc
    if (isRead !== undefined) {
      filter.isRead = isRead === 'true';
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });
    
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    return res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    console.error('GET NOTIFICATIONS ERROR:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// GET /api/notifications/unread-count - Đếm số thông báo chưa đọc
// ===============================
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const unreadCount = await Notification.countDocuments({
      user: userId,
      isRead: false
    });

    return res.status(200).json({
      success: true,
      unreadCount
    });
  } catch (err) {
    console.error('GET UNREAD COUNT ERROR:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// PUT /api/notifications/:id/read - Đánh dấu đã đọc
// ===============================
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.params;
    const notification = await Notification.markAsRead(id, userId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông báo'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Đã đánh dấu đã đọc',
      data: notification
    });
  } catch (err) {
    console.error('MARK AS READ ERROR:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// PUT /api/notifications/read-all - Đánh dấu tất cả đã đọc
// ===============================
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const result = await Notification.markAllAsRead(userId);

    return res.status(200).json({
      success: true,
      message: `Đã đánh dấu ${result.modifiedCount} thông báo là đã đọc`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error('MARK ALL AS READ ERROR:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// DELETE /api/notifications/:id - Xóa thông báo
// ===============================
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.params;
    const notification = await Notification.findOneAndDelete({
      _id: id,
      user: userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông báo'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Đã xóa thông báo'
    });
  } catch (err) {
    console.error('DELETE NOTIFICATION ERROR:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// DELETE /api/notifications/clear-all - Xóa tất cả thông báo đã đọc
// ===============================
exports.clearAllRead = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const result = await Notification.deleteMany({
      user: userId,
      isRead: true
    });

    return res.status(200).json({
      success: true,
      message: `Đã xóa ${result.deletedCount} thông báo đã đọc`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error('CLEAR ALL READ ERROR:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// GET /api/notifications/recent - Lấy thông báo gần đây (5 cái)
// ===============================
exports.getRecentNotifications = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const unreadCount = await Notification.countDocuments({
      user: userId,
      isRead: false
    });

    return res.status(200).json({
      success: true,
      data: notifications,
      unreadCount
    });
  } catch (err) {
    console.error('GET RECENT NOTIFICATIONS ERROR:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
