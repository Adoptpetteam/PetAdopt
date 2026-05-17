# Test Plan: User Cancel Order Restriction

## Mục đích
Kiểm tra xem user chỉ có thể hủy đơn hàng khi đơn đang ở trạng thái "Chờ xác nhận" (pending).

## Test Cases

### 1. Backend API Tests

#### Test 1.1: Hủy đơn COD ở trạng thái PENDING ✅
**Điều kiện:**
- User đã đăng nhập
- Có đơn hàng COD với status = 'pending'

**Bước thực hiện:**
```bash
PUT /api/orders/me/{orderId}/cancel
Authorization: Bearer {token}
```

**Kết quả mong đợi:**
- Status code: 200
- Response: `{ success: true, data: {...} }`
- Order status được cập nhật thành 'cancelled'
- Kho hàng được hoàn lại
- Email thông báo được gửi

#### Test 1.2: Hủy đơn COD ở trạng thái CONFIRMED ❌
**Điều kiện:**
- User đã đăng nhập
- Có đơn hàng COD với status = 'confirmed'

**Bước thực hiện:**
```bash
PUT /api/orders/me/{orderId}/cancel
Authorization: Bearer {token}
```

**Kết quả mong đợi:**
- Status code: 400
- Response: 
```json
{
  "success": false,
  "message": "Không thể hủy đơn hàng đã được xác nhận. Chỉ có thể hủy đơn khi đang ở trạng thái \"Chờ xác nhận\"."
}
```

#### Test 1.3: Hủy đơn VNPay chưa thanh toán ở trạng thái PENDING ✅
**Điều kiện:**
- User đã đăng nhập
- Có đơn hàng VNPay với status = 'pending', paymentStatus = 'pending'

**Bước thực hiện:**
```bash
PUT /api/orders/me/{orderId}/cancel
Authorization: Bearer {token}
```

**Kết quả mong đợi:**
- Status code: 200
- Response: `{ success: true, data: {...} }`
- Order status được cập nhật thành 'cancelled'
- Kho hàng được hoàn lại

#### Test 1.4: Hủy đơn VNPay đã thanh toán ở trạng thái PENDING ✅
**Điều kiện:**
- User đã đăng nhập
- Có đơn hàng VNPay với status = 'pending', paymentStatus = 'paid'

**Bước thực hiện:**
```bash
PUT /api/orders/me/{orderId}/request-cancel
Authorization: Bearer {token}
```

**Kết quả mong đợi:**
- Status code: 200
- Yêu cầu hoàn tiền được tạo
- Admin cần xét duyệt

#### Test 1.5: Hủy đơn ở trạng thái SHIPPING ❌
**Điều kiện:**
- User đã đăng nhập
- Có đơn hàng với status = 'shipping'

**Bước thực hiện:**
```bash
PUT /api/orders/me/{orderId}/cancel
Authorization: Bearer {token}
```

**Kết quả mong đợi:**
- Status code: 400
- Error message: "Không thể hủy đơn hàng đang giao hàng..."

#### Test 1.6: Hủy đơn ở trạng thái COMPLETED ❌
**Điều kiện:**
- User đã đăng nhập
- Có đơn hàng với status = 'completed'

**Bước thực hiện:**
```bash
PUT /api/orders/me/{orderId}/cancel
Authorization: Bearer {token}
```

**Kết quả mong đợi:**
- Status code: 400
- Error message: "Không thể hủy đơn hàng đã hoàn thành..."

### 2. Frontend UI Tests

#### Test 2.1: Hiển thị nút "Hủy đơn" khi status = PENDING ✅
**Điều kiện:**
- User đã đăng nhập
- Xem trang "Đơn hàng của tôi"
- Có đơn hàng với status = 'pending'

**Kết quả mong đợi:**
- Nút "Hủy đơn" HIỂN THỊ trong danh sách
- Nút "Hủy đơn" HIỂN THỊ trong chi tiết đơn hàng

#### Test 2.2: Ẩn nút "Hủy đơn" khi status = CONFIRMED ❌
**Điều kiện:**
- User đã đăng nhập
- Xem trang "Đơn hàng của tôi"
- Có đơn hàng với status = 'confirmed'

**Kết quả mong đợi:**
- Nút "Hủy đơn" KHÔNG HIỂN THỊ trong danh sách
- Nút "Hủy đơn" KHÔNG HIỂN THỊ trong chi tiết đơn hàng

#### Test 2.3: Ẩn nút "Hủy đơn" khi status = PAID ❌
**Điều kiện:**
- User đã đăng nhập
- Có đơn hàng với status = 'paid'

**Kết quả mong đợi:**
- Nút "Hủy đơn" KHÔNG HIỂN THỊ

#### Test 2.4: Ẩn nút "Hủy đơn" khi status = SHIPPING ❌
**Điều kiện:**
- User đã đăng nhập
- Có đơn hàng với status = 'shipping'

**Kết quả mong đợi:**
- Nút "Hủy đơn" KHÔNG HIỂN THỊ

#### Test 2.5: Ẩn nút "Hủy đơn" khi status = COMPLETED ❌
**Điều kiện:**
- User đã đăng nhập
- Có đơn hàng với status = 'completed'

**Kết quả mong đợi:**
- Nút "Hủy đơn" KHÔNG HIỂN THỊ

### 3. Integration Tests

#### Test 3.1: Flow hủy đơn COD thành công
**Bước thực hiện:**
1. Tạo đơn hàng COD mới (status = 'pending')
2. Click nút "Hủy đơn"
3. Xác nhận trong modal
4. Chờ response

**Kết quả mong đợi:**
1. Modal xác nhận hiển thị
2. API call thành công
3. Thông báo "Đã hủy đơn hàng, hàng đã được hoàn kho"
4. Đơn hàng biến mất khỏi danh sách hoặc status = 'cancelled'
5. Kho hàng được cập nhật

#### Test 3.2: Flow hủy đơn VNPay đã thanh toán
**Bước thực hiện:**
1. Tạo đơn hàng VNPay, thanh toán thành công (status = 'pending', paymentStatus = 'paid')
2. Click nút "Hủy đơn"
3. Xác nhận trong modal "Hủy đơn hàng đã thanh toán"
4. Chờ response

**Kết quả mong đợi:**
1. Modal đặc biệt cho VNPay hiển thị
2. API call `/request-cancel` thành công
3. Thông báo "Đã gửi yêu cầu hủy đơn. Vui lòng chờ admin xét duyệt."
4. Status chuyển sang 'refund_pending'

#### Test 3.3: Validation khi cố hủy đơn confirmed
**Bước thực hiện:**
1. Có đơn hàng với status = 'confirmed'
2. Nút "Hủy đơn" không hiển thị
3. Thử gọi API trực tiếp (bypass frontend)

**Kết quả mong đợi:**
1. Backend trả về error 400
2. Message rõ ràng về lý do không thể hủy

### 4. Edge Cases

#### Test 4.1: Đơn hàng chuyển trạng thái trong khi user đang xem
**Bước thực hiện:**
1. User mở trang đơn hàng (status = 'pending')
2. Admin confirm đơn (status → 'confirmed')
3. User click "Hủy đơn" (nút vẫn còn hiển thị)

**Kết quả mong đợi:**
- Backend validation bắt lỗi
- Error message hiển thị
- Frontend refresh và ẩn nút

#### Test 4.2: Race condition - 2 requests hủy cùng lúc
**Bước thực hiện:**
1. User click "Hủy đơn" 2 lần nhanh
2. 2 API calls được gửi đồng thời

**Kết quả mong đợi:**
- Request đầu thành công
- Request thứ 2 fail (order đã cancelled)
- Không có lỗi critical

#### Test 4.3: Đơn hàng không tồn tại
**Bước thực hiện:**
```bash
PUT /api/orders/me/invalid-order-id/cancel
```

**Kết quả mong đợi:**
- Status code: 404
- Message: "Không tìm thấy đơn hàng"

#### Test 4.4: Hủy đơn của user khác
**Bước thực hiện:**
1. User A tạo đơn hàng
2. User B cố hủy đơn của User A

**Kết quả mong đợi:**
- Status code: 404 (không tìm thấy - vì query có điều kiện user)
- Không leak thông tin đơn hàng

## Manual Testing Checklist

### Preparation
- [ ] Backend server đang chạy
- [ ] Frontend đang chạy
- [ ] Database có dữ liệu test
- [ ] Có ít nhất 2 user accounts
- [ ] Có đơn hàng ở các trạng thái khác nhau

### Backend Tests
- [ ] Test 1.1: Hủy đơn COD pending
- [ ] Test 1.2: Hủy đơn COD confirmed (should fail)
- [ ] Test 1.3: Hủy đơn VNPay chưa thanh toán
- [ ] Test 1.4: Request cancel VNPay đã thanh toán
- [ ] Test 1.5: Hủy đơn shipping (should fail)
- [ ] Test 1.6: Hủy đơn completed (should fail)

### Frontend Tests
- [ ] Test 2.1: Nút hiển thị khi pending
- [ ] Test 2.2: Nút ẩn khi confirmed
- [ ] Test 2.3: Nút ẩn khi paid
- [ ] Test 2.4: Nút ẩn khi shipping
- [ ] Test 2.5: Nút ẩn khi completed

### Integration Tests
- [ ] Test 3.1: Flow hủy COD thành công
- [ ] Test 3.2: Flow hủy VNPay đã thanh toán
- [ ] Test 3.3: Validation bypass frontend

### Edge Cases
- [ ] Test 4.1: Status thay đổi trong khi xem
- [ ] Test 4.2: Race condition
- [ ] Test 4.3: Order không tồn tại
- [ ] Test 4.4: Hủy đơn của user khác

## Automated Test Script (Optional)

```javascript
// test-cancel-restriction.js
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let userToken = '';
let pendingOrderId = '';
let confirmedOrderId = '';

async function runTests() {
  console.log('🧪 Starting Cancel Order Restriction Tests...\n');
  
  // 1. Login
  console.log('1️⃣ Login user...');
  const loginRes = await axios.post(`${API_URL}/auth/login`, {
    email: 'test@example.com',
    password: 'password123'
  });
  userToken = loginRes.data.token;
  console.log('✅ Login successful\n');
  
  // 2. Get orders
  console.log('2️⃣ Fetching orders...');
  const ordersRes = await axios.get(`${API_URL}/orders/me`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  const orders = ordersRes.data.data;
  
  pendingOrderId = orders.find(o => o.status === 'pending')?._id;
  confirmedOrderId = orders.find(o => o.status === 'confirmed')?._id;
  
  console.log(`Found ${orders.length} orders`);
  console.log(`Pending order: ${pendingOrderId || 'NONE'}`);
  console.log(`Confirmed order: ${confirmedOrderId || 'NONE'}\n`);
  
  // 3. Test cancel pending order (should succeed)
  if (pendingOrderId) {
    console.log('3️⃣ Test: Cancel pending order...');
    try {
      const res = await axios.put(
        `${API_URL}/orders/me/${pendingOrderId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      console.log('✅ SUCCESS: Pending order cancelled');
      console.log(`   Status: ${res.data.data.status}\n`);
    } catch (err) {
      console.log('❌ FAILED: Should be able to cancel pending order');
      console.log(`   Error: ${err.response?.data?.message}\n`);
    }
  }
  
  // 4. Test cancel confirmed order (should fail)
  if (confirmedOrderId) {
    console.log('4️⃣ Test: Cancel confirmed order...');
    try {
      await axios.put(
        `${API_URL}/orders/me/${confirmedOrderId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      console.log('❌ FAILED: Should NOT be able to cancel confirmed order\n');
    } catch (err) {
      console.log('✅ SUCCESS: Correctly rejected');
      console.log(`   Error: ${err.response?.data?.message}\n`);
    }
  }
  
  console.log('🎉 Tests completed!');
}

runTests().catch(console.error);
```

## Notes

- Tất cả tests phải pass trước khi deploy
- Đặc biệt chú ý edge cases về race condition
- Kiểm tra cả UI và API validation
- Verify email notifications được gửi đúng
- Kiểm tra kho hàng được hoàn lại chính xác

## Date
Created: 2026-05-17
