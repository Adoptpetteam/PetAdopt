const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'petadopt_local_dev_secret';

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        message: 'Không có token, truy cập bị từ chối' 
      });
    }
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();

  } catch (error) {
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
