const Product = require('../models/Product');

const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: 'Thức ăn cho chó',
    price: 120000,
    image: '/images/Jack.png',
    quantity: 10,
    description: 'Thức ăn dinh dưỡng cho chó',
  },
  {
    id: 2,
    name: 'Cát vệ sinh cho mèo',
    price: 80000,
    image: '/images/Jack.png',
    quantity: 20,
    description: 'Cát sạch, khử mùi tốt',
  },
];

async function ensureSeed() {
  const count = await Product.countDocuments();
  if (count > 0) return;
  await Product.insertMany(DEFAULT_PRODUCTS);
}

function normalizeProductPayload(body = {}) {
  return {
    name: body.name !== undefined ? String(body.name).trim() : undefined,
    image: body.image !== undefined ? String(body.image).trim() : undefined,
    price:
      body.price !== undefined && body.price !== ''
        ? Number(body.price)
        : undefined,
    quantity:
      body.quantity !== undefined && body.quantity !== ''
        ? Number(body.quantity)
        : undefined,
    description:
      body.description !== undefined ? String(body.description).trim() : undefined,
  };
}

exports.getProducts = async (req, res, next) => {
  try {
    await ensureSeed();
    const products = await Product.find({}).sort({ id: 1 });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ success: false, message: 'product id không hợp lệ' });
    }

    await ensureSeed();
    const product = await Product.findOne({ id });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const payload = normalizeProductPayload(req.body);
    const name = payload.name;

    if (!name || payload.price === undefined || payload.quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu field bắt buộc: name, price, quantity',
      });
    }

    const last = await Product.findOne({}).sort({ id: -1 }).select('id');
    const nextId = last ? last.id + 1 : 1;

    const product = await Product.create({
      id: nextId,
      name,
      image: payload.image ?? '',
      price: payload.price,
      quantity: payload.quantity,
      description: payload.description ?? '',
    });

    res.status(201).json({ success: true, message: 'Thêm sản phẩm thành công', data: product });
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ success: false, message: 'product id không hợp lệ' });
    }

    const product = await Product.findOne({ id });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

    const payload = normalizeProductPayload(req.body);
    if (payload.name !== undefined) product.name = payload.name;
    if (payload.image !== undefined) product.image = payload.image;
    if (payload.price !== undefined) product.price = payload.price;
    if (payload.quantity !== undefined) product.quantity = payload.quantity;
    if (payload.description !== undefined) product.description = payload.description;

    await product.save();
    res.status(200).json({ success: true, message: 'Cập nhật sản phẩm thành công', data: product });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ success: false, message: 'product id không hợp lệ' });
    }

    const result = await Product.deleteOne({ id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

    res.status(200).json({ success: true, message: 'Xóa sản phẩm thành công' });
  } catch (error) {
    next(error);
  }
};

