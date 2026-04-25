const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/veri-register-otp', authController.verifyRegistrationOTP);
router.post('/verify-registration-otp', authController.verifyRegistrationOTP);
router.post('/resend-registration-otp', authController.resendRegistrationOTP);

router.post('/login', authController.login);
router.post('/google', authController.googleAuth);

router.post('/forgot-password', authController.forgotPassword);
router.post('/resend-reset-password-otp', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);
router.put('/change-password', authenticate, authController.changePassword);
router.get('/abc',(req,res)=>{
    res.send('abc')

})

module.exports = router;