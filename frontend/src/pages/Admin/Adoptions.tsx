import { useListAdoption, useDeleteAdoption } from "../../hook/huyHook"
import { useNavigate } from "react-router-dom"

export default function Adoptions() {
  const navigate = useNavigate()

  const { data: orders = [], isLoading } = useListAdoption({
    resource: "adoptions"
  })

  const { mutate: deleteOrder } = useDeleteAdoption({
    resource: "adoptions"
  })

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
              <th className="p-4 text-left">Quyên góp</th>
              <th className="p-4 text-left">Chứng nhận</th>
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

                <td className="p-4">
                  {o.donationType === "monthly"
                    ? "Hàng tháng"
                    : "Cả năm"}
                </td>

                <td className="p-4">
                  {o.certificateType === "digital"
                    ? "Điện tử"
                    : "Bản cứng"}
                </td>

                <td className="p-4">
                  <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-600 ">
                    {o.status}
                  </span>
                </td>

                <td className="p-4 flex gap-2">

                  {/* XEM PET */}
                  <button
                    onClick={() => navigate(`/admin/pet/${o.petId}`)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Xem thú cưng
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