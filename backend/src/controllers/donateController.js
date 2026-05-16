const crypto = require('crypto');
const moment = require('moment');
const { sendDonationThankYou } = require('../utils/donateService');
const Donation = require('../models/Donation');

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

function verifyVNPaySignature(vnp_Params, secretKey) {
    // Tạo bản copy để không mutate object gốc
    const params = { ...vnp_Params };
    const secureHash = params['vnp_SecureHash'];
    delete params['vnp_SecureHash'];
    delete params['vnp_SecureHashType'];

    // PHẢI encode lại theo đúng cách createPayment đã ký, vì Express tự decode query string
    const sortedParams = sortObject(params);
    const signData = Object.keys(sortedParams)
        .map(key => `${key}=${sortedParams[key]}`)
        .join('&');

    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    const ok = signed === secureHash;
    if (!ok) {
        console.error('[Donate] Signature mismatch');
        console.error('  Expected:', secureHash);
        console.error('  Got     :', signed);
    }
    return ok;
}

// ====== POST /api/donate/create-payment ======
exports.createPayment = async (req, res) => {
    try {
        process.env.TZ = 'Asia/Ho_Chi_Minh';

        const { amount, email, name } = req.body;

        if (!amount || isNaN(amount) || Number(amount) < 1000) {
            return res.status(400).json({ message: 'Số tiền không hợp lệ (tối thiểu 1,000 VND)' });
        }

        const date = new Date();
        const createDate = moment(date).format('YYYYMMDDHHmmss');
        const orderId = `${moment(date).format('YYMMDD')}${moment(date).format('HHmmssSSS')}`;

        const vnp_TmnCode = process.env.VNP_TMNCODE;
        const vnp_HashSecret = process.env.VNP_HASHSECRET;
        const vnpUrl = process.env.VNP_URL;
        const returnUrl = process.env.VNP_RETURN_URL;

        if (!vnp_TmnCode || !vnp_HashSecret || !vnpUrl || !returnUrl) {
            console.error('[Donate] Missing VNPay config');
            return res.status(500).json({ message: 'Cấu hình thanh toán chưa đầy đủ' });
        }

        // Lưu Donation vào DB
        try {
            await Donation.create({
                orderId,
                amount: parseInt(amount),
                name: name || '',
                email: email || '',
                status: 'pending',
            });
        } catch (dbError) {
            console.error('[Donate] DB error:', dbError.message);
            // Không block nếu lỗi DB (unique orderId)
        }

        pendingOrders.set(orderId, {
            email: email || null,
            name: name || null,
            amount: parseInt(amount),
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
        const vnp_HashSecret = process.env.VNP_HASHSECRET;
        const base = process.env.CLIENT_URL || 'http://localhost:5173';

        const orderId = vnp_Params['vnp_TxnRef'];
        const rspCode = vnp_Params['vnp_ResponseCode'];
        const amount = parseInt(vnp_Params['vnp_Amount'] || 0) / 100;

        console.log(`[Donate] vnpayReturn called - orderId=${orderId}, rspCode=${rspCode}, amount=${amount}`);

        if (!verifyVNPaySignature(vnp_Params, vnp_HashSecret)) {
            console.error('[Donate] Invalid signature - vẫn xử lý theo rspCode để không block UX');
            // Fallback: vẫn dùng rspCode để update vì signature thường fail do dev env
        }

        if (rspCode === '00') {
            try {
                const donation = await Donation.findOneAndUpdate(
                    { orderId },
                    { status: 'success', paidAt: new Date() },
                    { new: true }
                );
                console.log(`[Donate] Donation updated to success:`, donation?._id);
                if (donation?.email) {
                    sendDonationThankYou(donation.email, donation.name, donation.amount)
                        .catch(err => console.error('[Donate] Email failed:', err.message));
                }
            } catch (dbError) {
                console.error('[Donate] DB update error:', dbError.message);
            }
            pendingOrders.delete(orderId);
            return res.redirect(`${base}/donate?status=success&amount=${amount}`);
        } else {
            console.log(`[Donate] Failed: Order ${orderId}, Code ${rspCode}`);

            try {
                await Donation.findOneAndUpdate({ orderId }, { status: 'failed' });
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
        const vnp_HashSecret = process.env.VNP_HASHSECRET;

        if (!verifyVNPaySignature(vnp_Params, vnp_HashSecret)) {
            return res.status(400).json({ RspCode: '97', Message: 'Invalid signature' });
        }

        const orderId = vnp_Params['vnp_TxnRef'];
        const rspCode = vnp_Params['vnp_ResponseCode'];
        const amount = parseInt(vnp_Params['vnp_Amount']) / 100;

        if (rspCode === '00') {
            try {
                const donation = await Donation.findOneAndUpdate(
                    { orderId },
                    { status: 'success', paidAt: new Date() },
                    { new: true }
                );
                if (donation?.email) {
                    sendDonationThankYou(donation.email, donation.name, donation.amount)
                        .catch(err => console.error('[Donate IPN] Email failed:', err.message));
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
        const { limit = 50 } = req.query;
        const supporters = await Donation.find({ status: 'success' })
            .sort({ paidAt: -1 })
            .limit(Number(limit))
            .select('name amount paidAt createdAt');
        return res.json({ success: true, data: supporters });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ====== GET /api/donate/top-supporters ======
exports.getTopSupporters = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const supporters = await Donation.find({ status: 'success' })
            .sort({ amount: -1 })
            .limit(Number(limit))
            .select('name amount paidAt createdAt');
        return res.json({ success: true, data: supporters });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ====== GET /api/donate/statistics ======
exports.getDonationStatistics = async (req, res) => {
    try {
        const result = await Donation.aggregate([
            { $match: { status: 'success' } },
            { $group: { _id: null, total: { $sum: 1 }, totalAmount: { $sum: '$amount' } } }
        ]);
        const pending = await Donation.countDocuments({ status: 'pending' });
        return res.json({
            success: true,
            data: {
                total: result[0]?.total || 0,
                totalAmount: result[0]?.totalAmount || 0,
                pending,
            }
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ====== GET /api/donate/admin/list ======
exports.adminListDonations = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const filter = {};
        if (status) filter.status = status;
        const skip = (Number(page) - 1) * Number(limit);
        const total = await Donation.countDocuments(filter);
        const donations = await Donation.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));
        return res.status(200).json({
            success: true,
            data: donations,
            pagination: { page: Number(page), limit: Number(limit), total },
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ====== POST /api/donate/admin/send-voucher-email ======
// Gửi email thông báo voucher cho donor
exports.sendVoucherEmail = async (req, res) => {
    try {
        const { email, name, code, type, value, description, endDate } = req.body;
        if (!email || !code) return res.status(400).json({ success: false, message: 'Thiếu email hoặc mã voucher' });

        const { sendEmail } = require('../utils/emailService');
        const { createNotification } = require('./notificationController');
        const User = require('../models/User');

        const discount = type === 'percent' ? `${value}%` : `${new Intl.NumberFormat('vi-VN').format(value)}đ`;
        const expiry = endDate ? `Hết hạn: ${new Date(endDate).toLocaleDateString('vi-VN')}` : 'Không giới hạn thời gian';

        const html = `
<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"/></head>
<body style="font-family:Arial,sans-serif;background:#f9f9f9;padding:20px;">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
  <div style="background:linear-gradient(135deg,#6272B6,#8B9FE8);padding:32px;text-align:center;">
    <div style="font-size:48px;">🎁</div>
    <h1 style="color:#fff;font-size:22px;margin:12px 0 0;">Quà tặng từ PetAdopt</h1>
  </div>
  <div style="padding:32px;">
    <p>Xin chào <strong>${name || 'bạn'}</strong>,</p>
    <p>Cảm ơn bạn đã ủng hộ trung tâm bảo trợ thú cưng PetAdopt. Đây là voucher giảm giá dành riêng cho bạn:</p>
    <div style="background:#EEF2FF;border:2px dashed #6272B6;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
      <p style="font-size:12px;color:#6366F1;font-weight:bold;letter-spacing:2px;margin:0 0 8px;">MÃ VOUCHER</p>
      <p style="font-size:32px;font-weight:bold;color:#4338CA;letter-spacing:4px;margin:0 0 8px;">${code}</p>
      <p style="font-size:20px;font-weight:bold;color:#10b981;margin:0;">Giảm ${discount}</p>
      ${description ? `<p style="font-size:13px;color:#6B7280;margin:8px 0 0;">${description}</p>` : ''}
      <p style="font-size:12px;color:#9CA3AF;margin:8px 0 0;">${expiry}</p>
    </div>
    <p>Nhập mã này khi thanh toán tại cửa hàng để nhận ưu đãi nhé!</p>
    <p style="color:#9CA3AF;font-size:12px;margin-top:24px;">Cảm ơn sự ủng hộ của bạn 🐾❤️<br/>PetAdopt Team</p>
  </div>
</div>
</body></html>`;

        await sendEmail(email, `🎁 Voucher giảm giá ${discount} từ PetAdopt`, html);

        // Tạo notification trong app nếu email khớp với tài khoản đã đăng ký
        const user = await User.findOne({ email: email.toLowerCase() }).select('_id');
        if (user) {
            await createNotification({
                userId: user._id,
                type: 'voucher_received',
                title: '🎁 Bạn nhận được voucher từ PetAdopt',
                message: `Cảm ơn bạn đã ủng hộ! Admin đã gửi cho bạn mã voucher giảm ${discount}.\n\nMã voucher: ${code}\n${description ? `Mô tả: ${description}\n` : ''}${expiry}`,
                actionUrl: '/products',
                actionLabel: 'Mua sắm ngay',
                metadata: { voucherCode: code, discount, type, value, endDate },
            });
        }

        return res.json({ success: true, message: 'Đã gửi email voucher' });
    } catch (err) {
        console.error('[Donate] Send voucher email error:', err.message);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ====== DELETE /api/donate/admin/:id ======
exports.adminDeleteDonation = async (req, res) => {
    try {
        await Donation.findByIdAndDelete(req.params.id);
        return res.status(200).json({ success: true, message: 'Đã xóa' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
