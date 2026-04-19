import { useLocation } from "react-router-dom"
import { useEffect, useState } from "react"

interface CartItem {
  id: number
  productId: number
  name: string
  price: number
  image: string
  quantity: number
}

export default function Checkout() {
  const location = useLocation()
  const selectedIds = location.state?.selectedIds || []

  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    fetch("http://localhost:3000/cart")
      .then(res => res.json())
      .then(data => {
        const selectedItems = data.filter((item: CartItem) =>
          selectedIds.includes(item.id)
        )
        setItems(selectedItems)
      })
  }, [])

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  return (
    <div className="max-w-[900px] mx-auto py-20 px-6">
      <h1 className="text-3xl font-bold text-[#6272B6] mb-10">
        Thanh toán
      </h1>

      {/* DANH SÁCH */}
      <div className="space-y-4">
        {items.map(item => (
          <div
            key={item.id}
            className="flex items-center gap-4 bg-white p-4 rounded-xl shadow"
          >
            <img src={item.image} className="w-16 h-16 rounded" />

            <div>
              <p className="font-semibold">{item.name}</p>
              <p>{item.price.toLocaleString()}đ</p>
              <p>SL: {item.quantity}</p>
            </div>
          </div>
        ))}
      </div>

      {/* FORM */}
      <div className="mt-10 bg-white p-6 rounded-xl shadow space-y-4">
        <input placeholder="Họ và tên" className="w-full h-12 bg-[#DDEDFF] px-4 rounded-full" />
        <input placeholder="Số điện thoại" className="w-full h-12 bg-[#DDEDFF] px-4 rounded-full" />
        <input placeholder="Địa chỉ" className="w-full h-12 bg-[#DDEDFF] px-4 rounded-full" />
      </div>

      {/* TOTAL */}
      <div className="mt-10 text-right">
        <p className="text-xl font-bold">
          Tổng: {total.toLocaleString()}đ
        </p>

        <button className="mt-4 px-6 py-3 bg-[#6272B6] text-white rounded-full">
          Thanh toán ngay
        </button>
      </div>
    </div>
  )
}