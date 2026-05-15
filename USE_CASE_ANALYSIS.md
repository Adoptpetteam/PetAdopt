# BÁO CÁO PHÂN TÍCH USE CASE - HỆ THỐNG PETADOPT

## 📋 TỔNG QUAN HỆ THỐNG

**Tên dự án:** PetAdopt - Hệ thống nhận nuôi thú cưng  
**Phiên bản:** 1.0  
**Ngày tạo:** 15/05/2026  
**Người phân tích:** System Analysis Team  

### Mô tả hệ thống
PetAdopt là một nền tảng trực tuyến toàn diện cho việc nhận nuôi thú cưng, bao gồm các tính năng ecommerce, quản lý tình nguyện viên, donation và chăm sóc sức khỏe thú cưng.

---

## 👥 PHÂN TÍCH ACTOR

### 1. Primary Actors (Tác nhân chính)

#### 1.1 Guest/Visitor (Khách)
- **Mô tả:** Người dùng chưa đăng nhập vào hệ thống
- **Quyền hạn:** 
  - Xem danh sách thú cưng
  - Xem sản phẩm
  - Đăng ký tài khoản
  - Đăng ký tình nguyện viên
  - Donation

#### 1.2 User (Người dùng)
- **Mô tả:** Người dùng đã đăng ký và xác thực tài khoản
- **Quyền hạn:**
  - Tất cả quyền của Guest
  - Tạo đơn nhận nuôi
  - Quản lý thú cưng cá nhân
  - Mua sắm sản phẩm
  - Quản lý đơn hàng
  - Viết review và đánh giá
  - Quản lý lịch tiêm phòng

#### 1.3 Admin (Quản trị viên)
- **Mô tả:** Quản trị viên hệ thống với quyền cao nhất
- **Quyền hạn:**
  - Tất cả quyền của User
  - Quản lý tất cả người dùng
  - Duyệt/từ chối thú cưng
  - Duyệt đơn nhận nuôi
  - Quản lý sản phẩm
  - Xem thống kê và báo cáo
  - Quản lý tình nguyện viên

#### 1.4 Volunteer (Tình nguyện viên)
- **Mô tả:** Tình nguyện viên đã được duyệt
- **Quyền hạn:**
  - Tất cả quyền của User
  - Hỗ trợ chăm sóc thú cưng
  - Tham gia các hoạt động tình nguyện

### 2. Secondary Actors (Tác nhân phụ)

#### 2.1 Email System
- **Mô tả:** Hệ thống gửi email tự động
- **Chức năng:** Gửi OTP, thông báo, nhắc nhở

#### 2.2 Payment Gateway (VNPay)
- **Mô tả:** Cổng thanh toán trực tuyến
- **Chức năng:** Xử lý thanh toán đơn hàng và donation

---

## 🎯 SƠ ĐỒ USE CASE TỔNG QUAN

```
                    HỆ THỐNG PETADOPT
    
    Guest           User            Admin           System
      |              |               |               |
      |              |               |               |
   [Xem pets]    [Nhận nuôi]    [Quản lý]      [Gửi email]
   [Đăng ký]     [Mua hàng]     [Thống kê]     [Thanh toán]
   [Donation]    [Review]       [Duyệt đơn]    [Nhắc nhở]
      |              |               |               |
      +------+-------+-------+-------+---------------+
             |               |
         [Authentication] [Authorization]
```

---

## 📊 CHI TIẾT CÁC USE CASE

### 🔐 NHÓM 1: AUTHENTICATION & USER MANAGEMENT

#### UC001: Đăng ký tài khoản
- **Actor:** Guest
- **Mô tả:** Người dùng tạo tài khoản mới với xác thực OTP
- **Luồng chính:**
  1. Guest nhập thông tin đăng ký (name, email, password)
  2. Hệ thống gửi OTP qua email
  3. Guest nhập OTP để xác thực
  4. Hệ thống tạo tài khoản và trả về JWT token
- **Luồng phụ:**
  - OTP hết hạn → Gửi lại OTP
  - Email đã tồn tại → Thông báo lỗi

#### UC002: Đăng nhập
- **Actor:** User
- **Mô tả:** Xác thực người dùng vào hệ thống
- **Luồng chính:**
  1. User nhập email/password hoặc đăng nhập Google
  2. Hệ thống xác thực thông tin
  3. Trả về JWT token và thông tin user
- **Luồng phụ:**
  - Sai thông tin → Thông báo lỗi
  - Tài khoản bị ban → Từ chối truy cập

#### UC003: Quên mật khẩu
- **Actor:** User
- **Mô tả:** Đặt lại mật khẩu qua OTP
- **Luồng chính:**
  1. User nhập email
  2. Hệ thống gửi OTP reset password
  3. User nhập OTP và mật khẩu mới
  4. Hệ thống cập nhật mật khẩu

#### UC004: Quản lý profile
- **Actor:** User
- **Mô tả:** Cập nhật thông tin cá nhân
- **Luồng chính:**
  1. User xem thông tin profile hiện tại
  2. Cập nhật thông tin cần thiết
  3. Hệ thống lưu thay đổi

#### UC005: Ban/Unban user
- **Actor:** Admin
- **Mô tả:** Quản lý trạng thái tài khoản người dùng
- **Luồng chính:**
  1. Admin xem danh sách users
  2. Chọn user cần ban/unban
  3. Hệ thống cập nhật trạng thái isBanned

---

### 🐕 NHÓM 2: PET MANAGEMENT

#### UC006: Xem danh sách thú cưng
- **Actor:** Guest, User
- **Mô tả:** Hiển thị danh sách thú cưng có thể nhận nuôi
- **Luồng chính:**
  1. Actor truy cập trang pets
  2. Hệ thống hiển thị pets với status='available'
  3. Hỗ trợ filter theo species, age, size, location
  4. Phân trang kết quả

#### UC007: Xem chi tiết thú cưng
- **Actor:** Guest, User
- **Mô tả:** Xem thông tin chi tiết của một thú cưng
- **Luồng chính:**
  1. Actor click vào thú cưng
  2. Hiển thị thông tin đầy đủ (ảnh, mô tả, health status)
  3. Hiển thị reviews và ratings
  4. Nút "Nhận nuôi" (nếu đã login)

#### UC008: Thêm thú cưng mới
- **Actor:** User, Admin
- **Mô tả:** Đăng thông tin thú cưng cần tìm chủ
- **Luồng chính:**
  1. User upload ảnh và nhập thông tin pet
  2. Hệ thống validate dữ liệu
  3. Tạo pet với status='pending' (cần admin duyệt)
  4. Gửi thông báo cho admin

#### UC009: Duyệt/Từ chối thú cưng
- **Actor:** Admin
- **Mô tả:** Admin kiểm duyệt thú cưng mới
- **Luồng chính:**
  1. Admin xem danh sách pets pending
  2. Xem chi tiết và quyết định approve/reject
  3. Cập nhật status và gửi thông báo cho owner

---

### 💝 NHÓM 3: ADOPTION SYSTEM

#### UC010: Tạo đơn nhận nuôi
- **Actor:** User
- **Mô tả:** Gửi đơn xin nhận nuôi thú cưng
- **Luồng chính:**
  1. User chọn pet muốn nhận nuôi
  2. Điền form đơn nhận nuôi (thông tin cá nhân, lý do, kinh nghiệm)
  3. Hệ thống tạo AdoptionRequest với status='pending'
  4. Gửi thông báo cho admin và pet owner

#### UC011: Xem đơn nhận nuôi của tôi
- **Actor:** User
- **Mô tả:** Theo dõi trạng thái các đơn nhận nuôi
- **Luồng chính:**
  1. User truy cập "My Adoption Requests"
  2. Hiển thị danh sách đơn với trạng thái
  3. Có thể cancel đơn đang pending

#### UC012: Duyệt đơn nhận nuôi
- **Actor:** Admin
- **Mô tả:** Xét duyệt đơn nhận nuôi
- **Luồng chính:**
  1. Admin xem danh sách đơn pending
  2. Xem chi tiết đơn và thông tin người xin nhận nuôi
  3. Quyết định approve/reject
  4. Cập nhật status pet thành 'adopted' nếu approve
  5. Gửi thông báo kết quả

#### UC013: Đánh giá đơn nhận nuôi
- **Actor:** User
- **Mô tả:** Đánh giá trải nghiệm sau khi nhận nuôi
- **Luồng chính:**
  1. User có đơn approved có thể đánh giá
  2. Nhập rating và comment
  3. Hệ thống lưu review

---

### 🛒 NHÓM 4: PRODUCT & ORDER SYSTEM

#### UC014: Xem sản phẩm
- **Actor:** Guest, User
- **Mô tả:** Duyệt danh sách sản phẩm cho thú cưng
- **Luồng chính:**
  1. Actor truy cập trang products
  2. Hiển thị products theo categories
  3. Filter theo giá, category, rating
  4. Search theo tên sản phẩm

#### UC015: Mua sản phẩm
- **Actor:** User
- **Mô tả:** Đặt hàng sản phẩm
- **Luồng chính:**
  1. User thêm sản phẩm vào giỏ hàng
  2. Checkout với thông tin giao hàng
  3. Chọn phương thức thanh toán (VNPay/COD)
  4. Tạo Order với status='pending'
  5. Nếu VNPay → redirect đến payment gateway

#### UC016: Quản lý đơn hàng
- **Actor:** User
- **Mô tả:** Theo dõi trạng thái đơn hàng
- **Luồng chính:**
  1. User xem "My Orders"
  2. Hiển thị danh sách đơn hàng với status
  3. Có thể cancel đơn chưa xác nhận
  4. Xem chi tiết từng đơn

#### UC017: Quản lý đơn hàng (Admin)
- **Actor:** Admin
- **Mô tả:** Xử lý và cập nhật đơn hàng
- **Luồng chính:**
  1. Admin xem tất cả orders
  2. Cập nhật status: confirmed → shipping → completed
  3. Gửi thông báo cập nhật cho customer

---

### 💰 NHÓM 5: DONATION SYSTEM

#### UC018: Tạo donation
- **Actor:** Guest, User
- **Mô tả:** Ủng hộ tổ chức
- **Luồng chính:**
  1. Actor nhập số tiền và thông tin donor
  2. Chọn ẩn danh hoặc hiển thị tên
  3. Thanh toán qua VNPay
  4. Tạo Donation record
  5. Hiển thị trong top supporters nếu không ẩn danh

#### UC019: Xem top supporters
- **Actor:** Guest, User
- **Mô tả:** Hiển thị danh sách nhà hảo tâm
- **Luồng chính:**
  1. Hiển thị supporters không ẩn danh
  2. Sắp xếp theo tổng số tiền ủng hộ
  3. Hiển thị dạng marquee trên trang chủ

---

### 🤝 NHÓM 6: VOLUNTEER SYSTEM

#### UC020: Đăng ký tình nguyện viên
- **Actor:** Guest, User
- **Mô tả:** Đăng ký làm tình nguyện viên
- **Luồng chính:**
  1. Actor điền form đăng ký volunteer
  2. Nhập thông tin cá nhân, kinh nghiệm, thời gian rảnh
  3. Tạo Volunteer record với status='pending'
  4. Gửi thông báo cho admin

#### UC021: Duyệt tình nguyện viên
- **Actor:** Admin
- **Mô tả:** Xét duyệt đơn tình nguyện viên
- **Luồng chính:**
  1. Admin xem danh sách volunteers pending
  2. Xem chi tiết thông tin
  3. Approve/reject đơn
  4. Gửi email thông báo kết quả

---

### 🔔 NHÓM 7: NOTIFICATION SYSTEM

#### UC022: Xem thông báo
- **Actor:** User
- **Mô tả:** Xem các thông báo cá nhân
- **Luồng chính:**
  1. User click vào notification bell
  2. Hiển thị danh sách notifications
  3. Đánh dấu đã đọc khi click
  4. Hiển thị số lượng unread

#### UC023: Gửi thông báo tự động
- **Actor:** System
- **Mô tả:** Hệ thống gửi thông báo tự động
- **Trigger events:**
  - Đơn nhận nuôi được duyệt/từ chối
  - Đơn hàng thay đổi status
  - Volunteer được duyệt
  - Nhắc nhở tiêm phòng

---

### ⭐ NHÓM 8: REVIEW & RATING SYSTEM

#### UC024: Viết review
- **Actor:** User
- **Mô tả:** Đánh giá thú cưng hoặc sản phẩm
- **Luồng chính:**
  1. User có thể review sau khi adopt pet hoặc mua product
  2. Nhập rating (1-5 sao) và comment
  3. Hệ thống lưu review và cập nhật average rating

#### UC025: Vote helpful review
- **Actor:** User
- **Mô tả:** Đánh giá review có hữu ích không
- **Luồng chính:**
  1. User click helpful/not helpful trên review
  2. Cập nhật helpfulCount của review

---

### 💉 NHÓM 9: VACCINATION MANAGEMENT

#### UC026: Quản lý lịch tiêm phòng
- **Actor:** User
- **Mô tả:** Theo dõi lịch tiêm phòng cho thú cưng
- **Luồng chính:**
  1. User tạo vaccination schedule cho pet
  2. Nhập loại vaccine, ngày tiêm, ngày nhắc nhở
  3. Hệ thống gửi email nhắc nhở trước ngày tiêm
  4. User cập nhật trạng thái đã tiêm

#### UC027: Gửi nhắc nhở tiêm phòng
- **Actor:** System
- **Mô tả:** Tự động gửi email nhắc nhở
- **Luồng chính:**
  1. Cron job chạy hàng ngày
  2. Tìm các lịch tiêm sắp đến hạn
  3. Gửi email nhắc nhở cho pet owner

---

### 🎫 NHÓM 10: VOUCHER SYSTEM

#### UC028: Sử dụng voucher
- **Actor:** User
- **Mô tả:** Áp dụng mã giảm giá khi mua hàng
- **Luồng chính:**
  1. User nhập voucher code khi checkout
  2. Hệ thống validate voucher (còn hạn, chưa dùng, đủ điều kiện)
  3. Áp dụng discount và cập nhật usage

#### UC029: Quản lý voucher
- **Actor:** Admin
- **Mô tả:** Tạo và quản lý mã giảm giá
- **Luồng chính:**
  1. Admin tạo voucher với điều kiện (min order, discount %, expiry)
  2. Xem thống kê usage của các voucher

---

### 📊 NHÓM 11: ADMIN DASHBOARD

#### UC030: Xem dashboard thống kê
- **Actor:** Admin
- **Mô tả:** Xem tổng quan hoạt động hệ thống
- **Luồng chính:**
  1. Admin truy cập dashboard
  2. Hiển thị các metrics:
     - Tổng số pets, users, orders
     - Doanh thu theo tháng
     - Số đơn nhận nuôi thành công
     - Top products bán chạy

#### UC031: Báo cáo chi tiết
- **Actor:** Admin
- **Mô tả:** Xuất báo cáo theo thời gian
- **Luồng chính:**
  1. Admin chọn loại báo cáo và khoảng thời gian
  2. Hệ thống generate báo cáo
  3. Có thể export PDF/Excel

---

## 🔐 MA TRẬN PHÂN QUYỀN

| Use Case | Guest | User | Admin | System |
|----------|-------|------|-------|--------|
| UC001-005: Auth & User Mgmt | ✅ | ✅ | ✅ | - |
| UC006-007: Xem pets | ✅ | ✅ | ✅ | - |
| UC008: Thêm pet | ❌ | ✅ | ✅ | - |
| UC009: Duyệt pet | ❌ | ❌ | ✅ | - |
| UC010-013: Adoption | ❌ | ✅ | ✅ | - |
| UC014: Xem products | ✅ | ✅ | ✅ | - |
| UC015-016: Mua hàng | ❌ | ✅ | ✅ | - |
| UC017: Quản lý orders | ❌ | ❌ | ✅ | - |
| UC018-019: Donation | ✅ | ✅ | ✅ | - |
| UC020: Đăng ký volunteer | ✅ | ✅ | ✅ | - |
| UC021: Duyệt volunteer | ❌ | ❌ | ✅ | - |
| UC022: Xem notifications | ❌ | ✅ | ✅ | - |
| UC023: Gửi notifications | ❌ | ❌ | ❌ | ✅ |
| UC024-025: Reviews | ❌ | ✅ | ✅ | - |
| UC026: Quản lý vaccination | ❌ | ✅ | ✅ | - |
| UC027: Nhắc nhở vaccination | ❌ | ❌ | ❌ | ✅ |
| UC028: Sử dụng voucher | ❌ | ✅ | ✅ | - |
| UC029: Quản lý voucher | ❌ | ❌ | ✅ | - |
| UC030-031: Dashboard & Reports | ❌ | ❌ | ✅ | - |

---

## 🔄 LUỒNG NGHIỆP VỤ CHÍNH

### 1. Luồng nhận nuôi thú cưng
```
User đăng ký → Xác thực OTP → Đăng nhập → Xem pets → 
Chọn pet → Tạo đơn nhận nuôi → Admin duyệt → 
Thông báo kết quả → (Nếu approved) Pet status = adopted
```

### 2. Luồng mua sắm
```
User xem products → Thêm vào giỏ hàng → Checkout → 
Chọn thanh toán → (VNPay) Thanh toán → Order confirmed → 
Admin xử lý → Giao hàng → Hoàn thành
```

### 3. Luồng donation
```
Donor nhập thông tin → Chọn số tiền → Thanh toán VNPay → 
Donation thành công → Hiển thị trong top supporters
```

### 4. Luồng tình nguyện viên
```
Đăng ký volunteer → Điền thông tin → Admin xét duyệt → 
Thông báo kết quả → (Nếu approved) Tham gia hoạt động
```

---

## 📈 BIỂU ĐỒ HOẠT ĐỘNG - LUỒNG NHẬN NUÔI

```
    User                    System                  Admin
      |                       |                      |
      |-- Tạo đơn nhận nuôi --|                      |
      |                       |-- Gửi thông báo ---->|
      |                       |                      |
      |                       |                      |-- Xem đơn
      |                       |                      |-- Quyết định
      |                       |<-- Approve/Reject ---|
      |<-- Thông báo kết quả --|                      |
      |                       |                      |
   [Nếu approved]             |                      |
      |                       |-- Cập nhật pet ----->|
      |                       |   status = adopted   |
      |                       |                      |
```

---

## 🎯 KẾT LUẬN

### Tổng kết hệ thống:
- **31 Use Cases** chính được xác định
- **4 Actor types** với phân quyền rõ ràng  
- **11 nhóm chức năng** chính
- **Tích hợp thanh toán** VNPay
- **Hệ thống thông báo** tự động
- **Quản lý đầy đủ** từ pets đến ecommerce

### Điểm mạnh:
- Phân quyền rõ ràng và bảo mật
- Luồng nghiệp vụ logic và hoàn chỉnh
- Tích hợp nhiều tính năng trong một platform
- Hỗ trợ automation (email, notifications)

### Khuyến nghị:
- Thêm tính năng chat/messaging giữa adopter và pet owner
- Implement push notifications cho mobile
- Thêm tính năng booking visit pet trước khi nhận nuôi
- Tích hợp social media sharing

---

**📅 Ngày hoàn thành:** 15/05/2026  
**👨‍💻 Phân tích bởi:** Kiro AI Assistant  
**📧 Liên hệ:** support@petadopt.com