import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { message } from "antd";
import {
  DashboardOutlined,
  HeartOutlined,
  TeamOutlined,
  FileTextOutlined,
  UserOutlined,
  AppstoreOutlined,
  BugOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  BarChartOutlined,
  GiftOutlined,
  MedicineBoxOutlined,
  DollarOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { useState } from "react";

// Admin layout dashboard
export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const adminUser = JSON.parse(
    localStorage.getItem("admin_user") || "{}"
  );

  const menuItems = [
    { path: "/admin", icon: <DashboardOutlined />, label: "Dashboard", color: "#6366f1" },
    { path: "/admin/adoptions", icon: <HeartOutlined />, label: "Nhận nuôi", color: "#ec4899" },
    { path: "/admin/volunteers", icon: <TeamOutlined />, label: "Tình nguyện", color: "#10b981" },
    { path: "/admin/reviews", icon: <StarOutlined />, label: "Đánh giá", color: "#f59e0b" },
    { path: "/admin/post", icon: <FileTextOutlined />, label: "Bài viết", color: "#f59e0b" },
    { path: "/admin/user", icon: <UserOutlined />, label: "Người dùng", color: "#8b5cf6" },
    { path: "/admin/pet-categories", icon: <BugOutlined />, label: "DM Thú cưng", color: "#06b6d4" },
    { path: "/admin/product-categories", icon: <AppstoreOutlined />, label: "DM Sản phẩm", color: "#14b8a6" },
    { path: "/admin/pets", icon: <HeartOutlined />, label: "Thú cưng", color: "#f97316" },
    { path: "/admin/product", icon: <ShoppingOutlined />, label: "Sản phẩm", color: "#84cc16" },
    { path: "/admin/order", icon: <ShoppingCartOutlined />, label: "Đơn hàng", color: "#ef4444" },
    { path: "/admin/statistics", icon: <BarChartOutlined />, label: "Thống kê", color: "#6366f1" },
    { path: "/admin/vouchers", icon: <GiftOutlined />, label: "Voucher", color: "#f59e0b" },
    { path: "/admin/vaccinations", icon: <MedicineBoxOutlined />, label: "Lịch tiêm", color: "#10b981" },
    { path: "/admin/supporters", icon: <DollarOutlined />, label: "Ủng hộ", color: "#ec4899" },
    { path: "/admin/adopted-pets", icon: <HeartOutlined />, label: "Đã nhận nuôi", color: "#8b5cf6" },
  ];

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    message.success("Đã đăng xuất hoàn toàn");
    navigate("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${
          collapsed ? "w-20" : "w-72"
        } transition-all duration-500 relative shadow-2xl`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#6272B6] via-purple-600 to-indigo-700"></div>
        <div className="absolute inset-0 bg-black/10"></div>

        <div className="relative h-full text-white p-6 overflow-y-auto">
          {/* Decorative */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            {!collapsed && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <BugOutlined className="text-xl text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">PetAdopt Admin</h2>
                  <p className="text-white/70 text-xs">
                    {adminUser?.name || "Trang quản trị"}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-all"
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                title={item.label}
                className={`group flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 relative overflow-hidden hover:shadow-lg ${
                  isActive(item.path)
                    ? "bg-white/20 text-white shadow-lg backdrop-blur-sm"
                    : "hover:bg-white/10 text-white/80 hover:text-white"
                }`}
              >
                {isActive(item.path) && (
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                )}

                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                    isActive(item.path)
                      ? "scale-110"
                      : "group-hover:scale-105"
                  }`}
                  style={{
                    backgroundColor: isActive(item.path)
                      ? item.color
                      : "rgba(255,255,255,0.1)",
                  }}
                >
                  {item.icon}
                </div>

                {!collapsed && (
                  <span className="font-medium group-hover:translate-x-1 transition-transform">
                    {item.label}
                  </span>
                )}
              </Link>
            ))}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="group flex items-center gap-4 px-4 py-3 rounded-2xl transition-all text-red-300 hover:text-red-200 hover:bg-red-500/20 w-full mt-6"
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-red-500/20">
                <LogoutOutlined />
              </div>

              {!collapsed && (
                <span className="font-medium group-hover:translate-x-1 transition-transform">
                  Đăng xuất hệ thống
                </span>
              )}
            </button>
          </nav>

          {/* Footer */}
          {!collapsed && (
            <div className="mt-10 pt-6 border-t border-white/10 text-center text-xs text-white/50">
              PetAdopt © 2026
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30"></div>

        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(98,114,182,0.05) 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, rgba(139,92,246,0.05) 0%, transparent 50%)`,
          }}
        ></div>

        <div className="relative p-10 min-h-screen max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}