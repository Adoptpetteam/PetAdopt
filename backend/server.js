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
app.use(cors());

app.use(express.json({ limit: '10mb' }));

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
app.use((err, req, res, next) => {

  console.error('SERVER ERROR:', err);

  res.status(err.statusCode || 500).json({
    success: false,
    message:
      err.message || 'Internal Server Error',
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
