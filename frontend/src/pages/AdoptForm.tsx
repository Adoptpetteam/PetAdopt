import { useParams, useNavigate } from "react-router-dom"
import { useState } from "react"
import { usePetDetail } from "../hook/huyHook"

export default function AdoptForm() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: pet, isLoading } = usePetDetail({
    resource: "pets",
    id
  })

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    reason: ""
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleNext = () => {
    // lưu tạm form + pet
    localStorage.setItem("adoptForm", JSON.stringify(form))
    navigate(`/adopt-form/${id}/step-2`)
  }

  if (isLoading) {
    return <div className="text-center py-20">Đang tải...</div>
  }

  if (!pet) {
    return <div className="text-center py-20">Pet không tồn tại</div>
  }

  return (
    <div className="max-w-[1100px] mx-auto py-20 px-6">

      <h1 className="text-3xl font-bold text-[#6272B6] text-center mb-10">
        Đăng ký nhận nuôi
      </h1>

      <div className="grid grid-cols-2 gap-10">

        {/* ===== LEFT: PET INFO ===== */}
        <div className="bg-white rounded-2xl shadow p-6">

          <img
            src={pet.image}
            className="w-full h-[300px] object-cover rounded-xl mb-4"
          />

          <h2 className="text-xl font-bold text-[#6272B6] mb-4">
            {pet.name}
          </h2>

          <div className="space-y-2 text-gray-700">
            <p><strong>Tuổi:</strong> {pet.age}</p>
            <p><strong>Giới tính:</strong> {pet.gender}</p>

            <p>
              <strong>Tiêm phòng:</strong>{" "}
              {pet.vaccinated ? "Đã tiêm" : "Chưa tiêm"}
            </p>

            <p>
              <strong>Triệt sản:</strong>{" "}
              {pet.sterilized ? "Đã triệt sản" : "Chưa triệt sản"}
            </p>
          </div>

        </div>

        {/* ===== RIGHT: FORM ===== */}
        <div className="bg-white rounded-2xl shadow p-8 space-y-6">

          <input
            name="name"
            placeholder="Họ và tên"
            value={form.name}
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
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full h-12 bg-[#DDEDFF] rounded-full px-6 outline-none"
            required
          />

          <input
            name="address"
            placeholder="Địa chỉ"
            value={form.address}
            onChange={handleChange}
            className="w-full h-12 bg-[#DDEDFF] rounded-full px-6 outline-none"
            required
          />

          <textarea
            name="reason"
            placeholder="Lý do nhận nuôi"
            value={form.reason}
            onChange={handleChange}
            className="w-full h-28 bg-[#DDEDFF] rounded-2xl px-6 py-3 outline-none"
            required
          />

          <button
            onClick={handleNext}
            className="w-full bg-[#6272B6] text-white py-3 rounded-full hover:bg-[#4e5fa8] transition"
          >
            Tiếp tục
          </button>

        </div>

      </div>
    </div>
  )
}