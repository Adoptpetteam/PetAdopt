import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { message } from "antd"
import {
  getVolunteers,
  approveVolunteer,
  rejectVolunteer,
} from "../../api/volunteerApi"

export default function VolunteerList() {
  const [volunteers, setVolunteers] = useState<any[]>([])
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending")
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const load = () => {
    setLoading(true)
    getVolunteers({ limit: 100 })
      .then(res => setVolunteers(res.data || []))
      .catch(() => message.error("Không tải được danh sách"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleApprove = async (id: string) => {
    try {
      await approveVolunteer(id)
      message.success("Đã duyệt!")
      load()
    } catch {
      message.error("Duyệt thất bại")
    }
  }

  const handleReject = async (id: string) => {
    try {
      await rejectVolunteer(id)
      message.info("Đã từ chối")
      load()
    } catch {
      message.error("Từ chối thất bại")
    }
  }

  const filteredList = volunteers.filter((v) => {
    if (tab === "pending") return v.status === "pending"
    if (tab === "approved") return v.status === "approved"
    if (tab === "rejected") return v.status === "rejected"
    return false
  })

  const pendingCount = volunteers.filter(v => v.status === "pending").length
  const approvedCount = volunteers.filter(v => v.status === "approved").length
  const rejectedCount = volunteers.filter(v => v.status === "rejected").length

  return (
    <div className="max-w-[1000px] mx-auto py-10 px-6">
      <h1 className="text-2xl font-bold mb-6 text-[#6272B6]">
        Quản lý tình nguyện viên
      </h1>

      {/* TAB */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setTab("pending")}
          className={`px-4 py-2 rounded ${
            tab === "pending" ? "bg-yellow-500 text-white" : "bg-gray-200"
          }`}
        >
          Chờ duyệt ({pendingCount})
        </button>

        <button
          onClick={() => setTab("approved")}
          className={`px-4 py-2 rounded ${
            tab === "approved" ? "bg-green-500 text-white" : "bg-gray-200"
          }`}
        >
          Đã duyệt ({approvedCount})
        </button>

        <button
          onClick={() => setTab("rejected")}
          className={`px-4 py-2 rounded ${
            tab === "rejected" ? "bg-red-500 text-white" : "bg-gray-200"
          }`}
        >
          Từ chối ({rejectedCount})
        </button>
      </div>

      {/* LIST */}
      {loading ? (
        <div className="py-10 text-center text-gray-400">Đang tải...</div>
      ) : filteredList.length === 0 ? (
        <div className="py-10 text-center text-gray-400">Không có đơn nào.</div>
      ) : (
        <div className="space-y-4">
          {filteredList.map((v) => (
            <div
              key={v._id}
              className="bg-white shadow rounded-xl p-4 flex justify-between items-center"
            >
              {/* LEFT */}
              <div>
                <p className="font-semibold">{v.name}</p>
                <p className="text-sm text-gray-500">{v.email}</p>
                <p className="text-sm text-gray-400">{v.phone}</p>
                <p className={`text-sm font-semibold ${
                  v.status === "approved" ? "text-green-600"
                    : v.status === "rejected" ? "text-red-600"
                    : "text-yellow-600"
                }`}>
                  {v.status === "pending" ? "Chờ duyệt"
                    : v.status === "approved" ? "Đã duyệt"
                    : "Từ chối"}
                </p>
              </div>

              {/* RIGHT - BUTTONS */}
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/admin/volunteers/${v._id}`)}
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Chi tiết
                </button>

                {v.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleApprove(v._id)}
                      className="px-4 py-2 bg-green-500 text-white rounded"
                    >
                      Duyệt
                    </button>

                    <button
                      onClick={() => handleReject(v._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded"
                    >
                      Từ chối
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}