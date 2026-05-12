import { Outlet, Link, useNavigate } from "react-router-dom";
import { message } from "antd";

export default function AdminLayout() {
  const navigate = useNavigate();

  const linkClass =
  "px-4 py-2 rounded-lg hover:bg-white hover:text-[#6272B6] hover:translate-x-1 transition-all duration-200";

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
          <Link to="/admin" className={linkClass}>Quản lý</Link>
          <Link to="/admin/adoptions" className={linkClass}>Nhận nuôi</Link>
          <Link to="/admin/volunteers" className={linkClass}>Tình nguyện</Link>
          <Link to="/admin/post" className={linkClass}>Bài viết</Link>
          <Link to="/admin/user" className={linkClass}>Người dùng</Link>
          <Link to="/admin/category" className={linkClass}>Danh mục</Link>
          <Link to="/admin/pets" className={linkClass}>Thú cưng</Link>
          <Link to="/admin/product" className={linkClass}>Sản phẩm</Link>
          <Link to="/admin/order" className={linkClass}>Đơn hàng</Link>
          {/* <Link to="/admin/contacts">Liên hệ</Link> */}
          <Link to="/admin/adopted-pets" className={linkClass}>Thú đã nhận nuôi</Link>
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
