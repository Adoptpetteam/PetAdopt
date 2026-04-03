import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import axios from "axios";
import {
  registerUser,
  verifyRegistrationOtp,
  resendRegistrationOtp,
  type RegisterBody,
} from "../api/authApi";

function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message || "Có lỗi xảy ra";
  }
  return "Có lỗi xảy ra";
}

type Step = "register" | "verify";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("register");

  const [form, setForm] = useState<RegisterBody & { confirmPassword: string }>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.fullName || !form.email || !form.password || !form.confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu không trùng khớp");
      return;
    }

    if (form.password.length < 6) {
      setError("Mật khẩu phải ít nhất 6 ký tự");
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        name: form.fullName,
        email: form.email,
        password: form.password,
      });
      setRegisteredEmail(form.email);
      setStep("verify");
      message.success("Đăng ký thành công! Vui lòng nhập mã OTP.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otp.trim()) {
      setError("Vui lòng nhập mã OTP");
      return;
    }

    setLoading(true);
    try {
      await verifyRegistrationOtp({ email: registeredEmail, otp: otp.trim() });
      message.success("Xác thực thành công! Đang chuyển sang đăng nhập...");
      // Chuyển thông tin đã đăng ký sang trang login để tự điền
      navigate(`/login?email=${encodeURIComponent(form.email)}&password=${encodeURIComponent(form.password)}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await resendRegistrationOtp(registeredEmail);
      message.success("Đã gửi lại mã OTP!");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white py-20">
      <div className="flex flex-col items-center mb-16">
        <h2 className="text-3xl font-bold text-[#6272B6] pt-20">
          {step === "register" ? "ĐĂNG KÝ TÀI KHOẢN" : "XÁC THỰC EMAIL"}
        </h2>
      </div>

      {step === "register" ? (
        <form
          onSubmit={handleRegister}
          className="w-[980px] mx-auto flex flex-col gap-10"
        >
          {error && (
            <div className="text-red-500 text-center font-medium">{error}</div>
          )}

          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Họ và tên"
            className="h-[60px] px-4 border rounded"
          />

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="h-[60px] px-4 border rounded"
          />

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Mật khẩu (ít nhất 6 ký tự)"
            className="h-[60px] px-4 border rounded"
          />

          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Nhập lại mật khẩu"
            className="h-[60px] px-4 border rounded"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-[#6272B6] text-white py-4 rounded-full disabled:opacity-60"
          >
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>
      ) : (
        <form
          onSubmit={handleVerify}
          className="w-[500px] mx-auto flex flex-col gap-6"
        >
          <p className="text-gray-600 text-center">
            Mã OTP đã được gửi đến <strong>{registeredEmail}</strong>
          </p>

          {error && (
            <div className="text-red-500 text-center font-medium">{error}</div>
          )}

          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Nhập mã OTP"
            className="h-[60px] px-4 border rounded text-center text-xl tracking-widest"
            maxLength={6}
          />

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep("register")}
              className="text-[#6272B6] hover:underline"
            >
              ← Đổi email khác
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="text-[#6272B6] hover:underline disabled:opacity-60"
            >
              Gửi lại OTP
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#6272B6] text-white py-4 rounded-full disabled:opacity-60"
          >
            {loading ? "Đang xác thực..." : "Xác thực"}
          </button>
        </form>
      )}
    </div>
  );
}