const Order = require('../models/Order');
const Transaction = require('../models/Transaction');

// ====== Helpers ======

function generateOrderCode() {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 9000) + 1000;
    return `ORD${timestamp}${random}`;
}

// data.code = mã thanh toán (nội dung CK), data.content = mô tả giao dịch
// Ưu tiên data.code, fallback sang content nếu cần
function extractOrderCode(payload) {
    const code = payload.code;
    if (code) return code.toUpperCase();
    const content = payload.content;
    if (!content) return null;
    const match = content.match(/ORD[A-Z0-9]+|\d{10,}/i);
    return match ? match[0].toUpperCase() : null;
}

// ====== POST /api/sepay/create-order ======
// Tạo đơn ủng hộ, trả về mã để user chuyển khoản
exports.createOrder = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || isNaN(amount) || Number(amount) < 1000) {
            return res.status(400).json({ message: 'Số tiền không hợp lệ (tối thiểu 1,000 VND)' });
        }

        const code = generateOrderCode();

        // Đơn hàng hết hạn sau 24 giờ
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const order = await Order.create({
            code,
            amount: Number(amount),
            status: 'PENDING',
            expiresAt,
        });

        console.log(`[SePay] Order created: ${code} — ${Number(amount).toLocaleString('vi-VN')} VND`);

        const accountNumber = process.env.SEPAY_ACCOUNT_NUMBER;
        const bank = process.env.SEPAY_BANK_CODE || 'MB';
        const accountName = process.env.SEPAY_ACCOUNT_NAME || 'PawPalace';

        res.status(201).json({
            code: order.code,
            amount: order.amount,
            status: order.status,
            expiresAt: order.expiresAt,
            accountNumber,
            bank,
            accountName,
            qrUrl: `https://qr.sepay.vn/img?acc=${accountNumber}&bank=${bank}&amount=${amount}&des=${code}`,
            transferContent: code,
        });
    } catch (err) {
        console.error('[SePay] Create order error:', err.message);
        res.status(500).json({ message: 'Lỗi khi tạo đơn hàng' });
    }
};

// ====== POST /api/sepay/webhook ======
// Nhận webhook từ SePay khi có giao dịch mới
exports.webhook = async (req, res) => {
    // Luôn trả 200 nhanh để tránh SePay retry
    res.status(200).send('OK');

    const payload = req.body;

    try {
        const {
            id: sepayId,
            gateway,
            accountNumber,
            transferType,
            transferAmount,
            content,
            transactionDate,
            referenceCode,
        } = payload;

        console.log(`[SePay Webhook] Received: id=${sepayId}, type=${transferType}, amount=${transferAmount}, content="${content}"`);

        // 1. Chỉ xử lý khi tiền vào tài khoản
        if (transferType !== 'in') {
            console.log(`[SePay Webhook] Skip — transferType="${transferType}" is not "in"`);
            return;
        }

        // 2. Tránh duplicate — đã xử lý rồi thì bỏ qua
        const existing = await Transaction.findOne({ sepayId });
        if (existing) {
            console.log(`[SePay Webhook] Duplicate webhook id=${sepayId}, skipping`);
            return;
        }

        // 3. Lấy mã đơn hàng từ payload (data.code hoặc parse từ data.content)
        const orderCode = extractOrderCode(payload);
        if (!orderCode) {
            console.log(`[SePay Webhook] No order code found in content="${content}", skipping`);
            // Lưu transaction dù không tìm được đơn (để trace)
            await Transaction.create({
                sepayId,
                orderCode: null,
                gateway: gateway || '',
                accountNumber: accountNumber || '',
                transferAmount: transferAmount || 0,
                transferType: transferType || '',
                content: content || '',
                transactionDate: transactionDate || '',
                referenceCode: referenceCode || '',
            });
            return;
        }

        // 4. Tìm đơn hàng
        const order = await Order.findOne({ code: orderCode });
        if (!order) {
            console.log(`[SePay Webhook] Order not found: ${orderCode}`);
            return;
        }

        // 5. Đơn đã thanh toán hoặc hết hạn thì bỏ qua
        if (order.status === 'PAID') {
            console.log(`[SePay Webhook] Order ${orderCode} already PAID`);
            return;
        }
        if (order.status === 'EXPIRED' || new Date() > order.expiresAt) {
            console.log(`[SePay Webhook] Order ${orderCode} already EXPIRED`);
            return;
        }

        // 6. Kiểm tra số tiền
        if (Number(transferAmount) !== order.amount) {
            console.log(`[SePay Webhook] Amount mismatch for ${orderCode}: expected=${order.amount}, got=${transferAmount}`);
            return;
        }

        // 7. ✅ Hợp lệ — cập nhật đơn hàng
        order.status = 'PAID';
        order.paidAt = new Date();
        order.transactionId = sepayId;
        await order.save();

        // 8. Lưu transaction để tránh duplicate
        await Transaction.create({
            sepayId,
            orderCode,
            gateway: gateway || '',
            accountNumber: accountNumber || '',
            transferAmount: Number(transferAmount),
            transferType,
            content: content || '',
            transactionDate: transactionDate || '',
            referenceCode: referenceCode || '',
        });

        console.log(`[SePay Webhook] ✅ SUCCESS — Order ${orderCode} marked as PAID, amount=${transferAmount}`);
    } catch (err) {
        console.error('[SePay Webhook] Error processing webhook:', err.message);
    }
};

// ====== GET /api/sepay/order/:code ======
// Kiểm tra trạng thái đơn hàng
exports.getOrder = async (req, res) => {
    try {
        const { code } = req.params;

        const order = await Order.findOne({ code: code.toUpperCase() });
        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        // Tự động đánh dấu hết hạn nếu quá thời gian
        if (order.status === 'PENDING' && new Date() > order.expiresAt) {
            order.status = 'EXPIRED';
            await order.save();
        }

        res.json({
            code: order.code,
            amount: order.amount,
            status: order.status,
            paidAt: order.paidAt,
            createdAt: order.createdAt,
            expiresAt: order.expiresAt,
        });
    } catch (err) {
        console.error('[SePay] Get order error:', err.message);
        res.status(500).json({ message: 'Lỗi khi lấy thông tin đơn hàng' });
    }
};
