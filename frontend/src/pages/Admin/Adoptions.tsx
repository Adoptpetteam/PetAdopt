import { useListAdoption, useDeleteAdoption } from "../../hook/huyHook"
import { useNavigate } from "react-router-dom"
import axios from "axios"

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

  const { data: orders = [], isLoading, refetch } = useListAdoption({
    resource: "adoptions"
  })

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

  // Sửa Update status
const updateStatus = async (id: string, status: string, petId: string) => {
  try {
    // update adoption
    await axios.patch(`http://localhost:3000/adoptions/${id}`, {
      status
    })

    // ✅ nếu duyệt → update pet
    if (status === "approved") {
      await axios.patch(`http://localhost:3000/pets/${petId}`, {
        status: "Đã nhận"
      })
    }

    refetch()
  } catch (error) {
    console.error(error)
  }
}

const sendEmail = async (o: any) => {
  try {
    await axios.post("http://localhost:3000/send-email", {
      email: o.email,
      name: o.name,
      petId: o.petId
    })

    alert("Đã gửi mail thành công!")
  } catch (error) {
    console.error(error)
    alert("Gửi mail thất bại!")
  }
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
                    onClick={() => updateStatus(o.id, "approved", o.petId)}
                    disabled={o.status === "approved"}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    Duyệt
                  </button>

                  {/* TỪ CHỐI */}
                  <button
                    onClick={() => updateStatus(o.id, "rejected", o.petId)}
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

                    {/* Gửi gmail */}
                  <button
                  onClick={() => sendEmail(o)}
                  disabled={o.status !== "approved"}
                  className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600 disabled:opacity-50"
                >
                  Gửi mail
                </button>

                </td>

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