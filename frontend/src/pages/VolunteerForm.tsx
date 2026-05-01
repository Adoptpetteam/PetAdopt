import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { message } from "antd"
import { submitVolunteer } from "../api/volunteerApi"

export default function VolunteerForm() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    experience: "",
    availability: "",
    reason: "",
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm({
      ...form,
      [name]: name === "age" ? Number(value) : value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name || !form.email || !form.phone || !form.reason) {
      message.warning("Vui lòng điền đầy đủ thông tin bắt buộc")
      return
    }

    setLoading(true)
    try {
      await submitVolunteer({
        name: form.name,
        email: form.email,
        phone: form.phone,
        age: form.age ? Number(form.age) : undefined,
        experience: form.experience || undefined,
        availability: form.availability || undefined,
        reason: form.reason,
      })
      message.success("Đăng ký tình nguyện viên thành công!")
      navigate("/")
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Gửi đơn thất bại")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-[600px] mx-auto py-20 px-6">
      <h1 className="text-3xl font-bold text-[#6272B6] text-center mb-10">
        Đăng ký làm tình nguyện viên
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow p-8 space-y-6"
      >
        <input
          name="name"
          placeholder="Họ và tên *"
          value={form.name}
          onChange={handleChange}
          className="w-full h-12 bg-[#DDEDFF] rounded-full px-6 outline-none"
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Email *"
          value={form.email}
          onChange={handleChange}
          className="w-full h-12 bg-[#DDEDFF] rounded-full px-6 outline-none"
          required
        />

        <input
          name="phone"
          placeholder="Số điện thoại *"
          value={form.phone}
          onChange={handleChange}
          className="w-full h-12 bg-[#DDEDFF] rounded-full px-6 outline-none"
          required
        />

        <input
          name="age"
          type="number"
          placeholder="Tuổi"
          value={form.age}
          onChange={handleChange}
          className="w-full h-12 bg-[#DDEDFF] rounded-full px-6 outline-none"
        />

        <textarea
          name="experience"
          placeholder="Kinh nghiệm nuôi thú (nếu có)"
          value={form.experience}
          onChange={handleChange}
          className="w-full h-24 bg-[#DDEDFF] rounded-2xl px-6 py-3 outline-none"
        />

        <input
          name="availability"
          placeholder="Thời gian có thể tham gia"
          value={form.availability}
          onChange={handleChange}
          className="w-full h-12 bg-[#DDEDFF] rounded-full px-6 outline-none"
        />

        <textarea
          name="reason"
          placeholder="Lý do bạn muốn làm tình nguyện viên *"
          value={form.reason}
          onChange={handleChange}
          className="w-full h-28 bg-[#DDEDFF] rounded-2xl px-6 py-3 outline-none"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#6272B6] text-white py-3 rounded-full hover:bg-[#4e5fa8] transition disabled:opacity-60"
        >
          {loading ? "Đang gửi..." : "Gửi đăng ký"}
        </button>
      </form>
    </div>
  )
}
