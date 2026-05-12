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
  console.log(
    `🚀 Server running on http://localhost:${PORT}`
  );
});

console.log(process.env.ZALOPAY_APP_ID);