const crypto = require('crypto');
const moment = require('moment');
const { sendDonationThankYou } = require('../utils/donateService');

// ====== In-memory store (thay bằng MongoDB nếu cần) ======
// Key: orderId, Value: { amount, email, name, createdAt }
const pendingOrders = new Map();

// ====== Helpers ======
function sortObject(obj) {
    const sorted = {};
    Object.keys(obj).sort().forEach(key => {
        sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, '+');
    });
    return sorted;
}

function removeVietnameseTones(str) {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, (m) => (m === 'đ' ? 'd' : 'D'))
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .trim();
}

function getClientIp(req) {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.connection?.socket?.remoteAddress ||
        '127.0.0.1';
}

function verifyVNPaySignature(vnp_Params, secretKey) {
    const secureHash = vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    const sorted = sortObject(vnp_Params);
    const signData = Object.entries(sorted)
        .map(([k, v]) => `${k}=${v}`)
        .join('&');

    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    return secureHash === signed;
}

// ====== POST /api/donate/create-payment ======
exports.createPayment = (req, res) => {
    process.env.TZ = 'Asia/Ho_Chi_Minh';

    const { amount, email, name } = req.body;

    // Validate
    if (!amount || isNaN(amount) || Number(amount) < 1000) {
        return res.status(400).json({ message: 'Số tiền không hợp lệ (tối thiểu 1,000 VND)' });
    }

    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');
    const orderId = `${moment(date).format('YYMMDD')}${moment(date).format('HHmmss')}`;
    const ipAddr = getClientIp(req);

    // Thời hạn thanh toán: 15 phút
    const expireDate = moment(date).add(15, 'minutes').format('YYYYMMDDHHmmss');

    // Order info: tiếng Việt không dấu
    const orderDescription = `Ung ho PawPalace ${Number(amount).toLocaleString('vi-VN')} VND`;
    const orderInfoNoAccent = removeVietnameseTones(orderDescription);

    const vnp_TmnCode = process.env.VNP_TMNCODE;
    const vnp_HashSecret = process.env.VNP_HASHSECRET;
    const vnpUrl = process.env.VNP_URL;
    const returnUrl = process.env.VNP_RETURN_URL;

    // Lưu đơn chờ để verify IPN (chứa cả email + name để gửi mail cảm ơn)
    pendingOrders.set(orderId, {
        amount: Number(amount),
        email: email || null,
        name: name || null,
        orderInfo: orderDescription,
        createdAt: date,
    });

    const vnp_Params = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode,
        vnp_Locale: 'vn',
        vnp_CurrCode: 'VND',
        vnp_TxnRef: orderId,
        vnp_OrderInfo: orderInfoNoAccent,
        vnp_OrderType: 'billpayment',
        vnp_Amount: String(Number(amount) * 100), // VNPay nhân 100
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate,
        vnp_ExpireDate: expireDate,
    };

    // Build signature
    const sorted = sortObject(vnp_Params);
    const signData = Object.entries(sorted)
        .map(([k, v]) => `${k}=${v}`)
        .join('&');
    const hmac = crypto.createHmac('sha512', vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    const paymentUrl = `${vnpUrl}?${Object.entries({ ...sorted, vnp_SecureHash: signed })
        .map(([k, v]) => `${k}=${v}`)
        .join('&')}`;

    res.json({ paymentUrl, orderId });
};

// ====== GET /api/donate/vnpay-return ======
// Xử lý khi VNPay redirect khách hàng quay về
exports.vnpayReturn = async (req, res) => {
    const vnp_Params = { ...req.query };
    const vnp_HashSecret = process.env.VNP_HASHSECRET;
    const base = process.env.CLIENT_URL || 'http://localhost:5173';

    const isValidSignature = verifyVNPaySignature(vnp_Params, vnp_HashSecret);
    const rspCode = vnp_Params['vnp_ResponseCode'];
    const orderId = vnp_Params['vnp_TxnRef'];
    const amount = vnp_Params['vnp_Amount'];

    if (isValidSignature && rspCode === '00') {
        // Thanh toán thành công
        console.log(`[Donate] Success: Order ${orderId}, Amount ${amount}`);
        // Lấy thông tin order để gửi mail cảm ơn
        const order = pendingOrders.get(orderId);
        if (order) {
            pendingOrders.delete(orderId);
            // Gửi email cảm ơn (async, không block redirect)
            if (order.email) {
                sendDonationThankYou(order.email, order.name, order.amount)
                    .catch(err => console.error('[Donate] Send thank-you email failed:', err.message));
            }
        }
        res.redirect(`${base}/donate?status=success&code=${rspCode}&ref=${orderId}`);
    } else {
        console.log(`[Donate] Failed: Order ${orderId}, Code ${rspCode}`);
        pendingOrders.delete(orderId);
        res.redirect(`${base}/donate?status=failed&code=${rspCode}&ref=${orderId}`);
    }
};

// ====== GET /api/donate/vnpay-ipn ======
// VNPay gọi server-to-server (IPN) — cần trả JSON cho VNPay
exports.vnpayIPN = async (req, res) => {
    const vnp_Params = { ...req.query };
    const vnp_HashSecret = process.env.VNP_HASHSECRET;

    const orderId = vnp_Params['vnp_TxnRef'];
    const rspCode = vnp_Params['vnp_ResponseCode'];
    const amount = vnp_Params['vnp_Amount'];

    console.log(`[Donate IPN] Received: order=${orderId}, code=${rspCode}, amount=${amount}`);

    // 1. Verify signature
    const isValidSignature = verifyVNPaySignature(vnp_Params, vnp_HashSecret);
    if (!isValidSignature) {
        console.log(`[Donate IPN] Invalid signature for order ${orderId}`);
        return res.status(200).json({ RspCode: '97', Message: 'Checksum failed' });
    }

    // 2. Check order exists
    const order = pendingOrders.get(orderId);
    if (!order) {
        console.log(`[Donate IPN] Order not found: ${orderId}`);
        return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
    }

    // 3. Check amount
    const paidAmount = Number(amount) / 100;
    if (paidAmount !== order.amount) {
        console.log(`[Donate IPN] Amount mismatch: expected=${order.amount}, got=${paidAmount}`);
        return res.status(200).json({ RspCode: '04', Message: 'Amount invalid' });
    }

    // 4. Update payment status
    if (rspCode === '00') {
        // ✅ Thành công — gửi email cảm ơn + lưu vào DB (đánh dấu đã thanh toán)
        console.log(`[Donate IPN] Payment SUCCESS: order=${orderId}, amount=${paidAmount}`);
        pendingOrders.delete(orderId);

        // Gửi email cảm ơn (async, không block IPN response)
        if (order.email) {
            sendDonationThankYou(order.email, order.name, order.amount)
                .catch(err => console.error('[Donate IPN] Send thank-you email failed:', err.message));
        }

        // TODO: Lưu Donation record vào MongoDB nếu cần
        return res.status(200).json({ RspCode: '00', Message: 'Success' });
    } else {
        // ❌ Thất bại
        console.log(`[Donate IPN] Payment FAILED: order=${orderId}, code=${rspCode}`);
        pendingOrders.delete(orderId);
        return res.status(200).json({ RspCode: '00', Message: 'Success' });
    }
};
