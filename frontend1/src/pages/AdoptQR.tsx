import { useParams, useNavigate } from "react-router-dom"
import { pets } from "../data/pet"
import { useState } from "react"

export default function PaymentQR() {
  const { id, method } = useParams<{ id: string; method: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const orderId = localStorage.getItem("currentOrderId")

  const pet = pets.find((p) => p.id === Number(id))
  if (!pet) return <div className="text-center py-20">Pet not found</div>

  const formData = JSON.parse(localStorage.getItem("adoptForm") || "{}")

const handleSuccess = () => {
  setLoading(true)

  setTimeout(() => {
    const orders = JSON.parse(localStorage.getItem("orders") || "[]")

    const updated = orders.map((o: any) => {
      if (o.createdAt === orderId) {
        return { ...o, status: "paid" } // 🔥 update tại đây
      }
      return o
    })

    localStorage.setItem("orders", JSON.stringify(updated))

    navigate("/success")
  }, 2000)
}

  const qrImage =
    method === "momo"
      ? "/images/qr-momo.png"
      : "/images/qr-zalo.png"

  return (
    <div className="max-w-[600px] mx-auto py-20 text-center">
      <h1 className="text-3xl font-bold text-[#6272B6] mb-6">
        Thanh toán bằng {method?.toUpperCase()}
      </h1>

      <img src={pet.image} className="w-full h-[250px] object-cover rounded-xl mb-4" />

      <p className="mb-4">Số tiền: <strong>1.500.000₫</strong></p>

      <img src={qrImage} className="mx-auto w-60 h-60 mb-6" />

      <button
        onClick={handleSuccess}
        disabled={loading}
        className="w-full bg-[#6272B6] text-white py-3 rounded-full"
      >
        {loading ? "Đang xử lý..." : "Tôi đã thanh toán"}
      </button>
    </div>
  )
}