const User = require('../models/User');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const { generateRandomOTP, sendRegistrationOTP } = require('../utils/otpService');

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
      message: 'Xác thực email thành công! Bây giờ bạn có thể thiết lập 2FA.'
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

exports.setup2FA = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp email!'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail }).select('+twoFASecret');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng!'
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản chưa xác thực email!'
      });
    }

    const secret = speakeasy.generateSecret({
      name: `PawPalace (${user.email})`,
      length: 20
    });

    user.twoFASecret = secret.base32;
    user.twoFAEnabled = false;
    await user.save();

    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    return res.status(200).json({
      success: true,
      message: 'Quét mã QR bằng Google Authenticator',
      qrCode: qrCodeUrl,
      secret: secret.base32
    });
  } catch (error) {
    next(error);
  }
};

exports.verify2FA = async (req, res, next) => {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp email và mã xác thực!'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail }).select('+twoFASecret');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng!'
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản chưa xác thực email!'
      });
    }

    if (!user.twoFASecret) {
      return res.status(400).json({
        success: false,
        message: 'Chưa thiết lập 2FA!'
      });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: 'base32',
      token,
      window: 2
    });

    if (!verified) {
      return res.status(401).json({
        success: false,
        message: 'Mã xác thực không đúng!'
      });
    }

    user.twoFAEnabled = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Kích hoạt 2FA thành công!'
    });
  } catch (error) {
    next(error);
  }
};

exports.login2FA = async (req, res, next) => {
  try {
    const { email, password, totpCode } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp email và password!'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail })
      .select('+password +twoFASecret');

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

    if (!user.twoFAEnabled) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản chưa kích hoạt 2FA!'
      });
    }

    if (!totpCode) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp mã 2FA!'
      });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: 'base32',
      token: totpCode,
      window: 2
    });

    if (!verified) {
      return res.status(401).json({
        success: false,
        message: 'Mã xác thực không đúng!'
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

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp email!'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy email này trong hệ thống!'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Đã gửi hướng dẫn đặt lại mật khẩu qua email! (Chức năng đang phát triển)'
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