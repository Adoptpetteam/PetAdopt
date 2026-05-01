import { useListAdoption, useDeleteAdoption } from "../../hook/huyHook"
import { useNavigate } from "react-router-dom"
import axios from "axios"

export default function Adoptions() {
  const navigate = useNavigate()

  const { data: orders = [], isLoading, refetch } = useListAdoption({
    resource: "adoptions"
  })

  const { mutate: deleteOrder } = useDeleteAdoption({
    resource: "adoptions"
  })

  // ✅ Update status
  const updateStatus = async (id: string, status: string) => {
    try {
      await axios.patch(`http://localhost:3000/adoptions/${id}`, {
        status
      })
      refetch()
    } catch (error) {
      console.error(error)
    }
  }

  if (isLoading) {
    return <div className="text-center py-20">Đang tải...</div>
  }

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
              <th className="p-4 text-left">Pet ID</th>
              <th className="p-4 text-left">SĐT</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Địa chỉ</th>
              <th className="p-4 text-left">Lý do</th>
              <th className="p-4 text-left">Trạng thái</th>
              <th className="p-4 text-left">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o: any) => (
              <tr key={o.id} className="border-t">

                <td className="p-4">{o.name}</td>
                <td className="p-4">{o.petId}</td>
                <td className="p-4">{o.phone}</td>
                <td className="p-4">{o.email}</td>
                <td className="p-4">{o.address}</td>
                <td className="p-4">{o.reason}</td>

                {/* ✅ STATUS */}
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-sm
                    ${o.status === "approved" && "bg-green-100 text-green-600"}
                    ${o.status === "rejected" && "bg-red-100 text-red-600"}
                    ${o.status === "submitted" && "bg-yellow-100 text-yellow-600"}
                  `}>
                    {o.status}
                  </span>
                </td>

                <td className="p-4 flex gap-2 flex-wrap">

                  {/* XEM PET */}
                  <button
                    onClick={() => navigate(`/admin/pet/${o.petId}`)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Xem thú cưng
                  </button>

                  {/* DUYỆT */}
                  <button
                    onClick={() => updateStatus(o.id, "approved")}
                    disabled={o.status === "approved"}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    Duyệt
                  </button>

                  {/* TỪ CHỐI */}
                  <button
                    onClick={() => updateStatus(o.id, "rejected")}
                    disabled={o.status === "rejected"}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 disabled:opacity-50"
                  >
                    Từ chối
                  </button>

                  {/* DELETE */}
                  <button
                    onClick={() => deleteOrder(o.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
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
  )
}