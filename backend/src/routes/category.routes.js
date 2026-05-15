const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { authenticate } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

// ====== GET /api/category - Lấy danh sách danh mục ======
router.get('/', async (req, res) => {
  try {
    const { type, isActive = true } = req.query;
    
    const query = { isActive };
    if (type) {
      query.type = type;
    }
    
    const categories = await Category.find(query).sort({ name: 1 });
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('[Category] Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh mục'
    });
  }
});

// ====== GET /api/category/:id - Lấy chi tiết danh mục ======
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục'
      });
    }
    
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('[Category] Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh mục'
    });
  }
});

// ====== POST /api/category - Tạo danh mục mới (Admin) ======
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, description, type } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Tên và loại danh mục là bắt buộc'
      });
    }
    
    // Kiểm tra trùng tên
    const existingCategory = await Category.findOne({ name, type });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Danh mục này đã tồn tại'
      });
    }
    
    const category = await Category.create({
      name,
      description,
      type
    });
    
    res.status(201).json({
      success: true,
      data: category,
      message: 'Tạo danh mục thành công'
    });
  } catch (error) {
    console.error('[Category] Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo danh mục'
    });
  }
});

// ====== PUT /api/category/:id - Cập nhật danh mục (Admin) ======
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục'
      });
    }
    
    // Kiểm tra trùng tên (nếu thay đổi tên)
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ 
        name, 
        type: category.type,
        _id: { $ne: req.params.id }
      });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Tên danh mục này đã tồn tại'
        });
      }
    }
    
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    res.json({
      success: true,
      data: updatedCategory,
      message: 'Cập nhật danh mục thành công'
    });
  } catch (error) {
    console.error('[Category] Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật danh mục'
    });
  }
});

// ====== DELETE /api/category/:id - Xóa danh mục (Admin) ======
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục'
      });
    }
    
    await Category.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Xóa danh mục thành công'
    });
  } catch (error) {
    console.error('[Category] Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa danh mục'
    });
  }
});

module.exports = router;