import { useEffect, useState } from "react"
import { getAdoptionRequests } from "../../api/adoptionApi"
import { message } from "antd"
import { approveAdoptionRequest, rejectAdoptionRequest } from "../../api/adoptionApi"

export default function Adoptions() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    getAdoptionRequests({ limit: 100 })
      .then(res => setOrders(res.data || []))
      .catch(() => message.error("Không tải được danh sách"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleApprove = async (id: string) => {
    try {
      await approveAdoptionRequest(id)
      message.success("Đã duyệt đơn!")
      load()
    } catch {
      message.error("Duyệt thất bại")
    }
  }

  const handleReject = async (id: string) => {
    try {
      await rejectAdoptionRequest(id)
      message.info("Đã từ chối đơn")
      load()
    } catch {
      message.error("Từ chối thất bại")
    }
  }

  const statusColor = (s: string) => {
    if (s === 'pending') return 'bg-yellow-100 text-yellow-600'
    if (s === 'approved') return 'bg-green-100 text-green-600'
    if (s === 'rejected') return 'bg-red-100 text-red-600'
    return 'bg-gray-100 text-gray-600'
  }

  const statusLabel = (s: string) => {
    if (s === 'pending') return 'Chờ duyệt'
    if (s === 'approved') return 'Đã duyệt'
    if (s === 'rejected') return 'Từ chối'
    return s
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#6272B6] mb-6">
        Danh sách đơn nhận nuôi
      </h1>

      {loading ? (
        <div className="py-10 text-gray-400 text-center">Đang tải...</div>
      ) : orders.length === 0 ? (
        <div className="py-10 text-gray-400 text-center">Chưa có đơn nhận nuôi nào.</div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">Tên</th>
                <th className="p-4 text-left">Thú cưng</th>
                <th className="p-4 text-left">SĐT</th>
                <th className="p-4 text-left">Trạng thái</th>
                <th className="p-4 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="border-t">
                  <td className="p-4">{o.fullName}</td>
                  <td className="p-4">{o.pet?.name || o.pet || "—"}</td>
                  <td className="p-4">{o.phone}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(o.status)}`}>
                      {statusLabel(o.status)}
                    </span>
                  </td>
                  <td className="p-4">
                    {o.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(o._id)}
                          className="px-3 py-1 bg-green-500 text-white rounded text-xs"
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() => handleReject(o._id)}
                          className="px-3 py-1 bg-red-500 text-white rounded text-xs"
                        >
                          Từ chối
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}