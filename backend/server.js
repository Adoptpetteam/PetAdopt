require('dotenv').config({ override: true });
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/database');
const authRoutes = require('./src/routes/auth.routes');
const petRoutes = require('./src/routes/pet.routes'); 
const productRoutes = require('./src/routes/product.routes');
const orderRoutes = require('./src/routes/order.routes');
const vaccinationRoutes = require('./src/routes/vaccination.routes');
const { startVaccinationReminderJob } = require('./src/jobs/vaccinationReminderJob');

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);  
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/vaccinations', vaccinationRoutes);

startVaccinationReminderJob();

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Lỗi server'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
