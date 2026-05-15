# 🐾 PetAdopt - Hệ Thống Nhận Nuôi Thú Cưng

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/your-repo/petadopt)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.x-blue.svg)](https://reactjs.org/)

## 📋 Tổng Quan

PetAdopt là một nền tảng trực tuyến toàn diện cho việc nhận nuôi thú cưng, bao gồm:

- 🏠 **Nhận nuôi thú cưng** - Kết nối người nuôi và người nhận nuôi
- 🛒 **Cửa hàng sản phẩm** - Bán đồ dùng cho thú cưng
- 💝 **Donation** - Ủng hộ tổ chức bảo vệ động vật
- 🤝 **Tình nguyện viên** - Đăng ký và quản lý tình nguyện viên
- 💉 **Quản lý tiêm phòng** - Theo dõi lịch tiêm cho thú cưng
- 📊 **Dashboard Admin** - Quản lý toàn bộ hệ thống

## 🏗️ Kiến Trúc Hệ Thống

```
PetAdopt/
├── backend/          # Node.js + Express API Server
├── frontend/         # React + TypeScript + Vite
└── docs/            # Tài liệu dự án
```

### Backend Stack
- **Runtime:** Node.js 16+
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT + Google OAuth
- **File Upload:** Multer
- **Email:** Nodemailer
- **Payment:** VNPay Integration
- **Security:** Helmet, CORS, Rate Limiting

### Frontend Stack
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **UI Library:** Ant Design
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **State Management:** React Context + Hooks

## 🚀 Cài Đặt và Chạy

### Yêu Cầu Hệ Thống
- Node.js >= 16.0.0
- MongoDB >= 4.4
- npm hoặc yarn

### 1. Clone Repository
```bash
git clone https://github.com/your-repo/petadopt.git
cd petadopt
```

### 2. Cài Đặt Backend
```bash
cd backend
npm install

# Copy và cấu hình environment
cp .env.example .env
# Chỉnh sửa .env với thông tin của bạn

# Tạo database indexes và seed data
npm run db:setup
```

### 3. Cài Đặt Frontend
```bash
cd ../frontend
npm install

# Copy và cấu hình environment
cp .env.example .env
# Chỉnh sửa .env với thông tin của bạn
```

### 4. Chạy Development
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Truy cập:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Admin Panel:** http://localhost:5173/admin

## ⚙️ Cấu Hình Environment

### Backend (.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/petadopt

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# VNPay
VNPAY_TMN_CODE=your-vnpay-code
VNPAY_HASH_SECRET=your-vnpay-secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_ENVIRONMENT=development
VITE_APP_NAME=PetAdopt
VITE_APP_VERSION=1.0.0
```

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/register          # Đăng ký tài khoản
POST /api/auth/login             # Đăng nhập
POST /api/auth/google            # Đăng nhập Google
POST /api/auth/forgot-password   # Quên mật khẩu
GET  /api/auth/profile           # Thông tin profile
```

### Pet Management
```
GET    /api/pets                 # Danh sách thú cưng
POST   /api/pets                 # Thêm thú cưng mới
GET    /api/pets/:id             # Chi tiết thú cưng
PUT    /api/pets/:id             # Cập nhật thú cưng
DELETE /api/pets/:id             # Xóa thú cưng
```

### Adoption System
```
POST /api/adoption               # Tạo đơn nhận nuôi
GET  /api/adoption/my-requests   # Đơn của tôi
PUT  /api/adoption/:id/approve   # Duyệt đơn (Admin)
PUT  /api/adoption/:id/reject    # Từ chối đơn (Admin)
```

### E-commerce
```
GET  /api/products               # Danh sách sản phẩm
POST /api/orders                 # Tạo đơn hàng
GET  /api/orders/me              # Đơn hàng của tôi
```

### Donation
```
POST /api/donate/create-payment  # Tạo donation
GET  /api/donate/supporters      # Top supporters
```

## 🔒 Bảo Mật

### Implemented Security Features
- ✅ **JWT Authentication** với refresh token
- ✅ **Password Hashing** với bcrypt
- ✅ **Input Validation** với express-validator
- ✅ **Rate Limiting** chống spam
- ✅ **CORS Configuration** 
- ✅ **File Upload Security** với file type validation
- ✅ **XSS Protection** với input sanitization
- ✅ **SQL Injection Prevention** với Mongoose
- ✅ **Environment Variables** cho sensitive data

### Security Headers
```javascript
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

## 📊 Database Schema

### Core Collections
- **users** - Người dùng và admin
- **pets** - Thông tin thú cưng
- **adoptionrequests** - Đơn nhận nuôi
- **products** - Sản phẩm bán
- **orders** - Đơn hàng
- **donations** - Ủng hộ
- **notifications** - Thông báo
- **reviews** - Đánh giá
- **volunteers** - Tình nguyện viên
- **vaccinationschedules** - Lịch tiêm phòng

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests  
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## 📦 Deployment

### Production Build
```bash
# Build frontend
cd frontend
npm run build

# Start production server
cd ../backend
npm start
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set up SSL certificates
4. Configure reverse proxy (Nginx)
5. Set up monitoring and logging

## 🔧 Scripts Hữu Ích

### Backend Scripts
```bash
npm run seed:all          # Seed tất cả dữ liệu mẫu
npm run db:indexes        # Tạo database indexes
npm run send:reminders    # Gửi nhắc nhở tiêm phòng
npm run test:email        # Test email service
npm run fix:products      # Fix product data
```

### Frontend Scripts
```bash
npm run dev               # Development server
npm run build             # Production build
npm run preview           # Preview production build
npm run lint              # Lint code
npm run type-check        # TypeScript check
```

## 🐛 Troubleshooting

### Common Issues

**1. MongoDB Connection Error**
```bash
# Kiểm tra MongoDB đang chạy
mongod --version
# Hoặc start MongoDB service
sudo systemctl start mongod
```

**2. Port Already in Use**
```bash
# Kill process on port 5000
npx kill-port 5000
# Hoặc thay đổi PORT trong .env
```

**3. Email Service Error**
- Kiểm tra Gmail App Password
- Enable 2FA và tạo App Password
- Kiểm tra EMAIL_USER và EMAIL_PASS trong .env

**4. File Upload Error**
```bash
# Tạo upload directories
mkdir -p backend/uploads/{pets,products,users}
```

## 📈 Performance Optimization

### Backend Optimizations
- ✅ Database indexing cho queries thường dùng
- ✅ Image compression và resizing
- ✅ API response caching
- ✅ Connection pooling
- ✅ Pagination cho large datasets

### Frontend Optimizations
- ✅ Code splitting với React.lazy()
- ✅ Image lazy loading
- ✅ Bundle size optimization
- ✅ Service Worker caching
- ✅ Component memoization

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👥 Team

- **Developer:** Your Name
- **Email:** your.email@example.com
- **GitHub:** [@yourusername](https://github.com/yourusername)

## 🙏 Acknowledgments

- [Ant Design](https://ant.design/) - UI Components
- [MongoDB](https://www.mongodb.com/) - Database
- [Express.js](https://expressjs.com/) - Backend Framework
- [React](https://reactjs.org/) - Frontend Framework
- [VNPay](https://vnpay.vn/) - Payment Gateway

---

**⭐ Nếu project này hữu ích, hãy cho chúng tôi một star!**