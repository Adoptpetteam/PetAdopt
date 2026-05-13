import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { Spin } from "antd";
import { apiClient } from "../api/http";

type Status = "checking" | "ok" | "denied";

export default function AdminRoute() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const user = (() => {
      try { return JSON.parse(localStorage.getItem("admin_user") || "null"); }
      catch { return null; }
    })();

    // Kiểm tra nhanh localStorage trước
    if (!token || !user || user.role !== "admin") {
      setStatus("denied");
      return;
    }

    // Verify token với backend
    apiClient
      .get("/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data?.user || res.data;
        if (data?.role === "admin") {
          setStatus("ok");
        } else {
          // Token hợp lệ nhưng không phải admin
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_user");
          setStatus("denied");
        }
      })
      .catch(() => {
        // Token hết hạn hoặc không hợp lệ
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        setStatus("denied");
      });
  }, []);

  if (status === "checking") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" tip="Đang xác thực..." />
      </div>
    );
  }

  if (status === "denied") {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
