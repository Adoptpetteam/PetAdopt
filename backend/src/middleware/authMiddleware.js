const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    console.log('Auth Header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        message: 'Không có token, truy cập bị từ chối' 
      });
    }
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log('Decoded user:', decoded);
    
    req.user = decoded;
    next();

  } catch (error) {
    console.error('Auth error:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token đã hết hạn' 
      });
    }
    
    res.status(401).json({ 
      success: false,
      message: 'Token không hợp lệ' 
    });
  }
};

module.exports = { authenticate };
