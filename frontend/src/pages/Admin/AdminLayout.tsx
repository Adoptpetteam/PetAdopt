import { Outlet, Link } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen">

      {/* SIDEBAR */}
      <div className="w-64 bg-[#6272B6] text-white p-6 space-y-4">
        <h2 className="text-2xl font-bold mb-6">Admin</h2>

        <nav className="flex flex-col gap-3">
          <Link to="/admin">Quản lý</Link>
          <Link to="/admin/pets">Danh sách thú cưng</Link>
          <Link to="/admin/adoptions">Nhận nuôi</Link>
          <Link to="/admin/volunteers">Tình nguyện</Link>
          <Link to="/admin/post">Bài viết</Link>
          <Link to="/admin/user">Người dùng</Link>
          <Link to="/admin/category">Danh mục</Link>
          <Link to="/admin/product">Sản phẩm</Link>
          <Link to="/admin/order">Đơn hàng</Link>
<<<<<<< Updated upstream
          <Link to="/admin/contacts">Liên hệ</Link>
=======
          <Link to="/admin/vaccination-care">Lịch tiêm phòng</Link>
          <Link to="/admin/contacts">Liên hệ</Link>

          {/* ✅ MỚI */}
          <Link to="/admin/customer-care">Chăm sóc khách hàng</Link>
>>>>>>> Stashed changes
        </nav>
      </div>

      {/* CONTENT */}
      <div className="flex-1 bg-gray-100 p-8">
        <Outlet />
      </div>

    </div>
  );
}