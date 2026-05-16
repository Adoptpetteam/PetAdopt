const RefundRequest = require('../models/RefundRequest');
const Order = require('../models/Order');
const Notification = require('../models/Notification');

// ===============================
// USER: GET /api/refunds/me
// ===============================
exports.getMyRefunds = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const refunds = await RefundRequest.find({ user: userId })
      .populate('order', '_id totals paymentMethod customer')
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: refunds });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// USER: GET /api/refunds/me/:id
// ===============================
exports.getMyRefundById = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const userRole = req.user?.role;

    const refund = await RefundRequest.findById(req.params.id).populate('order');
    if (!refund) return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu hoàn tiền' });

    if (userRole !== 'admin' && refund.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Không có quyền xem yêu cầu này' });
    }

    return res.status(200).json({ success: true, data: refund });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// USER: PUT /api/refunds/me/:id/submit-bank-info
// ===============================
exports.submitBankInfo = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const userRole = req.user?.role;
    const { bankName, accountNumber, accountHolder, qrCodeImage } = req.body;

    const refund = await RefundRequest.findById(req.params.id);
    if (!refund) return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu hoàn tiền' });

    if (userRole !== 'admin' && refund.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Không có quyền thực hiện' });
    }

    if (refund.status !== 'awaiting_info') {
      return res.status(400).json({ success: false, message: 'Yêu cầu này đã được nộp thông tin' });
    }

    const hasFullBank = bankName && accountNumber && accountHolder;
    const hasQR = qrCodeImage;
    if (!hasFullBank && !hasQR) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập thông tin ngân hàng hoặc tải lên ảnh QR code' });
    }

    refund.bankInfo = {
      bankName: bankName || '',
      accountNumber: accountNumber || '',
      accountHolder: accountHolder || '',
      qrCodeImage: qrCodeImage || '',
    };
    refund.status = 'pending';
    refund.submittedAt = new Date();
    await refund.save();

    return res.status(200).json({ success: true, data: refund, message: 'Đã gửi thông tin hoàn tiền, vui lòng chờ admin xử lý' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// ADMIN: GET /api/refunds/admin
// ===============================
exports.adminListRefunds = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await RefundRequest.countDocuments(filter);
    const refunds = await RefundRequest.find(filter)
      .populate('user', 'name email')
      .populate('order', '_id totals paymentMethod customer')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      data: refunds,
      pagination: { page: Number(page), limit: Number(limit), total },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// ADMIN: PUT /api/refunds/admin/:id/process
// ===============================
exports.adminProcessRefund = async (req, res) => {
  try {
    const adminId = req.user?.userId || req.user?.id;
    const { status, adminNote, transactionRef, billImage } = req.body;

    if (!['processing', 'completed', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
    }

    if (status === 'completed' && !transactionRef?.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập mã chứng từ chuyển khoản' });
    }

    const refund = await RefundRequest.findById(req.params.id);
    if (!refund) return res.status(404).json({ success: false, message: 'Không tìm thấy' });

    refund.status = status;
    if (adminNote !== undefined) refund.adminNote = adminNote;
    if (transactionRef !== undefined) refund.transactionRef = transactionRef;
    if (billImage !== undefined) refund.billImage = billImage;

    if (status === 'completed') {
      refund.processedAt = new Date();
      refund.processedBy = adminId;
      await Order.findByIdAndUpdate(refund.order, { paymentStatus: 'refunded' });
      await Notification.create({
        user: refund.user,
        type: 'refund_completed',
        title: '✅ Hoàn tiền thành công',
        message: `Đơn hàng #${String(refund.order).slice(-8).toUpperCase()} đã được hoàn ${refund.amount.toLocaleString('vi-VN')}đ.\nMã GD: ${transactionRef}`,
        order: refund.order,
        refundRequest: refund._id,
      });
    } else if (status === 'processing') {
      await Order.findByIdAndUpdate(refund.order, { paymentStatus: 'refunding' });
    } else if (status === 'rejected') {
      refund.processedAt = new Date();
      refund.processedBy = adminId;
      await Notification.create({
        user: refund.user,
        type: 'refund_completed',
        title: '❌ Yêu cầu hoàn tiền bị từ chối',
        message: `Lý do: ${adminNote || 'Không có ghi chú'}`,
        order: refund.order,
        refundRequest: refund._id,
      });
    }

    await refund.save();
    return res.status(200).json({ success: true, data: refund });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
