import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

interface Volunteer {
  id: number
  name: string
  email: string
  phone: string
  age: number
  experience: string
  availability: string
  reason: string
  status: "pending_review" | "approved" | "rejected"
  createdAt: string
}

export default function VolunteerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null)

  useEffect(() => {
    const data: Volunteer[] = JSON.parse(localStorage.getItem("volunteers") || "[]")
    const found = data.find(v => v.id === Number(id))
    if (found) setVolunteer(found)
  }, [id])

  if (!volunteer) {
    return <div className="text-center py-20">Không tìm thấy dữ liệu</div>
  }

  return (
    <div className="max-w-[800px] mx-auto py-10 px-6">
      <h1 className="text-2xl font-bold mb-6 text-[#6272B6]">
        Chi tiết tình nguyện viên
      </h1>

      <div className="bg-white shadow rounded-xl p-6 space-y-4">
        <p><b>Họ tên:</b> {volunteer.name}</p>
        <p><b>Email:</b> {volunteer.email}</p>
        <p><b>SĐT:</b> {volunteer.phone}</p>
        <p><b>Tuổi:</b> {volunteer.age}</p>
        <p><b>Kinh nghiệm:</b> {volunteer.experience}</p>
        <p><b>Thời gian:</b> {volunteer.availability}</p>
        <p><b>Lý do:</b> {volunteer.reason}</p>
        <p><b>Trạng thái:</b> {volunteer.status}</p>
        <p><b>Ngày đăng ký:</b> {new Date(volunteer.createdAt).toLocaleString()}</p>

        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded"
        >
          Quay lại
        </button>
      </div>
    </div>
  )
}