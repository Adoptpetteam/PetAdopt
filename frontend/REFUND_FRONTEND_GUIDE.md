# 🎨 Frontend - Hệ thống Hoàn hủy đơn hàng

## 📦 Components đã tạo

### 1. RefundModal.tsx
**Đường dẫn:** `src/components/RefundModal.tsx`

**Chức năng:** Modal cho user yêu cầu hoàn tiền

**Props:**
```typescript
interface RefundModalProps {
  visible: boolean;
  orderId: string;
  orderTotal: number;
  onClose: () => void;
  onSuccess: () => void;
}
```

**Features:**
- ✅ Form nhập lý do hoàn tiền
- ✅ Thông tin tài khoản ngân hàng (Tên NH, Số TK, Chủ TK)
- ✅ Upload ảnh QR code (optional)
- ✅ Validation đầy đủ
- ✅ Hiển thị số tiền hoàn
- ✅ Alert thông tin và lưu ý

**Sử dụng:**
```tsx
import { RefundModal } from '../components/RefundModal';

<RefundModal
  visible={refundModalVisible}
  orderId={order._id}
  orderTotal={order.totals.total}
  onClose={() => setRefundModalVisible(false)}
  onSuccess={() => {
    loadOrders();
    message.success('Yêu cầu đã được gửi');
  }}
/>
```

---

### 2. ReturnExchangeModal.tsx
**Đường dẫn:** `src/components/ReturnExchangeModal.tsx`

**Chức năng:** Modal cho user yêu cầu trả/đổi hàng

**Props:**
```typescript
interface ReturnExchangeModalProps {
  visible: boolean;
  orderId: string;
  orderItems: any[];
  onClose: () => void;
  onSuccess: () => void;
}
```

**Features:**
- ✅ Chọn loại: Trả hàng hoặc Đổi hàng
- ✅ Form nhập lý do chi tiết
- ✅ Upload nhiều ảnh chứng minh (1-5 ảnh)
- ✅ Hiển thị danh sách sản phẩm trong đơn
- ✅ Hướng dẫn quy trình rõ ràng
- ✅ Alert điều kiện và thời hạn

**Sử dụng:**
```tsx
import { ReturnExchangeModal } from '../components/ReturnExchangeModal';

<ReturnExchangeModal
  visible={returnExchangeModalVisible}
  orderId={order._id}
  orderItems={order.items}
  onClose={() => setReturnExchangeModalVisible(false)}
  onSuccess={() => {
    loadOrders();
    message.success('Yêu cầu đã được gửi');
  }}
/>
```

---

### 3. Orders.tsx (Updated)
**Đường dẫn:** `src/pages/Orders.tsx`

**Cập nhật:**
- ✅ Thêm 9 trạng thái mới vào interface
- ✅ Cập nhật statusConfig với icon và màu sắc
- ✅ Thêm 2 functions kiểm tra điều kiện:
  - `canRequestRefund()` - Kiểm tra có thể hoàn tiền
  - `canRequestReturnExchange()` - Kiểm tra có thể trả/đổi hàng
- ✅ Thêm nút "Hoàn tiền" và "Trả/Đổi" trong bảng
- ✅ Thêm nút trong modal chi tiết đơn hàng
- ✅ Tích hợp RefundModal và ReturnExchangeModal

**Các nút action mới:**
```tsx
// Trong table columns
{canRequestRefund(record) && (
  <Button
    icon={<DollarOutlined />}
    onClick={() => handleOpenRefundModal(record)}
  >
    Hoàn tiền
  </Button>
)}

{canRequestReturnExchange(record) && (
  <Button
    icon={<SwapOutlined />}
    onClick={() => handleOpenReturnExchangeModal(record)}
  >
    Trả/Đổi
  </Button>
)}
```

---

### 4. RefundManagement.tsx (Admin)
**Đường dẫn:** `src/pages/Admin/RefundManagement.tsx`

**Chức năng:** Trang admin quản lý và xử lý yêu cầu hoàn hủy

**Features:**
- ✅ 3 tabs: Hoàn tiền, Trả hàng, Đổi hàng
- ✅ Bảng danh sách đơn hàng với filter
- ✅ Modal xem chi tiết đơn hàng
- ✅ Modal xử lý yêu cầu (approve/reject)
- ✅ Cập nhật trạng thái vận chuyển
- ✅ Hiển thị thông tin ngân hàng, ảnh QR
- ✅ Hiển thị ảnh chứng minh sản phẩm lỗi
- ✅ Badge đếm số lượng yêu cầu

**Các action admin:**
1. **Xử lý hoàn tiền:**
   - Chọn trạng thái: Đang xử lý / Hoàn tiền thành công / Từ chối
   - Nhập ghi chú
   - Xem thông tin tài khoản khách

2. **Xử lý trả hàng:**
   - Chấp nhận / Từ chối
   - Nhập thông tin tài khoản để hoàn tiền
   - Ghi chú kiểm tra hàng

3. **Xử lý đổi hàng:**
   - Chấp nhận / Từ chối
   - Tự động tạo đơn mới giá 0đ
   - Ghi chú kiểm tra

4. **Cập nhật vận chuyển:**
   - Đang ship về
   - Đã nhận hàng

---

## 🎯 Quy trình User

### 1. Yêu cầu hoàn tiền
```
User vào Orders → Chọn đơn hàng → Click "Hoàn tiền"
  ↓
Điền form:
  - Lý do hoàn tiền
  - Thông tin ngân hàng (Tên NH, Số TK, Chủ TK)
  - Upload QR code (optional)
  ↓
Submit → Trạng thái: refund_pending
  ↓
Chờ admin xử lý
```

### 2. Yêu cầu trả hàng
```
User vào Orders → Chọn đơn completed (trong 3 ngày) → Click "Trả/Đổi"
  ↓
Chọn "Trả hàng hoàn tiền"
  ↓
Điền form:
  - Lý do trả hàng
  - Upload 1-5 ảnh chứng minh
  ↓
Submit → Trạng thái: return_requested
  ↓
Chờ admin xử lý
```

### 3. Yêu cầu đổi hàng
```
User vào Orders → Chọn đơn completed (trong 3 ngày) → Click "Trả/Đổi"
  ↓
Chọn "Đổi hàng mới"
  ↓
Điền form:
  - Lý do đổi hàng
  - Upload 1-5 ảnh chứng minh
  ↓
Submit → Trạng thái: exchange_requested
  ↓
Chờ admin xử lý → Nhận đơn mới giá 0đ
```

---

## 🔧 Quy trình Admin

### 1. Xử lý hoàn tiền
```
Admin vào RefundManagement → Tab "Hoàn tiền"
  ↓
Xem danh sách đơn refund_pending
  ↓
Click "Chi tiết" → Xem thông tin đầy đủ
  ↓
Click "Xử lý" → Chọn trạng thái:
  - refund_processing (Đang xử lý)
  - refund_completed (Hoàn tiền thành công)
  - cancelled (Từ chối)
  ↓
Nhập ghi chú → Submit
  ↓
Nếu refund_completed:
  - Tự động hoàn kho
  - Tự động hoàn voucher
  - Gửi email thông báo
```

### 2. Xử lý trả hàng
```
Admin vào RefundManagement → Tab "Trả hàng"
  ↓
Xem danh sách đơn return_requested
  ↓
Click "Chi tiết" → Xem ảnh chứng minh
  ↓
Click "Xử lý" → Chọn:
  - Chấp nhận: Nhập thông tin TK → Chuyển sang refund_pending
  - Từ chối: Nhập lý do → Chuyển về completed
  ↓
Nếu chấp nhận:
  - Click "Đang ship về" → return_shipping
  - Click "Đã nhận hàng" → return_received
  - Xử lý hoàn tiền → refund_completed
```

### 3. Xử lý đổi hàng
```
Admin vào RefundManagement → Tab "Đổi hàng"
  ↓
Xem danh sách đơn exchange_requested
  ↓
Click "Chi tiết" → Xem ảnh chứng minh
  ↓
Click "Xử lý" → Chọn:
  - Chấp nhận: Tự động tạo đơn mới giá 0đ
  - Từ chối: Nhập lý do → Chuyển về completed
  ↓
Nếu chấp nhận:
  - Đơn cũ: exchange_completed
  - Đơn mới: confirmed, giá 0đ, ship COD
  - Gửi email thông báo
```

---

## 🎨 UI/UX Features

### Màu sắc theo trạng thái
```typescript
refund_pending      → Orange  (Chờ xử lý)
refund_processing   → Blue    (Đang xử lý)
refund_completed    → Green   (Thành công)
return_requested    → Orange  (Chờ xử lý)
return_shipping     → Purple  (Vận chuyển)
return_received     → Blue    (Đã nhận)
exchange_requested  → Orange  (Chờ xử lý)
exchange_completed  → Green   (Thành công)
```

### Icons
```typescript
Hoàn tiền    → <DollarOutlined />
Trả hàng     → <RollbackOutlined />
Đổi hàng     → <SwapOutlined />
Ngân hàng    → <BankOutlined />
QR Code      → <QrcodeOutlined />
Vận chuyển   → <TruckOutlined />
```

### Responsive
- ✅ Mobile-friendly
- ✅ Table scroll horizontal
- ✅ Modal responsive
- ✅ Form layout adaptive

---

## 📱 Điều kiện hiển thị nút

### Nút "Hoàn tiền"
Hiển thị khi:
- Trạng thái: `paid`, `confirmed`, `shipping`, `completed`
- Nếu `completed`: Trong vòng 3 ngày

```typescript
const canRequestRefund = (order: OrderData) => {
  const refundableStatuses = ['paid', 'confirmed', 'shipping', 'completed'];
  if (!refundableStatuses.includes(order.status)) return false;
  
  if (order.status === 'completed') {
    const completedDate = new Date(order.updatedAt);
    const daysSince = (Date.now() - completedDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 3;
  }
  
  return true;
};
```

### Nút "Trả/Đổi hàng"
Hiển thị khi:
- Trạng thái: `completed`
- Trong vòng 3 ngày

```typescript
const canRequestReturnExchange = (order: OrderData) => {
  if (order.status !== 'completed') return false;
  
  const completedDate = new Date(order.updatedAt);
  const daysSince = (Date.now() - completedDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysSince <= 3;
};
```

---

## 🔌 API Integration

### User APIs
```typescript
// Yêu cầu hoàn tiền
POST /api/orders/:id/request-refund
{
  reason: string,
  bankAccount: string,
  bankName: string,
  accountHolder: string,
  qrCodeImage?: string
}

// Yêu cầu trả/đổi hàng
POST /api/orders/:id/request-return-exchange
{
  type: 'return' | 'exchange',
  reason: string,
  images: string[]
}
```

### Admin APIs
```typescript
// Xử lý hoàn tiền
POST /api/orders/:id/process-refund
{
  status: 'refund_processing' | 'refund_completed' | 'cancelled',
  note: string,
  bankAccount?: string,
  bankName?: string,
  accountHolder?: string
}

// Xử lý trả hàng
POST /api/orders/:id/process-return
{
  action: 'approve_refund' | 'reject',
  note: string,
  inspectionNote: string,
  bankAccount?: string,
  bankName?: string,
  accountHolder?: string
}

// Xử lý đổi hàng
POST /api/orders/:id/process-exchange
{
  action: 'approve' | 'reject',
  note: string,
  inspectionNote: string
}

// Cập nhật trạng thái vận chuyển
POST /api/orders/:id/update-return-status
{
  status: 'return_shipping' | 'return_received',
  trackingNumber?: string,
  note: string
}
```

---

## 📝 Validation Rules

### RefundModal
```typescript
reason: required, maxLength: 500
bankName: required
bankAccount: required, pattern: /^[0-9]{9,20}$/
accountHolder: required, pattern: /^[A-Z\s]+$/ (HOA KHÔNG DẤU)
qrCodeImage: optional, image file
```

### ReturnExchangeModal
```typescript
type: required, enum: ['return', 'exchange']
reason: required, maxLength: 500
images: required, min: 1, max: 5, image files
```

---

## 🎯 Testing Checklist

### User Flow
- [ ] Hiển thị nút "Hoàn tiền" đúng điều kiện
- [ ] Hiển thị nút "Trả/Đổi" đúng điều kiện
- [ ] Modal hoàn tiền mở và đóng đúng
- [ ] Modal trả/đổi mở và đóng đúng
- [ ] Form validation hoạt động
- [ ] Upload ảnh thành công
- [ ] Submit request thành công
- [ ] Hiển thị message success/error
- [ ] Reload danh sách sau khi submit

### Admin Flow
- [ ] Hiển thị đúng 3 tabs
- [ ] Filter đơn hàng theo tab
- [ ] Modal chi tiết hiển thị đầy đủ
- [ ] Modal xử lý hoạt động
- [ ] Xử lý hoàn tiền thành công
- [ ] Xử lý trả hàng thành công
- [ ] Xử lý đổi hàng thành công
- [ ] Cập nhật trạng thái vận chuyển
- [ ] Badge đếm số lượng chính xác

---

## 🚀 Deployment

### 1. Build
```bash
cd frontend
npm run build
```

### 2. Environment Variables
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Routes (cần thêm vào router)
```typescript
// User routes
{
  path: '/orders',
  element: <Orders />
}

// Admin routes
{
  path: '/admin/refund-management',
  element: <RefundManagement />
}
```

---

## 📦 Dependencies

Đã có sẵn trong project:
- ✅ antd
- ✅ react-router-dom
- ✅ axios
- ✅ dayjs
- ✅ @ant-design/icons

Không cần cài thêm gì!

---

## 🎉 Hoàn thành

Frontend đã sẵn sàng với:
- ✅ 2 Components mới (RefundModal, ReturnExchangeModal)
- ✅ 1 Page user cập nhật (Orders.tsx)
- ✅ 1 Page admin mới (RefundManagement.tsx)
- ✅ UI/UX đẹp, responsive
- ✅ Validation đầy đủ
- ✅ Integration với backend APIs
- ✅ Error handling
- ✅ Loading states
- ✅ Success messages

**Sẵn sàng sử dụng ngay!** 🚀
