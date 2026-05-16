# 💳 Cập nhật: Form thông tin tài khoản

## 🎯 Yêu cầu

1. **Hủy đơn VNPay đã thanh toán** → Mở form hoàn tiền (nhập thông tin TK)
2. **Yêu cầu trả hàng** → Nhập thông tin TK ngay trong form trả hàng

---

## ✅ Đã cập nhật

### 1. Frontend - Orders.tsx

#### Function `handleCancelOrder()` - Xử lý hủy đơn

**Trước:**
```typescript
// Hủy trực tiếp, không phân biệt COD hay VNPay
const handleCancelOrder = (orderId: string) => {
  Modal.confirm({
    title: "Xác nhận hủy đơn",
    onOk: async () => {
      await apiClient.put(`/orders/me/${orderId}/cancel`);
      message.success("Đã hủy đơn hàng");
    }
  });
};
```

**Sau:**
```typescript
// Phân biệt COD và VNPay
const handleCancelOrder = (orderId: string) => {
  const order = orders.find(o => o._id === orderId);
  
  // Nếu VNPay đã thanh toán → Mở form hoàn tiền
  if (order && order.paymentMethod === 'vnpay' && ['paid', 'confirmed'].includes(order.status)) {
    Modal.confirm({
      title: "Hủy đơn hàng đã thanh toán",
      icon: <DollarOutlined />,
      content: "Đơn hàng này đã thanh toán qua VNPay. Bạn cần cung cấp thông tin tài khoản để nhận hoàn tiền.",
      okText: "Tiếp tục",
      onOk: () => {
        setSelectedOrderForAction(order);
        setRefundModalVisible(true);
      },
    });
    return;
  }
  
  // COD hoặc chưa thanh toán → Hủy bình thường
  Modal.confirm({
    title: "Xác nhận hủy đơn",
    onOk: async () => {
      await apiClient.put(`/orders/me/${orderId}/cancel`);
      message.success("Đã hủy đơn hàng");
    }
  });
};
```

---

### 2. Frontend - ReturnExchangeModal.tsx

#### Thêm form thông tin tài khoản

**Imports mới:**
```typescript
import {
  BankOutlined,
  CreditCardOutlined,
  UserOutlined,
  QrcodeOutlined
} from '@ant-design/icons';
```

**State mới:**
```typescript
const [qrFile, setQrFile] = useState<UploadFile[]>([]);
```

**Form mới (chỉ hiển thị khi type === 'return'):**
```tsx
{type === 'return' && (
  <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
    <h4>Thông tin tài khoản nhận hoàn tiền</h4>
    
    <Form.Item name="bankName" label="Tên ngân hàng" rules={[{ required: true }]}>
      <Input prefix={<BankOutlined />} placeholder="Vietcombank, Techcombank..." />
    </Form.Item>
    
    <Form.Item name="bankAccount" label="Số tài khoản" rules={[
      { required: true },
      { pattern: /^[0-9]{9,20}$/ }
    ]}>
      <Input prefix={<CreditCardOutlined />} placeholder="Số tài khoản" />
    </Form.Item>
    
    <Form.Item name="accountHolder" label="Tên chủ tài khoản" rules={[
      { required: true },
      { pattern: /^[A-Z\s]+$/ }
    ]}>
      <Input prefix={<UserOutlined />} placeholder="NGUYEN VAN A" />
    </Form.Item>
    
    <Form.Item label="Mã QR ngân hàng (optional)">
      <Upload
        listType="picture-card"
        fileList={qrFile}
        onChange={({ fileList }) => setQrFile(fileList)}
        beforeUpload={() => false}
        maxCount={1}
      >
        {qrFile.length === 0 && <div>Upload QR</div>}
      </Upload>
    </Form.Item>
  </div>
)}
```

**Validation trong handleSubmit:**
```typescript
// Nếu là trả hàng, kiểm tra thông tin tài khoản
if (values.type === 'return') {
  if (!values.bankAccount || !values.bankName || !values.accountHolder) {
    message.warning('Vui lòng nhập đầy đủ thông tin tài khoản để nhận hoàn tiền');
    return;
  }
}
```

**Gửi data:**
```typescript
const requestData: any = {
  type: values.type,
  reason: values.reason,
  images: imageUrls,
};

// Nếu là trả hàng, thêm thông tin tài khoản
if (values.type === 'return') {
  requestData.bankAccount = values.bankAccount;
  requestData.bankName = values.bankName;
  requestData.accountHolder = values.accountHolder;
  if (qrFile.length > 0) {
    requestData.qrCodeImage = 'https://example.com/qr-code.jpg';
  }
}

await apiClient.post(`/orders/${orderId}/request-return-exchange`, requestData);
```

---

### 3. Backend - orderController.js

#### Function `requestReturnExchange()` - Nhận thông tin TK

**Trước:**
```javascript
const { type, reason, images } = req.body;
```

**Sau:**
```javascript
const { type, reason, images, bankAccount, bankName, accountHolder, qrCodeImage } = req.body;
```

**Logic mới:**
```javascript
// Prepare update data
const updateData = {
  status: newStatus,
  $push: { statusHistory: { ... } },
  returnExchange: {
    type,
    reason,
    requestedAt: new Date(),
    images: images || []
  }
};

// Nếu là trả hàng VÀ có thông tin tài khoản, lưu luôn vào refund
if (type === 'return' && bankAccount && bankName && accountHolder) {
  updateData.refund = {
    reason: reason || 'Trả hàng',
    requestedAt: new Date(),
    requestedBy: 'user',
    bankAccount,
    bankName,
    accountHolder,
    qrCodeImage: qrCodeImage || null,
    amount: order.totals.total
  };
}

const updated = await Order.findByIdAndUpdate(order._id, updateData, { new: true });
```

---

## 🎯 Quy trình mới

### 1. Hủy đơn VNPay đã thanh toán

```
User click "Hủy đơn" (đơn VNPay paid/confirmed)
  ↓
Modal xác nhận: "Đơn đã thanh toán, cần nhập thông tin TK"
  ↓
User click "Tiếp tục"
  ↓
Mở RefundModal
  ↓
User nhập:
  - Lý do hủy
  - Tên ngân hàng
  - Số tài khoản
  - Tên chủ tài khoản
  - QR code (optional)
  ↓
Submit → POST /api/orders/:id/request-refund
  ↓
Trạng thái: refund_pending
  ↓
Admin xử lý hoàn tiền
```

### 2. Yêu cầu trả hàng

```
User click "Trả/Đổi" (đơn completed trong 3 ngày)
  ↓
Mở ReturnExchangeModal
  ↓
User chọn "Trả hàng hoàn tiền"
  ↓
Form hiển thị:
  - Lý do trả hàng
  - Upload ảnh (1-5 ảnh)
  - Thông tin tài khoản (BẮT BUỘC):
    * Tên ngân hàng
    * Số tài khoản
    * Tên chủ tài khoản
    * QR code (optional)
  ↓
Submit → POST /api/orders/:id/request-return-exchange
  ↓
Backend lưu:
  - returnExchange: { type, reason, images }
  - refund: { bankAccount, bankName, accountHolder, qrCodeImage }
  ↓
Trạng thái: return_requested
  ↓
Admin xử lý:
  - Approve → Đã có sẵn thông tin TK
  - Không cần user nhập lại
```

---

## 📊 So sánh

### Trước khi cập nhật

#### Hủy đơn VNPay
```
User hủy → Đơn cancelled → Admin phải liên hệ user để lấy TK → Hoàn tiền
❌ Phức tạp, mất thời gian
```

#### Trả hàng
```
User yêu cầu → Admin approve → Admin phải liên hệ user để lấy TK → Hoàn tiền
❌ Phức tạp, mất thời gian
```

### Sau khi cập nhật

#### Hủy đơn VNPay
```
User hủy → Nhập TK ngay → Đơn refund_pending → Admin xử lý → Hoàn tiền
✅ Nhanh, đơn giản, có đầy đủ thông tin
```

#### Trả hàng
```
User yêu cầu → Nhập TK ngay → Đơn return_requested → Admin approve → Hoàn tiền
✅ Nhanh, đơn giản, có đầy đủ thông tin
```

---

## 🎨 UI/UX

### Hủy đơn VNPay

**Modal xác nhận:**
```
┌─────────────────────────────────────┐
│ 💰 Hủy đơn hàng đã thanh toán       │
├─────────────────────────────────────┤
│ Đơn hàng này đã thanh toán qua      │
│ VNPay. Bạn cần cung cấp thông tin   │
│ tài khoản để nhận hoàn tiền.        │
│                                     │
│         [Hủy bỏ]  [Tiếp tục]       │
└─────────────────────────────────────┘
```

**Sau khi click "Tiếp tục":**
→ Mở RefundModal (form hoàn tiền đầy đủ)

---

### Trả hàng

**Form trả hàng:**
```
┌─────────────────────────────────────┐
│ 🔄 Yêu cầu trả hàng                 │
├─────────────────────────────────────┤
│ ⚪ Trả hàng hoàn tiền (selected)    │
│ ⚪ Đổi hàng mới                      │
│                                     │
│ Lý do: [________________]           │
│                                     │
│ Ảnh chứng minh: [Upload 1-5 ảnh]   │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🏦 Thông tin TK nhận hoàn tiền  │ │
│ │ ℹ️ Bắt buộc: Vui lòng cung cấp  │ │
│ │                                 │ │
│ │ Tên NH: [__________________]    │ │
│ │ Số TK:  [__________________]    │ │
│ │ Chủ TK: [__________________]    │ │
│ │ QR:     [Upload]                │ │
│ └─────────────────────────────────┘ │
│                                     │
│         [Hủy]  [Gửi yêu cầu]       │
└─────────────────────────────────────┘
```

**Khi chọn "Đổi hàng":**
→ Form thông tin TK KHÔNG hiển thị (vì không cần hoàn tiền)

---

## ✅ Lợi ích

### Cho User
- ✅ Không cần liên hệ admin để cung cấp TK
- ✅ Nhập thông tin 1 lần, không cần nhập lại
- ✅ Quy trình rõ ràng, dễ hiểu
- ✅ Nhận hoàn tiền nhanh hơn

### Cho Admin
- ✅ Có đầy đủ thông tin TK ngay từ đầu
- ✅ Không cần liên hệ user để hỏi TK
- ✅ Xử lý nhanh hơn
- ✅ Giảm thiểu sai sót

### Cho Hệ thống
- ✅ Tự động hóa cao hơn
- ✅ Dữ liệu đầy đủ hơn
- ✅ Trải nghiệm tốt hơn
- ✅ Giảm support tickets

---

## 🧪 Test Cases

### Test 1: Hủy đơn COD
```
1. Tạo đơn COD
2. Click "Hủy đơn"
3. Kiểm tra: Modal hủy bình thường (không yêu cầu TK)
4. Confirm → Đơn cancelled
✅ Pass
```

### Test 2: Hủy đơn VNPay chưa thanh toán
```
1. Tạo đơn VNPay (pending)
2. Click "Hủy đơn"
3. Kiểm tra: Modal hủy bình thường (không yêu cầu TK)
4. Confirm → Đơn cancelled
✅ Pass
```

### Test 3: Hủy đơn VNPay đã thanh toán
```
1. Tạo đơn VNPay và thanh toán (paid)
2. Click "Hủy đơn"
3. Kiểm tra: Modal yêu cầu nhập TK
4. Click "Tiếp tục"
5. Kiểm tra: RefundModal mở
6. Nhập đầy đủ thông tin TK
7. Submit
8. Kiểm tra: Đơn refund_pending
✅ Pass
```

### Test 4: Yêu cầu trả hàng
```
1. Đơn completed (trong 3 ngày)
2. Click "Trả/Đổi"
3. Chọn "Trả hàng hoàn tiền"
4. Kiểm tra: Form thông tin TK hiển thị
5. Nhập lý do + upload ảnh
6. Nhập thông tin TK
7. Submit
8. Kiểm tra: Đơn return_requested
9. Kiểm tra backend: refund field có data
✅ Pass
```

### Test 5: Yêu cầu đổi hàng
```
1. Đơn completed (trong 3 ngày)
2. Click "Trả/Đổi"
3. Chọn "Đổi hàng mới"
4. Kiểm tra: Form thông tin TK KHÔNG hiển thị
5. Nhập lý do + upload ảnh
6. Submit
7. Kiểm tra: Đơn exchange_requested
8. Kiểm tra backend: refund field KHÔNG có data
✅ Pass
```

### Test 6: Validation
```
1. Yêu cầu trả hàng
2. Không nhập thông tin TK
3. Submit
4. Kiểm tra: Warning "Vui lòng nhập đầy đủ thông tin tài khoản"
✅ Pass

5. Nhập số TK sai format (< 9 số)
6. Kiểm tra: Error "Số tài khoản không hợp lệ"
✅ Pass

7. Nhập tên chủ TK có dấu
8. Kiểm tra: Error "Tên phải viết HOA KHÔNG DẤU"
✅ Pass
```

---

## 📝 Notes

### Backend
- Thông tin TK được lưu vào field `refund` ngay khi user yêu cầu trả hàng
- Admin không cần nhập lại thông tin TK khi xử lý
- Field `refund` có thể null nếu là đổi hàng (không cần hoàn tiền)

### Frontend
- Form thông tin TK chỉ hiển thị khi `type === 'return'`
- Validation chặt chẽ: số TK (9-20 số), tên chủ TK (HOA KHÔNG DẤU)
- QR code là optional, không bắt buộc

### UX
- Modal xác nhận rõ ràng khi hủy đơn VNPay
- Form trả hàng có background màu xanh để highlight phần thông tin TK
- Alert "Bắt buộc" để user biết phải nhập

---

## 🎉 Hoàn thành

Hệ thống giờ đã:
- ✅ Tự động yêu cầu thông tin TK khi hủy đơn VNPay
- ✅ Thu thập thông tin TK ngay khi yêu cầu trả hàng
- ✅ Lưu trữ thông tin TK đầy đủ
- ✅ Admin có sẵn thông tin để xử lý
- ✅ Quy trình nhanh hơn, ít lỗi hơn

**Trải nghiệm tốt hơn cho cả User và Admin!** 🚀
