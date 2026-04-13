import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../utils/auth";

export default function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    // fake API delay
    setTimeout(() => {
      const user = login(form.email, form.password);

      if (!user) {
        setError("Sai email hoặc mật khẩu");
        return;
      }

      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/adopt");
      }
    }, 500);
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

        <button className="bg-blue-500 text-white p-3 rounded">
          Đăng nhập
        </button>
      </form>
    </div>
  );
}