import { Link, useSearchParams } from "react-router-dom"
import { Button } from "antd"

export default function OrderSuccess() {
  const [params] = useSearchParams()
  const orderId = params.get("orderId") || ""

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-4xl font-bold text-green-500 mb-6">Thanh toán thành công!</h1>
      <p className="text-gray-700 mb-10">
        orderId: <span className="font-semibold">{orderId}</span>
      </p>
      <div className="flex gap-4">
        <Link to="/products">
          <Button type="primary">Tiếp tục mua</Button>
        </Link>
        <Link to="/orders">
          <Button>Về đơn hàng</Button>
        </Link>
      </div>
    </div>
  )
}

