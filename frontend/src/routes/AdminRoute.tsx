import { Navigate, Outlet } from "react-router-dom";

export default function AdminRoute() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user || user.role !== "admin") {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
}