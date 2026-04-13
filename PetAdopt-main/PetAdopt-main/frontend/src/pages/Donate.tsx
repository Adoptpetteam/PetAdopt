import { useState } from "react"

export default function Donate() {
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")

  const handleConfirm = () => {
    const donations = JSON.parse(localStorage.getItem("donations") || "[]")

    const newDonate = {
      id: Date.now(),
      name,
      message,
      status: "pending_confirm",
      createdAt: new Date().toISOString(),
    }

    localStorage.setItem("donations", JSON.stringify([...donations, newDonate]))

    alert("Đã ghi nhận. Chúng tôi sẽ xác nhận sau khi kiểm tra!")
    setName("")
    setMessage("")
  }

  return (
    <div className="max-w-[600px] mx-auto py-20 px-6 text-center">
      <h1 className="text-3xl font-bold text-[#6272B6] mb-6">
        Ủng hộ chúng tôi ❤️
      </h1>

      <p className="text-gray-500 mb-10">
        Quét mã QR bên dưới để chuyển khoản
      </p>

      {/* INPUT */}
      {/* <div className="space-y-4 mb-8">
        <input
          placeholder="Tên của bạn"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full h-12 bg-[#DDEDFF] rounded-full px-6 outline-none"
          required
        />

        <textarea
          placeholder="Lời nhắn (tuỳ chọn)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full h-28 bg-[#DDEDFF] rounded-2xl px-6 py-3 outline-none"
        />
      </div> */}

      {/* QR */}
      <div className="bg-white p-6 rounded-2xl shadow mb-6">
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
      {/* <button
        onClick={handleConfirm}
        className="w-full bg-[#6272B6] text-white py-3 rounded-full hover:bg-[#4e5fa8]"
      >
        Tôi đã thanh toán
      </button> */}
    </div>
  )
}