import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import axios from "axios";
import { login, type LoginResponse } from "../../api/authApi";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginSuccess = (res: LoginResponse) => {
    if (res.user.role !== "admin") {
      setError("Tài khoản không có quyền Admin");
      return;
    }

    localStorage.setItem("admin_token", res.token);
    localStorage.setItem(
      "admin_user",
      JSON.stringify({
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: res.user.role,
      })
    );
    message.success(res.message || "Đăng nhập Admin thành công!");
    navigate("/admin");
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
      const res = await login(form);
      handleLoginSuccess(res);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string } | undefined;
        setError(data?.message || "Đăng nhập thất bại");
      } else {
        setError("Có lỗi xảy ra");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="bg-white p-10 rounded-lg shadow-lg w-[450px]">
        <div className="flex flex-col items-center mb-8">
          <h2 className="text-2xl font-bold text-[#6272B6]">ADMIN LOGIN</h2>
          <p className="text-gray-500 text-sm mt-2">Dành riêng cho Quản trị viên</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && <div className="text-red-500 text-center text-sm bg-red-50 p-2 rounded">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              placeholder="admin@gmail.com"
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#6272B6]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <input
              type="password"
              name="password"
              placeholder="********"
              value={form.password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#6272B6]"
            />
          </div>

          <button 
            disabled={loading} 
            className="w-full bg-[#6272B6] hover:bg-[#4d5a94] text-white p-3 rounded font-medium disabled:opacity-60 transition-colors mt-4"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
