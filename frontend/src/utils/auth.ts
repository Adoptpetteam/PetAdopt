/** Trùng backend/scripts/seed-demo.js — dùng khi API không chạy hoặc chưa seed DB. */
const DEMO_ACCOUNTS: Array<{
  id: string;
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
}> = [
  {
    id: "demo-user",
    name: "Khách Demo",
    email: "petdemo@demo.com",
    password: "Demo123!",
    role: "user",
  },
  {
    id: "demo-admin",
    name: "Admin Demo",
    email: "admindemo@demo.com",
    password: "Admin123!",
    role: "admin",
  },
];

export const getUsers = () => {
  const users = localStorage.getItem("users");
  return users ? JSON.parse(users) : [];
};

export const saveUsers = (users: any[]) => {
  localStorage.setItem("users", JSON.stringify(users));
};

export const login = (email: string, password: string) => {
  const normalized = email.trim().toLowerCase();
  const users = getUsers();
  const fromStorage = users.find(
    (u: any) =>
      String(u.email).toLowerCase() === normalized && u.password === password
  );
  if (fromStorage) return fromStorage;
  return (
    DEMO_ACCOUNTS.find(
      (u) => u.email === normalized && u.password === password
    ) ?? null
  );
};

export const register = (user: any) => {
  const users = getUsers();

  const exist = users.find((u: any) => u.email === user.email);
  if (exist) return { error: "Email đã tồn tại" };

  users.push(user);
  saveUsers(users);

  return { success: true };
};

/** Đã đăng nhập: có JWT từ API hoặc object user (demo local). */
export function isAuthenticated(): boolean {
  if (localStorage.getItem("token")) return true;
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return false;
    const u = JSON.parse(raw) as { email?: string; id?: unknown };
    return Boolean(u && (u.email || u.id != null));
  } catch {
    return false;
  }
}

export const logout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
};