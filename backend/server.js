const path = require('path');

// ===============================
// LOAD ENV
// ===============================
require('dotenv').config({
  path: path.join(__dirname, '.env'),
});

const express = require('express');
const cors = require('cors');

// ===============================
// DATABASE
// ===============================
const connectDB = require('./src/config/database');
const { startVaccinationReminderCron } = require('./src/scripts/sendVaccinationReminders');

// ===============================
// ROUTES
// ===============================
const authRoutes = require('./src/routes/auth.routes');
const petRoutes = require('./src/routes/pet.routes');
const adoptionRoutes = require('./src/routes/adoption.routes');
const donateRoutes = require('./src/routes/donate.routes');
const newsRoutes = require('./src/routes/news.routes');
const volunteerRoutes = require('./src/routes/volunteer.routes');
const contactRoutes = require('./src/routes/contact.routes');
const categoryRoutes = require('./src/routes/category.routes');
const adminRoutes = require('./src/routes/admin.routes');
const productRoutes = require('./src/routes/product.routes');
const orderRoutes = require('./src/routes/order.routes');
const statisticsRoutes = require('./statistics.routes');
const voucherRoutes = require('./src/routes/voucher.routes');
const vaccinationRoutes = require('./src/routes/vaccination.routes');
const reviewRoutes = require('./src/routes/review.routes');
const notificationRoutes = require('./src/routes/notification.routes');
const healthRecordRoutes = require('./src/routes/healthRecord.routes');

const app = express();

// ===============================
// MIDDLEWARE
// ===============================

// CORS Configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({
        success: false,
        message: 'Invalid JSON format'
      });
      return;
    }
  }
}));

app.use(express.urlencoded({
  extended: true,
  limit: '10mb'
}));

// ===============================
// STATIC FILES
// ===============================
app.use(
  '/uploads',
  express.static(
    path.join(__dirname, 'uploads')
  )
);

// ===============================
// CONNECT DATABASE
// ===============================
connectDB();

// ===============================
// API ROUTES
// ===============================
app.use('/api/auth', authRoutes);

app.use('/api/pets', petRoutes);

app.use('/api/adoption', adoptionRoutes);

app.use('/api/donate', donateRoutes);

app.use('/api/news', newsRoutes);

app.use('/api/volunteer', volunteerRoutes);

app.use('/api/contact', contactRoutes);

app.use('/api/category', categoryRoutes);

app.use('/api/admin', adminRoutes);

app.use('/api/products', productRoutes);

app.use('/api/orders', orderRoutes);

app.use('/api/statistics', statisticsRoutes);

app.use('/api/vouchers', voucherRoutes);

app.use('/api/vaccinations', vaccinationRoutes);

app.use('/api/reviews', reviewRoutes);

app.use('/api/notifications', notificationRoutes);

app.use('/api/health-records', healthRecordRoutes);

// ===============================
// HEALTH CHECK
// ===============================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ===============================
// ERROR HANDLER
// ===============================
// GLOBAL ERROR HANDLER
// ===============================
app.use((err, req, res, next) => {
  // Log error details (but not in production)
  if (process.env.NODE_ENV !== 'production') {
    console.error('SERVER ERROR:', err);
  }

  // Default error
  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Tài nguyên không tồn tại';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} đã tồn tại`;
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token không hợp lệ';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token đã hết hạn';
    error = { message, statusCode: 401 };
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File quá lớn. Vui lòng chọn file nhỏ hơn 5MB';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Loại file không được hỗ trợ';
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Lỗi máy chủ nội bộ',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// ===============================
// START SERVER
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  
  // Khởi động cron job cho nhắc nhở tiêm phòng
  if (process.env.NODE_ENV !== 'test') {
    startVaccinationReminderCron();
  }
});
