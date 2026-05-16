const Order = require('../models/Order');
const Product = require('../models/Product');
const Voucher = require('../models/Voucher');
const User = require('../models/User');
const crypto = require('crypto');
const querystring = require('querystring');
const { VNPAY_CONFIG } = require('../config/paymentConfig');
const { validateVoucherHelper, calcDiscount } = require('./voucherController');
const { sendOrderConfirmation, sendOrderStatusUpdate } = require('../utils/emailService');
const {
  notifyOrderConfirmed,
  notifyOrderPaid,
  notifyOrderShipping,
  notifyOrderCompleted,
  notifyOrderCancelled
} = require('../utils/notificationService');

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
      // TẤT CẢ ĐƠN HÀNG ĐỀU BẮT ĐẦU Ở TRẠNG THÁI PENDING
      // Đợi admin duyệt trước khi xử lý
      createdOrder = await Order.create({
        user: userId,
        // Old status (backward compatible)
        status: 'pending',
        // New status fields
        orderStatus: 'pending',
        paymentStatus: paymentMethod === 'vnpay' ? 'pending' : 'unpaid',
        returnStatus: null,
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
    // KHÔNG tăng ngay nữa - đợi admin duyệt đơn
    // Voucher sẽ được tăng khi admin confirm đơn hàng

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

    // ===== COD FLOW: Giữ ở pending, đợi admin duyệt =====
    // KHÔNG tự động chuyển sang confirmed nữa
    // Admin sẽ duyệt đơn trong trang quản lý
    
    // Gửi email thông báo đơn hàng đã được tạo (chờ xác nhận)
    try {
      const user = await User.findById(userId);
      if (user?.email) {
        await sendOrderConfirmation(user.email, {
          customerName: customer.name,
          orderId: createdOrder._id,
          items: orderItems,
          totals: { subtotal, discount, total },
          paymentMethod: 'cod',
          customer,
          status: 'pending' // Đơn đang chờ xác nhận
        });
      }
    } catch (emailError) {
      console.error('Email error (non-blocking):', emailError.message);
    }

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
      // Thanh toán thành công - CẬP NHẬT TRẠNG THÁI MỚI
      await Order.findByIdAndUpdate(orderId, {
        // Old status (backward compatible)
        status: 'pending', // Vẫn giữ pending, đợi admin duyệt
        // New status fields
        orderStatus: 'pending', // Đợi admin xác nhận
        paymentStatus: 'paid', // Đã thanh toán
        returnStatus: null,
        $push: { statusHistory: { status: 'paid', note: 'Thanh toán VNPay thành công - Đợi admin xác nhận đơn' } },
      });
      
      // KHÔNG tăng usedCount voucher ngay - đợi admin duyệt đơn
      // Voucher sẽ được tăng khi admin confirm đơn hàng

      // Gửi email xác nhận thanh toán VNPay thành công
      try {
        const user = await User.findById(order.user);
        if (user?.email) {
          await sendOrderConfirmation(user.email, {
            customerName: order.customer.name,
            orderId: order._id,
            items: order.items,
            totals: order.totals,
            paymentMethod: 'vnpay',
            customer: order.customer,
            status: 'pending' // Đơn đang chờ admin xác nhận
          });
        }
      } catch (emailError) {
        console.error('Email error (non-blocking):', emailError.message);
      }

      // Tạo notification
      try {
        await notifyOrderPaid(
          order.user,
          order._id,
          order._id.toString().slice(-8).toUpperCase()
        );
      } catch (notifError) {
        console.error('Notification error (non-blocking):', notifError.message);
      }

      return res.redirect(`${frontendBase}/orders/payment-result?status=success&orderId=${orderId}`);
    } else {
      // ===== XỬ LÝ HỦY THANH TOÁN =====
      // Không xóa đơn hàng, chỉ cập nhật trạng thái thành "cancelled"
      if (order.status === 'pending' || order.orderStatus === 'pending') {
        // Hoàn kho
        for (const item of order.items) {
          await Product.updateOne({ _id: item.product }, { $inc: { quantity: item.quantity } });
        }
        // Voucher chưa được tăng (VNPay) → không cần hoàn
        await Order.findByIdAndUpdate(orderId, {
          // Old status
          status: 'cancelled',
          // New status fields
          orderStatus: 'cancelled',
          paymentStatus: 'failed',
          returnStatus: null,
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
// PUT /api/orders/:id/status (admin)
// ===============================
exports.updateOrderStatus = async (req, res) => {
  try {
    console.log('[updateOrderStatus] Request received:', {
      orderId: req.params.id,
      body: req.body
    });
    
    const { status, note, orderStatus, paymentStatus, returnStatus } = req.body;
    
    // Validate old status (backward compatible)
    const validStatuses = [
      'pending', 'confirmed', 'paid', 'shipping', 'completed', 'cancelled',
      'refund_pending', 'refund_processing', 'refund_completed',
      'return_requested', 'return_shipping', 'return_received',
      'exchange_requested', 'exchange_shipping', 'exchange_completed'
    ];
    
    if (status && !validStatuses.includes(status)) {
      console.log('[updateOrderStatus] Invalid status:', status);
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      console.log('[updateOrderStatus] Order not found:', req.params.id);
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    console.log('[updateOrderStatus] Current order:', {
      _id: order._id,
      status: order.status,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod
    });

    // ===== XỬ LÝ ADMIN CONFIRM ĐƠN HÀNG =====
    // Khi admin chuyển từ pending → confirmed
    const isConfirming = (orderStatus === 'confirmed' || status === 'confirmed') && 
                         (order.orderStatus === 'pending' || order.status === 'pending');
    
    if (isConfirming) {
      // Tăng usedCount voucher khi admin duyệt đơn
      if (order.voucher?.code) {
        await Voucher.findOneAndUpdate(
          { code: order.voucher.code },
          {
            $inc: { usedCount: 1 },
            $push: { usedBy: { user: order.user, usedAt: new Date() } },
          }
        );
      }
    }

    // Hoàn kho và voucher khi admin hủy đơn (chỉ hoàn nếu chưa cancelled trước đó)
    const isCancelling = (orderStatus === 'cancelled' || status === 'cancelled') && 
                         (order.orderStatus !== 'cancelled' && order.status !== 'cancelled');
    
    if (isCancelling) {
      // Hoàn kho
      await Product.bulkWrite(
        order.items.map((item) => ({
          updateOne: {
            filter: { _id: item.product },
            update: { $inc: { quantity: item.quantity } },
          },
        }))
      );
      
      // Hoàn voucher nếu đơn đã được tính (confirmed, shipping, delivered)
      const voucherWasUsed = ['confirmed', 'paid', 'shipping', 'completed'].includes(order.status) ||
                             ['confirmed', 'shipping', 'delivered'].includes(order.orderStatus);
      if (voucherWasUsed) await releaseVoucher(order);
      
      // ===== XỬ LÝ HỦY ĐƠN VNPAY ĐÃ THANH TOÁN =====
      // Nếu đơn VNPay đã thanh toán → Chuyển sang refund_pending và gửi form hoàn tiền
      const isVNPayPaid = order.paymentMethod === 'vnpay' && 
                          (order.paymentStatus === 'paid' || order.status === 'paid');
      
      if (isVNPayPaid) {
        console.log('[Cancel Order] VNPay paid order cancelled - sending refund form');
        
        // Cập nhật trạng thái hoàn tiền
        updateData.paymentStatus = 'refunding';
        updateData.returnStatus = 'requested';
        
        // Khởi tạo thông tin refund
        updateData.refund = {
          reason: note || 'Admin hủy đơn hàng',
          requestedAt: new Date(),
          requestedBy: 'admin',
          amount: order.totals.total,
          note: 'Đơn hàng bị hủy bởi admin - Vui lòng điền form để nhận hoàn tiền'
        };
        
        // Gửi email thông báo và form hoàn tiền (non-blocking)
        const sendRefundEmail = async () => {
          try {
            const user = await User.findById(order.user);
            if (user?.email) {
              const emailService = require('../utils/emailService');
              await emailService.sendRefundFormEmail(user.email, {
                customerName: order.customer.name,
                orderId: order._id,
                amount: order.totals.total,
                reason: 'Admin hủy đơn hàng',
                items: order.items,
                totals: order.totals
              });
              console.log('[Cancel Order] Refund form email sent to:', user.email);
            }
          } catch (emailError) {
            console.error('[Cancel Order] Email error (non-blocking):', emailError.message);
          }
        };
        
        // Tạo notification (non-blocking)
        const sendRefundNotification = async () => {
          try {
            const notificationService = require('../utils/notificationService');
            await notificationService.notifyRefundRequested(
              order.user,
              order._id,
              order._id.toString().slice(-8).toUpperCase(),
              'Admin đã hủy đơn hàng. Vui lòng điền form hoàn tiền để nhận lại tiền.'
            );
          } catch (notifError) {
            console.error('[Cancel Order] Notification error (non-blocking):', notifError.message);
          }
        };
        
        // Chạy async không chờ
        sendRefundEmail();
        sendRefundNotification();
      }
    }

    // Build update object
    const updateData = {
      $push: { statusHistory: { status: status || orderStatus, note: note || `Admin cập nhật trạng thái` } },
    };
    
    // Update old status if provided (backward compatible)
    if (status) {
      updateData.status = status;
    }
    
    // Update new status fields if provided
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (returnStatus !== undefined) updateData.returnStatus = returnStatus;

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('user', 'name email');

    // Gửi email thông báo cập nhật trạng thái
    if (updated && updated.user?.email) {
      try {
        await sendOrderStatusUpdate(updated.user.email, {
          customerName: updated.customer.name,
          orderId: updated._id,
          status: orderStatus || status,
          note: note || `Admin cập nhật trạng thái`,
          items: updated.items,
          totals: updated.totals
        });
      } catch (emailError) {
        console.error('Email error (non-blocking):', emailError.message);
      }
    }

    // Tạo notification theo trạng thái
    if (updated && updated.user) {
      try {
        const orderCode = updated._id.toString().slice(-8).toUpperCase();
        const userId = updated.user._id || updated.user;
        
        const currentStatus = orderStatus || status;
        switch (currentStatus) {
          case 'confirmed':
            await notifyOrderConfirmed(userId, updated._id, orderCode);
            break;
          case 'paid':
            await notifyOrderPaid(userId, updated._id, orderCode);
            break;
          case 'shipping':
            await notifyOrderShipping(userId, updated._id, orderCode);
            break;
          case 'completed':
            await notifyOrderCompleted(userId, updated._id, orderCode);
            break;
          case 'cancelled':
            await notifyOrderCancelled(userId, updated._id, orderCode, note || '');
            break;
        }
      } catch (notifError) {
        console.error('Notification error (non-blocking):', notifError.message);
      }
    }

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// PUT /api/orders/me/:id/request-cancel (user yêu cầu hủy đơn VNPay)
// Chuyển sang refund_pending để admin xét duyệt
// ===============================
exports.requestCancelOrder = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const order = await Order.findOne({ _id: req.params.id, user: userId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    // Chỉ cho phép yêu cầu hủy đơn VNPay đã thanh toán
    if (order.paymentMethod !== 'vnpay') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ áp dụng cho đơn hàng thanh toán qua VNPay',
      });
    }

    // Chỉ cho hủy khi ở trạng thái pending, confirmed, paid
    const cancellableStatuses = ['pending', 'confirmed', 'paid'];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Không thể hủy đơn hàng ở trạng thái ${order.status}`,
      });
    }

    // Chuyển sang refund_pending
    const updated = await Order.findByIdAndUpdate(
      order._id,
      {
        status: 'refund_pending',
        $push: { 
          statusHistory: { 
            status: 'refund_pending', 
            note: 'Khách hàng yêu cầu hủy đơn và hoàn tiền' 
          } 
        },
      },
      { new: true }
    ).populate('user', 'name email');

    console.log('[Order] Refund request created:', updated._id);

    res.json({
      success: true,
      message: 'Đã gửi yêu cầu hủy đơn. Vui lòng chờ admin xét duyệt.',
      data: updated,
    });
  } catch (error) {
    console.error('[Order] Request cancel error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
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

    // Chỉ cho hủy khi chưa giao hàng
    const cancellableStatuses = ['pending', 'confirmed'];
    if (!cancellableStatuses.includes(order.status)) {
      const statusMessages = {
        'paid': 'đã thanh toán',
        'shipping': 'đang giao hàng', 
        'completed': 'đã hoàn thành',
        'cancelled': 'đã bị hủy'
      };
      
      const statusText = statusMessages[order.status] || order.status;
      
      return res.status(400).json({
        success: false,
        message: `Không thể hủy đơn hàng ${statusText}. Chỉ có thể hủy đơn khi chưa được giao hàng.`,
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
    ).populate('user', 'name email');

    // Gửi email thông báo hủy đơn
    if (updated && updated.user?.email) {
      try {
        await sendOrderStatusUpdate(updated.user.email, {
          customerName: updated.customer.name,
          orderId: updated._id,
          status: 'cancelled',
          note: 'Bạn đã hủy đơn hàng này',
          items: updated.items,
          totals: updated.totals
        });
      } catch (emailError) {
        console.error('Email error (non-blocking):', emailError.message);
      }
    }

    // Tạo notification
    if (updated && updated.user) {
      try {
        const orderCode = updated._id.toString().slice(-8).toUpperCase();
        const userId = updated.user._id || updated.user;
        await notifyOrderCancelled(userId, updated._id, orderCode, 'Bạn đã hủy đơn hàng này');
      } catch (notifError) {
        console.error('Notification error (non-blocking):', notifError.message);
      }
    }

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

// ===============================
// GET /api/orders/statistics (admin)
// Thống kê đơn hàng
// ===============================
exports.getOrderStatistics = async (req, res) => {
  try {
    // Tổng số đơn hàng theo trạng thái
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const confirmedOrders = await Order.countDocuments({ status: 'confirmed' });
    const paidOrders = await Order.countDocuments({ status: 'paid' });
    const shippingOrders = await Order.countDocuments({ status: 'shipping' });
    const completedOrders = await Order.countDocuments({ status: 'completed' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

    // Tổng doanh thu (chỉ tính đơn completed)
    const revenueResult = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totals.total' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Doanh thu theo tháng (6 tháng gần nhất)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totals.total' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Top sản phẩm bán chạy
    const topProducts = await Order.aggregate([
      { $match: { status: { $in: ['completed', 'shipping', 'paid'] } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          image: { $first: '$items.image' },
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    // Phương thức thanh toán
    const paymentMethods = await Order.aggregate([
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 }
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        overview: {
          total: totalOrders,
          pending: pendingOrders,
          confirmed: confirmedOrders,
          paid: paidOrders,
          shipping: shippingOrders,
          completed: completedOrders,
          cancelled: cancelledOrders,
          totalRevenue,
          completionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0
        },
        monthlyRevenue,
        topProducts,
        paymentMethods
      }
    });
  } catch (err) {
    console.error('GET ORDER STATISTICS ERROR:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};


// ===============================
// POST /api/orders/:id/request-refund (user yêu cầu hoàn tiền)
// Dùng khi user muốn hủy đơn đã thanh toán hoặc yêu cầu hoàn tiền sau khi nhận hàng
// ===============================
exports.requestRefund = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { reason, bankAccount, bankName, accountHolder, qrCodeImage } = req.body;

    const order = await Order.findOne({ _id: req.params.id, user: userId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    // Chỉ cho phép yêu cầu hoàn tiền với các trạng thái phù hợp
    const refundableStatuses = ['paid', 'confirmed', 'shipping', 'completed'];
    if (!refundableStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Không thể yêu cầu hoàn tiền cho đơn hàng này',
      });
    }

    // Kiểm tra thời hạn hoàn tiền (3 ngày sau khi completed)
    if (order.status === 'completed') {
      const completedDate = order.statusHistory.find(h => h.status === 'completed')?.changedAt;
      if (completedDate) {
        const daysSinceCompleted = (Date.now() - new Date(completedDate).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceCompleted > 3) {
          return res.status(400).json({
            success: false,
            message: 'Đã quá thời hạn yêu cầu hoàn tiền (3 ngày sau khi nhận hàng)',
          });
        }
      }
    }

    const updated = await Order.findByIdAndUpdate(
      order._id,
      {
        status: 'refund_pending',
        $push: { 
          statusHistory: { 
            status: 'refund_pending', 
            note: `Khách hàng yêu cầu hoàn tiền: ${reason || 'Không có lý do'}` 
          } 
        },
        refund: {
          reason,
          requestedAt: new Date(),
          requestedBy: 'user',
          bankAccount,
          bankName,
          accountHolder,
          qrCodeImage,
          amount: order.totals.total
        }
      },
      { new: true }
    ).populate('user', 'name email');

    // Gửi email thông báo
    if (updated && updated.user?.email) {
      try {
        await sendOrderStatusUpdate(updated.user.email, {
          customerName: updated.customer.name,
          orderId: updated._id,
          status: 'refund_pending',
          note: 'Yêu cầu hoàn tiền của bạn đang được xử lý',
          items: updated.items,
          totals: updated.totals
        });
      } catch (emailError) {
        console.error('Email error (non-blocking):', emailError.message);
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Yêu cầu hoàn tiền đã được gửi, vui lòng chờ admin xử lý',
      data: updated 
    });
  } catch (err) {
    console.error('REQUEST REFUND ERROR:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// POST /api/orders/:id/process-refund (admin xử lý hoàn tiền)
// ===============================
exports.processRefund = async (req, res) => {
  try {
    const adminId = req.user?.userId || req.user?.id;
    const { status, note, bankAccount, bankName, accountHolder, qrCodeImage } = req.body;

    if (!['refund_processing', 'refund_completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid refund status' });
    }

    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'refund_pending' && order.status !== 'refund_processing') {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng không ở trạng thái chờ hoàn tiền',
      });
    }

    const updateData = {
      status,
      $push: { 
        statusHistory: { 
          status, 
          note: note || `Admin ${status === 'refund_completed' ? 'hoàn thành' : 'xử lý'} hoàn tiền` 
        } 
      },
      'refund.processedAt': new Date(),
      'refund.processedBy': adminId,
      'refund.note': note
    };

    // Cập nhật thông tin ngân hàng nếu có
    if (bankAccount) updateData['refund.bankAccount'] = bankAccount;
    if (bankName) updateData['refund.bankName'] = bankName;
    if (accountHolder) updateData['refund.accountHolder'] = accountHolder;
    if (qrCodeImage) updateData['refund.qrCodeImage'] = qrCodeImage;

    // Hoàn kho nếu hoàn tiền thành công
    if (status === 'refund_completed') {
      await Product.bulkWrite(
        order.items.map((item) => ({
          updateOne: {
            filter: { _id: item.product },
            update: { $inc: { quantity: item.quantity } },
          },
        }))
      );
      // Hoàn voucher
      await releaseVoucher(order);
    }

    const updated = await Order.findByIdAndUpdate(
      order._id,
      updateData,
      { new: true }
    ).populate('user', 'name email');

    // Gửi email thông báo
    if (updated && updated.user?.email) {
      try {
        await sendOrderStatusUpdate(updated.user.email, {
          customerName: updated.customer.name,
          orderId: updated._id,
          status,
          note: note || `Hoàn tiền ${status === 'refund_completed' ? 'thành công' : 'đang xử lý'}`,
          items: updated.items,
          totals: updated.totals,
          refundInfo: updated.refund
        });
      } catch (emailError) {
        console.error('Email error (non-blocking):', emailError.message);
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: status === 'refund_completed' ? 'Hoàn tiền thành công' : 'Đã cập nhật trạng thái hoàn tiền',
      data: updated 
    });
  } catch (err) {
    console.error('PROCESS REFUND ERROR:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// POST /api/orders/:id/request-return-exchange (user yêu cầu trả/đổi hàng)
// Chỉ áp dụng sau khi đơn hàng completed (trong vòng 3 ngày)
// ===============================
exports.requestReturnExchange = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { type, reason, images, bankAccount, bankName, accountHolder, qrCodeImage } = req.body; // type: 'return' hoặc 'exchange'

    if (!['return', 'exchange'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid type. Must be "return" or "exchange"' });
    }

    const order = await Order.findOne({ _id: req.params.id, user: userId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    // Chỉ cho phép với đơn đã completed
    if (order.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể yêu cầu trả/đổi hàng sau khi đơn hàng đã hoàn thành',
      });
    }

    // Kiểm tra thời hạn (3 ngày)
    const completedDate = order.statusHistory.find(h => h.status === 'completed')?.changedAt;
    if (completedDate) {
      const daysSinceCompleted = (Date.now() - new Date(completedDate).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCompleted > 3) {
        return res.status(400).json({
          success: false,
          message: 'Đã quá thời hạn yêu cầu trả/đổi hàng (3 ngày sau khi nhận hàng)',
        });
      }
    }

    const newStatus = type === 'return' ? 'return_requested' : 'exchange_requested';

    // Prepare update data
    const updateData = {
      status: newStatus,
      $push: { 
        statusHistory: { 
          status: newStatus, 
          note: `Khách hàng yêu cầu ${type === 'return' ? 'trả hàng' : 'đổi hàng'}: ${reason || 'Không có lý do'}` 
        } 
      },
      returnExchange: {
        type,
        reason,
        requestedAt: new Date(),
        images: images || []
      }
    };

    // Nếu là trả hàng VÀ có thông tin tài khoản, lưu luôn vào refund
    if (type === 'return' && bankAccount && bankName && accountHolder) {
      updateData.refund = {
        reason: reason || 'Trả hàng',
        requestedAt: new Date(),
        requestedBy: 'user',
        bankAccount,
        bankName,
        accountHolder,
        qrCodeImage: qrCodeImage || null,
        amount: order.totals.total
      };
    }

    const updated = await Order.findByIdAndUpdate(
      order._id,
      updateData,
      { new: true }
    ).populate('user', 'name email');

    // Gửi email thông báo
    if (updated && updated.user?.email) {
      try {
        await sendOrderStatusUpdate(updated.user.email, {
          customerName: updated.customer.name,
          orderId: updated._id,
          status: newStatus,
          note: `Yêu cầu ${type === 'return' ? 'trả hàng' : 'đổi hàng'} của bạn đang được xử lý`,
          items: updated.items,
          totals: updated.totals
        });
      } catch (emailError) {
        console.error('Email error (non-blocking):', emailError.message);
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: `Yêu cầu ${type === 'return' ? 'trả hàng' : 'đổi hàng'} đã được gửi`,
      data: updated 
    });
  } catch (err) {
    console.error('REQUEST RETURN/EXCHANGE ERROR:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// POST /api/orders/:id/process-return (admin xử lý trả hàng)
// ===============================
exports.processReturn = async (req, res) => {
  try {
    const { action, note, trackingNumber, inspectionNote, bankAccount, bankName, accountHolder, qrCodeImage } = req.body;
    // action: 'approve_refund' hoặc 'reject'

    if (!['approve_refund', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!['return_requested', 'return_shipping', 'return_received'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng không ở trạng thái yêu cầu trả hàng',
      });
    }

    let newStatus;
    let statusNote;

    if (action === 'approve_refund') {
      // Chuyển sang trạng thái hoàn tiền
      newStatus = 'refund_pending';
      statusNote = 'Admin chấp nhận trả hàng, chuyển sang xử lý hoàn tiền';
      
      const updateData = {
        status: newStatus,
        $push: { statusHistory: { status: newStatus, note: statusNote } },
        'returnExchange.inspectionNote': inspectionNote || note,
        'returnExchange.receivedAt': new Date(),
        refund: {
          reason: order.returnExchange?.reason || 'Trả hàng',
          requestedAt: new Date(),
          requestedBy: 'admin',
          bankAccount,
          bankName,
          accountHolder,
          qrCodeImage,
          amount: order.totals.total
        }
      };

      if (trackingNumber) {
        updateData['returnExchange.trackingNumber'] = trackingNumber;
      }

      const updated = await Order.findByIdAndUpdate(order._id, updateData, { new: true })
        .populate('user', 'name email');

      // Gửi email
      if (updated && updated.user?.email) {
        try {
          await sendOrderStatusUpdate(updated.user.email, {
            customerName: updated.customer.name,
            orderId: updated._id,
            status: newStatus,
            note: 'Yêu cầu trả hàng đã được chấp nhận, chúng tôi sẽ hoàn tiền cho bạn',
            items: updated.items,
            totals: updated.totals
          });
        } catch (emailError) {
          console.error('Email error (non-blocking):', emailError.message);
        }
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Đã chấp nhận trả hàng và chuyển sang xử lý hoàn tiền',
        data: updated 
      });
    } else {
      // Từ chối trả hàng
      newStatus = 'completed';
      statusNote = `Admin từ chối trả hàng: ${note || 'Không đủ điều kiện'}`;

      const updated = await Order.findByIdAndUpdate(
        order._id,
        {
          status: newStatus,
          $push: { statusHistory: { status: newStatus, note: statusNote } },
          'returnExchange.inspectionNote': note
        },
        { new: true }
      ).populate('user', 'name email');

      // Gửi email
      if (updated && updated.user?.email) {
        try {
          await sendOrderStatusUpdate(updated.user.email, {
            customerName: updated.customer.name,
            orderId: updated._id,
            status: newStatus,
            note: `Yêu cầu trả hàng bị từ chối: ${note || 'Không đủ điều kiện'}`,
            items: updated.items,
            totals: updated.totals
          });
        } catch (emailError) {
          console.error('Email error (non-blocking):', emailError.message);
        }
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Đã từ chối yêu cầu trả hàng',
        data: updated 
      });
    }
  } catch (err) {
    console.error('PROCESS RETURN ERROR:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// POST /api/orders/:id/process-exchange (admin xử lý đổi hàng)
// ===============================
exports.processExchange = async (req, res) => {
  try {
    const { action, note, trackingNumber, inspectionNote } = req.body;
    // action: 'approve' hoặc 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!['exchange_requested', 'exchange_shipping'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng không ở trạng thái yêu cầu đổi hàng',
      });
    }

    if (action === 'approve') {
      // Tạo đơn hàng mới với giá 0đ (ship COD)
      const newOrder = await Order.create({
        user: order.user._id || order.user,
        status: 'confirmed',
        paymentMethod: 'cod',
        customer: order.customer,
        items: order.items.map(item => ({
          ...item,
          price: 0 // Giá 0đ
        })),
        totals: {
          subtotal: 0,
          discount: 0,
          total: 0
        },
        voucher: { code: null, discount: 0 }
      });

      const updated = await Order.findByIdAndUpdate(
        order._id,
        {
          status: 'exchange_completed',
          $push: { 
            statusHistory: { 
              status: 'exchange_completed', 
              note: `Admin chấp nhận đổi hàng, đơn mới: ${newOrder._id}` 
            } 
          },
          'returnExchange.inspectionNote': inspectionNote || note,
          'returnExchange.receivedAt': new Date(),
          'returnExchange.newOrderId': newOrder._id
        },
        { new: true }
      ).populate('user', 'name email');

      if (trackingNumber) {
        await Order.findByIdAndUpdate(order._id, {
          'returnExchange.trackingNumber': trackingNumber
        });
      }

      // Gửi email
      if (updated && updated.user?.email) {
        try {
          await sendOrderStatusUpdate(updated.user.email, {
            customerName: updated.customer.name,
            orderId: updated._id,
            status: 'exchange_completed',
            note: `Yêu cầu đổi hàng đã được chấp nhận. Đơn hàng mới: ${newOrder._id.toString().slice(-8).toUpperCase()}`,
            items: updated.items,
            totals: updated.totals
          });
        } catch (emailError) {
          console.error('Email error (non-blocking):', emailError.message);
        }
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Đã chấp nhận đổi hàng và tạo đơn mới',
        data: { originalOrder: updated, newOrder } 
      });
    } else {
      // Từ chối đổi hàng
      const updated = await Order.findByIdAndUpdate(
        order._id,
        {
          status: 'completed',
          $push: { 
            statusHistory: { 
              status: 'completed', 
              note: `Admin từ chối đổi hàng: ${note || 'Không đủ điều kiện'}` 
            } 
          },
          'returnExchange.inspectionNote': note
        },
        { new: true }
      ).populate('user', 'name email');

      // Gửi email
      if (updated && updated.user?.email) {
        try {
          await sendOrderStatusUpdate(updated.user.email, {
            customerName: updated.customer.name,
            orderId: updated._id,
            status: 'completed',
            note: `Yêu cầu đổi hàng bị từ chối: ${note || 'Không đủ điều kiện'}`,
            items: updated.items,
            totals: updated.totals
          });
        } catch (emailError) {
          console.error('Email error (non-blocking):', emailError.message);
        }
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Đã từ chối yêu cầu đổi hàng',
        data: updated 
      });
    }
  } catch (err) {
    console.error('PROCESS EXCHANGE ERROR:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// POST /api/orders/:id/update-return-status (admin cập nhật trạng thái vận chuyển trả hàng)
// ===============================
exports.updateReturnStatus = async (req, res) => {
  try {
    const { status, trackingNumber, note } = req.body;
    // status: 'return_shipping' hoặc 'return_received'

    if (!['return_shipping', 'return_received'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid return status' });
    }

    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const updateData = {
      status,
      $push: { statusHistory: { status, note: note || `Cập nhật: ${status}` } }
    };

    if (trackingNumber) {
      updateData['returnExchange.trackingNumber'] = trackingNumber;
    }

    if (status === 'return_received') {
      updateData['returnExchange.receivedAt'] = new Date();
    }

    const updated = await Order.findByIdAndUpdate(order._id, updateData, { new: true })
      .populate('user', 'name email');

    // Gửi email
    if (updated && updated.user?.email) {
      try {
        const statusText = status === 'return_shipping' ? 'đang được vận chuyển về' : 'đã được nhận';
        await sendOrderStatusUpdate(updated.user.email, {
          customerName: updated.customer.name,
          orderId: updated._id,
          status,
          note: `Hàng trả ${statusText}`,
          items: updated.items,
          totals: updated.totals
        });
      } catch (emailError) {
        console.error('Email error (non-blocking):', emailError.message);
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Đã cập nhật trạng thái trả hàng',
      data: updated 
    });
  } catch (err) {
    console.error('UPDATE RETURN STATUS ERROR:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
