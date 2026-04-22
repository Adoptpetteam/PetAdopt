import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { isAuthenticated } from "../utils/auth";
import { login as loginApi } from "../api/authApi";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || "/";

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const normalizeRole = (role?: string) => String(role || "").toLowerCase();

  useEffect(() => {
    if (!isAuthenticated()) return;
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        const user = JSON.parse(raw) as { role?: string };
        navigate(normalizeRole(user.role) === "admin" ? "/admin" : from, { replace: true });
        return;
      } catch {
        /* fall through */
      }
    }
    navigate(from, { replace: true });
  }, [navigate, from]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setLoading(true);
    try {
      const res = await loginApi({
        email: form.email.trim(),
        password: form.password,
      });
      if (res.success && res.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: res.user.id,
            email: res.user.email,
            name: res.user.name,
            role: res.user.role,
          })
        );
        window.dispatchEvent(new Event("auth-change"));
        if (normalizeRole(res.user.role) === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate(from !== "/login" ? from : "/", { replace: true });
        }
        return;
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const msg = (err.response?.data as { message?: string })?.message;
        if (status === 403 && msg) {
          setError(msg);
          setLoading(false);
          return;
        }
      }
    } finally {
      setLoading(false);
    }

    setError(
      "Sai email hoặc mật khẩu (hoặc backend chưa sẵn sàng). Demo: admindemo@demo.com / Admin123! hoặc petdemo@demo.com / Demo123!."
    );
  };

  return (
    <div className="bg-white py-20">
      <div className="flex flex-col items-center mb-16">
        <h2 className="text-3xl font-bold text-[#6272B6] pt-20">
          ĐĂNG NHẬP
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="w-[500px] mx-auto flex flex-col gap-6">
        {error && <div className="text-red-500 text-center">{error}</div>}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="p-4 border rounded"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="p-4 border rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white p-3 rounded disabled:opacity-60"
        >
          {loading ? "Đang đăng nhập…" : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
}
