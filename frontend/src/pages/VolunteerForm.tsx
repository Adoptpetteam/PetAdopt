import { useNavigate } from "react-router-dom"
import { useState } from "react"

interface VolunteerFormData {
  name: string
  email: string
  phone: string
  age: string
  experience: string
  availability: string
  reason: string
}

export default function VolunteerForm() {
  const navigate = useNavigate()

  const [form, setForm] = useState<VolunteerFormData>({
    name: "",
    email: "",
    phone: "",
    age: "",
    experience: "",
    availability: "",
    reason: "",
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target

    setForm({
      ...form,
      [name]: name === "age" ? Number(value) : value,
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()

  const newVolunteer = {
    ...form,
    status: "pending_review",
    createdAt: new Date().toISOString(),
  }

  try {
    await fetch("http://localhost:3000/volunteers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newVolunteer),
    })

    alert("Đăng ký thành công!")
    navigate("/")
  } catch (error) {
    console.error(error)
    alert("Có lỗi xảy ra!")
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
          placeholder="Họ và tên"
          value={form.name}
          onChange={handleChange}
          className="w-full h-12 bg-[#DDEDFF] rounded-full px-6 outline-none"
          required
        />

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full h-12 bg-[#DDEDFF] rounded-full px-6 outline-none"
          required
        />

        <input
          name="phone"
          placeholder="Số điện thoại"
          value={form.phone}
          onChange={handleChange}
          className="w-full h-12 bg-[#DDEDFF] rounded-full px-6 outline-none"
          required
        />

        <input
          name="age"
          placeholder="Tuổi"
          value={form.age}
          onChange={handleChange}
          className="w-full h-12 bg-[#DDEDFF] rounded-full px-6 outline-none"
          required
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
          placeholder="Lý do bạn muốn làm tình nguyện viên"
          value={form.reason}
          onChange={handleChange}
          className="w-full h-28 bg-[#DDEDFF] rounded-2xl px-6 py-3 outline-none"
          required
        />

        <button
          type="submit"
          className="w-full bg-[#6272B6] text-white py-3 rounded-full hover:bg-[#4e5fa8] transition"
        >
          Gửi đăng ký
        </button>
      </form>
    </div>
  )
}