import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { message } from "antd"
import {
  listVolunteersAdmin,
  approveVolunteer,
  rejectVolunteer,
  type Volunteer,
  type VolunteerStatus,
} from "../../api/volunteerApi"

export default function VolunteerList() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [tab, setTab] = useState<VolunteerStatus>("pending")
  const [loading, setLoading] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [approvedCount, setApprovedCount] = useState(0)
  const [rejectedCount, setRejectedCount] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
          listVolunteersAdmin({ status: "pending", page: 1, limit: 1000 }),
          listVolunteersAdmin({ status: "approved", page: 1, limit: 1000 }),
          listVolunteersAdmin({ status: "rejected", page: 1, limit: 1000 }),
        ])
        setPendingCount(pendingRes.data.length)
        setApprovedCount(approvedRes.data.length)
        setRejectedCount(rejectedRes.data.length)
      } catch (e: any) {
        message.error(
          e?.response?.data?.message || "Không tải được số lượng."
        )
      }
    }

    void loadCounts()
  }, [])

  useEffect(() => {
    const loadTab = async () => {
      setLoading(true)
      try {
        const res = await listVolunteersAdmin({ status: tab, page: 1, limit: 1000 })
        setVolunteers(res.data)
      } catch (e: any) {
        message.error(e?.response?.data?.message || "Không tải được danh sách.")
      } finally {
        setLoading(false)
      }
    }

    void loadTab()
  }, [tab])

  const refreshAfterMutation = async () => {
    const res = await listVolunteersAdmin({ status: tab, page: 1, limit: 1000 })
    setVolunteers(res.data)
    try {
      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        listVolunteersAdmin({ status: "pending", page: 1, limit: 1000 }),
        listVolunteersAdmin({ status: "approved", page: 1, limit: 1000 }),
        listVolunteersAdmin({ status: "rejected", page: 1, limit: 1000 }),
      ])
      setPendingCount(pendingRes.data.length)
      setApprovedCount(approvedRes.data.length)
      setRejectedCount(rejectedRes.data.length)
    } catch {
      // non-blocking
    }
  }

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      if (status === "approved") {
        await approveVolunteer(id)
      } else {
        await rejectVolunteer(id)
      }
      await refreshAfterMutation()
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Cập nhật thất bại.")
    }
  }

  const filteredList = volunteers

  return (
    <div className="max-w-[1000px] mx-auto py-10 px-6">
      <h1 className="text-2xl font-bold mb-6 text-[#6272B6]">
        Quản lý tình nguyện viên
      </h1>

      {/* 🔥 TAB */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setTab("pending")}
          className={`px-4 py-2 rounded ${
            tab === "pending" ? "bg-yellow-500 text-white" : "bg-gray-200"
          }`}
        >
          Pending ({pendingCount})
        </button>

        <button
          onClick={() => setTab("approved")}
          className={`px-4 py-2 rounded ${
            tab === "approved" ? "bg-green-500 text-white" : "bg-gray-200"
          }`}
        >
          Approved ({approvedCount})
        </button>

        <button
          onClick={() => setTab("rejected")}
          className={`px-4 py-2 rounded ${
            tab === "rejected" ? "bg-red-500 text-white" : "bg-gray-200"
          }`}
        >
          Rejected ({rejectedCount})
        </button>
      </div>

      {/* 🔥 LIST */}
      <div className="space-y-4">
        {filteredList.map((v) => (
          <div
            key={v.id}
            className="bg-white shadow rounded-xl p-4 flex justify-between items-center"
          >
            {/* LEFT */}
            <div>
              <p className="font-semibold">{v.name}</p>
              <p className="text-sm text-gray-500">{v.email}</p>

              {/* STATUS */}
              <p
                className={`text-sm font-semibold ${
                  v.status === "approved"
                    ? "text-green-600"
                    : v.status === "rejected"
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}
              >
                {v.status}
              </p>
            </div>

            {/* RIGHT - BUTTONS */}
            <div className="flex gap-2">
              {/* 👁️ LUÔN HIỆN */}
              <button
                onClick={() => navigate(`/admin/volunteers/${v.id}`)}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Chi tiết
              </button>

              {/* 🔒 CHỈ pending mới có */}
              {v.status === "pending" && (
                <>
                  <button
                    onClick={() => updateStatus(v.id, "approved")}
                    className="px-4 py-2 bg-green-500 text-white rounded"
                    disabled={loading}
                  >
                    Duyệt
                  </button>

                  <button
                    onClick={() => updateStatus(v.id, "rejected")}
                    className="px-4 py-2 bg-red-500 text-white rounded"
                    disabled={loading}
                  >
                    Từ chối
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
