import { Navigate, Outlet } from "react-router-dom";

export default function AdminRoute() {
  const user = JSON.parse(localStorage.getItem("admin_user") || "null");

  if (!user || user.role !== "admin") {
    return <Navigate to="/admin/login" />;
  }

  return <Outlet />;
}