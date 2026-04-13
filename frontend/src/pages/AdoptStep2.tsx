import { useParams, useNavigate } from "react-router-dom"
import { useState } from "react"
import { useCreateAdoption } from "../hook/huyHook"

export default function AdoptStep2() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [donationType, setDonationType] = useState("")
  const [certificateType, setCertificateType] = useState("")
  const { mutate } = useCreateAdoption({ resource: "adoptions" })

 const handleSubmit = () => {
  if (!donationType || !certificateType) {
    alert("Vui lòng chọn đầy đủ thông tin")
    return
  }

  const formData = JSON.parse(localStorage.getItem("adoptForm") || "{}")

  const newOrder = {
    ...formData,
    petId: Number(id),
    donationType,
    certificateType,
    status: "submitted",
    createdAt: new Date().toISOString()
  }

  mutate(newOrder, {
    onSuccess: () => {
      navigate("/success")
    }
  })
}

  return (
    <div className="max-w-[800px] mx-auto py-20 px-6">

      <h1 className="text-3xl font-bold text-[#6272B6] text-center mb-10">
        Thông tin bổ sung
      </h1>

      <div className="bg-white rounded-2xl shadow p-8 space-y-10">

        {/* ===== Donation ===== */}
        <div>
          <h2 className="font-semibold mb-4">
            Hình thức quyên góp
          </h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="donation"
                value="monthly"
                onChange={(e) => setDonationType(e.target.value)}
              />
              Định kỳ hàng tháng
            </label>

            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="donation"
                value="yearly"
                onChange={(e) => setDonationType(e.target.value)}
              />
              Một lần cho cả năm
            </label>
          </div>
        </div>

        {/* ===== Certificate ===== */}
        <div>
          <h2 className="font-semibold mb-4">
            Nhận chứng nhận & quà tri ân
          </h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="certificate"
                value="digital"
                onChange={(e) => setCertificateType(e.target.value)}
              />
              Bản điện tử
            </label>

            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="certificate"
                value="physical"
                onChange={(e) => setCertificateType(e.target.value)}
              />
              Bản cứng qua bưu điện
            </label>
          </div>
        </div>

        {/* BUTTON */}
        <button
          onClick={handleSubmit}
          className="w-full bg-[#6272B6] text-white py-3 rounded-full hover:bg-[#4e5fa8]"
        >
          Gửi form nhận nuôi
        </button>

      </div>
    </div>
  )
}