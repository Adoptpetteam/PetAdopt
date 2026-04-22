import { useState } from "react"
import { message } from "antd"
import { submitContact } from "../api/contactApi"

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!form.name || !form.email || !form.message) {
      message.warning("Vui lòng điền đầy đủ thông tin")
      return
    }

    setLoading(true)
    try {
      await submitContact(form)
      message.success("Gửi liên hệ thành công!")
      setForm({ name: "", email: "", message: "" })
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Gửi liên hệ thất bại")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-[600px] mx-auto py-20 px-6">
      <h1 className="text-3xl font-bold text-[#6272B6] text-center mb-6">
        Liên hệ với chúng tôi
      </h1>

      <p className="text-center text-gray-500 mb-10">
        Nếu bạn có câu hỏi hoặc cần hỗ trợ, hãy gửi thông tin cho chúng tôi
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-2xl p-8 space-y-6"
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
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full h-12 bg-[#DDEDFF] rounded-full px-6 outline-none"
          required
        />

        <textarea
          name="message"
          placeholder="Nội dung liên hệ"
          value={form.message}
          onChange={handleChange}
          className="w-full h-32 bg-[#DDEDFF] rounded-2xl px-6 py-3 outline-none"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#6272B6] text-white py-3 rounded-full hover:bg-[#4e5fa8] transition disabled:opacity-60"
        >
          {loading ? "Đang gửi..." : "Gửi liên hệ"}
        </button>
      </form>
    </div>
  )
}