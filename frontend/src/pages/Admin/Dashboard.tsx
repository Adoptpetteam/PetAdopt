import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Dashboard() {
  const navigate = useNavigate()

  const [orders, setOrders] = useState<any[]>([])
  const [volunteers, setVolunteers] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])

  // 🔥 FETCH DATA
  useEffect(() => {
    fetch("http://localhost:3000/adoptions")
      .then(res => res.json())
      .then(data => setOrders(data))

    fetch("http://localhost:3000/volunteers")
      .then(res => res.json())
      .then(data => setVolunteers(data))

    fetch("http://localhost:3000/news")
      .then(res => res.json())
      .then(data => setPosts(data))

    fetch("http://localhost:3000/category")
      .then(res => res.json())
      .then(data => setCategories(data))
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#6272B6] mb-6">
        Trang Quản Lý
      </h1>

      <div className="grid grid-cols-3 gap-6">

        {/* 🐾 Đơn nhận nuôi */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Tổng đơn nhận nuôi</h2>
          <p className="text-3xl font-bold">{orders.length}</p>

          <button
            onClick={() => navigate("/admin/orders")}
            className="mt-4 px-4 py-2 bg-[#6272B6] text-white rounded"
          >
            Xem chi tiết
          </button>
        </div>

        {/* ⏳ Pending */}
        {/* <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Đơn pending</h2>
          <p className="text-3xl font-bold">
            {orders.filter(o => o?.status === "pending").length}
          </p>

          <button
            onClick={() => navigate("/admin/orders")}
            className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded"
          >
            Xem chi tiết
          </button>
        </div> */}

        {/* 🙋 TNV */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Tổng TNV</h2>
          <p className="text-3xl font-bold">{volunteers.length}</p>

          <button
            onClick={() => navigate("/admin/volunteers")}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
          >
            Xem chi tiết
          </button>
        </div>

        {/* 📰 Bài viết */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Tổng bài viết</h2>
          <p className="text-3xl font-bold">{posts.length}</p>

          <button
            onClick={() => navigate("/admin/posts")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Xem chi tiết
          </button>
        </div>

        {/* 📂 Danh mục */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Tổng danh mục</h2>
          <p className="text-3xl font-bold">{categories.length}</p>

          <button
            onClick={() => navigate("/admin/categories")}
            className="mt-4 px-4 py-2 bg-purple-500 text-white rounded"
          >
            Xem chi tiết
          </button>
        </div>

      </div>
    </div>
  )
}