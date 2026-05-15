const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Người nhận thông báo
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Loại thông báo
  type: {
    type: String,
    enum: [
      'order_confirmed',
      'order_paid',
      'order_shipping',
      'order_completed',
      'order_cancelled',
      'adoption_approved',
      'adoption_rejected',
      'adoption_cancelled',
      'volunteer_approved',
      'volunteer_rejected',
      'vaccination_reminder',
      'system'
    ],
    required: true
  },
  
  // Tiêu đề
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  // Nội dung
  message: {
    type: String,
    required: true,
    trim: true
  },
  
  // Link liên quan (nếu có)
  link: {
    type: String,
    trim: true
  },
  
  // Reference đến đối tượng liên quan
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  
  relatedAdoption: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdoptionRequest'
  },
  
  relatedVaccination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VaccinationSchedule'
  },
  
  // Trạng thái đã đọc
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Thời gian đọc
  readAt: {
    type: Date
  },
  
  // Icon/emoji cho notification
  icon: {
    type: String,
    default: '🔔'
  },
  
  // Priority
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  }
  
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });

// Static method: Tạo notification
notificationSchema.statics.createNotification = async function(data) {
  try {
    const notification = await this.create(data);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Static method: Đánh dấu đã đọc
notificationSchema.statics.markAsRead = async function(notificationId, userId) {
  try {
    const notification = await this.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Static method: Đánh dấu tất cả đã đọc
notificationSchema.statics.markAllAsRead = async function(userId) {
  try {
    const result = await this.updateMany(
      { user: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    return result;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Static method: Xóa notification cũ (> 30 ngày)
notificationSchema.statics.cleanOldNotifications = async function() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await this.deleteMany({
      createdAt: { $lt: thirtyDaysAgo },
      isRead: true
    });
    
    console.log(`Cleaned ${result.deletedCount} old notifications`);
    return result;
  } catch (error) {
    console.error('Error cleaning old notifications:', error);
    throw error;
  }
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
