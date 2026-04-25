const isAdmin = (req, res, next) => {
  try {
  
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập!'
      });
    }

    console.log(' Checking admin role:', req.user.role);
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập! (Chỉ admin mới được phép)'
      });
    }

    next();
  } catch (error) {
    console.error(' Admin middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi kiểm tra quyền admin'
    });
  }
};

module.exports = { isAdmin };
