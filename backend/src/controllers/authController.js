const User = require('../models/User');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin!'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng!'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'user'
    });

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công! Vui lòng kích hoạt 2FA.',
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

exports.verifyRegistration = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp email!'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng!'
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

    res.status(200).json({
      success: true,
      message: 'Quét mã QR bằng Google Authenticator để kích hoạt 2FA',
      qrCode: qrCodeUrl,
      secret: secret.base32
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

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng!'
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

    res.status(200).json({
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

    const user = await User.findOne({ email }).select('+twoFASecret');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng!'
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
      token: token,
      window: 2
    });

    if (!verified) {
      return res.status(401).json({
        success: false,
        message: 'Mã xác thực không đúng!'
      });
    }

    user.twoFAEnabled = true;
    user.isVerified = true;
    await user.save();

    res.status(200).json({
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

    const user = await User.findOne({ email })
      .select('+password +twoFASecret');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng!'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng!'
      });
    }

    if (!user.twoFAEnabled) {
      console.log('⚠️ 2FA disabled - Bypassing TOTP check for:', user.email);
      console.log('👤 User role:', user.role);
      
      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công! (2FA disabled)',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
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

    console.log(' User role từ DB:', user.role);
    console.log(' User email:', user.email);
    console.log(' User ID:', user._id);

 
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công!',
      token,
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

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy email này trong hệ thống!'
      });
    }

    res.status(200).json({
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

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        twoFAEnabled: user.twoFAEnabled,
        isVerified: user.isVerified,
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

    res.status(200).json({
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

    res.status(200).json({
      success: true,
      message: 'Đổi mật khẩu thành công!'
    });
  } catch (error) {
    next(error);
  }
};
