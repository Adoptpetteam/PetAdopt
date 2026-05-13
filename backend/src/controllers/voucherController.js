const Voucher = require('../models/Voucher');

// ===============================
// Helper: tính discount
// ===============================
function calcDiscount(voucher, subtotal) {
  let discount = 0;
  if (voucher.type === 'percent') {
    discount = Math.round((subtotal * voucher.value) / 100);
    if (voucher.maxDiscount > 0) {
      discount = Math.min(discount, voucher.maxDiscount);
    }
  } else {
    discount = voucher.value;
  }
  return Math.min(discount, subtotal); // không giảm quá tổng đơn
}

// ===============================
// Helper: validate voucher logic
// ===============================
async function validateVoucher(code, userId, subtotal) {
  const voucher = await Voucher.findOne({ code: code.toUpperCase().trim() });

  if (!voucher) return { ok: false, message: 'Mã voucher không tồn tại' };
  if (!voucher.isActive) return { ok: false, message: 'Voucher đã bị vô hiệu hóa' };

  const now = new Date();
  if (voucher.startDate && now < voucher.startDate)
    return { ok: false, message: 'Voucher chưa đến thời gian sử dụng' };
  if (voucher.endDate && now > voucher.endDate)
    return { ok: false, message: 'Voucher đã hết hạn' };

  if (voucher.minOrder > 0 && subtotal < voucher.minOrder)
    return {
      ok: false,
      message: `Đơn hàng tối thiểu ${voucher.minOrder.toLocaleString('vi-VN')}đ để dùng voucher này`,
    };

  if (voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit)
    return { ok: false, message: 'Voucher đã hết lượt sử dụng' };

  if (userId && voucher.userLimit > 0) {
    const userUsed = voucher.usedBy.filter(
      (u) => String(u.user) === String(userId)
    ).length;
    if (userUsed >= voucher.userLimit)
      return { ok: false, message: 'Bạn đã dùng voucher này rồi' };
  }

  const discount = calcDiscount(voucher, subtotal);
  return { ok: true, voucher, discount };
}

// ===============================
// POST /api/vouchers/validate
// User kiểm tra mã voucher
// ===============================
exports.validateVoucherCode = async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    const userId = req.user?.userId || req.user?.id;

    if (!code) return res.status(400).json({ success: false, message: 'Vui lòng nhập mã voucher' });
    if (!subtotal || subtotal <= 0)
      return res.status(400).json({ success: false, message: 'Giá trị đơn hàng không hợp lệ' });

    const result = await validateVoucher(code, userId, subtotal);
    if (!result.ok) return res.status(400).json({ success: false, message: result.message });

    return res.status(200).json({
      success: true,
      data: {
        code: result.voucher.code,
        description: result.voucher.description,
        type: result.voucher.type,
        value: result.voucher.value,
        discount: result.discount,
        finalTotal: subtotal - result.discount,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// ADMIN: GET /api/admin/vouchers
// ===============================
exports.listVouchers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, isActive } = req.query;
    const filter = {};
    if (search) filter.code = { $regex: search.toUpperCase(), $options: 'i' };
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Voucher.countDocuments(filter);
    const vouchers = await Voucher.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('-usedBy');

    return res.status(200).json({
      success: true,
      data: vouchers,
      pagination: { page: Number(page), limit: Number(limit), total },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// ADMIN: POST /api/admin/vouchers
// ===============================
exports.createVoucher = async (req, res) => {
  try {
    const {
      code, description, type, value,
      maxDiscount, minOrder, usageLimit, userLimit,
      startDate, endDate, isActive,
    } = req.body;

    if (!code || !type || value === undefined)
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });

    if (!['percent', 'fixed'].includes(type))
      return res.status(400).json({ success: false, message: 'Loại voucher không hợp lệ' });

    if (type === 'percent' && (value <= 0 || value > 100))
      return res.status(400).json({ success: false, message: 'Phần trăm giảm phải từ 1-100' });

    const existing = await Voucher.findOne({ code: code.toUpperCase().trim() });
    if (existing)
      return res.status(400).json({ success: false, message: 'Mã voucher đã tồn tại' });

    const voucher = await Voucher.create({
      code, description, type, value,
      maxDiscount: maxDiscount || 0,
      minOrder: minOrder || 0,
      usageLimit: usageLimit || 0,
      userLimit: userLimit ?? 1,
      startDate: startDate || null,
      endDate: endDate || null,
      isActive: isActive !== false,
    });

    return res.status(201).json({ success: true, data: voucher });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ success: false, message: 'Mã voucher đã tồn tại' });
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// ADMIN: PUT /api/admin/vouchers/:id
// ===============================
exports.updateVoucher = async (req, res) => {
  try {
    const allowed = [
      'description', 'type', 'value', 'maxDiscount', 'minOrder',
      'usageLimit', 'userLimit', 'startDate', 'endDate', 'isActive',
    ];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const voucher = await Voucher.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!voucher) return res.status(404).json({ success: false, message: 'Không tìm thấy voucher' });

    return res.status(200).json({ success: true, data: voucher });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// ADMIN: DELETE /api/admin/vouchers/:id
// ===============================
exports.deleteVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndDelete(req.params.id);
    if (!voucher) return res.status(404).json({ success: false, message: 'Không tìm thấy voucher' });
    return res.status(200).json({ success: true, message: 'Đã xóa voucher' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Export helper để dùng trong orderController
exports.validateVoucherHelper = validateVoucher;
exports.calcDiscount = calcDiscount;
