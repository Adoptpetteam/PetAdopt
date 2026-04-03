const Product = require('../models/Product');
const ProductOrder = require('../models/ProductOrder');

function normalizePhone(phone) {
  return String(phone ?? '').replace(/[^\d]/g, '');
}

exports.createCheckoutOrder = async (req, res, next) => {
  try {
    const { paymentMethod, customer, items } = req.body || {};

    if (!['momo', 'zalopay'].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'paymentMethod không hợp lệ' });
    }

    const name = String(customer?.name ?? '').trim();
    const address = String(customer?.address ?? '').trim();
    const phone = normalizePhone(customer?.phone);
    const reason = String(customer?.reason ?? '').trim();

    if (!name || !address || !phone || phone.length < 8 || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu/không hợp lệ customer: name, phone, address, reason',
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'items không hợp lệ' });
    }

    const normalizedItems = items
      .map((it) => ({
        productId: Number(it.productId),
        quantity: Number(it.quantity),
      }))
      .filter((it) => Number.isFinite(it.productId) && Number.isFinite(it.quantity) && it.quantity > 0);

    if (normalizedItems.length === 0) {
      return res.status(400).json({ success: false, message: 'items không hợp lệ' });
    }

    // Load products and validate stock.
    const products = await Promise.all(
      normalizedItems.map((it) => Product.findOne({ id: it.productId }))
    );

    for (let i = 0; i < normalizedItems.length; i++) {
      if (!products[i]) {
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy productId = ${normalizedItems[i].productId}`,
        });
      }
      // Tồn kho đã được trừ khi thêm vào giỏ (frontend); không kiểm tra lại theo kiểu đặt hàng trừ kho lần đầu.
    }

    const orderItems = normalizedItems.map((it, idx) => {
      const p = products[idx];
      return {
        productId: p.id,
        name: p.name,
        image: p.image,
        price: p.price,
        quantity: it.quantity,
      };
    });

    const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    // Demo: mark as paid immediately.
    const order = await ProductOrder.create({
      user: req.user?.userId ?? null,
      paymentMethod,
      customer: {
        name,
        phone,
        address,
        reason,
      },
      items: orderItems,
      subtotal,
      total: subtotal,
      status: 'paid',
      paidAt: new Date(),
    });

    // Không trừ kho ở đây: đã trừ khi thêm vào giỏ hàng (reserve).

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const filter = req.user?.userId ? { user: req.user.userId } : {};
    const orders = await ProductOrder.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

