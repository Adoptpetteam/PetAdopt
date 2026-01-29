const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -twoFASecret');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User không tồn tại' 
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, profilePicture } = req.body;
    
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User không tồn tại' 
      });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (profilePicture) user.profilePicture = profilePicture;

    await user.save();

    res.json({
      success: true,
      message: 'Cập nhật profile thành công!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự' 
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User không tồn tại' 
      });
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: 'Mật khẩu cũ không đúng' 
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công!'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

