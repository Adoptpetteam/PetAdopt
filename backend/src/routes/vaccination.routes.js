const express = require('express');
const router = express.Router();
const {
  getMyVaccinations,
  createVaccination,
  updateVaccination,
  completeVaccination,
  deleteVaccination,
  getUpcomingVaccinations,
  getAllVaccinations,
  sendReminders
} = require('../controllers/vaccinationController');
const { authenticate } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

// ===============================
// USER ROUTES
// ===============================

// GET /api/vaccinations/me - Lấy lịch tiêm của user
router.get('/me', authenticate, getMyVaccinations);

// GET /api/vaccinations/upcoming - Lịch tiêm sắp tới
router.get('/upcoming', authenticate, getUpcomingVaccinations);

// POST /api/vaccinations - Tạo lịch tiêm mới
router.post('/', authenticate, createVaccination);

// PUT /api/vaccinations/:id - Cập nhật lịch tiêm
router.put('/:id', authenticate, updateVaccination);

// PUT /api/vaccinations/:id/complete - Đánh dấu hoàn thành
router.put('/:id/complete', authenticate, completeVaccination);

// DELETE /api/vaccinations/:id - Xóa lịch tiêm
router.delete('/:id', authenticate, deleteVaccination);

// ===============================
// ADMIN ROUTES
// ===============================

// GET /api/vaccinations/admin/all - Tất cả lịch tiêm (admin)
router.get('/admin/all', authenticate, isAdmin, getAllVaccinations);

// POST /api/vaccinations/admin/send-reminders - Gửi nhắc nhở (admin)
router.post('/admin/send-reminders', authenticate, isAdmin, sendReminders);

module.exports = router;