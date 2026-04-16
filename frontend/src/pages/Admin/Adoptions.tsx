import { useEffect, useState } from "react"
import { message } from "antd"
import {
  approveAdoptionRequest,
  listAdoptionRequestsAdmin,
  rejectAdoptionRequest,
  type AdoptionRequest,
  type AdoptionStatus,
} from "../../api/adoptionApi"

function statusBadgeColor(status: AdoptionStatus) {
  if (status === "approved") return "bg-green-100 text-green-700"
  if (status === "rejected") return "bg-red-100 text-red-700"
  if (status === "cancelled") return "bg-gray-100 text-gray-700"
  return "bg-yellow-100 text-yellow-700"
}

export default function Adoptions() {
  const [requests, setRequests] = useState<AdoptionRequest[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await listAdoptionRequestsAdmin({ page: 1, limit: 1000 })
      setRequests(res.data)
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Không tải được đơn nhận nuôi.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const process = async (id: string, action: "approved" | "rejected") => {
    try {
      if (action === "approved") await approveAdoptionRequest(id)
      else await rejectAdoptionRequest(id)
      await load()
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Xử lý thất bại.")
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#6272B6] mb-6">
        Danh sách đơn nhận nuôi
      </h1>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Tên</th>
              <th className="p-4 text-left">Pet</th>
              <th className="p-4 text-left">SĐT</th>
              <th className="p-4 text-left">Trạng thái</th>
              <th className="p-4 text-left">Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {requests.map((r) => {
              const petName =
                typeof r.pet === "object" && r.pet && "name" in r.pet
                  ? (r.pet as { name?: string }).name || "—"
                  : typeof r.pet === "string"
                    ? r.pet
                    : "—"

              return (
                <tr key={r._id} className="border-t">
                  <td className="p-4">{r.fullName}</td>
                  <td className="p-4">{petName}</td>
                  <td className="p-4">{r.phone}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full ${statusBadgeColor(r.status)}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {r.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => void process(r._id, "approved")}
                          className="px-3 py-1 rounded bg-green-500 text-white"
                          disabled={loading}
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() => void process(r._id, "rejected")}
                          className="px-3 py-1 rounded bg-red-500 text-white"
                          disabled={loading}
                        >
                          Từ chối
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {requests.length === 0 && !loading && (
          <div className="p-10 text-center text-gray-500">Chưa có đơn nào.</div>
        )}
      </div>
    </div>
  )
}
