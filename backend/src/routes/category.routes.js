const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { authenticate } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

// ====== GET /api/category - Lấy danh sách danh mục ======
router.get('/', async (req, res) => {
  try {
    const { type, isActive } = req.query;
    
    console.log('[Category GET] Query params:', { type, isActive });
    
    const query = {};
    
    // Only filter by isActive if explicitly provided
    if (isActive !== undefined) {
      query.isActive = isActive === 'true' || isActive === true;
    }
    
    if (type) {
      query.type = type;
    }
    
    console.log('[Category GET] MongoDB query:', query);
    
    const categories = await Category.find(query).sort({ name: 1 });
    
    console.log('[Category GET] Found', categories.length, 'categories');
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('[Category GET] ERROR:', error);
    console.error('[Category GET] Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh mục',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
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
    console.log('[Category POST] Request body:', req.body);
    console.log('[Category POST] User:', req.user);
    
    const { name, description, type, image, icon, color, isActive } = req.body;
    
    if (!name || !type) {
      console.log('[Category POST] Validation failed: missing name or type');
      return res.status(400).json({
        success: false,
        message: 'Tên và loại danh mục là bắt buộc'
      });
    }
    
    // Kiểm tra trùng tên
    const existingCategory = await Category.findOne({ name, type });
    if (existingCategory) {
      console.log('[Category POST] Duplicate category:', { name, type });
      return res.status(400).json({
        success: false,
        message: 'Danh mục này đã tồn tại'
      });
    }
    
    console.log('[Category POST] Creating category:', { name, type, isActive });
    
    const category = await Category.create({
      name,
      description,
      type,
      image,
      icon,
      color,
      isActive
    });
    
    console.log('[Category POST] Category created successfully:', category._id);
    
    res.status(201).json({
      success: true,
      data: category,
      message: 'Tạo danh mục thành công'
    });
  } catch (error) {
    console.error('[Category POST] ERROR:', error);
    console.error('[Category POST] Error message:', error.message);
    console.error('[Category POST] Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo danh mục',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// ====== PUT /api/category/:id - Cập nhật danh mục (Admin) ======
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, description, isActive, image, icon, color } = req.body;
    
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
        ...(image !== undefined && { image }),
        ...(icon !== undefined && { icon }),
        ...(color !== undefined && { color }),
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