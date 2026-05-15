# 🚨 QUICK FIX - 500 ERROR

## BƯỚC 1: RESTART BACKEND SERVER

```bash
# Dừng server hiện tại (Ctrl+C)
# Sau đó chạy lại:
cd backend
npm start
```

## BƯỚC 2: CLEAR BROWSER CACHE

```
1. Mở DevTools (F12)
2. Right-click vào nút Refresh
3. Chọn "Empty Cache and Hard Reload"
```

## BƯỚC 3: CHECK BACKEND LOGS

Khi restart backend, xem console có lỗi gì không:
- MongoDB connection error?
- Missing environment variables?
- Syntax errors?

## BƯỚC 4: TEST API TRỰC TIẾP

```bash
# Test category API
curl http://localhost:5000/api/category

# Test health check
curl http://localhost:5000

# Test với browser
# Mở: http://localhost:5000/api/category
```

## NẾU VẪN LỖI - GỬI CHO TÔI:

1. **URL đầy đủ của lỗi** (ví dụ: http://localhost:5000/api/category)
2. **Backend console logs** (copy toàn bộ error message)
3. **Browser console error** (F12 → Console tab)

---

## COMMON 500 ERRORS & FIXES:

### 1. MongoDB Not Connected
```bash
# Start MongoDB
mongod

# Or on Windows:
net start MongoDB
```

### 2. Missing Environment Variables
Check `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/petadopt
JWT_SECRET=your-secret-key
```

### 3. Syntax Error in Code
```bash
# Check backend logs when starting
cd backend
npm start
# Look for syntax errors
```

### 4. Database Index Error
```bash
cd backend
node src/scripts/addDatabaseIndexes.js
```

---

## EMERGENCY FULL RESTART:

```bash
# 1. Stop everything (Ctrl+C all terminals)

# 2. Restart MongoDB
mongod

# 3. Restart Backend
cd backend
npm start

# 4. Restart Frontend
cd frontend
npm run dev

# 5. Clear browser cache (Ctrl+Shift+R)
```

---

**Nếu vẫn lỗi, gửi cho tôi:**
- Screenshot của error
- Backend console output
- URL đang bị lỗi
