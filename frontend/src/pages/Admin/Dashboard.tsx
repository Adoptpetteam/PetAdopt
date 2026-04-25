import { useEffect, useState } from "react"
import { message } from "antd"
import { getAdoptionRequests } from "../../api/adoptionApi"

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getAdoptionRequests({ limit: 100 })
      .then(res => {
        const data = res.data || []
        setStats({
          total: data.length,
          pending: data.filter((o: any) => o.status === "pending").length,
          approved: data.filter((o: any) => o.status === "approved").length,
          rejected: data.filter((o: any) => o.status === "rejected").length,
        })
      })
      .catch(() => message.error("Không tải được dữ liệu"))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#6272B6] mb-6">
        Trang Quản Lý
      </h1>

      {loading ? (
        <div className="text-gray-400 py-10">Đang tải...</div>
      ) : (
        <div className="grid grid-cols-3 gap-6">

          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <h2 className="text-gray-500 text-sm uppercase tracking-wide">Tổng đơn nhận nuôi</h2>
            <p className="text-3xl font-bold text-[#6272B6] mt-2">{stats.total}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <h2 className="text-gray-500 text-sm uppercase tracking-wide">Chờ duyệt</h2>
            <p className="text-3xl font-bold text-yellow-500 mt-2">{stats.pending}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <h2 className="text-gray-500 text-sm uppercase tracking-wide">Đã duyệt</h2>
            <p className="text-3xl font-bold text-green-500 mt-2">{stats.approved}</p>
          </div>

        </div>
      )}
    </div>
  )
}
