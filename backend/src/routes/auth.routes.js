const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { 
  userValidation, 
  handleValidationErrors, 
  sanitizeInput,
  authRateLimit,
  otpRateLimit 
} = require('../middleware/validation');

// Apply rate limiting and input sanitization to all routes
router.use(sanitizeInput);

// Registration routes
router.post('/register', 
  authRateLimit,
  userValidation.register, 
  handleValidationErrors, 
  authController.register
);

router.post('/verify-registration-otp', 
  otpRateLimit,
  handleValidationErrors, 
  authController.verifyRegistrationOTP
);

router.post('/resend-registration-otp', 
  otpRateLimit,
  handleValidationErrors, 
  authController.resendRegistrationOTP
);

// Login routes
router.post('/login', 
  authRateLimit,
  userValidation.login, 
  handleValidationErrors, 
  authController.login
);

router.post('/google', 
  authRateLimit,
  authController.googleAuth
);

// Password reset routes
router.post('/forgot-password', 
  otpRateLimit,
  handleValidationErrors, 
  authController.forgotPassword
);

router.post('/reset-password', 
  authRateLimit,
  handleValidationErrors, 
  authController.resetPassword
);

// Protected routes
router.get('/profile', authenticate, authController.getProfile);

router.put('/profile', 
  authenticate, 
  userValidation.updateProfile, 
  handleValidationErrors, 
  authController.updateProfile
);

router.put('/change-password', 
  authenticate, 
  handleValidationErrors, 
  authController.changePassword
);

// Test route
router.get('/abc', (req, res) => {
  res.json({ success: true, message: 'Auth routes working' });
});

module.exports = router;
