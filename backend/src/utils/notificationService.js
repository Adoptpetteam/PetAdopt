const Notification = require('../models/Notification');

// ===============================
// HELPER: Tạo notification
// ===============================
const createNotification = async (userId, type, title, message, options = {}) => {
  try {
    const notificationData = {
      user: userId,
      type,
      title,
      message,
      link: options.link || null,
      relatedOrder: options.relatedOrder || null,
      relatedAdoption: options.relatedAdoption || null,
      relatedVaccination: options.relatedVaccination || null,
      icon: options.icon || getIconByType(type),
      priority: options.priority || 'normal'
    };

    const notification = await Notification.createNotification(notificationData);
    console.log(`✅ Notification created for user ${userId}: ${type}`);
    return notification;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    // Không throw error để không ảnh hưởng đến flow chính
    return null;
  }
};

// ===============================
// HELPER: Lấy icon theo type
// ===============================
const getIconByType = (type) => {
  const iconMap = {
    order_confirmed: '✅',
    order_paid: '💳',
    order_shipping: '🚚',
    order_completed: '🎉',
    order_cancelled: '❌',
    adoption_approved: '🎉',
    adoption_rejected: '😔',
    adoption_cancelled: '❌',
    volunteer_approved: '👏',
    volunteer_rejected: '😔',
    vaccination_reminder: '💉',
    system: '🔔'
  };
  return iconMap[type] || '🔔';
};

// ===============================
// ORDER NOTIFICATIONS
// ===============================
const notifyOrderConfirmed = async (userId, orderId, orderCode) => {
  return createNotification(
    userId,
    'order_confirmed',
    'Đơn hàng đã được xác nhận',
    `Đơn hàng #${orderCode} của bạn đã được xác nhận và đang được xử lý.`,
    {
      link: `/orders/${orderId}`,
      relatedOrder: orderId,
      priority: 'normal'
    }
  );
};

const notifyOrderPaid = async (userId, orderId, orderCode) => {
  return createNotification(
    userId,
    'order_paid',
    'Thanh toán thành công',
    `Đơn hàng #${orderCode} đã được thanh toán thành công.`,
    {
      link: `/orders/${orderId}`,
      relatedOrder: orderId,
      priority: 'normal'
    }
  );
};

const notifyOrderShipping = async (userId, orderId, orderCode) => {
  return createNotification(
    userId,
    'order_shipping',
    'Đơn hàng đang được giao',
    `Đơn hàng #${orderCode} đang trên đường giao đến bạn!`,
    {
      link: `/orders/${orderId}`,
      relatedOrder: orderId,
      priority: 'high'
    }
  );
};

const notifyOrderCompleted = async (userId, orderId, orderCode) => {
  return createNotification(
    userId,
    'order_completed',
    'Đơn hàng hoàn thành',
    `Đơn hàng #${orderCode} đã được giao thành công. Cảm ơn bạn đã mua hàng!`,
    {
      link: `/orders/${orderId}`,
      relatedOrder: orderId,
      priority: 'normal'
    }
  );
};

const notifyOrderCancelled = async (userId, orderId, orderCode, reason = '') => {
  return createNotification(
    userId,
    'order_cancelled',
    'Đơn hàng đã bị hủy',
    `Đơn hàng #${orderCode} đã bị hủy. ${reason}`,
    {
      link: `/orders/${orderId}`,
      relatedOrder: orderId,
      priority: 'high'
    }
  );
};

// ===============================
// ADOPTION NOTIFICATIONS
// ===============================
const notifyAdoptionApproved = async (userId, adoptionId, petName) => {
  return createNotification(
    userId,
    'adoption_approved',
    'Đơn nhận nuôi được chấp thuận',
    `Chúc mừng! Đơn nhận nuôi thú cưng "${petName}" của bạn đã được chấp thuận.`,
    {
      link: `/my-adoptions`,
      relatedAdoption: adoptionId,
      priority: 'high'
    }
  );
};

const notifyAdoptionRejected = async (userId, adoptionId, petName, reason = '') => {
  return createNotification(
    userId,
    'adoption_rejected',
    'Đơn nhận nuôi bị từ chối',
    `Rất tiếc, đơn nhận nuôi thú cưng "${petName}" của bạn đã bị từ chối. ${reason}`,
    {
      link: `/my-adoptions`,
      relatedAdoption: adoptionId,
      priority: 'normal'
    }
  );
};

const notifyAdoptionCancelled = async (userId, adoptionId, petName) => {
  return createNotification(
    userId,
    'adoption_cancelled',
    'Đơn nhận nuôi đã bị hủy',
    `Đơn nhận nuôi thú cưng "${petName}" đã bị hủy.`,
    {
      link: `/my-adoptions`,
      relatedAdoption: adoptionId,
      priority: 'normal'
    }
  );
};

// ===============================
// VOLUNTEER NOTIFICATIONS
// ===============================
const notifyVolunteerApproved = async (userEmail, name) => {
  // Note: Volunteer không có userId, chỉ có email
  // Có thể tìm user bằng email hoặc skip notification
  console.log(`Volunteer ${name} (${userEmail}) approved - notification skipped (no userId)`);
  return null;
};

const notifyVolunteerRejected = async (userEmail, name) => {
  console.log(`Volunteer ${name} (${userEmail}) rejected - notification skipped (no userId)`);
  return null;
};

// ===============================
// VACCINATION NOTIFICATIONS
// ===============================
const notifyVaccinationReminder = async (userId, vaccinationId, petName, vaccineName, daysUntil) => {
  const urgencyText = daysUntil === 0 ? 'HÔM NAY' : daysUntil === 1 ? 'NGÀY MAI' : `${daysUntil} ngày nữa`;
  
  return createNotification(
    userId,
    'vaccination_reminder',
    `Nhắc nhở tiêm phòng cho ${petName}`,
    `Lịch tiêm ${vaccineName} cho ${petName} là ${urgencyText}!`,
    {
      link: `/vaccination-schedule`,
      relatedVaccination: vaccinationId,
      priority: daysUntil <= 1 ? 'urgent' : 'high'
    }
  );
};

// ===============================
// SYSTEM NOTIFICATIONS
// ===============================
const notifySystem = async (userId, title, message, options = {}) => {
  return createNotification(
    userId,
    'system',
    title,
    message,
    {
      link: options.link || null,
      priority: options.priority || 'normal'
    }
  );
};

module.exports = {
  createNotification,
  notifyOrderConfirmed,
  notifyOrderPaid,
  notifyOrderShipping,
  notifyOrderCompleted,
  notifyOrderCancelled,
  notifyAdoptionApproved,
  notifyAdoptionRejected,
  notifyAdoptionCancelled,
  notifyVolunteerApproved,
  notifyVolunteerRejected,
  notifyVaccinationReminder,
  notifySystem
};
