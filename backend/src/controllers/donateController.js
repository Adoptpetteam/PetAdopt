const crypto = require('crypto');
const moment = require('moment');
const { sendDonationThankYou } = require('../utils/donateService');
const Supporter = require('../models/Supporter');

// ====== In-memory store ======
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

function sortObjectKeys(obj) {
    const sorted = {};
    Object.keys(obj).sort().forEach(key => {
        sorted[key] = obj[key];
    });
    return sorted;
}

function verifyVNPaySignature(vnp_Params, secretKey) {
    const secureHash = vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHash'];

    const sortedParams = sortObjectKeys(vnp_Params);
    const signData = Object.keys(sortedParams)
        .map(key => `${key}=${sortedParams[key]}`)
        .join('&');

    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    return signed === secureHash;
}

// ====== POST /api/donate/create-payment ======
exports.createPayment = async (req, res) => {
    try {
        process.env.TZ = 'Asia/Ho_Chi_Minh';

        const { amount, email, name, phone, message, isAnonymous } = req.body;

        if (!amount || amount < 10000) {
            return res.status(400).json({ message: 'Số tiền tối thiểu 10,000đ' });
        }

        if (!email || !name) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
        }

        const date = new Date();
        const createDate = moment(date).format('YYYYMMDDHHmmss');
        const orderId = createDate;

        const vnp_TmnCode = process.env.VNP_DONATE_TMNCODE;
        const vnp_HashSecret = process.env.VNP_DONATE_HASHSECRET;
        const vnpUrl = process.env.VNP_DONATE_URL;
        const returnUrl = process.env.VNP_DONATE_RETURN_URL;

        // Tạo Supporter record với status pending
        try {
            const supporter = await Supporter.create({
                name: isAnonymous ? 'Ẩn danh' : name,
                email,
                phone: phone || '',
                amount: parseInt(amount),
                message: message || '',
                isAnonymous: isAnonymous || false,
                status: 'pending',
                orderId,
                createdAt: date
            });

            console.log('[Donate] Created supporter:', supporter._id);
        } catch (dbError) {
            console.error('[Donate] DB error:', dbError.message);
            return res.status(500).json({ message: 'Lỗi khi tạo đơn ủng hộ' });
        }

        if (!vnp_TmnCode || !vnp_HashSecret || !vnpUrl || !returnUrl) {
            console.error('[Donate] Missing VNPay config');
            return res.status(500).json({ message: 'Cấu hình thanh toán chưa đầy đủ' });
        }

        pendingOrders.set(orderId, {
            email, name, amount: parseInt(amount), phone, message, isAnonymous,
            createdAt: date,
        });

        const vnp_Params = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode,
            vnp_Locale: 'vn',
            vnp_CurrCode: 'VND',
            vnp_TxnRef: orderId,
            vnp_OrderInfo: `Ung ho ${removeVietnameseTones(name)} - ${amount}d`,
            vnp_OrderType: 'other',
            vnp_Amount: parseInt(amount) * 100,
            vnp_ReturnUrl: returnUrl,
            vnp_IpAddr: getClientIp(req),
            vnp_CreateDate: createDate,
        };

        const sortedParams = sortObject(vnp_Params);
        const signData = Object.keys(sortedParams)
            .map(key => `${key}=${sortedParams[key]}`)
            .join('&');

        const hmac = crypto.createHmac('sha512', vnp_HashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        vnp_Params['vnp_SecureHash'] = signed;

        const paymentUrl = vnpUrl + '?' + Object.keys(vnp_Params)
            .map(key => `${key}=${encodeURIComponent(vnp_Params[key])}`)
            .join('&');

        console.log(`[Donate] Created payment: ${orderId}, Amount: ${amount}`);
        return res.json({ paymentUrl });

    } catch (error) {
        console.error('[Donate] Create payment error:', error.message);
        return res.status(500).json({ message: 'Lỗi hệ thống' });
    }
};

// ====== GET /api/donate/vnpay-return ======
exports.vnpayReturn = async (req, res) => {
    try {
        const vnp_Params = { ...req.query };
        const vnp_HashSecret = process.env.VNP_DONATE_HASHSECRET;
        const base = process.env.CLIENT_URL || 'http://localhost:5173';

        if (!verifyVNPaySignature(vnp_Params, vnp_HashSecret)) {
            console.error('[Donate] Invalid signature');
            return res.redirect(`${base}/donate?status=error`);
        }

        const orderId = vnp_Params['vnp_TxnRef'];
        const rspCode = vnp_Params['vnp_ResponseCode'];
        const amount = parseInt(vnp_Params['vnp_Amount']) / 100;

        if (rspCode === '00') {
            console.log(`[Donate] Success: Order ${orderId}, Amount ${amount}`);
            
            // Cập nhật Supporter status thành completed
            try {
                const supporter = await Supporter.findOneAndUpdate(
                    { orderId },
                    { 
                        status: 'completed',
                        completedAt: new Date()
                    },
                    { new: true }
                );

                if (supporter) {
                    console.log('[Donate] Updated supporter status to completed');
                    
                    // Gửi email cảm ơn
                    sendDonationThankYou(supporter.email, supporter.name, supporter.amount)
                        .catch(err => console.error('[Donate] Send thank-you email failed:', err.message));
                }
            } catch (dbError) {
                console.error('[Donate] DB update error:', dbError.message);
            }

            pendingOrders.delete(orderId);
            return res.redirect(`${base}/donate?status=success&amount=${amount}`);
        } else {
            console.log(`[Donate] Failed: Order ${orderId}, Code ${rspCode}`);
            
            // Cập nhật Supporter status thành failed
            try {
                await Supporter.findOneAndUpdate(
                    { orderId },
                    { status: 'failed' }
                );
            } catch (dbError) {
                console.error('[Donate] DB update error:', dbError.message);
            }
        
            pendingOrders.delete(orderId);
            return res.redirect(`${base}/donate?status=failed&code=${rspCode}`);
        }
    } catch (error) {
        console.error('[Donate] Return error:', error.message);
        const base = process.env.CLIENT_URL || 'http://localhost:5173';
        return res.redirect(`${base}/donate?status=error`);
    }
};

// ====== GET /api/donate/vnpay-ipn ======
exports.vnpayIPN = async (req, res) => {
    try {
        const vnp_Params = { ...req.query };
        const vnp_HashSecret = process.env.VNP_DONATE_HASHSECRET;

        if (!verifyVNPaySignature(vnp_Params, vnp_HashSecret)) {
            return res.status(400).json({ RspCode: '97', Message: 'Invalid signature' });
        }

        const orderId = vnp_Params['vnp_TxnRef'];
        const rspCode = vnp_Params['vnp_ResponseCode'];
        const amount = parseInt(vnp_Params['vnp_Amount']) / 100;

        if (rspCode === '00') {
            console.log(`[Donate IPN] Success: Order ${orderId}, Amount ${amount}`);
            
            try {
                const supporter = await Supporter.findOneAndUpdate(
                    { orderId },
                    { 
                        status: 'completed',
                        completedAt: new Date()
                    },
                    { new: true }
                );

                if (supporter) {
                    sendDonationThankYou(supporter.email, supporter.name, supporter.amount)
                        .catch(err => console.error('[Donate IPN] Send thank-you email failed:', err.message));
                }
            } catch (dbError) {
                console.error('[Donate IPN] DB update error:', dbError.message);
            }
        }

        return res.status(200).json({ RspCode: '00', Message: 'Success' });
    } catch (error) {
        console.error('[Donate IPN] Error:', error.message);
        return res.status(500).json({ RspCode: '99', Message: 'System error' });
    }
};

// ====== GET /api/donate/supporters ======
exports.getSupporters = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            status = 'completed',
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;
        
        // Build query
        const query = {};
        if (status && status !== 'all') {
            query.status = status;
        }
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Build sort
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const [supporters, total] = await Promise.all([
            Supporter.find(query)
                .sort(sort)
                .limit(parseInt(limit))
                .skip(skip),
            Supporter.countDocuments(query)
        ]);

        return res.json({
            success: true,
            data: supporters,
            pagination: {
                current: parseInt(page),
                pageSize: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (err) {
        console.error('[Donate] Get supporters error:', err);
        return res.status(500).json({ 
            success: false, 
            message: 'Lỗi khi lấy danh sách người ủng hộ',
            error: err.message 
        });
    }
};

// ====== GET /api/donate/top-supporters ======
exports.getTopSupporters = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        
        const supporters = await Supporter.aggregate([
            { $match: { status: 'completed' } },
            {
                $group: {
                    _id: '$email',
                    name: { $first: '$name' },
                    totalAmount: { $sum: '$amount' },
                    donationCount: { $sum: 1 },
                    isAnonymous: { $first: '$isAnonymous' },
                    lastDonation: { $max: '$createdAt' },
                    displayName: { $first: '$name' }
                }
            },
            { $sort: { totalAmount: -1 } },
            { $limit: parseInt(limit) }
        ]);

        return res.json({
            success: true,
            data: supporters
        });
    } catch (err) {
        console.error('[Donate] Get top supporters error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ====== GET /api/donate/statistics ======
exports.getDonationStatistics = async (req, res) => {
    try {
        const totalDonations = await Supporter.countDocuments({ status: 'completed' });
        const totalAmount = await Supporter.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const avgAmount = totalDonations > 0 ? 
            (totalAmount[0]?.total || 0) / totalDonations : 0;

        const pending = await Supporter.countDocuments({ status: 'pending' });
        const failed = await Supporter.countDocuments({ status: 'failed' });

        return res.json({
            success: true,
            data: {
                total: totalDonations,
                totalAmount: totalAmount[0]?.total || 0,
                avgAmount: Math.round(avgAmount),
                pending,
                completed: totalDonations,
                failed
            }
        });
    } catch (err) {
        console.error('[Donate] Get statistics error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};
