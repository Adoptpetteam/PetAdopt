import { useEffect, useMemo, useState } from "react"
import { Button } from "antd"
import { Link } from "react-router-dom"
import { listMyOrders, type ProductOrderResponse } from "../api/orderApi"
import { message } from "antd"
import { useNavigate } from "react-router-dom"

export default function Orders() {
  const [orders, setOrders] = useState<ProductOrderResponse[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      try {
        const res = await listMyOrders()
        setOrders(res.data)
      } catch (e: any) {
        message.error(e?.response?.data?.message || "Không thể tải đơn hàng.")
        navigate("/login")
      }
    }
    load()
  }, [])

  const totalPaid = useMemo(() => orders.length, [orders])

  return (
    <div className="max-w-[1100px] mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold text-[#6272B6] mb-6 text-center">
        Đơn đã thanh toán
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          Chưa có đơn nào.
          <div className="mt-6">
            <Link to="/products">
              <Button type="primary">Xem sản phẩm</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-600 mb-4">{totalPaid} đơn</p>
          <div className="space-y-4">
            {orders.map((o) => (
              <div key={o.id} className="border rounded-xl p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">orderId: {o.id}</p>
                    <p className="text-gray-600">
                      {new Date(o.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {o.totals.total.toLocaleString("vi-VN")}đ
                    </p>
                    <p className="text-gray-600">phương thức: {o.paymentMethod}</p>
                  </div>
                </div>

                <div className="mt-3 text-gray-700">
                  {o.items.map((i) => (
                    <div key={i.productId} className="flex items-center justify-between">
                      <span>
                        {i.name} (x{i.quantity})
                      </span>
                      <span>
                        {(i.price * i.quantity).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

