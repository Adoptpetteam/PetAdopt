const Order = require('../models/Order');
const Product = require('../models/Product');
const crypto = require('crypto');
const querystring = require('querystring');
const { VNPAY_CONFIG } = require('../config/paymentConfig');

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

    const { paymentMethod, customer, items } = req.body;

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

    // ===== TRỪ KHO NGAY (cả COD lẫn VNPay) =====
    // Trừ trước khi tạo order để tránh oversell
    for (const item of items) {
      const qty = toNumber(item.quantity);
      const updated = await Product.updateOne(
        { _id: item.productId, quantity: { $gte: qty } },
        { $inc: { quantity: -qty } }
      );
      if (updated.modifiedCount === 0) {
        // Hoàn lại stock đã trừ trước đó
        for (const prev of items) {
          if (String(prev.productId) === String(item.productId)) break;
          await Product.updateOne(
            { _id: prev.productId },
            { $inc: { quantity: toNumber(prev.quantity) } }
          );
        }
        return res.status(400).json({
          success: false,
          message: `Sản phẩm "${productMap.get(String(item.productId))?.name}" vừa hết hàng`,
        });
      }
    }

    // Create order
    const createdOrder = await Order.create({
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
      totals: { subtotal, total: subtotal },
    });

    // ===== VNPAY FLOW =====
    if (paymentMethod === 'vnpay') {
      const ipAddr =
        req.headers['x-forwarded-for'] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        '127.0.0.1';

      const { payUrl, txnRef } = createVNPayUrl(createdOrder._id, subtotal, ipAddr);
      await Order.findByIdAndUpdate(createdOrder._id, { vnpayTxnRef: txnRef });

      return res.status(201).json({
        success: true,
        paymentMethod: 'vnpay',
        payUrl,
        data: createdOrder,
      });
    }

    // ===== COD FLOW: đánh dấu paid ngay =====
    await Order.findByIdAndUpdate(createdOrder._id, { status: 'paid' });

    return res.status(201).json({
      success: true,
      paymentMethod: 'cod',
      data: { ...createdOrder.toObject(), status: 'paid' },
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
      return res.redirect(`${frontendBase}/orders/success?status=fail&message=invalid_signature`);
    }

    const responseCode = vnpParams['vnp_ResponseCode'];
    const txnRef = vnpParams['vnp_TxnRef'];
    const order = await Order.findOne({ vnpayTxnRef: txnRef });

    if (!order) {
      return res.redirect(`${frontendBase}/orders/success?status=fail&message=order_not_found`);
    }

    const orderId = order._id;

    if (responseCode === '00') {
      await Order.findByIdAndUpdate(orderId, { status: 'paid' });
      return res.redirect(`${frontendBase}/orders/success?status=success&orderId=${orderId}`);
    } else {
      if (order.status === 'pending') {
        for (const item of order.items) {
          await Product.updateOne({ _id: item.product }, { $inc: { quantity: item.quantity } });
        }
        await Order.findByIdAndUpdate(orderId, { status: 'cancelled' });
      }
      return res.redirect(`${frontendBase}/orders/success?status=fail&orderId=${orderId}&code=${responseCode}`);
    }
  } catch (err) {
    console.error('VNPAY RETURN ERROR:', err);
    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendBase}/orders/success?status=fail&message=server_error`);
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
    const { status } = req.body;
    if (!['pending', 'paid', 'shipping', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.status(200).json({ success: true, data: order });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
