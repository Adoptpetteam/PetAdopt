const express = require('express');
const router = express.Router();
const {
  createAdoptionRequest,
  getAdoptionRequests,
  getAdoptionRequestById,
  approveAdoptionRequest,
  rejectAdoptionRequest,
  cancelAdoptionRequest,
  getMyAdoptionRequests
} = require('../controllers/adoptionController');
const { authenticate } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

// Public routes
// POST /api/adoption - Tạo đơn nhận nuôi mới
router.post('/', createAdoptionRequest);

// Protected routes
// GET /api/adoption/my-requests - Đơn của user hiện tại
router.get('/my-requests', authenticate, getMyAdoptionRequests);

// GET /api/adoption/:id - Chi tiết đơn
router.get('/:id', getAdoptionRequestById);

// PUT /api/adoption/:id/cancel - Hủy đơn (user)
router.put('/:id/cancel', authenticate, cancelAdoptionRequest);

// Admin routes
// GET /api/adoption - Danh sách tất cả đơn (admin)
router.get('/', authenticate, isAdmin, getAdoptionRequests);

// PUT /api/adoption/:id/approve - Duyệt đơn (admin)
router.put('/:id/approve', authenticate, isAdmin, approveAdoptionRequest);

// PUT /api/adoption/:id/reject - Từ chối đơn (admin)
router.put('/:id/reject', authenticate, isAdmin, rejectAdoptionRequest);

module.exports = router;
