# 🐾 Hệ Thống Chăm Sóc Thú Cưng

## Tổng Quan
Hệ thống chăm sóc thú cưng hoàn chỉnh cho phép người dùng quản lý sức khỏe và chăm sóc thú cưng đã nhận nuôi.

## Tính Năng Chính

### 1. 📊 Tổng Quan Sức Khỏe
- Hiển thị thống kê tiêm phòng, khám bệnh, hồ sơ y tế
- Lịch chăm sóc sắp tới
- Hướng dẫn chăm sóc chi tiết

### 2. 🏥 Hồ Sơ Sức Khỏe
- Thêm/sửa/xóa hồ sơ khám bệnh
- Theo dõi cân nặng, nhiệt độ
- Lịch tái khám
- Phân loại: Tiêm phòng, Khám bệnh, Điều trị, Khác

### 3. 💉 Lịch Tiêm Phòng
- Quản lý lịch tiêm phòng đầy đủ
- Tích hợp với hệ thống vaccination hiện có
- Nhắc nhở tự động qua email
- Theo dõi trạng thái: Đã lên lịch, Đã nhắc nhở, Hoàn thành, Trễ hẹn

### 4. 📖 Mẹo Chăm Sóc
- Hướng dẫn dinh dưỡng, vận động, vệ sinh, y tế
- Dấu hiệu cần chú ý
- Liên hệ bác sĩ khẩn cấp

### 5. 🔔 Thông Báo
- Thông báo real-time về lịch tiêm, khám bệnh
- Đánh dấu đã đọc/chưa đọc
- Xóa thông báo không cần thiết

## API Endpoints

### Health Records
- `GET /api/health-records/pet/:petId` - Lấy hồ sơ sức khỏe
- `POST /api/health-records/pet/:petId` - Thêm hồ sơ mới
- `PUT /api/health-records/:recordId` - Cập nhật hồ sơ
- `DELETE /api/health-records/:recordId` - Xóa hồ sơ
- `GET /api/health-records/pet/:petId/stats` - Thống kê sức khỏe

### Vaccinations
- `GET /api/vaccinations/me` - Lấy lịch tiêm của user
- `POST /api/vaccinations` - Thêm lịch tiêm mới
- `PUT /api/vaccinations/:id` - Cập nhật lịch tiêm
- `PUT /api/vaccinations/:id/complete` - Đánh dấu hoàn thành
- `DELETE /api/vaccinations/:id` - Xóa lịch tiêm
- `GET /api/vaccinations/upcoming` - Lịch tiêm sắp tới

### Notifications
- `GET /api/notifications/recent` - Thông báo gần đây
- `PUT /api/notifications/:id/read` - Đánh dấu đã đọc
- `PUT /api/notifications/read-all` - Đọc tất cả
- `DELETE /api/notifications/:id` - Xóa thông báo

## Frontend Components

### Pages
- `PetCare.tsx` - Trang chính chăm sóc thú cưng
- `PetCare.css` - Styles cho trang chăm sóc
- `Notifications.tsx` - Trang thông báo

### Components
- `NotificationBell.tsx` - Chuông thông báo trong header
- `NotificationBell.css` - Styles cho chuông thông báo

## Database Models

### HealthRecord
```javascript
{
  pet: ObjectId,
  user: ObjectId,
  type: ['vaccination', 'checkup', 'treatment', 'other'],
  date: Date,
  veterinarian: String,
  description: String,
  nextCheckup: Date,
  weight: Number,
  temperature: Number,
  notes: String
}
```

### VaccinationSchedule
```javascript
{
  pet: ObjectId,
  owner: ObjectId,
  vaccineName: String,
  vaccineType: ['basic', 'rabies', 'combo', 'other'],
  scheduledDate: Date,
  status: ['scheduled', 'reminded', 'completed', 'missed', 'cancelled'],
  veterinarian: {
    name: String,
    clinic: String,
    phone: String
  },
  doseNumber: Number,
  totalDoses: Number
}
```

### Notification
```javascript
{
  user: ObjectId,
  type: String,
  title: String,
  message: String,
  link: String,
  isRead: Boolean,
  icon: String,
  priority: ['low', 'medium', 'high']
}
```

## Bảo Mật
- Tất cả API đều yêu cầu authentication
- Kiểm tra quyền sở hữu thú cưng trước khi cho phép truy cập
- Validation đầy đủ cho tất cả input

## Cách Sử Dụng

1. **Truy cập trang chăm sóc**: `/pet-care`
2. **Chọn thú cưng** từ danh sách đã nhận nuôi
3. **Xem tổng quan** sức khỏe và lịch sắp tới
4. **Thêm hồ sơ** sức khỏe khi cần
5. **Quản lý lịch tiêm** phòng
6. **Đọc mẹo** chăm sóc
7. **Theo dõi thông báo** trong header

## Tích Hợp
- Tích hợp với hệ thống adoption để lấy danh sách thú cưng
- Tích hợp với hệ thống email để gửi nhắc nhở
- Tích hợp với hệ thống notification real-time

## Testing
Chạy test script:
```bash
node test-pet-care.js <your_jwt_token>
```

## Responsive Design
- Hỗ trợ đầy đủ mobile và tablet
- UI/UX tối ưu cho tất cả thiết bị
- Animation mượt mà và hiệu ứng đẹp mắt