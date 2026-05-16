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
  RollbackOutlined
} from "@ant-design/icons";
import { useState } from "react";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { path: "/admin", icon: <DashboardOutlined />, label: "Dashboard", color: "#6366f1" },
    { path: "/admin/adoptions", icon: <HeartOutlined />, label: "Nhận nuôi", color: "#b9226d" },
    { path: "/admin/volunteers", icon: <TeamOutlined />, label: "Tình nguyện", color: "#10b981" },
    { path: "/admin/reviews", icon: <StarOutlined />, label: "Đánh giá", color: "#f59e0b" },
    { path: "/admin/post", icon: <FileTextOutlined />, label: "Bài viết", color: "#bf7e0d" },
    { path: "/admin/user", icon: <UserOutlined />, label: "Người dùng", color: "#8b5cf6" },
    { path: "/admin/category", icon: <AppstoreOutlined />, label: "Danh mục", color: "#06b6d4" },
    { path: "/admin/pets", icon: <HeartOutlined />, label: "Thú cưng", color: "#f97316" },
    { path: "/admin/product", icon: <ShoppingOutlined />, label: "Sản phẩm", color: "#84cc16" },
    { path: "/admin/order", icon: <ShoppingCartOutlined />, label: "Đơn hàng", color: "#ef4444" },
    { path: "/admin/refund-management", icon: <RollbackOutlined />, label: "Hoàn hủy", color: "#f97316" },
    { path: "/admin/statistics", icon: <BarChartOutlined />, label: "Thống kê", color: "#3538e2" },
    { path: "/admin/vouchers", icon: <GiftOutlined />, label: "Voucher", color: "#f59e0b" },
    { path: "/admin/vaccinations", icon: <MedicineBoxOutlined />, label: "Lịch tiêm", color: "#10b981" },
    { path: "/admin/supporters", icon: <DollarOutlined />, label: "Ủng hộ", color: "#ec4899" },
    { path: "/admin/adopted-pets", icon: <HeartOutlined />, label: "Đã nhận nuôi", color: "#8b5cf6" },
  ];

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
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
      {/* SIDEBAR với gradient và glass effect */}
      {/* <div className={`${collapsed ? 'w-20' : 'w-72'} transition-all duration-300 relative`}> */}
      <div
  className={`
    ${collapsed ? 'w-20' : 'w-72'}
    fixed top-0 left-0 h-screen
    transition-all duration-300 z-50
  `}
>
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#6272B6] via-purple-600 to-indigo-700"></div>
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Sidebar content */}
        {/* <div className="relative h-full text-white p-6 overflow-hidden"> */}
        <div className="relative h-full text-white p-6 overflow-y-auto overflow-x-hidden">
          {/* Decorative elements */}
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
                  <h2 className="text-xl font-bold">T1 Pet Admin</h2>
                  <p className="text-white/70 text-xs">Quản trị hệ thống</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors backdrop-blur-sm"
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
                className={`group flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                  isActive(item.path)
                    ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                    : 'hover:bg-white/10 text-white/80 hover:text-white'
                }`}
              >
                {/* Active indicator */}
                {isActive(item.path) && (
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                )}
                
                {/* Icon with color */}
                <div 
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-white transition-all duration-300 ${
                    isActive(item.path) ? 'scale-110' : 'group-hover:scale-105'
                  }`}
                  style={{ 
                    backgroundColor: isActive(item.path) ? item.color : 'rgba(255,255,255,0.1)',
                  }}
                >
                  {item.icon}
                </div>
                
                {/* Label */}
                {!collapsed && (
                  <span className="font-medium group-hover:translate-x-1 transition-transform duration-300">
                    {item.label}
                  </span>
                )}
                
                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              </Link>
            ))}
            
            {/* Logout button */}
            <button 
              onClick={handleLogout}
              className="group flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 text-red-300 hover:text-red-200 hover:bg-red-500/20 w-full mt-6"
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-red-500/20 group-hover:bg-red-500/30 transition-colors">
                <LogoutOutlined />
              </div>
              {!collapsed && (
                <span className="font-medium group-hover:translate-x-1 transition-transform duration-300">
                  Đăng xuất
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>
      {/* CONTENT với gradient background */}
      {/* <div className="flex-1 relative overflow-hidden"> */}
<div
  className={`
    flex-1 relative
    ${collapsed ? "ml-20" : "ml-72"}
    transition-all duration-300
  `}
>
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(98, 114, 182, 0.05) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)`
        }}></div>
        {/* Content */}
        <div className="relative p-8 min-h-screen">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
