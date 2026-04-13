import { useParams, useNavigate } from "react-router-dom"
import { pets } from "../data/pet"

export default function PaymentMethod() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const pet = pets.find((p) => p.id === Number(id))
  if (!pet) return <div className="text-center py-20">Pet not found</div>

  const handleSelect = (method: string) => {
    navigate(`/payment/${method}/${pet.id}`)
  }

  return (
    <div className="max-w-[800px] mx-auto py-20 px-6 text-center">
      <h1 className="text-3xl font-bold text-[#6272B6] mb-10">
        Chọn phương thức thanh toán
      </h1>

      <div className="grid grid-cols-2 gap-10">

        {/* MoMo */}
        <div
          onClick={() => handleSelect("momo")}
          className="cursor-pointer bg-pink-100 hover:bg-pink-200 p-10 rounded-2xl shadow transition"
        >
          <h2 className="text-xl font-semibold text-pink-600 mb-2">MoMo</h2>
          <p>Thanh toán nhanh qua ví MoMo</p>
        </div>

        {/* ZaloPay */}
        <div
          onClick={() => handleSelect("zalopay")}
          className="cursor-pointer bg-blue-100 hover:bg-blue-200 p-10 rounded-2xl shadow transition"
        >
          <h2 className="text-xl font-semibold text-blue-600 mb-2">ZaloPay</h2>
          <p>Thanh toán qua ZaloPay</p>
        </div>

      </div>
    </div>
  )
}