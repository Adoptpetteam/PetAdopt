import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

interface CartItem {
  id: number
  productId: number
  name: string
  price: number
  image: string
  quantity: number
}

export default function Cart() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
    const navigate = useNavigate()

  const fetchCart = () => {
    fetch("http://localhost:3000/cart")
      .then(res => res.json())
      .then(data => setCart(data))
  }

  useEffect(() => {
    fetchCart()
  }, [])

  const handleDelete = async (id: number) => {
    await fetch(`http://localhost:3000/cart/${id}`, {
      method: "DELETE",
    })
    fetchCart()
    setSelectedIds(prev => prev.filter(itemId => itemId !== id))
  }

  // ✅ CHỌN TẤT CẢ
  const handleSelectAll = () => {
    if (selectedIds.length === cart.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(cart.map(item => item.id))
    }
  }

  // ✅ TÍNH TỔNG THEO ITEM ĐÃ CHỌN
  const total = cart
    .filter(item => selectedIds.includes(item.id))
    .reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="max-w-[900px] mx-auto py-20 px-6">
      <h1 className="text-3xl font-bold text-[#6272B6] mb-10">
        Giỏ hàng
      </h1>

      {cart.length === 0 && <p>Giỏ hàng trống</p>}

      {/* ✅ CHỌN TẤT CẢ */}
      {cart.length > 0 && (
        <div className="mb-4 flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedIds.length === cart.length}
            onChange={handleSelectAll}
          />
          <span>Chọn tất cả</span>
        </div>
      )}

      <div className="space-y-4">
        {cart.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center bg-white p-4 rounded-xl shadow"
          >
            <div className="flex gap-4 items-center">
              {/* ✅ CHECKBOX */}
              <input
                type="checkbox"
                checked={selectedIds.includes(item.id)}
                onChange={() => {
                  if (selectedIds.includes(item.id)) {
                    setSelectedIds(selectedIds.filter(id => id !== item.id))
                  } else {
                    setSelectedIds([...selectedIds, item.id])
                  }
                }}
              />

              <img src={item.image} className="w-16 h-16 rounded" />

              <div>
                <p className="font-semibold">{item.name}</p>
                <p>{item.price.toLocaleString()}đ</p>
                <p>SL: {item.quantity}</p>
              </div>
            </div>

            <button
              onClick={() => handleDelete(item.id)}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Xóa
            </button>
          </div>
        ))}
      </div>

      {/* TOTAL + BUTTON */}
      <div className="mt-10 text-right">
        <p className="text-xl font-bold">
          Tổng thanh toán: {total.toLocaleString()}đ
        </p>

        <button
          onClick={() => navigate("/checkout", { state: { selectedIds } })}
          className="mt-4 px-6 py-3 bg-[#6272B6] text-white rounded-full disabled:bg-gray-300"
        >
          Thanh toán
        </button>
      </div>
    </div>
  )
}