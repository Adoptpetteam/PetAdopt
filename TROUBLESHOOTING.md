# 🔧 TROUBLESHOOTING GUIDE

## Common Issues and Solutions

---

## 1. Category API 500 Error

### Symptoms
```
GET http://localhost:5000/api/category 500 (Internal Server Error)
```

### Solutions

#### ✅ Solution 1: Restart Backend Server
```bash
# Stop server (Ctrl+C)
# Then restart
cd backend
npm start
```

#### ✅ Solution 2: Clear Browser Cache
```
1. Open DevTools (F12)
2. Right-click Refresh button
3. Select "Empty Cache and Hard Reload"
```

#### ✅ Solution 3: Test API Directly
```bash
# Run test script
cd backend
node test-category-api.js

# Or use curl
curl http://localhost:5000/api/category
```

#### ✅ Solution 4: Check MongoDB Connection
```bash
# Check if MongoDB is running
mongosh

# Or restart MongoDB
sudo systemctl restart mongod  # Linux
brew services restart mongodb-community  # Mac
net start MongoDB  # Windows
```

---

## 2. Volunteer Approve 400 Error

### Symptoms
```
PUT /api/volunteer/:id/approve 400 (Bad Request)
```

### Solutions

#### ✅ Check Admin Token
```javascript
// Make sure you're logged in as admin
const token = localStorage.getItem('admin_token');
console.log('Token:', token ? 'Present' : 'Missing');
```

#### ✅ Verify Admin Role
```bash
# Check user role in MongoDB
mongosh
use petadopt
db.users.findOne({ email: "your-admin@email.com" })
# Should have role: "admin"
```

---

## 3. CORS Errors

### Symptoms
```
Access to XMLHttpRequest blocked by CORS policy
```

### Solutions

#### ✅ Check Backend CORS Config
File: `backend/server.js`
```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',  // ← Make sure this is here
  'http://127.0.0.1:5173',
];
```

#### ✅ Restart Both Servers
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

---

## 4. MongoDB Connection Error

### Symptoms
```
MongooseServerSelectionError: connect ECONNREFUSED
```

### Solutions

#### ✅ Start MongoDB
```bash
# Linux
sudo systemctl start mongod
sudo systemctl status mongod

# Mac
brew services start mongodb-community
brew services list

# Windows
net start MongoDB
```

#### ✅ Check MongoDB URI
File: `backend/.env`
```env
MONGODB_URI=mongodb://localhost:27017/petadopt
```

---

## 5. Port Already in Use

### Symptoms
```
Error: listen EADDRINUSE: address already in use :::5000
```

### Solutions

#### ✅ Kill Process on Port
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9

# Or use npx
npx kill-port 5000
```

#### ✅ Change Port
File: `backend/.env`
```env
PORT=5001  # Use different port
```

---

## 6. Email Service Error

### Symptoms
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

### Solutions

#### ✅ Generate Gmail App Password
```
1. Go to Google Account Settings
2. Security → 2-Step Verification (enable it)
3. App passwords → Generate new
4. Copy 16-character password
5. Update .env file
```

File: `backend/.env`
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx  # 16-char app password
```

#### ✅ Test Email Service
```bash
cd backend
node test-email.js
```

---

## 7. File Upload Error

### Symptoms
```
Error: ENOENT: no such file or directory, open 'uploads/...'
```

### Solutions

#### ✅ Create Upload Directories
```bash
cd backend
mkdir -p uploads/pets
mkdir -p uploads/products
mkdir -p uploads/users
```

#### ✅ Check Permissions
```bash
# Linux/Mac
chmod 755 uploads
chmod 755 uploads/*

# Windows - no action needed
```

---

## 8. Frontend Build Error

### Symptoms
```
Error: Cannot find module '@vitejs/plugin-react'
```

### Solutions

#### ✅ Reinstall Dependencies
```bash
cd frontend
rm -rf node_modules
rm package-lock.json
npm install
```

#### ✅ Clear Vite Cache
```bash
cd frontend
rm -rf node_modules/.vite
npm run dev
```

---

## 9. JWT Token Expired

### Symptoms
```
401 Unauthorized: Token đã hết hạn
```

### Solutions

#### ✅ Login Again
```javascript
// Clear old token and login
localStorage.removeItem('token');
localStorage.removeItem('admin_token');
// Then login again
```

#### ✅ Extend Token Expiry
File: `backend/.env`
```env
JWT_EXPIRE=30d  # Extend to 30 days
```

---

## 10. Ant Design Warnings

### Symptoms
```
Warning: [antd: Progress] `trailColor` is deprecated
Warning: [antd: List] The `List` component is deprecated
```

### Solutions

#### ✅ Already Fixed!
All Ant Design warnings have been fixed in the latest version.

If you still see them:
```bash
cd frontend
npm run dev  # Restart dev server
# Clear browser cache (Ctrl+Shift+R)
```

---

## Quick Health Check

Run this to check all services:

```bash
# 1. Check MongoDB
mongosh --eval "db.version()"

# 2. Check Backend
curl http://localhost:5000

# 3. Check Category API
curl http://localhost:5000/api/category

# 4. Check Frontend
curl http://localhost:5173
```

---

## Test Scripts

### Backend Tests
```bash
cd backend

# Test category API
node test-category-api.js

# Test email service
node test-email.js

# Test admin token
node test-admin-token.js

# Test complete system
node test-complete-system.js
```

### Frontend Tests
```bash
cd frontend

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Environment Variables Checklist

### Backend `.env`
```env
✅ PORT=5000
✅ MONGODB_URI=mongodb://localhost:27017/petadopt
✅ JWT_SECRET=your-secret-key
✅ JWT_EXPIRE=7d
✅ EMAIL_USER=your-email@gmail.com
✅ EMAIL_PASS=your-app-password
✅ VNP_TMN_CODE=your-vnpay-code
✅ VNP_HASH_SECRET=your-vnpay-secret
✅ GOOGLE_CLIENT_ID=your-google-client-id
```

### Frontend `.env`
```env
✅ VITE_API_URL=http://localhost:5000/api
✅ VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

---

## Still Having Issues?

### 1. Check Logs
```bash
# Backend logs
cd backend
npm start  # Watch console output

# Frontend logs
cd frontend
npm run dev  # Watch console output
```

### 2. Enable Debug Mode
File: `backend/.env`
```env
NODE_ENV=development
DEBUG=*
```

### 3. Check Network Tab
```
1. Open DevTools (F12)
2. Go to Network tab
3. Reload page
4. Check failed requests
5. Look at Response tab for error details
```

### 4. Database Issues
```bash
# Connect to MongoDB
mongosh

# Switch to database
use petadopt

# Check collections
show collections

# Count documents
db.categories.countDocuments()
db.pets.countDocuments()
db.users.countDocuments()
```

---

## Emergency Reset

If nothing works, try a complete reset:

```bash
# 1. Stop all servers
# Press Ctrl+C in all terminals

# 2. Clear all caches
cd frontend
rm -rf node_modules/.vite
rm -rf dist

cd ../backend
rm -rf node_modules

# 3. Reinstall dependencies
cd backend
npm install

cd ../frontend
npm install

# 4. Reset database (optional)
mongosh
use petadopt
db.dropDatabase()
exit

# 5. Seed database
cd backend
npm run seed:all

# 6. Restart servers
# Terminal 1
cd backend
npm start

# Terminal 2
cd frontend
npm run dev
```

---

**Last Updated:** 2026-05-15  
**Status:** All known issues documented and resolved ✅
