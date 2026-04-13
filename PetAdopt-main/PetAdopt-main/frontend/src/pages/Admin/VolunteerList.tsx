import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../api/http";

interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  experience: string;
  availability: string;
  reason: string;
  status: "pending_review" | "approved" | "rejected";
  createdAt: string;
}

export default function VolunteerList() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");
  const navigate = useNavigate();

  const loadVolunteers = async () => {
    const res = await apiClient.get("/volunteers");
    setVolunteers(res.data?.data ?? res.data);
  };

  useEffect(() => {
    loadVolunteers();
  }, []);

  const updateStatus = async (id: string, status: Volunteer["status"]) => {
    try {
      await apiClient.patch(`/volunteers/${id}`, { status });
      await loadVolunteers();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredList = volunteers.filter((v) => {
    if (tab === "pending") return v.status === "pending_review";
    if (tab === "approved") return v.status === "approved";
    if (tab === "rejected") return v.status === "rejected";
    return false;
  });

  const pendingCount = volunteers.filter((v) => v.status === "pending_review").length;
  const approvedCount = volunteers.filter((v) => v.status === "approved").length;
  const rejectedCount = volunteers.filter((v) => v.status === "rejected").length;

  return (
    <div className="max-w-[1000px] mx-auto py-10 px-6">
      <h1 className="text-2xl font-bold mb-6 text-[#6272B6]">Quản lý tình nguyện viên</h1>

      <div className="flex gap-4 mb-6">
        <button onClick={() => setTab("pending")} className={`px-4 py-2 rounded ${tab === "pending" ? "bg-yellow-500 text-white" : "bg-gray-200"}`}>
          Pending ({pendingCount})
        </button>

        <button onClick={() => setTab("approved")} className={`px-4 py-2 rounded ${tab === "approved" ? "bg-green-500 text-white" : "bg-gray-200"}`}>
          Approved ({approvedCount})
        </button>

        <button onClick={() => setTab("rejected")} className={`px-4 py-2 rounded ${tab === "rejected" ? "bg-red-500 text-white" : "bg-gray-200"}`}>
          Rejected ({rejectedCount})
        </button>
      </div>

      <div className="space-y-4">
        {filteredList.map((v) => (
          <div key={v.id} className="bg-white shadow rounded-xl p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold">{v.name}</p>
              <p className="text-sm text-gray-500">{v.email}</p>
              <p className={`text-sm font-semibold ${v.status === "approved" ? "text-green-600" : v.status === "rejected" ? "text-red-600" : "text-yellow-600"}`}>
                {v.status}
              </p>
            </div>

            <div className="flex gap-2">
              <button onClick={() => navigate(`/admin/volunteers/${v.id}`)} className="px-4 py-2 bg-blue-500 text-white rounded">
                Chi tiết
              </button>

              {v.status === "pending_review" && (
                <>
                  <button onClick={() => updateStatus(v.id, "approved")} className="px-4 py-2 bg-green-500 text-white rounded">
                    Duyệt
                  </button>

                  <button onClick={() => updateStatus(v.id, "rejected")} className="px-4 py-2 bg-red-500 text-white rounded">
                    Từ chối
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
