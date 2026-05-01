import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { getVolunteerById } from "../../api/volunteerApi"

export default function VolunteerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [volunteer, setVolunteer] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getVolunteerById(id)
      .then(res => setVolunteer(res.data))
      .catch(() => setVolunteer(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="text-center py-20">Đang tải...</div>
  if (!volunteer) return <div className="text-center py-20">Không tìm thấy dữ liệu</div>

  return (
    <div className="max-w-[800px] mx-auto py-10 px-6">
      <h1 className="text-2xl font-bold mb-6 text-[#6272B6]">
        Chi tiết tình nguyện viên
      </h1>

      <div className="bg-white shadow rounded-xl p-6 space-y-4">
        <p><b>Họ tên:</b> {volunteer.name}</p>
        <p><b>Email:</b> {volunteer.email}</p>
        <p><b>SĐT:</b> {volunteer.phone}</p>
        {volunteer.age && <p><b>Tuổi:</b> {volunteer.age}</p>}
        {volunteer.experience && <p><b>Kinh nghiệm:</b> {volunteer.experience}</p>}
        {volunteer.availability && <p><b>Thời gian:</b> {volunteer.availability}</p>}
        <p><b>Lý do:</b> {volunteer.reason}</p>
        <p><b>Trạng thái:</b> {volunteer.status}</p>
        <p><b>Ngày đăng ký:</b> {volunteer.createdAt ? new Date(volunteer.createdAt).toLocaleString("vi-VN") : ""}</p>

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