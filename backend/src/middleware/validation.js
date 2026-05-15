const { body, param, query, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

// Generic validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Input sanitization
const sanitizeInput = (req, res, next) => {
  // Remove potential XSS and injection attempts
  const sanitize = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        // Remove script tags and potential XSS
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .trim();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  
  next();
};

// Rate limiting configurations
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Specific rate limits
const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  'Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau 15 phút.'
);

const generalRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests
  'Quá nhiều requests. Vui lòng thử lại sau.'
);

const otpRateLimit = createRateLimit(
  5 * 60 * 1000, // 5 minutes
  3, // 3 OTP requests
  'Quá nhiều yêu cầu OTP. Vui lòng thử lại sau 5 phút.'
);

// Validation rules
const userValidation = {
  register: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Tên phải có từ 2-50 ký tự')
      .matches(/^[a-zA-ZÀ-ỹ\s]+$/)
      .withMessage('Tên chỉ được chứa chữ cái và khoảng trắng'),
    
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Email không hợp lệ'),
    
    body('password')
      .isLength({ min: 8 })
      .withMessage('Mật khẩu phải có ít nhất 8 ký tự')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số'),
  ],

  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Email không hợp lệ'),
    
    body('password')
      .notEmpty()
      .withMessage('Mật khẩu không được để trống'),
  ],

  updateProfile: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Tên phải có từ 2-50 ký tự'),
    
    body('phone')
      .optional()
      .matches(/^[0-9]{10,11}$/)
      .withMessage('Số điện thoại không hợp lệ'),
  ]
};

const petValidation = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Tên thú cưng phải có từ 1-100 ký tự'),
    
    body('species')
      .isIn(['dog', 'cat', 'bird', 'rabbit', 'hamster', 'other'])
      .withMessage('Loại thú cưng không hợp lệ'),
    
    body('age')
      .optional()
      .isInt({ min: 0, max: 30 })
      .withMessage('Tuổi phải từ 0-30'),
    
    body('adoptionFee')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Phí nhận nuôi phải >= 0'),
  ]
};

const adoptionValidation = {
  create: [
    body('fullName')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Họ tên phải có từ 2-100 ký tự'),
    
    body('phone')
      .matches(/^[0-9]{10,11}$/)
      .withMessage('Số điện thoại không hợp lệ'),
    
    body('address')
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Địa chỉ phải có từ 10-500 ký tự'),
    
    body('reason')
      .trim()
      .isLength({ min: 20, max: 1000 })
      .withMessage('Lý do nhận nuôi phải có từ 20-1000 ký tự'),
  ]
};

const productValidation = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Tên sản phẩm phải có từ 1-200 ký tự'),
    
    body('price')
      .isFloat({ min: 0 })
      .withMessage('Giá phải >= 0'),
    
    body('stock')
      .isInt({ min: 0 })
      .withMessage('Số lượng phải >= 0'),
  ]
};

module.exports = {
  handleValidationErrors,
  sanitizeInput,
  authRateLimit,
  generalRateLimit,
  otpRateLimit,
  userValidation,
  petValidation,
  adoptionValidation,
  productValidation
};