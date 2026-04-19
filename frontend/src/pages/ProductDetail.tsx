import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

interface Product {
  id: number
  name: string
  price: number
  image: string
  description: string
}

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    fetch(`http://localhost:3000/products/${id}`)
      .then(res => res.json())
      .then(data => setProduct(data))
  }, [id])

  if (!product) {
    return <div className="text-center py-20">Không tìm thấy sản phẩm</div>
  }

const handleAddToCart = async () => {
  const res = await fetch("http://localhost:3000/cart")
  const data = await res.json()

  const existing = data.find((item: any) => item.productId === product.id)

  if (existing) {
    // 👉 nếu đã có → cộng thêm số lượng
    await fetch(`http://localhost:3000/cart/${existing.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quantity: existing.quantity + quantity,
      }),
    })
  } else {
    // 👉 nếu chưa có → tạo mới
    await fetch("http://localhost:3000/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity,
      }),
    })
  }

  alert("Đã thêm vào giỏ hàng 🛒")
  // navigate("/cart")
}

  return (
    <div className="max-w-[900px] mx-auto py-20 px-6 grid grid-cols-2 gap-10">
      <img src={product.image} className="w-full h-[400px] object-cover rounded-xl" />

      <div>
        <h1 className="text-3xl font-bold">{product.name}</h1>

        <p className="text-[#6272B6] text-xl font-bold mt-4">
          {product.price.toLocaleString()}đ
        </p>

        <p className="mt-4 text-gray-600">{product.description}</p>

        <div className="flex items-center gap-4 mt-6">
  <button
    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
    className="w-10 h-10 bg-gray-200 rounded-full text-lg"
  >
    -
  </button>

  <span className="text-lg font-semibold">{quantity}</span>

  <button
    onClick={() => setQuantity(prev => prev + 1)}
    className="w-10 h-10 bg-gray-200 rounded-full text-lg"
  >
    +
  </button>
</div>

        <button
  onClick={handleAddToCart}
  className="mt-6 px-6 py-3 bg-[#6272B6] text-white rounded-full"
>
  Thêm vào giỏ hàng
</button>
      </div>
    </div>
  )
}