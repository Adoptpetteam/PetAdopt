import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

function decodeBase64Url(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (padded.length % 4)) % 4;
  return atob(padded + "=".repeat(padLength));
}

function getRoleFromToken(): string | null {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = JSON.parse(decodeBase64Url(parts[1])) as { role?: string };
    return payload?.role ? String(payload.role).toLowerCase() : null;
  } catch {
    return null;
  }
}

export default function AdminRoute() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  let role: string | null = null;
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null") as { role?: string } | null;
    role = user?.role ? String(user.role).toLowerCase() : null;
  } catch {
    role = null;
  }

  if (!role) {
    role = getRoleFromToken();
  }

  if (role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}