import { Outlet } from "react-router-dom";
import HeaderAdmin from "./HeaderAdmin";
import SideBarAdmin from "./SideBarAdmin";
import "./cssAdmin.css"; 

const PageAdmin = () => {
  return (
    <div className="admin-layout-container">
      {/* 1. SIDEBAR CHIẾM CỘT TRÁI */}
      <SideBarAdmin />

      {/* 2. WRAPPER CHIẾM CỘT PHẢI */}
      <div className="admin-right-wrapper">
        <HeaderAdmin />
        
        <main className="admin-content-main">
             <Outlet />
             
        </main>
      </div>
    </div>
  );
};

export default PageAdmin;