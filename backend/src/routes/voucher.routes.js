const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');
const voucherController = require('../controllers/voucherController');

// User: validate mã voucher (cần đăng nhập)
router.post('/validate', authenticate, voucherController.validateVoucherCode);

// Admin: quản lý voucher
router.get('/admin', authenticate, isAdmin, voucherController.listVouchers);
router.post('/admin', authenticate, isAdmin, voucherController.createVoucher);
router.put('/admin/:id', authenticate, isAdmin, voucherController.updateVoucher);
router.delete('/admin/:id', authenticate, isAdmin, voucherController.deleteVoucher);

module.exports = router;
