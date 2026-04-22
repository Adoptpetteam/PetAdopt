import { useState } from "react";
import { Link } from "react-router-dom";
import {
  HomeOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  UserOutlined,
  BarChartOutlined,
  UnorderedListOutlined,
  PlusCircleFilled,
} from "@ant-design/icons";

import "./cssAdmin.css";

const SideBarAdmin = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const menuItems = [
    { name: "Dashboard", icon: <HomeOutlined />, path: "/admin" },
    { name: "Product", icon: <ShoppingOutlined />, path: "/admin/product" },

    {
      name: "Category",
      icon: <AppstoreOutlined />,
      children: [
        {
          name: " Danh sách",
          icon: <UnorderedListOutlined />,
          path: "/admin/category",
        },
        {
          name: "Thêm mới",
          icon: <PlusCircleFilled />,
          path: "/admin/add-category",
        },
      ],
    },

    { name: "Users", icon: <UserOutlined />, path: "/admin/users" },
    { name: "Reports", icon: <BarChartOutlined />, path: "/admin/reports" },
  ];

  const toggleMenu = (index: number) => {
    setOpenMenu(openMenu === index ? null : index);
  };

  return (
    <aside className={`admin-sidebar-custom ${collapsed ? "collapsed" : ""}`}>
      {/* LOGO */}
      <div className="sidebar-logo" onClick={() => setCollapsed(!collapsed)}>
        <img
          src="/assets/images/logo.png"
          alt="Logo"
          style={{ height: "35px" }}
        />
      </div>

      <ul className="sidebar-menu-list">
        {menuItems.map((item: any, index: number) => (
          <li key={index}>
            {/* MENU CÓ SUBMENU */}
            {item.children ? (
              <>
                <div className="menu-parent" onClick={() => toggleMenu(index)}>
                  <span className="menu-icon">{item.icon}</span>

                  {!collapsed && (
                    <span style={{ marginLeft: "15px" }}>{item.name}</span>
                  )}
                </div>

                {/* SUBMENU */}
                {openMenu === index && !collapsed && (
                  <ul className="submenu">
                    {item.children.map((child: any, i: number) => (
                      <li key={i}>
                        <Link to={child.path}>
                          <span className="menu-icon">{child.icon}</span>
                          <span style={{ marginLeft: "15px" }}>
                            {child.name}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              /* MENU KHÔNG CÓ SUBMENU */
              <Link to={item.path} className="menu-parent">
                <span className="menu-icon">{item.icon}</span>

                {!collapsed && (
                  <span style={{ marginLeft: "15px" }}>{item.name}</span>
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
