import { useParams } from "react-router-dom"
import { products } from "../data/products"

export default function ProductDetail() {
  const { id } = useParams()

  const product = products.find(p => p.id === Number(id))

  if (!product) {
    return <div className="text-center py-20">Không tìm thấy sản phẩm</div>
  }

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")

    cart.push(product)

    localStorage.setItem("cart", JSON.stringify(cart))

    alert("Đã thêm vào giỏ hàng 🛒")
  }

  return (
    <div className="max-w-[900px] mx-auto py-20 px-6 grid grid-cols-2 gap-10">
      <img
        src={product.image}
        className="w-full h-[400px] object-cover rounded-xl"
      />

      <div>
        <h1 className="text-3xl font-bold">{product.name}</h1>

        <p className="text-[#6272B6] text-xl font-bold mt-4">
          {product.price.toLocaleString()}đ
        </p>

        <p className="mt-4 text-gray-600">
          {product.description}
        </p>

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