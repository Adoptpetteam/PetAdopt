import { Outlet, Link, useNavigate } from "react-router-dom";
import { message } from "antd";

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    message.success("Đã đăng xuất hoàn toàn");
    navigate("/admin/login");
  };
  return (
    <div className="flex min-h-screen">

      {/* SIDEBAR */}
      <div className="w-64 bg-[#6272B6] text-white p-6 space-y-4">
        <h2 className="text-2xl font-bold mb-6">Admin</h2>

        <nav className="flex flex-col gap-3">
          <Link to="/admin">Quản lý</Link>
          <Link to="/admin/adoptions">Nhận nuôi</Link>
          <Link to="/admin/volunteers">Tình nguyện</Link>
          <Link to="/admin/post">Bài viết</Link>
          <Link to="/admin/user">Người dùng</Link>
          <Link to="/admin/category">Danh mục</Link>
          <Link to="/admin/pets">Thú cưng</Link>
          <Link to="/admin/product">Sản phẩm</Link>
          <Link to="/admin/order">Đơn hàng</Link>
          {/* <Link to="/admin/contacts">Liên hệ</Link> */}
            <Link to="/admin/customers"> Thông tin khách hàng</Link>
          <Link to="/admin/adopted-pets">Thú đã nhận nuôi</Link>
          <button 
            onClick={handleLogout}
            className="text-left text-red-300 hover:text-red-400 mt-4 font-bold"
          >
            Đăng xuất
          </button>
        </nav>
      </div>

      {/* CONTENT */}
      <div className="flex-1 bg-gray-100 p-8">
        <Outlet />
      </div>

    </div>
  );
}
