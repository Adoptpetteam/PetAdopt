import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { message } from "antd";
import axios from "axios";
import {
  changePassword,
  getProfile,
  updateProfile,
  type ProfileUser,
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

export default function AccountPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login", { replace: true });
      return;
    }

    const load = async () => {
      try {
        const res = await getProfile();
        setProfile(res.user);
        setName(res.user.name);
      } catch (err) {
        message.error(getErrorMessage(err));
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      message.warning("Nhập họ tên.");
      return;
    }
    setSavingProfile(true);
    try {
      const res = await updateProfile({ name: name.trim() });
      message.success(res.message);
      setProfile((p) => (p ? { ...p, name: res.user.name } : null));
      const prev = localStorage.getItem("user");
      if (prev) {
        try {
          const u = JSON.parse(prev) as { name: string; email: string };
          u.name = res.user.name;
          localStorage.setItem("user", JSON.stringify(u));
          window.dispatchEvent(new Event("auth-change"));
        } catch {
          /* ignore */
        }
      }
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      message.warning("Nhập đủ mật khẩu cũ và mật khẩu mới.");
      return;
    }
    if (newPassword.length < 6) {
      message.warning("Mật khẩu mới ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      message.warning("Mật khẩu mới nhập lại không khớp.");
      return;
    }
    setSavingPwd(true);
    try {
      const res = await changePassword({
        oldPassword,
        newPassword,
      });
      message.success(res.message);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setSavingPwd(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white px-6 py-20 text-center text-gray-600">
        Đang tải…
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white px-6 py-12 sm:px-10 lg:px-[130px]">
      <div className="mx-auto max-w-[640px]">
        <h1 className="mb-2 text-2xl font-bold text-[#6272B6]">
          Tài khoản của tôi
        </h1>
        <p className="mb-8 text-sm text-gray-600">
          <Link to="/" className="text-[#6272B6] hover:underline">
            ← Về trang chủ
          </Link>
        </p>

        <section className="mb-10 rounded-2xl border border-gray-100 bg-[#F8FAFC] p-6">
          <h2 className="mb-4 text-lg font-semibold text-[#6272B6]">
            Thông tin
          </h2>
          <p className="mb-1 text-sm text-gray-600">
            Email: <strong>{profile.email}</strong>
          </p>
          <p className="mb-1 text-sm text-gray-600">
            Vai trò: <strong>{profile.role}</strong>
          </p>
          <p className="mb-6 text-sm text-gray-600">
            Ngày tạo:{" "}
            <strong>
              {new Date(profile.createdAt).toLocaleString("vi-VN")}
            </strong>
          </p>

          <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
            <label className="text-sm font-medium text-[#6272B6]">Họ tên</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              autoComplete="name"
            />
            <button
              type="submit"
              disabled={savingProfile}
              className="rounded-full bg-[#6272B6] py-3 font-medium text-white transition hover:bg-[#4e5fa8] disabled:opacity-60"
            >
              {savingProfile ? "Đang lưu…" : "Lưu thông tin"}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-[#F8FAFC] p-6">
          <h2 className="mb-4 text-lg font-semibold text-[#6272B6]">
            Đổi mật khẩu
          </h2>
          <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
            <label className="text-sm font-medium text-[#6272B6]">
              Mật khẩu hiện tại
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className={inputClass}
              autoComplete="current-password"
            />
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
            <button
              type="submit"
              disabled={savingPwd}
              className="rounded-full bg-[#6272B6] py-3 font-medium text-white transition hover:bg-[#4e5fa8] disabled:opacity-60"
            >
              {savingPwd ? "Đang đổi…" : "Đổi mật khẩu"}
            </button>
          </form>
          <p className="mt-4 text-xs text-gray-500">
            Quên mật khẩu?{" "}
            <Link
              to="/forgot-password"
              className="font-medium text-[#6272B6] hover:underline"
            >
              Đặt lại bằng OTP email
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
