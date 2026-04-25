import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

export default function ContactDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [contact, setContact] = useState<any>(null)

  useEffect(() => {
    fetch(`http://localhost:3000/contacts/${id}`)
      .then(res => res.json())
      .then(data => setContact(data))
  }, [id])

  if (!contact) {
    return <div className="text-center py-20">Không tìm thấy dữ liệu</div>
  }

  return (
    <div className="max-w-[800px] mx-auto py-10 px-6">
      <h1 className="text-2xl font-bold text-[#6272B6] mb-6">
        Chi tiết liên hệ
      </h1>

      <div className="bg-white shadow rounded-xl p-6 space-y-4">
        <p><b>Họ tên:</b> {contact.name}</p>
        <p><b>Email:</b> {contact.email}</p>
        <p><b>Nội dung:</b> {contact.message}</p>
        <p><b>Ngày gửi:</b> {new Date(contact.createdAt).toLocaleString()}</p>

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