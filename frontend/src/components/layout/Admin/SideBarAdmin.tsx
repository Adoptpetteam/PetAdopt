import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  UserOutlined,
  HeartOutlined,
  FileTextOutlined,
  CalendarOutlined,
  UnorderedListOutlined,
  PlusCircleOutlined,
  MenuOutlined,
  UndoOutlined,
} from "@ant-design/icons";

const SideBarAdmin = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const location = useLocation();

  const menuItems = [
    { 
      name: "Dashboard", 
      icon: <HomeOutlined />, 
      path: "/admin" 
    },
    { 
      name: "Nhận nuôi", 
      icon: <HeartOutlined />, 
      path: "/admin/adoptions" 
    },
    { 
      name: "Tình nguyện", 
      icon: <UserOutlined />, 
      path: "/admin/volunteers" 
    },
    { 
      name: "Bài viết", 
      icon: <FileTextOutlined />, 
      path: "/admin/post" 
    },
    { 
      name: "Người dùng", 
      icon: <UserOutlined />, 
      path: "/admin/user" 
    },
    {
      name: "Danh mục",
      icon: <AppstoreOutlined />,
      children: [
        {
          name: "Danh sách",
          icon: <UnorderedListOutlined />,
          path: "/admin/category",
        },
        {
          name: "Thêm mới",
          icon: <PlusCircleOutlined />,
          path: "/admin/add-category",
        },
      ],
    },
    { 
      name: "Sản phẩm", 
      icon: <ShoppingOutlined />, 
      path: "/admin/product" 
    },
    { 
      name: "Đơn hàng", 
      icon: <ShoppingOutlined />, 
      path: "/admin/order" 
    },
    { 
      name: "Lịch tiêm", 
      icon: <CalendarOutlined />, 
      path: "/admin/vaccination-care" 
    },
    { 
      name: "Quay lại web", 
      icon: <UndoOutlined />, 
      path: "/" 
    },
  ];

  const toggleMenu = (index: number) => {
    setOpenMenu(openMenu === index ? null : index);
  };

  const isActive = (path: string) => location.pathname === path;
  const isActiveChild = (children?: { path: string }[]) => 
    children?.some(child => location.pathname === child.path);

  return (
    <aside style={{
      width: collapsed ? '70px' : '260px',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #6272B6 0%, #4f5fa3 100%)',
      transition: 'width 0.3s ease',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* LOGO */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
      }}>
        {!collapsed && (
          <span style={{ color: '#fff', fontSize: '22px', fontWeight: 700 }}>
            T1 Pet Adopt
          </span>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px',
            cursor: 'pointer',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MenuOutlined />
        </button>
      </div>

      {/* MENU */}
      <ul style={{ listStyle: 'none', padding: '16px 12px', margin: 0 }}>
        {menuItems.map((item: any, index: number) => (
          <li key={index} style={{ marginBottom: '4px' }}>
            {item.children ? (
              <>
                <div 
                  onClick={() => toggleMenu(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: collapsed ? '12px' : '12px 16px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    color: isActiveChild(item.children) ? '#fff' : 'rgba(255,255,255,0.85)',
                    background: isActiveChild(item.children) ? 'rgba(255,255,255,0.15)' : 'transparent',
                    transition: 'all 0.2s ease',
                    gap: '12px',
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{item.icon}</span>
                  {!collapsed && (
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>{item.name}</span>
                  )}
                </div>

                {/* SUBMENU */}
                {!collapsed && openMenu === index && (
                  <ul style={{ 
                    listStyle: 'none', 
                    padding: '8px 0 8px 44px', 
                    margin: 0 
                  }}>
                    {item.children.map((child: any, i: number) => (
                      <li key={i} style={{ marginBottom: '4px' }}>
                        <Link 
                          to={child.path}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            color: isActive(child.path) ? '#fff' : 'rgba(255,255,255,0.7)',
                            background: isActive(child.path) ? 'rgba(255,255,255,0.15)' : 'transparent',
                            textDecoration: 'none',
                            fontSize: '13px',
                            gap: '10px',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <span>{child.icon}</span>
                          <span>{child.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <Link 
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: collapsed ? '12px' : '12px 16px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: '10px',
                  color: isActive(item.path) ? '#fff' : 'rgba(255,255,255,0.85)',
                  background: isActive(item.path) ? 'rgba(255,255,255,0.15)' : 'transparent',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  gap: '12px',
                }}
              >
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                {!collapsed && (
                  <span>{item.name}</span>
                )}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default SideBarAdmin;