import { useNavigate } from "react-router-dom"

export default function SuccessPage() {
  const navigate = useNavigate()
  localStorage.removeItem("adoptForm")

  return (
    <div className="flex flex-col items-center justify-center py-40 text-center">
      <h1 className="text-4xl font-bold text-green-500 mb-6">
        Gửi form nhận nuôi thành công!
      </h1>

      <p className="text-gray-600 mb-10">
        Cảm ơn bạn đã yêu thương thú cưng 
      </p>

      <button
        onClick={() => navigate("/")}
        className="bg-[#6272B6] text-white px-8 py-3 rounded-full"
      >
        Về trang chủ
      </button>
    </div>
  )
}