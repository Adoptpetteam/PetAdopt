import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { isAuthenticated } from "../utils/auth"

export default function RegisterPage() {
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/", { replace: true })
    }
  }, [navigate])

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // ✅ validate
    if (!form.fullName || !form.email || !form.password || !form.confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin")
      return
    }

    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu không trùng khớp")
      return
    }

    // 👉 lấy users từ localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]")

    // ✅ check trùng email
    const exist = users.find((u: any) => u.email === form.email)
    if (exist) {
      setError("Email đã tồn tại")
      return
    }

    // 👉 tạo user mới
    const newUser = {
      id: Date.now(),
      fullName: form.fullName,
      email: form.email,
      password: form.password,
      role: "user", // 🔥 luôn là user
    }

    // 👉 lưu vào fake DB
    users.push(newUser)
    localStorage.setItem("users", JSON.stringify(users))

    // 👉 (OPTION 1) auto login luôn
    localStorage.setItem("user", JSON.stringify(newUser))

    alert("Đăng ký thành công!")

    // 👉 chuyển sang trang user
    navigate("/adopt")

    // 👉 reset form
    setForm({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    })
  }

  return (
    <div className="bg-white py-20">
      <div className="flex flex-col items-center mb-16">
        <h2 className="text-3xl font-bold text-[#6272B6] pt-20">
          ĐĂNG KÝ TÀI KHOẢN
        </h2>
      </div>

      <form
        onSubmit={handleSubmit}
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
          placeholder="Mật khẩu"
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

        <button className="bg-[#6272B6] text-white py-4 rounded-full">
          Đăng ký
        </button>
      </form>
    </div>
  )
}