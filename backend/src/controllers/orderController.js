const Order = require('../models/Order');
const Product = require('../models/Product');

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

// POST /api/orders/checkout
exports.checkoutOrder = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { paymentMethod, customer, items } = req.body;
    if (!paymentMethod || !customer || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid payload' });
    }

    // Validate products exist + stock
    const productIds = items.map((i) => i.productId);
    const uniqueIds = [...new Set(productIds)];

    const products = await Product.find({ _id: { $in: uniqueIds } });
    const productMap = new Map(products.map((p) => [String(p._id), p]));

    for (const it of items) {
      const p = productMap.get(String(it.productId));
      if (!p) return res.status(400).json({ success: false, message: `Product not found: ${it.productId}` });
      const qty = toNumber(it.quantity);
      if (qty <= 0) return res.status(400).json({ success: false, message: 'Quantity must be > 0' });
      if (p.quantity < qty) return res.status(400).json({ success: false, message: `Not enough stock for ${p.name}` });
    }

    // Decrease stock
    for (const it of items) {
      const qty = toNumber(it.quantity);
      await Product.updateOne(
        { _id: it.productId, quantity: { $gte: qty } },
        { $inc: { quantity: -qty } }
      );
    }

    const orderItems = items.map((it) => {
      const p = productMap.get(String(it.productId));
      return {
        product: p._id,
        name: p.name,
        image: p.image,
        price: p.price,
        quantity: toNumber(it.quantity),
      };
    });

    const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await Order.create({
      user: userId,
      status: 'paid',
      paymentMethod,
      customer: {
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        reason: customer.reason,
      },
      items: orderItems,
      totals: { subtotal, total: subtotal },
    });

    return res.status(201).json({
      success: true,
      data: order,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/me
exports.listMyOrders = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

