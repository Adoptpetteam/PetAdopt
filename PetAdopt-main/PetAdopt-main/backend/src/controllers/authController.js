const crypto = require('crypto');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { generateRandomOTP, sendRegistrationOTP, sendPasswordResetOTP } = require('../utils/otpService');

let googleOAuthClient;
function getGoogleClient() {
  if (!process.env.GOOGLE_CLIENT_ID) return null;
  if (!googleOAuthClient) {
    googleOAuthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }
  return googleOAuthClient;
}

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin!'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng!'
      });
    }

    const otp = generateRandomOTP();

    let user;

    if (existingUser && !existingUser.isVerified) {
      existingUser.name = name;
      existingUser.password = password;
      existingUser.registrationOTP = otp;
      existingUser.registrationOTPExpires = new Date(Date.now() + 5 * 60 * 1000);
      existingUser.isVerified = false;
      existingUser.twoFAEnabled = false;
      existingUser.twoFASecret = undefined;

      user = await existingUser.save();
    } else {
      user = await User.create({
        name,
        email: normalizedEmail,
        password,
        role: 'user',
        isVerified: false,
        twoFAEnabled: false,
        registrationOTP: otp,
        registrationOTPExpires: new Date(Date.now() + 5 * 60 * 1000)
      });
    }

    await sendRegistrationOTP(user.email, user.name, otp);

    return res.status(201).json({
      success: true,
      message: 'Đăng ký thành công! Vui lòng kiểm tra email để nhập mã OTP xác thực.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyRegistrationOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = String(email ?? '')
      .toLowerCase()
      .trim();
    const normalizedOtp = String(otp ?? '')
      .replace(/\s+/g, '')
      .trim();

    if (!normalizedEmail || !normalizedOtp) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp email và mã OTP!'
      });
    }

    const user = await User.findOne({ email: normalizedEmail })
      .select('+registrationOTP +registrationOTPExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng!'
      });
    }

    if (!user.registrationOTP || !user.registrationOTPExpires) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy OTP đăng ký hoặc OTP đã được sử dụng!'
      });
    }

    if (user.registrationOTPExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Mã OTP đã hết hạn!'
      });
    }

    if (user.registrationOTP !== normalizedOtp) {
      return res.status(400).json({
        success: false,
        message: 'Mã OTP không đúng!'
      });
    }

    user.isVerified = true;
    user.registrationOTP = null;
    user.registrationOTPExpires = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Xác thực email thành công! Bạn có thể đăng nhập.'
    });
  } catch (error) {
    next(error);
  }
};

exports.resendRegistrationOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp email!'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail })
      .select('+registrationOTP +registrationOTPExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng!'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Tài khoản đã được xác thực rồi!'
      });
    }

    const otp = generateRandomOTP();
    user.registrationOTP = otp;
    user.registrationOTPExpires = new Date(Date.now() + 5 * 60 * 1000);

    await user.save();
    await sendRegistrationOTP(user.email, user.name, otp);

    return res.status(200).json({
      success: true,
      message: 'Đã gửi lại OTP về email thành công!'
    });
  } catch (error) {
    next(error);
  }
};

/** Đăng nhập email + mật khẩu (không dùng TOTP/2FA). */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp email và mật khẩu!'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng!'
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản đã bị khóa!'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng!'
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản chưa xác thực email!'
      });
    }

    const authToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công!',
      token: authToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/** Gửi OTP đặt lại mật khẩu (dùng chung cho quên mật khẩu / gửi lại OTP). */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp email!'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          'Email chưa có trong hệ thống. Vui lòng kiểm tra lại hoặc đăng ký tài khoản mới.'
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản đã bị khóa!'
      });
    }

    const otp = generateRandomOTP();
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    await sendPasswordResetOTP(user.email, user.name, otp);

    return res.status(200).json({
      success: true,
      message: 'Đã gửi mã OTP đặt lại mật khẩu đến email của bạn.'
    });
  } catch (error) {
    next(error);
  }
};

/** Xác nhận OTP + đặt mật khẩu mới (không cần đăng nhập). */
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const normalizedEmail = String(email ?? '')
      .toLowerCase()
      .trim();
    const normalizedOtp = String(otp ?? '')
      .replace(/\s+/g, '')
      .trim();

    if (!normalizedEmail || !normalizedOtp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp email, mã OTP và mật khẩu mới!'
      });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự!'
      });
    }

    const user = await User.findOne({ email: normalizedEmail }).select(
      '+resetPasswordOTP +resetPasswordOTPExpires'
    );

    if (!user || !user.resetPasswordOTP || !user.resetPasswordOTPExpires) {
      return res.status(400).json({
        success: false,
        message:
          'Không có yêu cầu đặt lại mật khẩu hợp lệ. Vui lòng yêu cầu gửi OTP lại.'
      });
    }

    if (user.resetPasswordOTPExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Mã OTP đã hết hạn!'
      });
    }

    if (user.resetPasswordOTP !== normalizedOtp) {
      return res.status(400).json({
        success: false,
        message: 'Mã OTP không đúng!'
      });
    }

    user.password = newPassword;
    user.resetPasswordOTP = null;
    user.resetPasswordOTPExpires = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập.'
    });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng!'
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        twoFAEnabled: user.twoFAEnabled,
        isVerified: user.isVerified,
        isBanned: user.isBanned,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng!'
      });
    }

    if (name) user.name = name;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin thành công!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin!'
      });
    }

    const user = await User.findById(req.user.userId).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng!'
      });
    }

    const isPasswordValid = await user.comparePassword(oldPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Mật khẩu cũ không đúng!'
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Đổi mật khẩu thành công!'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Đăng nhập bằng Google (Google Identity Services gửi JWT id_token trong field `credential`).
 */
exports.googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu credential Google'
      });
    }

    const client = getGoogleClient();
    if (!client) {
      return res.status(500).json({
        success: false,
        message: 'Chưa cấu hình GOOGLE_CLIENT_ID trên server'
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(401).json({
        success: false,
        message: 'Không lấy được email từ Google'
      });
    }

    const sub = payload.sub;
    const normalizedEmail = String(payload.email).toLowerCase().trim();
    const displayName = payload.name || normalizedEmail.split('@')[0];

    let user = await User.findOne({
      $or: [{ googleId: sub }, { email: normalizedEmail }]
    });

    if (!user) {
      const randomPassword = crypto.randomBytes(32).toString('hex');
      user = await User.create({
        name: displayName,
        email: normalizedEmail,
        password: randomPassword,
        googleId: sub,
        role: 'user',
        isVerified: !!payload.email_verified,
        twoFAEnabled: false
      });
    } else {
      if (!user.googleId) {
        user.googleId = sub;
      }
      if (displayName) {
        user.name = displayName;
      }
      if (payload.email_verified) {
        user.isVerified = true;
      }
      await user.save();
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản đã bị khóa!'
      });
    }

    const authToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập Google thành công!',
      token: authToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};