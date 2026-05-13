const Order = require('../models/Order');
const Product = require('../models/Product');
const Voucher = require('../models/Voucher');
const crypto = require('crypto');
const querystring = require('querystring');
const { VNPAY_CONFIG } = require('../config/paymentConfig');
const { validateVoucherHelper, calcDiscount } = require('./voucherController');

// ===============================
// Helper: hoàn voucher khi đơn bị hủy
// ===============================
async function releaseVoucher(order) {
  if (!order.voucher?.code || order.voucher.discount <= 0) return;
  try {
    await Voucher.findOneAndUpdate(
      { code: order.voucher.code },
      {
        $inc: { usedCount: -1 },
        $pull: { usedBy: { user: order.user } },
      }
    );
  } catch (err) {
    console.error('[Voucher] Release failed:', err.message);
  }
}

// ===============================
// HELPER
// ===============================
function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    sorted[key] = obj[key];
  }
  return sorted;
}

function createVNPayUrl(orderId, amount, ipAddr) {
  const tmnCode = VNPAY_CONFIG.TMN_CODE;
  const secretKey = VNPAY_CONFIG.HASH_SECRET;
  const vnpUrl = VNPAY_CONFIG.URL;
  const returnUrl = VNPAY_CONFIG.RETURN_URL;

  // Timezone Vietnam (UTC+7)
  const now = new Date(Date.now() + 7 * 60 * 60 * 1000);
  const pad = (n) => String(n).padStart(2, '0');
  const createDate =
    `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}` +
    `${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}`;

  const txnRef = `${Date.now()}${String(orderId).slice(-8)}`;
  const safeOrderInfo = `Thanh toan don hang ${String(orderId).slice(-8)}`;

  let vnpParams = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: tmnCode,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: safeOrderInfo,
    vnp_OrderType: 'other',
    vnp_Amount: String(amount * 100),
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr || '127.0.0.1',
    vnp_CreateDate: createDate,
  };

  // Sort theo key alphabet
  vnpParams = sortObject(vnpParams);

  // Build chuỗi ký: encode từng value bằng encodeURIComponent, thay %20 bằng +
  const signData = Object.entries(vnpParams)
    .map(([k, v]) => `${k}=${encodeURIComponent(v).replace(/%20/g, '+')}`)
    .join('&');

  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  // Build URL cuối: dùng cùng cách encode
  const payUrl = `${vnpUrl}?${signData}&vnp_SecureHash=${signed}`;

  return { payUrl, txnRef };
}

// ===============================
// POST /api/orders/checkout
// ===============================
exports.checkoutOrder = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { paymentMethod, customer, items, voucherCode } = req.body;

    // Validate
    if (!paymentMethod || !customer || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid payload' });
    }

    if (!['cod', 'vnpay'].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Invalid payment method' });
    }

    // Find products
    const productIds = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [String(p._id), p]));

    // Validate stock
    for (const item of items) {
      const product = productMap.get(String(item.productId));
      if (!product) {
        return res.status(400).json({ success: false, message: `Không tìm thấy sản phẩm: ${item.productId}` });
      }
      const qty = toNumber(item.quantity);
      if (qty <= 0) {
        return res.status(400).json({ success: false, message: 'Số lượng phải lớn hơn 0' });
      }
      if (product.quantity < qty) {
        return res.status(400).json({ success: false, message: `Không đủ hàng: ${product.name}` });
      }
    }

    // Build order items
    const orderItems = items.map((item) => {
      const product = productMap.get(String(item.productId));
      return {
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: toNumber(item.quantity),
      };
    });

    // Calculate total
    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // ===== VALIDATE VOUCHER =====
    let discount = 0;
    let appliedVoucher = null;
    if (voucherCode) {
      const vResult = await validateVoucherHelper(voucherCode, userId, subtotal);
      if (!vResult.ok) {
        return res.status(400).json({ success: false, message: vResult.message });
      }
      discount = vResult.discount;
      appliedVoucher = vResult.voucher;
    }
    const total = subtotal - discount;

    // ===== TRỪ KHO ATOMIC =====
    // Dùng $inc + $gte để đảm bảo atomic — tránh race condition
    // Nếu 2 request đến cùng lúc, chỉ 1 cái thành công (modifiedCount = 1)
    const deducted = []; // track những item đã trừ thành công để rollback nếu cần

    for (const item of items) {
      const qty = toNumber(item.quantity);
      const updated = await Product.findOneAndUpdate(
        { _id: item.productId, quantity: { $gte: qty } },
        { $inc: { quantity: -qty } },
        { new: false } // trả về doc trước khi update để log
      );

      if (!updated) {
        // Atomic update thất bại → hàng vừa hết (race condition hoặc hết thật)
        // Rollback tất cả item đã trừ trước đó
        if (deducted.length > 0) {
          await Product.bulkWrite(
            deducted.map(({ productId, quantity }) => ({
              updateOne: {
                filter: { _id: productId },
                update: { $inc: { quantity } },
              },
            }))
          );
        }
        const productName = productMap.get(String(item.productId))?.name || item.productId;
        return res.status(409).json({
          success: false,
          message: `Sản phẩm "${productName}" vừa hết hàng, vui lòng thử lại`,
        });
      }

      deducted.push({ productId: item.productId, quantity: qty });
    }

    // Create order
    let createdOrder;
    try {
      createdOrder = await Order.create({
        user: userId,
        status: 'pending',
        paymentMethod,
        customer: {
          name: customer.name,
          phone: customer.phone,
          address: customer.address,
          reason: customer.reason || '',
        },
        items: orderItems,
        totals: { subtotal, discount, total },
        voucher: appliedVoucher
          ? { code: appliedVoucher.code, discount }
          : { code: null, discount: 0 },
      });
    } catch (createErr) {
      // Rollback kho nếu tạo order thất bại
      await Product.bulkWrite(
        deducted.map(({ productId, quantity }) => ({
          updateOne: {
            filter: { _id: productId },
            update: { $inc: { quantity } },
          },
        }))
      );
      throw createErr;
    }

    // ===== TĂNG USED COUNT VOUCHER =====
    // CHỈ tăng ngay cho COD (đã xác nhận)
    // VNPay: tăng sau khi thanh toán thành công trong vnpayReturn
    if (appliedVoucher && paymentMethod === 'cod') {
      await Voucher.findByIdAndUpdate(appliedVoucher._id, {
        $inc: { usedCount: 1 },
        $push: { usedBy: { user: userId, usedAt: new Date() } },
      });
    }

    // ===== VNPAY FLOW =====
    if (paymentMethod === 'vnpay') {
      const ipAddr =
        req.headers['x-forwarded-for'] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        '127.0.0.1';

      const { payUrl, txnRef } = createVNPayUrl(createdOrder._id, total, ipAddr);
      await Order.findByIdAndUpdate(createdOrder._id, { vnpayTxnRef: txnRef });

      return res.status(201).json({
        success: true,
        paymentMethod: 'vnpay',
        payUrl,
        data: createdOrder,
      });
    }

    // ===== COD FLOW: xác nhận đơn, chưa thu tiền =====
    await Order.findByIdAndUpdate(createdOrder._id, {
      status: 'confirmed',
      $push: { statusHistory: { status: 'confirmed', note: 'Đơn COD đã xác nhận, thanh toán khi nhận hàng' } },
    });

    return res.status(201).json({
      success: true,
      paymentMethod: 'cod',
      data: { ...createdOrder.toObject(), status: 'confirmed' },
    });
  } catch (err) {
    console.error('CHECKOUT ERROR:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// GET /api/orders/vnpay-return
// VNPay redirect về sau khi thanh toán
// ===============================
exports.vnpayReturn = async (req, res) => {
  try {
    const vnpParams = { ...req.query };
    const secureHash = vnpParams['vnp_SecureHash'];

    delete vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHashType'];

    const sortedParams = sortObject(vnpParams);

    // Dùng cùng cách encode như khi tạo URL
    const signData = Object.entries(sortedParams)
      .map(([k, v]) => `${k}=${encodeURIComponent(v).replace(/%20/g, '+')}`)
      .join('&');

    const hmac = crypto.createHmac('sha512', VNPAY_CONFIG.HASH_SECRET);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';

    console.log('[VNPay Return] secureHash:', secureHash);
    console.log('[VNPay Return] signed:    ', signed);
    console.log('[VNPay Return] match:', secureHash === signed);
    console.log('[VNPay Return] responseCode:', vnpParams['vnp_ResponseCode']);
    console.log('[VNPay Return] txnRef:', vnpParams['vnp_TxnRef']);

    if (secureHash !== signed) {
      return res.redirect(`${frontendBase}/orders/payment-result?status=failed&message=invalid_signature`);
    }

    const responseCode = vnpParams['vnp_ResponseCode'];
    const txnRef = vnpParams['vnp_TxnRef'];
    const order = await Order.findOne({ vnpayTxnRef: txnRef });

    if (!order) {
      return res.redirect(`${frontendBase}/orders/payment-result?status=failed&message=order_not_found`);
    }

    const orderId = order._id;

    if (responseCode === '00') {
      await Order.findByIdAndUpdate(orderId, {
        status: 'paid',
        $push: { statusHistory: { status: 'paid', note: 'Thanh toán VNPay thành công' } },
      });
      // Tăng usedCount voucher sau khi VNPay thành công
      if (order.voucher?.code) {
        await Voucher.findOneAndUpdate(
          { code: order.voucher.code },
          {
            $inc: { usedCount: 1 },
            $push: { usedBy: { user: order.user, usedAt: new Date() } },
          }
        );
      }
      return res.redirect(`${frontendBase}/orders/payment-result?status=success&orderId=${orderId}`);
    } else {
      // ===== XỬ LÝ HỦY THANH TOÁN =====
      // Không xóa đơn hàng, chỉ cập nhật trạng thái thành "cancelled"
      if (order.status === 'pending') {
        // Hoàn kho
        for (const item of order.items) {
          await Product.updateOne({ _id: item.product }, { $inc: { quantity: item.quantity } });
        }
        // Voucher chưa được tăng (VNPay) → không cần hoàn
        await Order.findByIdAndUpdate(orderId, {
          status: 'cancelled',
          $push: { statusHistory: { status: 'cancelled', note: `Thanh toán VNPay bị hủy - mã lỗi ${responseCode}` } },
        });
      }
      // Redirect về trang thất bại với orderId để FE có thể lấy thông tin đơn hàng
      return res.redirect(`${frontendBase}/orders/payment-result?status=failed&orderId=${orderId}&code=${responseCode}`);
    }
  } catch (err) {
    console.error('VNPAY RETURN ERROR:', err);
    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendBase}/orders/payment-result?status=failed&message=server_error`);
  }
};

// ===============================
// GET /api/orders/me/:id
// ===============================
exports.getMyOrderById = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const order = await Order.findOne({ _id: req.params.id, user: userId });
    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });

    return res.status(200).json({ success: true, data: order });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// GET /api/orders/me
// ===============================
exports.listMyOrders = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// GET /api/orders (admin)
// ===============================
exports.listAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      data: orders,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// PUT /api/orders/:id/status (admin)
// ===============================
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    if (!['pending', 'confirmed', 'paid', 'shipping', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Hoàn kho và voucher khi admin hủy đơn (chỉ hoàn nếu chưa cancelled trước đó)
    if (status === 'cancelled' && order.status !== 'cancelled') {
      await Product.bulkWrite(
        order.items.map((item) => ({
          updateOne: {
            filter: { _id: item.product },
            update: { $inc: { quantity: item.quantity } },
          },
        }))
      );
      // Hoàn voucher nếu đơn đã được tính (COD confirmed, hoặc VNPay paid)
      const voucherWasUsed = ['confirmed', 'paid', 'shipping', 'completed'].includes(order.status);
      if (voucherWasUsed) await releaseVoucher(order);
    }

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status,
        $push: { statusHistory: { status, note: note || `Admin cập nhật: ${status}` } },
      },
      { new: true }
    );

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// PUT /api/orders/:id/cancel (user tự hủy)
// Chỉ hủy được khi đơn còn pending hoặc confirmed
// ===============================
exports.cancelMyOrder = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const order = await Order.findOne({ _id: req.params.id, user: userId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    // Chỉ cho hủy khi chưa giao
    const cancellableStatuses = ['pending', 'confirmed'];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Không thể hủy đơn ở trạng thái "${order.status}". Chỉ hủy được khi đơn chưa được giao.`,
      });
    }

    // Hoàn kho
    await Product.bulkWrite(
      order.items.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { quantity: item.quantity } },
        },
      }))
    );

    // Hoàn voucher (COD confirmed đã tăng usedCount rồi)
    if (order.status === 'confirmed') await releaseVoucher(order);

    const updated = await Order.findByIdAndUpdate(
      order._id,
      {
        status: 'cancelled',
        $push: { statusHistory: { status: 'cancelled', note: 'Khách hàng tự hủy đơn' } },
      },
      { new: true }
    );

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
// ===============================
// DELETE /api/orders/:id (admin)
// ===============================
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Hoàn lại stock nếu đơn hàng chưa hoàn thành
    if (['pending', 'paid', 'shipping'].includes(order.status)) {
      const Product = require('../models/Product');
      for (const item of order.items) {
        await Product.updateOne(
          { _id: item.product },
          { $inc: { quantity: item.quantity } }
        );
      }
    }

    await Order.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: 'Đã xóa đơn hàng và hoàn lại kho' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};