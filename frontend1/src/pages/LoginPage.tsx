import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { message } from "antd";
import axios from "axios";
import { login, loginWithGoogle, type LoginResponse } from "../api/authApi";

const googleClientId =
  (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim() ?? "";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Tự điền email và password từ trang đăng ký (nếu có)
  useEffect(() => {
    const email = searchParams.get("email");
    const password = searchParams.get("password");
    if (email) setForm((prev) => ({ ...prev, email }));
    if (password) setForm((prev) => ({ ...prev, password }));
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginSuccess = (res: LoginResponse) => {
    localStorage.setItem("token", res.token);
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: res.user.role,
      })
    );
    window.dispatchEvent(new Event("auth-change"));
    message.success(res.message || "Đăng nhập thành công!");
    navigate("/");
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

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-[#6272B6]">
          <Link to="/forgot-password" className="hover:underline font-medium">
            Quên mật khẩu?
          </Link>
          <span className="text-gray-500">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="font-medium text-[#6272B6] hover:underline">
              Đăng ký
            </Link>
          </span>
        </div>

        <button disabled={loading} className="bg-blue-500 text-white p-3 rounded disabled:opacity-60">
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>

      {/* Google Login */}
      {googleClientId && (
        <div className="w-[500px] mx-auto mt-8 flex flex-col items-center gap-4 border-t border-gray-200 pt-8">
          <p className="text-sm text-gray-400">hoặc</p>
          <GoogleLogin
            text="continue_with"
            shape="rectangular"
            size="large"
            width={320}
            onSuccess={async (cred) => {
              if (!cred.credential) return;
              setLoading(true);
              try {
                const res = await loginWithGoogle({ credential: cred.credential });
                handleLoginSuccess(res);
              } catch (err) {
                message.error("Đăng nhập Google thất bại.");
              } finally {
                setLoading(false);
              }
            }}
            onError={() => message.error("Đăng nhập Google thất bại.")}
          />
        </div>
      )}

      {!googleClientId && (
        <div className="w-[500px] mx-auto mt-8 text-center">
          <p className="text-xs text-gray-400">
            Thêm{" "}
            <code className="bg-gray-100 px-1 rounded">VITE_GOOGLE_CLIENT_ID</code>{" "}
            vào file{" "}
            <code className="bg-gray-100 px-1 rounded">.env</code> để bật đăng nhập Google.
          </p>
        </div>
      )}
    </div>
  );
}