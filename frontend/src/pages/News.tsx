import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

export default function News() {
  const [data, setData] = useState<any[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    axios.get("http://localhost:3000/news")
      .then(res => setData(res.data))
  }, [])

  return (
    <div className="max-w-[1000px] mx-auto py-20 px-6">
      <h1 className="text-3xl font-bold text-[#6272B6] mb-10 text-center">
        Tin tức & Hoạt động
      </h1>

      <div className="grid grid-cols-3 gap-6">
        {data.map(item => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow cursor-pointer"
            onClick={() => navigate(`/news/${item.id}`)}
          >
            <img src={item.image} className="w-full h-40 object-cover"/>

            <div className="p-4">
              <h2 className="font-bold">{item.title}</h2>
              <p className="text-gray-500">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}