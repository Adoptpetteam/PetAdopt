import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

interface Product {
  id: number
  name: string
  price: number
  image: string
  description: string
}

export default function Products() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    fetch("http://localhost:3000/products")
      .then(res => res.json())
      .then(data => setProducts(data))
  }, [])

  return (
    <div className="max-w-[1000px] mx-auto py-20 px-6">
      <h1 className="text-3xl font-bold text-[#6272B6] mb-10 text-center">
        Sản phẩm
      </h1>

      <div className="grid grid-cols-3 gap-6">
        {products.map((p) => (
          <div
            key={p.id}
            onClick={() => navigate(`/products/${p.id}`)}
            className="bg-white rounded-2xl shadow p-4 cursor-pointer hover:scale-105 transition"
          >
            <img src={p.image} className="w-full h-40 object-cover rounded-xl mb-4" />
            <h2 className="font-semibold">{p.name}</h2>
            <p className="text-[#6272B6] font-bold mt-2">
              {p.price.toLocaleString()}đ
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}