import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

export default function ContactDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [contact, setContact] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`http://localhost:3000/contacts/${id}`)
      .then(res => res.json())
      .then(data => {
        setContact(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [id])

  // LOADING
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <p className="text-xl font-semibold text-[#6272B6]">
          Đang tải dữ liệu...
        </p>
      </div>
    )
  }

  // NOT FOUND
  if (!contact) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-red-500 mb-4">
          Không tìm thấy dữ liệu
        </h2>

        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 duration-200"
        >
          Quay lại
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-[800px] mx-auto py-10 px-6">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#6272B6]">
          Chi tiết liên hệ
        </h1>

        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 duration-200"
        >
          Quay lại
        </button>
      </div>

      <div className="bg-white shadow-xl rounded-2xl p-8 border">

        {/* USER */}
        <div className="flex items-center gap-4 mb-8">

          <div className="w-16 h-16 rounded-full bg-[#6272B6] text-white flex items-center justify-center text-2xl font-bold">
            {contact.name?.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {contact.name}
            </h2>

            <p className="text-gray-500">
              {contact.email}
            </p>
          </div>

        </div>

        {/* INFO */}
        <div className="space-y-5">

          <div className="bg-gray-50 p-5 rounded-xl">
            <p className="text-sm text-gray-500 mb-2">
              Nội dung liên hệ
            </p>

            <p className="text-gray-800 leading-7">
              {contact.message}
            </p>
          </div>

          <div className="bg-gray-50 p-5 rounded-xl">
            <p className="text-sm text-gray-500 mb-2">
              Ngày gửi
            </p>

            <p className="font-medium text-gray-800">
              {new Date(contact.createdAt).toLocaleString("vi-VN")}
            </p>
          </div>

        </div>

      </div>
    </div>
  )
}