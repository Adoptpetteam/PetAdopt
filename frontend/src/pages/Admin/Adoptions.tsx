import { useNavigate } from "react-router-dom";
import { apiClient } from "../../api/http";

import { useListAdoption } from "../../hook/huyHook";

export default function Adoptions() {
  const navigate = useNavigate();

  const { data: orders = [], refetch } = useListAdoption({
    resource: "adoption",
  });

  // STATUS COLOR
  const statusColor = (s: string) => {
    if (s === "approved") return "bg-green-100 text-green-600";
    if (s === "rejected") return "bg-red-100 text-red-600";
    if (s === "pending") return "bg-yellow-100 text-yellow-600";
    return "bg-gray-100 text-gray-600";
  };

  // UPDATE STATUS
  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      const action = status === "approved" ? "approve" : "reject";
      await apiClient.put(`/adoption/${id}/${action}`, {});
      refetch();
    } catch (error) {
      console.error(error);
    }
  };

  // DELETE
  const deleteOrder = async (id: string) => {
    try {
      await apiClient.delete(`/adoption/${id}`);
      refetch();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#6272B6] mb-6">
        Danh sách đơn nhận nuôi
      </h1>

      <div className="bg-white rounded-xl shadow overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Tên</th>
              <th className="p-4 text-left">Pet</th>
              <th className="p-4 text-left">SĐT</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Trạng thái</th>
              <th className="p-4 text-left">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o: any) => (
              <tr key={o._id} className="border-t">
                <td className="p-4">{o.fullName || o.user?.name}</td>
                <td className="p-4">{o.pet?.name || "Không rõ"}</td>
                <td className="p-4">{o.phone || o.user?.phone}</td>
                <td className="p-4">{o.user?.email || "Không rõ"}</td>

                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${statusColor(o.status)}`}>
                    {o.status}
                  </span>
                </td>

                <td className="p-4 flex gap-2 flex-wrap">

                  <button
                    onClick={() => navigate(`/admin/adoptions/${o._id}`)}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Xem chi tiết đơn nhận nuôi
                  </button>

                  <button
                    onClick={() => updateStatus(o._id, "approved")}
                    disabled={o.status !== "pending"}
                    className="bg-green-500 text-white px-3 py-1 rounded disabled:opacity-50"
                  >
                    Duyệt
                  </button>

                  <button
                    onClick={() => updateStatus(o._id, "rejected")}
                    disabled={o.status !== "pending"}
                    className="bg-yellow-500 text-white px-3 py-1 rounded disabled:opacity-50"
                  >
                    Từ chối
                  </button>

                  <button
                    onClick={() => deleteOrder(o._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Xóa
                  </button>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}