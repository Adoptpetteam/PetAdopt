const jwt = require('jsonwebtoken');

const parseToken = (authHeader = '') => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.replace('Bearer ', '').trim();
};

const authenticate = (req, res, next) => {
  try {
    const token = parseToken(req.header('Authorization'));

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Không có token, truy cập bị từ chối'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token đã hết hạn'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ'
    });
  }
};

const optionalAuthenticate = (req, _res, next) => {
  try {
    const token = parseToken(req.header('Authorization'));
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (error) {
    console.warn('Optional auth ignored:', error.message);
  }
  next();
};

module.exports = { authenticate, optionalAuthenticate };
