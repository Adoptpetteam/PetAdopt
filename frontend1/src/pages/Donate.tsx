import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { message } from "antd"
import { createVNPayPayment } from "../api/donateApi"

export default function Donate() {
  const [searchParams] = useSearchParams()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [messageText, setMessageText] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)

  const status = searchParams.get("status")
  const code = searchParams.get("code")

  // Tự điền email từ user đã đăng nhập (localStorage)
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        const user = JSON.parse(storedUser)
        if (user?.email) setEmail(user.email)
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    if (status === "success") {
      message.success("Thanh toán thành công! Cảm ơn bạn đã ủng hộ ❤️")
    } else if (status === "failed") {
      message.error("Thanh toán thất bại. Vui lòng thử lại.")
    }
  }, [status, code])

  const handleDonate = async () => {
    const amountNum = Number(amount)
    if (!amountNum || amountNum < 1000) {
      message.warning("Vui lòng nhập số tiền hợp lệ (tối thiểu 1,000 VND)")
      return
    }

    setLoading(true)
    try {
      const res = await createVNPayPayment({
        amount: amountNum,
        name: name || undefined,
        email: email || undefined,
      })
      window.location.href = res.paymentUrl
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Tạo thanh toán thất bại")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-[600px] mx-auto py-20 px-6 text-center">
      <h1 className="text-3xl font-bold text-[#6272B6] mb-6">
        Ủng hộ chúng tôi ❤️
      </h1>

      <p className="text-gray-500 mb-10">
        Nhập số tiền và nhấn "Ủng hộ" để chuyển sang trang thanh toán VNPay
      </p>

      {/* INPUT */}
      <div className="space-y-4 mb-8">
        <input
          placeholder="Tên của bạn (tuỳ chọn)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full h-12 bg-[#DDEDFF] rounded-full px-6 outline-none"
        />

        <input
          type="email"
          placeholder="Email (để nhận lời cảm ơn qua thư)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-12 bg-[#DDEDFF] rounded-full px-6 outline-none"
        />

        <input
          type="number"
          placeholder="Số tiền ủng hộ (VND) *"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full h-12 bg-[#DDEDFF] rounded-full px-6 outline-none"
          min="1000"
        />

        <textarea
          placeholder="Lời nhắn (tuỳ chọn)"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          className="w-full h-28 bg-[#DDEDFF] rounded-2xl px-6 py-3 outline-none"
        />
      </div>

      {/* QR - static info */}
      <div className="bg-white p-6 rounded-2xl shadow mb-6">
        <p className="text-sm text-gray-600 mb-2">
          Hoặc quét mã QR để chuyển khoản thủ công
        </p>
        <img
          src="https://img.vietqr.io/image/970422-123456789-compact.png"
          alt="QR Code"
          className="w-60 mx-auto"
        />
        <p className="mt-4 text-sm text-gray-600">
          Ngân hàng: MB Bank <br />
          STK: 123456789 <br />
          Chủ TK: PET ADOPTION
        </p>
      </div>

      {/* BUTTON */}
      <button
        onClick={handleDonate}
        disabled={loading}
        className="w-full bg-[#6272B6] text-white py-3 rounded-full hover:bg-[#4e5fa8] disabled:opacity-60"
      >
        {loading ? "Đang chuyển..." : "Ủng hộ qua VNPay"}
      </button>
    </div>
  )
}