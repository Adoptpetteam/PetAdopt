import { useEffect, useState } from "react"

export default function Adoptions() {
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("orders") || "[]")
    setOrders(data)
  }, [])

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
            </tr>
          </thead>

          <tbody>
            {orders.map((o, index) => (
              <tr key={index} className="border-t">
                <td className="p-4">{o.name}</td>
                <td className="p-4">{o.petName}</td>
                <td className="p-4">{o.phone}</td>
                <td className="p-4">
                  <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-600">
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  )
}