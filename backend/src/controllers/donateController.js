const crypto = require('crypto');
const moment = require('moment');
const { sendDonationThankYou } = require('../utils/donateService');
const Supporter = require('../models/Supporter');

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
exports.createPayment = async (req, res) => {
    process.env.TZ = 'Asia/Ho_Chi_Minh';

    const { amount, email, name, phone, message, isAnonymous } = req.body;

    // Validate
    if (!amount || isNaN(amount) || Number(amount) < 1000) {
        return res.status(400).json({ message: 'Số tiền không hợp lệ (tối thiểu 1,000 VND)' });
    }
    
    if (!email || !name) {
        return res.status(400).json({ message: 'Vui lòng nhập tên và email' });
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

    const vnp_TmnCode = process.env.VNP_DONATE_TMNCODE;
    const vnp_HashSecret = process.env.VNP_DONATE_HASHSECRET;
    const vnpUrl = process.env.VNP_DONATE_URL;
    const returnUrl = process.env.VNP_DONATE_RETURN_URL;

    // Tạo Supporter record với status pending
    try {
        const supporter = await Supporter.create({
            name,
            email,
            phone: phone || '',
            amount: Number(amount),
            message: message || '',
            paymentMethod: 'vnpay',
            transactionId: orderId,
            status: 'pending',
            isAnonymous: isAnonymous || false,
            displayName: name,
            vnpayData: {
                orderId
            }
        });
        
        // Lưu đơn chờ để verify IPN
        pendingOrders.set(orderId, {
            amount: Number(amount),
            email,
            name,
            phone,
            message,
            isAnonymous,
            supporterId: supporter._id,
            orderInfo: orderDescription,
            createdAt: date,
        });
    } catch (error) {
        console.error('[Donate] Create supporter failed:', error);
        return res.status(500).json({ message: 'Lỗi khi tạo đơn ủng hộ' });
    }

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

    console.log('[Donate] TmnCode:', vnp_TmnCode);
    console.log('[Donate] HashSecret exists:', !!vnp_HashSecret);
    console.log('[Donate] VNP URL:', vnpUrl);
    console.log('[Donate] Return URL:', returnUrl);
    console.log('[Donate] Payment URL:', paymentUrl.substring(0, 200));

    res.json({ paymentUrl, orderId });
};

// ====== GET /api/donate/vnpay-return ======
// Xử lý khi VNPay redirect khách hàng quay về
exports.vnpayReturn = async (req, res) => {
    const vnp_Params = { ...req.query };
    const vnp_HashSecret = process.env.VNP_DONATE_HASHSECRET;
    const base = process.env.CLIENT_URL || 'http://localhost:5173';

    const isValidSignature = verifyVNPaySignature(vnp_Params, vnp_HashSecret);
    const rspCode = vnp_Params['vnp_ResponseCode'];
    const orderId = vnp_Params['vnp_TxnRef'];
    const amount = vnp_Params['vnp_Amount'];

    console.log('[Donate Return] orderId:', orderId);
    console.log('[Donate Return] rspCode:', rspCode);
    console.log('[Donate Return] isValidSignature:', isValidSignature);

    if (isValidSignature && rspCode === '00') {
        // Thanh toán thành công
        console.log(`[Donate] Success: Order ${orderId}, Amount ${amount}`);
        
        // Cập nhật Supporter status thành completed
        const supporter = await Supporter.findOneAndUpdate(
            { transactionId: orderId },
            { 
                status: 'completed',
                'vnpayData.responseCode': rspCode,
                'vnpayData.transactionNo': vnp_Params['vnp_TransactionNo'],
                'vnpayData.bankCode': vnp_Params['vnp_BankCode'],
                'vnpayData.cardType': vnp_Params['vnp_CardType'],
                'vnpayData.payDate': vnp_Params['vnp_PayDate']
            },
            { new: true }
        );
        
        if (supporter) {
            // Lấy thông tin order để gửi mail cảm ơn
            const order = pendingOrders.get(orderId);
            if (order) {
                pendingOrders.delete(orderId);
                // Gửi email cảm ơn (async, không block redirect)
                if (order.email) {
                    sendDonationThankYou(order.email, order.name, order.amount)
                        .catch(err => console.error('[Donate] Send thank-you email failed:', err.message));
                }
            } else {
                // Nếu không có trong Map, gửi email từ DB
                if (supporter.email) {
                    sendDonationThankYou(supporter.email, supporter.name, supporter.amount)
                        .catch(err => console.error('[Donate] Send thank-you email failed:', err.message));
                }
            }
        }
        
        res.redirect(`${base}/donate?status=success&code=${rspCode}`);
    } else {
        console.log(`[Donate] Failed: Order ${orderId}, Code ${rspCode}`);
        
        // Cập nhật Supporter status thành failed
        await Supporter.findOneAndUpdate(
            { transactionId: orderId },
            { 
                status: 'failed',
                'vnpayData.responseCode': rspCode
            }
        );
        
        pendingOrders.delete(orderId);
        res.redirect(`${base}/donate?status=failed&code=${rspCode}`);
    }
};

// ====== GET /api/donate/vnpay-ipn ======
// VNPay gọi server-to-server (IPN) — cần trả JSON cho VNPay
exports.vnpayIPN = async (req, res) => {
    const vnp_Params = { ...req.query };
    const vnp_HashSecret = process.env.VNP_DONATE_HASHSECRET;

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
        
        // Cập nhật Supporter status
        await Supporter.findOneAndUpdate(
            { transactionId: orderId },
            { 
                status: 'completed',
                'vnpayData.responseCode': rspCode,
                'vnpayData.transactionNo': vnp_Params['vnp_TransactionNo'],
                'vnpayData.bankCode': vnp_Params['vnp_BankCode']
            }
        );
        
        pendingOrders.delete(orderId);

        // Gửi email cảm ơn (async, không block IPN response)
        if (order.email) {
            sendDonationThankYou(order.email, order.name, order.amount)
                .catch(err => console.error('[Donate IPN] Send thank-you email failed:', err.message));
        }

        return res.status(200).json({ RspCode: '00', Message: 'Success' });
    } else {
        // ❌ Thất bại
        console.log(`[Donate IPN] Payment FAILED: order=${orderId}, code=${rspCode}`);
        
        // Cập nhật Supporter status
        await Supporter.findOneAndUpdate(
            { transactionId: orderId },
            { 
                status: 'failed',
                'vnpayData.responseCode': rspCode
            }
        );
        
        pendingOrders.delete(orderId);
        return res.status(200).json({ RspCode: '00', Message: 'Success' });
    }
};


// ====== GET /api/donate/supporters (admin) ======
exports.getSupporters = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const filter = {};
        if (status) filter.status = status;

        const skip = (Number(page) - 1) * Number(limit);
        const total = await Supporter.countDocuments(filter);
        const supporters = await Supporter.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        return res.status(200).json({
            success: true,
            data: supporters,
            pagination: { 
                page: Number(page), 
                limit: Number(limit), 
                total, 
                pages: Math.ceil(total / Number(limit)) 
            }
        });
    } catch (err) {
        console.error('[Donate] Get supporters error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ====== GET /api/donate/top-supporters ======
exports.getTopSupporters = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        
        // Kiểm tra xem có supporter nào không
        const count = await Supporter.countDocuments({ status: 'completed' });
        
        if (count === 0) {
            return res.status(200).json({
                success: true,
                data: []
            });
        }
        
        // Top supporters theo tổng số tiền ủng hộ
        const topSupporters = await Supporter.aggregate([
            { $match: { status: 'completed' } },
            {
                $group: {
                    _id: '$email',
                    name: { $first: '$name' },
                    displayName: { $first: '$displayName' },
                    isAnonymous: { $first: '$isAnonymous' },
                    totalAmount: { $sum: '$amount' },
                    donationCount: { $sum: 1 },
                    lastDonation: { $max: '$createdAt' }
                }
            },
            { $sort: { totalAmount: -1 } },
            { $limit: Number(limit) }
        ]);

        return res.status(200).json({
            success: true,
            data: topSupporters
        });
    } catch (err) {
        console.error('[Donate] Get top supporters error:', err);
        console.error('[Donate] Error stack:', err.stack);
        return res.status(500).json({ 
            success: false, 
            message: err.message,
            error: 'Lỗi khi lấy danh sách người ủng hộ'
        });
    }
};

// ====== GET /api/donate/statistics (admin) ======
exports.getDonationStatistics = async (req, res) => {
    try {
        const totalDonations = await Supporter.countDocuments({ status: 'completed' });
        const pendingDonations = await Supporter.countDocuments({ status: 'pending' });
        const failedDonations = await Supporter.countDocuments({ status: 'failed' });
        
        // Tổng số tiền đã nhận
        const totalAmountResult = await Supporter.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalAmount = totalAmountResult.length > 0 ? totalAmountResult[0].total : 0;
        
        // Số tiền trung bình mỗi đơn
        const avgAmount = totalDonations > 0 ? Math.round(totalAmount / totalDonations) : 0;
        
        // Thống kê theo tháng (6 tháng gần nhất)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const monthlyStats = await Supporter.aggregate([
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
                    amount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        return res.status(200).json({
            success: true,
            data: {
                overview: {
                    total: totalDonations,
                    pending: pendingDonations,
                    failed: failedDonations,
                    totalAmount,
                    avgAmount
                },
                monthlyStats
            }
        });
    } catch (err) {
        console.error('[Donate] Get statistics error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};
