const Category = require('../models/Category');

// GET ALL
exports.getCategories = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const categories = await Category.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// GET BY ID
exports.getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục'
      });
    }

    return res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// CREATE
exports.createCategory = async (req, res, next) => {
  try {
    const { name, status = 'on' } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        errors: { name: ['Tên danh mục là bắt buộc'] }
      });
    }

    const existed = await Category.findOne({ name: name.trim() });

    if (existed) {
      return res.status(409).json({
        success: false,
        errors: { name: ['Danh mục đã tồn tại'] }
      });
    }

    const category = await Category.create({
      name: name.trim(),
      status
    });

    return res.status(201).json({
      success: true,
      message: 'Tạo thành công',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE
exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy'
      });
    }

    const { name, status } = req.body;

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          errors: { name: ['Tên không được rỗng'] }
        });
      }

      const duplicate = await Category.findOne({
        _id: { $ne: category._id },
        name: name.trim()
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          errors: { name: ['Tên đã tồn tại'] }
        });
      }

      category.name = name.trim();
    }

    if (status !== undefined) category.status = status;

    await category.save();

    return res.status(200).json({
      success: true,
      message: 'Cập nhật thành công',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// DELETE
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Xóa thành công'
    });
  } catch (error) {
    next(error);
  }
};
