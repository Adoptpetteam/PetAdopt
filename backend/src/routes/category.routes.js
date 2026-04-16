const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/categoryController');
const { authenticate } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

// =========================
// PUBLIC
// =========================

// Lấy danh sách danh mục
router.get('/', categoryController.getCategories);

// Lấy chi tiết danh mục
router.get('/:id', categoryController.getCategoryById);

// =========================
// ADMIN
// =========================

// Tạo danh mục
router.post('/', authenticate, isAdmin, categoryController.createCategory);

// Cập nhật danh mục
router.put('/:id', authenticate, isAdmin, categoryController.updateCategory);

// Xóa danh mục
router.delete('/:id', authenticate, isAdmin, categoryController.deleteCategory);

module.exports = router;
