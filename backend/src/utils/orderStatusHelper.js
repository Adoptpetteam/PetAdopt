/**
 * Order Status Helper
 * Utilities để làm việc với 3 trạng thái mới: orderStatus, paymentStatus, returnStatus
 */

// ============================================
// STATUS CONFIGURATIONS
// ============================================

const ORDER_STATUS_CONFIG = {
  pending: {
    label: 'Chờ xác nhận',
    color: 'orange',
    icon: 'clock',
    description: 'Đơn hàng đang chờ shop xác nhận'
  },
  confirmed: {
    label: 'Đã xác nhận',
    color: 'blue',
    icon: 'check',
    description: 'Shop đã xác nhận, đang chuẩn bị hàng'
  },
  shipping: {
    label: 'Đang giao hàng',
    color: 'purple',
    icon: 'truck',
    description: 'Shipper đang giao hàng đến khách'
  },
  delivered: {
    label: 'Giao hàng thành công',
    color: 'green',
    icon: 'gift',
    description: 'Đã giao hàng thành công'
  },
  cancelled: {
    label: 'Đã hủy',
    color: 'red',
    icon: 'close',
    description: 'Đơn hàng đã bị hủy'
  }
};

const PAYMENT_STATUS_CONFIG = {
  unpaid: {
    label: 'Chưa thanh toán',
    color: 'default',
    icon: 'dollar',
    description: 'Chưa thanh toán (COD)'
  },
  pending: {
    label: 'Chờ thanh toán',
    color: 'orange',
    icon: 'clock',
    description: 'Đang chờ thanh toán VNPay'
  },
  paid: {
    label: 'Đã thanh toán',
    color: 'green',
    icon: 'check',
    description: 'Đã thanh toán thành công'
  },
  refunding: {
    label: 'Đang hoàn tiền',
    color: 'blue',
    icon: 'reload',
    description: 'Đang xử lý hoàn tiền'
  },
  refunded: {
    label: 'Đã hoàn tiền',
    color: 'green',
    icon: 'check',
    description: 'Đã hoàn tiền thành công'
  },
  failed: {
    label: 'Thanh toán thất bại',
    color: 'red',
    icon: 'close',
    description: 'Thanh toán không thành công'
  }
};

const RETURN_STATUS_CONFIG = {
  null: {
    label: 'Không có yêu cầu',
    color: 'default',
    icon: 'minus',
    description: 'Không có yêu cầu hoàn trả'
  },
  requested: {
    label: 'Yêu cầu hoàn trả',
    color: 'orange',
    icon: 'rollback',
    description: 'Khách hàng yêu cầu hoàn trả'
  },
  approved: {
    label: 'Đã chấp thuận',
    color: 'cyan',
    icon: 'check',
    description: 'Admin đã chấp thuận yêu cầu'
  },
  rejected: {
    label: 'Đã từ chối',
    color: 'red',
    icon: 'close',
    description: 'Admin từ chối yêu cầu'
  },
  shipping: {
    label: 'Đang gửi về',
    color: 'purple',
    icon: 'truck',
    description: 'Hàng đang được gửi về kho'
  },
  received: {
    label: 'Đã nhận hàng',
    color: 'blue',
    icon: 'inbox',
    description: 'Kho đã nhận hàng trả về'
  },
  completed: {
    label: 'Hoàn tất',
    color: 'green',
    icon: 'check-circle',
    description: 'Đã xử lý hoàn tất'
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Lấy thông tin config của order status
 */
function getOrderStatusConfig(status) {
  return ORDER_STATUS_CONFIG[status] || ORDER_STATUS_CONFIG.pending;
}

/**
 * Lấy thông tin config của payment status
 */
function getPaymentStatusConfig(status) {
  return PAYMENT_STATUS_CONFIG[status] || PAYMENT_STATUS_CONFIG.unpaid;
}

/**
 * Lấy thông tin config của return status
 */
function getReturnStatusConfig(status) {
  return RETURN_STATUS_CONFIG[status || 'null'] || RETURN_STATUS_CONFIG.null;
}

/**
 * Kiểm tra xem đơn hàng có thể hủy không
 */
function canCancelOrder(order) {
  // Chỉ có thể hủy khi:
  // - orderStatus: pending, confirmed
  // - paymentStatus: unpaid, pending, paid (nếu VNPay)
  const cancellableOrderStatus = ['pending', 'confirmed'];
  return cancellableOrderStatus.includes(order.orderStatus);
}

/**
 * Kiểm tra xem đơn hàng có thể yêu cầu hoàn trả không
 */
function canRequestReturn(order) {
  // Chỉ có thể yêu cầu hoàn trả khi:
  // - orderStatus: delivered (đã giao hàng thành công)
  // - paymentStatus: paid
  // - returnStatus: null
  // - Trong vòng 3 ngày sau khi giao hàng
  if (order.orderStatus !== 'delivered') return false;
  if (order.paymentStatus !== 'paid') return false;
  if (order.returnStatus !== null) return false;
  
  // Kiểm tra 3 ngày
  const deliveredDate = order.statusHistory
    .filter(h => h.status === 'delivered')
    .sort((a, b) => b.changedAt - a.changedAt)[0]?.changedAt;
  
  if (!deliveredDate) return false;
  
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  
  return new Date(deliveredDate) > threeDaysAgo;
}

/**
 * Chuyển đổi từ old status sang new status
 */
function convertOldStatusToNew(oldStatus, paymentMethod) {
  const mapping = {
    'pending': { orderStatus: 'pending', paymentStatus: 'unpaid', returnStatus: null },
    'confirmed': { orderStatus: 'confirmed', paymentStatus: 'unpaid', returnStatus: null },
    'paid': { orderStatus: 'confirmed', paymentStatus: 'paid', returnStatus: null },
    'shipping': { 
      orderStatus: 'shipping', 
      paymentStatus: paymentMethod === 'vnpay' ? 'paid' : 'unpaid', 
      returnStatus: null 
    },
    'completed': { orderStatus: 'delivered', paymentStatus: 'paid', returnStatus: null },
    'cancelled': { 
      orderStatus: 'cancelled', 
      paymentStatus: paymentMethod === 'vnpay' ? 'pending' : 'unpaid', 
      returnStatus: null 
    },
    'refund_pending': { orderStatus: 'cancelled', paymentStatus: 'refunding', returnStatus: 'requested' },
    'refund_processing': { orderStatus: 'cancelled', paymentStatus: 'refunding', returnStatus: 'approved' },
    'refund_completed': { orderStatus: 'cancelled', paymentStatus: 'refunded', returnStatus: 'completed' },
    'return_requested': { orderStatus: 'delivered', paymentStatus: 'refunding', returnStatus: 'requested' },
    'return_shipping': { orderStatus: 'delivered', paymentStatus: 'refunding', returnStatus: 'shipping' },
    'return_received': { orderStatus: 'delivered', paymentStatus: 'refunding', returnStatus: 'received' },
    'exchange_requested': { orderStatus: 'delivered', paymentStatus: 'paid', returnStatus: 'requested' },
    'exchange_shipping': { orderStatus: 'delivered', paymentStatus: 'paid', returnStatus: 'shipping' },
    'exchange_completed': { orderStatus: 'delivered', paymentStatus: 'paid', returnStatus: 'completed' }
  };
  
  return mapping[oldStatus] || { orderStatus: 'pending', paymentStatus: 'unpaid', returnStatus: null };
}

/**
 * Chuyển đổi từ new status sang old status (để backward compatible)
 */
function convertNewStatusToOld(orderStatus, paymentStatus, returnStatus) {
  // Ưu tiên return status
  if (returnStatus) {
    if (returnStatus === 'requested' && orderStatus === 'cancelled') return 'refund_pending';
    if (returnStatus === 'approved' && orderStatus === 'cancelled') return 'refund_processing';
    if (returnStatus === 'completed' && orderStatus === 'cancelled' && paymentStatus === 'refunded') return 'refund_completed';
    if (returnStatus === 'requested' && orderStatus === 'delivered') return 'return_requested';
    if (returnStatus === 'shipping' && orderStatus === 'delivered') return 'return_shipping';
    if (returnStatus === 'received' && orderStatus === 'delivered') return 'return_received';
  }
  
  // Order status
  if (orderStatus === 'cancelled') return 'cancelled';
  if (orderStatus === 'delivered') return 'completed';
  if (orderStatus === 'shipping') return 'shipping';
  if (orderStatus === 'confirmed' && paymentStatus === 'paid') return 'paid';
  if (orderStatus === 'confirmed') return 'confirmed';
  if (orderStatus === 'pending') return 'pending';
  
  return 'pending';
}

/**
 * Lấy progress percentage cho order
 */
function getOrderProgress(order) {
  const steps = {
    pending: 0,
    confirmed: 33,
    shipping: 66,
    delivered: 100,
    cancelled: 100
  };
  
  return steps[order.orderStatus] || 0;
}

/**
 * Lấy màu cho progress bar
 */
function getProgressColor(order) {
  if (order.orderStatus === 'cancelled') return 'red';
  if (order.orderStatus === 'delivered') return 'green';
  if (order.returnStatus) return 'orange';
  return 'blue';
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  ORDER_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
  RETURN_STATUS_CONFIG,
  getOrderStatusConfig,
  getPaymentStatusConfig,
  getReturnStatusConfig,
  canCancelOrder,
  canRequestReturn,
  convertOldStatusToNew,
  convertNewStatusToOld,
  getOrderProgress,
  getProgressColor
};
