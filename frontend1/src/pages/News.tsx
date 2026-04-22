import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { listNews } from "../api/newsApi"

export default function News() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    listNews({ limit: 20 })
      .then(res => setData(res.data || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-[1000px] mx-auto py-20 px-6">
      <h1 className="text-3xl font-bold text-[#6272B6] mb-10 text-center">
        Tin tức & Hoạt động
      </h1>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Đang tải...</div>
      ) : data.length === 0 ? (
        <div className="text-center py-20 text-gray-400">Chưa có tin tức nào.</div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {data.map(item => (
            <div
              key={item._id}
              className="bg-white rounded-xl shadow cursor-pointer hover:shadow-lg transition"
              onClick={() => navigate(`/news/${item._id}`)}
            >
              <img src={item.image || "/images/Jack.png"} className="w-full h-40 object-cover"/>

              <div className="p-4">
                <h2 className="font-bold">{item.title}</h2>
                <p className="text-gray-500 text-sm">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}