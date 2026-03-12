const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/setup-2fa', authController.setup2FA);
router.post('/verify-2fa', authController.verify2FA);
router.post('/login-2fa', authController.login2FA);

router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);
router.put('/change-password', authenticate, authController.changePassword);

module.exports = router;
