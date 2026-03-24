import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { message } from "antd";
import axios from "axios";
import {
  registerUser,
  resendRegistrationOtp,
  setup2FA,
  verifyRegistrationOtp,
  verify2FA,
} from "../api/authApi";

type Step = "form" | "otp" | "2fa";

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
  "w-full h-14 sm:h-[72px] bg-[#DDEDFF] rounded-[40px] px-6 outline-none border border-transparent focus:border-[#6272B6]/40 transition-colors";

/** Cột phải: logo chân chó + chữ T1 + tiêu đề (giống mockup) */
function RegisterBrandingPanel({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <aside className="order-1 flex min-h-0 min-w-0 flex-col items-center justify-center border-b border-gray-100 bg-[#F8FAFC] px-6 py-10 lg:order-2 lg:border-b-0 lg:bg-white lg:py-16">
      <div className="relative w-full max-w-[300px] [&_svg]:block">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 379 371"
          fill="none"
          className="mx-auto h-auto w-full max-w-[280px]"
          aria-hidden
        >
          <g clipPath="url(#clipPawRegister)">
            <path
              d="M321.812 284.032C317.141 272.704 308.952 264.611 300.543 258.45C292.134 252.288 282.931 247.814 274.857 240.838C244.271 214.424 235.895 165.516 189.496 165.516C143.098 165.516 134.688 214.416 104.135 240.838C96.0529 247.814 86.9564 252.297 78.4898 258.45C70.0232 264.603 61.8511 272.704 57.2211 284.032C51.8876 296.966 51.9367 312.818 55.945 325.801C59.6701 337.765 66.7689 348.411 76.3957 356.469C95.7011 372.769 121.322 375.564 143.662 363.869C158.975 355.857 173.585 341.261 189.553 341.758C205.513 341.261 220.131 355.857 235.445 363.869C257.785 375.564 283.397 372.744 302.711 356.469C312.341 348.413 319.44 337.767 323.162 325.801C327.096 312.818 327.137 296.966 321.812 284.032ZM197.423 263.658H180.784V307.251H165.438V263.641H148.783V251.156H197.423V263.658ZM230.201 307.251H214.986V264.399H214.642L202.298 272.549V259.583L215.141 251.156H230.168L230.201 307.251Z"
              fill="#6272B6"
            />
            <path
              d="M134.525 141.857C159.646 139.526 175.892 115.778 175.426 88.6221C174.845 54.5392 159.515 0.431935 130.811 -9.68412e-06C105.567 -0.374905 80.0931 50.3664 83.2998 84.6205C86.3265 117.041 109.403 144.188 134.525 141.857Z"
              fill="#6272B6"
            />
            <path
              d="M83.5534 158.923C77.8272 129.16 55.9859 84.1396 30.8152 88.1575C8.64671 91.6864 -5.81601 140.015 2.2661 169.518C9.92283 197.448 34.3573 217.676 55.9532 211.792C77.5491 205.907 88.1589 182.631 83.5534 158.923Z"
              fill="#6272B6"
            />
            <path
              d="M244.475 141.857C269.589 144.188 292.665 117.041 295.7 84.6205C298.899 50.3664 273.434 -0.374905 248.181 -9.68412e-06C219.55 0.431935 204.155 54.5392 203.566 88.6221C203.1 115.794 219.354 139.526 244.475 141.857Z"
              fill="#6272B6"
            />
            <path
              d="M348.185 88.1493C323.014 84.1314 301.214 129.152 295.439 158.915C290.841 182.631 301.402 205.899 323.039 211.792C344.676 217.684 369.069 197.448 376.726 169.518C384.816 140.015 370.345 91.6864 348.185 88.1493Z"
              fill="#6272B6"
            />
          </g>
          {/* Một lần chữ T1 trong SVG — tránh chồng lên path khoét tạo cảm giác "T1 T1" */}
          <text
            x="189.5"
            y="212"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            className="pointer-events-none select-none"
            style={{
              fontSize: 78,
              fontWeight: 900,
              fontFamily: "system-ui, Segoe UI, sans-serif",
              paintOrder: "stroke fill",
              stroke: "rgba(98, 114, 182, 0.25)",
              strokeWidth: 2,
            }}
          >
            T1
          </text>
          <defs>
            <clipPath id="clipPawRegister">
              <rect width="379" height="371" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </div>
      <h2 className="mt-6 max-w-md text-center text-2xl font-bold tracking-wide text-[#6272B6] sm:text-3xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-3 max-w-sm text-center text-sm text-gray-600 sm:text-base">
          {subtitle}
        </p>
      ) : null}
    </aside>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [qrCode, setQrCode] = useState<string>("");
  const [twoFAToken, setTwoFAToken] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      message.warning("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (password !== confirmPassword) {
      message.warning("Mật khẩu nhập lại không khớp.");
      return;
    }
    setLoading(true);
    try {
      const res = await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      message.success(res.message);
      setStep("otp");
      setOtp("");
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      message.warning("Nhập mã OTP trong email.");
      return;
    }
    setLoading(true);
    try {
      const res = await verifyRegistrationOtp({
        email: email.trim(),
        otp: otp.trim(),
      });
      message.success(res.message);
      const setup = await setup2FA(email.trim());
      message.success(setup.message);
      setQrCode(setup.qrCode);
      setTwoFAToken("");
      setStep("2fa");
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFAToken.trim()) {
      message.warning("Vui lòng nhập mã 2FA trong ứng dụng Authenticator.");
      return;
    }
    setLoading(true);
    try {
      const res = await verify2FA({
        email: email.trim(),
        token: twoFAToken.trim(),
      });
      message.success(res.message);
      navigate("/login");
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const res = await resendRegistrationOtp(email.trim());
      message.success(res.message);
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const brandingTitle =
    step === "form"
      ? "ĐĂNG KÝ TÀI KHOẢN"
      : step === "otp"
        ? "XÁC THỰC EMAIL"
        : "THIẾT LẬP 2FA";
  const brandingSubtitle =
    step === "otp"
      ? `Mã OTP đã gửi tới ${email}`
      : step === "2fa"
        ? `Quét QR và nhập mã 2FA cho ${email}`
      : undefined;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto grid min-h-screen max-w-[1400px] grid-cols-1 lg:grid-cols-2">
        {/* Cột trái (desktop): form — grid chia đều 50/50, form căn giữa nửa trái */}
        <section className="order-2 flex min-h-0 min-w-0 flex-col justify-center px-6 py-10 sm:px-10 lg:order-1 lg:px-14 lg:py-16 xl:px-20">
          <div className="mx-auto w-full max-w-[520px]">
            {step === "form" ? (
              <form onSubmit={handleRegister} className="flex flex-col gap-8">
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-medium text-[#6272B6] sm:mb-3">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-medium text-[#6272B6] sm:mb-3">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-medium text-[#6272B6] sm:mb-3">
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-medium text-[#6272B6] sm:mb-3">
                    Nhập lại mật khẩu
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    className={inputClass}
                  />
                </div>
                <div className="text-right text-sm sm:text-base">
                  <span className="text-gray-600">
                    Bạn đã có tài khoản?{" "}
                    <Link
                      to="/login"
                      className="font-medium text-[#6272B6] hover:underline"
                    >
                      Đăng nhập
                    </Link>
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-[#6272B6] py-4 text-base font-medium text-white transition hover:bg-[#4e5fa8] disabled:opacity-60"
                >
                  {loading ? "Đang gửi…" : "Đăng ký"}
                </button>
              </form>
            ) : step === "otp" ? (
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-8">
                <p className="text-sm text-gray-600">
                  Đã gửi mã OTP tới <strong>{email}</strong>. Nhập đúng mã (có
                  thể dán cả dãy, hệ thống bỏ khoảng trắng).
                </p>
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-medium text-[#6272B6] sm:mb-3">
                    Mã OTP
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Nhập mã trong email"
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <button
                    type="button"
                    onClick={() => setStep("form")}
                    className="font-medium text-[#6272B6] hover:underline"
                  >
                    ← Quay lại sửa thông tin
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="font-medium text-[#6272B6] hover:underline disabled:opacity-60"
                  >
                    Gửi lại OTP
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-[#6272B6] py-4 text-base font-medium text-white transition hover:bg-[#4e5fa8] disabled:opacity-60"
                >
                  {loading ? "Đang xác thực…" : "Xác thực OTP"}
                </button>
                <p className="text-center text-sm text-gray-600">
                  Sau khi xác thực, cần thiết lập 2FA rồi mới đăng nhập.{" "}
                  <Link
                    to="/login"
                    className="font-medium text-[#6272B6] hover:underline"
                  >
                    Tới đăng nhập
                  </Link>
                </p>
              </form>
            ) : (
              <form onSubmit={handleVerify2FA} className="flex flex-col gap-8">
                <p className="text-sm text-gray-600">
                  Quét QR bằng Google Authenticator (hoặc app tương tự), sau đó
                  nhập mã 6 số để kích hoạt 2FA.
                </p>
                {qrCode ? (
                  <div className="flex justify-center">
                    <img
                      src={qrCode}
                      alt="QR code 2FA"
                      className="h-[220px] w-[220px] rounded-xl bg-white p-2 shadow"
                    />
                  </div>
                ) : null}
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-medium text-[#6272B6] sm:mb-3">
                    Mã 2FA
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={twoFAToken}
                    onChange={(e) => setTwoFAToken(e.target.value)}
                    placeholder="Nhập mã 6 số"
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <button
                    type="button"
                    onClick={() => setStep("otp")}
                    className="font-medium text-[#6272B6] hover:underline"
                  >
                    ← Quay lại OTP
                  </button>
                  <Link
                    to="/login"
                    className="font-medium text-[#6272B6] hover:underline"
                  >
                    Tới đăng nhập
                  </Link>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-[#6272B6] py-4 text-base font-medium text-white transition hover:bg-[#4e5fa8] disabled:opacity-60"
                >
                  {loading ? "Đang kích hoạt…" : "Kích hoạt 2FA"}
                </button>
              </form>
            )}
          </div>
        </section>

        <RegisterBrandingPanel
          title={brandingTitle}
          subtitle={brandingSubtitle}
        />
      </div>
    </div>
  );
}
