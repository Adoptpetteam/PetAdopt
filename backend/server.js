require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/database');
const authRoutes = require('./src/routes/auth.routes');
const petRoutes = require('./src/routes/pet.routes');
const categoryRoutes = require('./src/routes/category.routes');
const adoptionRoutes = require('./src/routes/adoptionRequest.routes');
const volunteerRoutes = require('./src/routes/volunteer.routes');

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/adoptions', adoptionRoutes);
app.use('/api/adoption-requests', adoptionRoutes);
app.use('/api/volunteers', volunteerRoutes);

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Lỗi server'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
