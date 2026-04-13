import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { message } from "antd";
import axios from "axios";
import {
  forgotPassword,
  resendResetPasswordOtp,
  resetPassword,
} from "../api/authApi";

function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    if (data?.message && typeof data.message === "string") {
      return data.message;
    }
  }
  return "Có lỗi xảy ra, vui lòng thử lại.";
}

const inputClass =
  "w-full h-12 sm:h-14 bg-[#DDEDFF] rounded-[40px] px-6 outline-none border border-transparent focus:border-[#6272B6]/40";

type Step = "email" | "reset";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      message.warning("Nhập email.");
      return;
    }
    setLoading(true);
    try {
      const res = await forgotPassword(email.trim());
      message.success(res.message);
      setStep("reset");
      setOtp("");
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await resendResetPasswordOtp(email.trim());
      message.success(res.message);
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      message.warning("Nhập mã OTP trong email.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      message.warning("Mật khẩu mới ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      message.warning("Mật khẩu nhập lại không khớp.");
      return;
    }
    setLoading(true);
    try {
      const res = await resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      });
      message.success(res.message);
      navigate("/login");
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-6 py-16 sm:px-10">
      <div className="mx-auto w-full max-w-[520px]">
        <h1 className="mb-2 text-center text-2xl font-bold text-[#6272B6]">
          Quên mật khẩu
        </h1>
        <p className="mb-8 text-center text-sm text-gray-600">
          <Link to="/login" className="text-[#6272B6] hover:underline">
            ← Quay lại đăng nhập
          </Link>
        </p>

        {step === "email" ? (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-6">
            <p className="text-sm text-gray-600">
              Nhập email đã đăng ký. Chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu
              (hiệu lực 15 phút).
            </p>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#6272B6]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                autoComplete="email"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-[#6272B6] py-4 font-medium text-white transition hover:bg-[#4e5fa8] disabled:opacity-60"
            >
              {loading ? "Đang gửi…" : "Gửi mã OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="flex flex-col gap-6">
            <p className="text-sm text-gray-600">
              Đã gửi OTP tới <strong>{email}</strong>. Nhập mã và mật khẩu mới.
            </p>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#6272B6]">
                Mã OTP
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className={inputClass}
                placeholder="6 số trong email"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#6272B6]">
                Mật khẩu mới
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
                autoComplete="new-password"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#6272B6]">
                Nhập lại mật khẩu mới
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                autoComplete="new-password"
              />
            </div>
            <div className="flex flex-wrap justify-between gap-2 text-sm">
              <button
                type="button"
                onClick={() => setStep("email")}
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
              className="rounded-full bg-[#6272B6] py-4 font-medium text-white transition hover:bg-[#4e5fa8] disabled:opacity-60"
            >
              {loading ? "Đang xử lý…" : "Đặt lại mật khẩu"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
