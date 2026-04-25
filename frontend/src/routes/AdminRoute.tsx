import { Outlet } from "react-router-dom";

export default function AdminRoute() {
  // Temporarily bypass authentication for UI preview
  // const user = JSON.parse(localStorage.getItem("user") || "null");

  // For demo: allow access if no user or not admin
  // In production, uncomment the check below:
  // if (!user || user.role !== "admin") {
  //   return <Navigate to="/login" />;
  // }

  return <Outlet />;
}