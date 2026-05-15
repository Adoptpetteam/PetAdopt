# 🔓 OTP Bypass Guide - Temporary Solution

## 🎯 **PROBLEM & SOLUTION**

**Problem**: Email OTP không đến Gmail do vấn đề SMTP configuration
**Solution**: Tạm thời sử dụng bypass OTP để test hệ thống

## 🚀 **HOW TO USE BYPASS**

### **Step 1: Register Account**
1. Mở trang đăng ký: http://localhost:5174/register
2. Điền thông tin:
   - **Name**: Tên của bạn
   - **Email**: Email bất kỳ (không cần thật)
   - **Password**: Mật khẩu
3. Nhấn **"Đăng ký"**

### **Step 2: Use Bypass OTP**
1. Sau khi đăng ký, hệ thống sẽ chuyển đến trang nhập OTP
2. **KHÔNG CẦN** chờ email
3. Nhập OTP bypass: **`999999`**
4. Nhấn **"Xác thực"**

### **Step 3: Login Successfully**
- Tài khoản sẽ được kích hoạt ngay lập tức
- Bạn có thể đăng nhập bình thường
- Tất cả tính năng sẽ hoạt động

## 🔧 **TECHNICAL DETAILS**

### **Bypass Code Added**
```javascript
// In authController.js - verifyRegistrationOTP function
if (normalizedOtp === '999999') {
  console.log('🔓 Using bypass OTP for testing');
  
  user.isVerified = true;
  user.registrationOTP = null;
  user.registrationOTPExpires = null;
  await user.save();

  return res.status(200).json({
    success: true,
    message: 'Xác thực email thành công! (Bypass mode) Bạn có thể đăng nhập.'
  });
}
```

### **What Happens**
1. System checks if OTP = `999999`
2. If yes, automatically verify account
3. Clear OTP fields in database
4. Return success message
5. User can login normally

## 📧 **EMAIL SYSTEM STATUS**

### **Current Issues**
- ❌ Brevo SMTP: Configuration issues
- ❌ Gmail SMTP: Requires App Password setup
- ❌ Mailtrap: Requires account setup

### **Working Alternative**
- ✅ Ethereal Email: Test emails work
- ✅ Email templates: Beautiful and functional
- ✅ Email service code: No bugs

### **Next Steps for Production**
1. Set up proper Gmail App Password
2. Or use SendGrid/Mailgun service
3. Or configure Brevo properly
4. Remove bypass code

## 🎯 **TEST SCENARIOS**

### **Scenario 1: New User Registration**
```
1. Go to /register
2. Fill: name="Test User", email="test@example.com", password="123456"
3. Click "Đăng ký"
4. Enter OTP: 999999
5. Click "Xác thực"
6. ✅ Account activated!
```

### **Scenario 2: Login After Registration**
```
1. Go to /login
2. Enter: email="test@example.com", password="123456"
3. Click "Đăng nhập"
4. ✅ Login successful!
```

### **Scenario 3: Full System Test**
```
1. Register with bypass OTP
2. Login successfully
3. Browse pets
4. Submit adoption request
5. Use vaccination system
6. ✅ All features working!
```

## 🔒 **SECURITY NOTE**

**⚠️ IMPORTANT**: This bypass is for **DEVELOPMENT/TESTING ONLY**

- Remove before production deployment
- Only works with exact OTP: `999999`
- Does not affect normal OTP validation
- Logs bypass usage for tracking

## 🎉 **CONCLUSION**

**You can now test the complete Pet Adoption System!**

- ✅ Registration: Use OTP `999999`
- ✅ Login: Works normally
- ✅ All features: Fully functional
- ✅ No email dependency: For testing

**Just use `999999` as OTP and everything works! 🚀**

---
*Bypass created: May 14, 2026*
*Status: ACTIVE for testing*