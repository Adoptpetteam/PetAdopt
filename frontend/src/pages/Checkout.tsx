import { useMemo, useState } from "react"
import { Button, Input, Radio, message } from "antd"
import { Link, useLocation, useNavigate } from "react-router-dom"
import type { CheckoutLocationState } from "../types/checkout"
import {
  calculateCartTotal,
  loadCartItems,
  removeCartItemsByProductIds,
} from "../utils/cartStore"
import { getPreferredPaymentMethod, setPreferredPaymentMethod } from "../utils/checkoutPrefs"

import { checkoutOrder, type PaymentMethod } from "../api/orderApi"

export default function Checkout() {
  const navigate = useNavigate()
  const location = useLocation()

  const items = useMemo(() => {
    const all = loadCartItems()
    const state = location.state as CheckoutLocationState | null
    const ids = state?.checkoutProductIds
    if (!ids?.length) return all
    const allow = new Set(ids)
    return all.filter((i) => allow.has(i.productId))
  }, [location.key, location.state])

  const subtotal = calculateCartTotal(items)

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(() => getPreferredPaymentMethod())
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    reason: "",
  })
  const [loading, setLoading] = useState(false)

  const cartNonEmpty = loadCartItems().length > 0

  if (items.length === 0) {
    return (
      <div className="max-w-[1100px] mx-auto py-20 px-6 text-center text-gray-600">
        {cartNonEmpty ? (
          <>
            <p>Không có sản phẩm nào được chọn để thanh toán.</p>
            <p className="mt-2 text-sm">Vui lòng quay lại giỏ hàng và chọn ít nhất một sản phẩm.</p>
            <div className="mt-6">
              <Link to="/cart">
                <Button type="primary">Về giỏ hàng</Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <p>Giỏ hàng trống. Vui lòng quay lại trang sản phẩm.</p>
            <div className="mt-6">
              <Button type="primary" onClick={() => navigate("/products")}>
                Xem sản phẩm
              </Button>
            </div>
          </>
        )}
      </div>
    )
  }

  async function handlePay() {
    const name = customer.name.trim()
    const phoneDigits = customer.phone.replace(/[^\d]/g, "")
    const address = customer.address.trim()
    const reason = customer.reason.trim()

    if (!name) return message.error("Vui lòng nhập họ và tên.")
    if (phoneDigits.length < 8) return message.error("Vui lòng nhập số điện thoại hợp lệ.")
    if (!address) return message.error("Vui lòng nhập địa chỉ.")
    if (!reason) return message.error("Vui lòng nhập lý do/ghi chú.")

    setLoading(true)
    try {
      const res = await checkoutOrder({
        paymentMethod,
        customer: {
          name,
          phone: phoneDigits,
          address,
          reason,
        },
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      })

      removeCartItemsByProductIds(items.map((i) => i.productId))
      navigate(`/orders/success?orderId=${encodeURIComponent(res.data.id)}`)
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Thanh toán thất bại.")
      if (e?.response?.status === 401) navigate("/login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-[1100px] mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold text-[#6272B6] mb-6 text-center">Thanh toán</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-semibold text-xl mb-4">Đơn hàng</h2>
          <div className="space-y-3">
            {items.map((i) => (
              <div key={i.productId} className="flex items-center gap-3">
                <img src={i.image} alt={i.name} className="w-16 h-16 object-cover rounded-lg" />
                <div className="flex-1">
                  <p className="font-medium">{i.name}</p>
                  <p className="text-gray-600">
                    {i.price.toLocaleString("vi-VN")}đ x {i.quantity} ={" "}
                    {(i.price * i.quantity).toLocaleString("vi-VN")}đ
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-between font-semibold">
            <span>Tổng</span>
            <span>{subtotal.toLocaleString("vi-VN")}đ</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-semibold text-xl mb-4">Thông tin thanh toán</h2>

          <div className="mb-4">
            <p className="mb-2 text-gray-700 font-medium">Phương thức thanh toán</p>
            <Radio.Group
              value={paymentMethod}
              onChange={(e) => {
                const m = e.target.value as PaymentMethod
                setPaymentMethod(m)
                setPreferredPaymentMethod(m)
              }}
            >
              <Radio value="momo">MoMo</Radio>
              <Radio value="zalopay">ZaloPay</Radio>
            </Radio.Group>
          </div>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-gray-700 font-medium">Họ và tên</p>
              <Input
                value={customer.name}
                onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))}
                placeholder="Nhập họ và tên"
              />
            </div>

            <div>
              <p className="mb-2 text-gray-700 font-medium">Số điện thoại</p>
              <Input
                value={customer.phone}
                onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))}
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div>
              <p className="mb-2 text-gray-700 font-medium">Địa chỉ</p>
              <Input
                value={customer.address}
                onChange={(e) => setCustomer((c) => ({ ...c, address: e.target.value }))}
                placeholder="Nhập địa chỉ nhận hàng"
              />
            </div>

            <div>
              <p className="mb-2 text-gray-700 font-medium">Lý do/ghi chú</p>
              <Input
                value={customer.reason}
                onChange={(e) => setCustomer((c) => ({ ...c, reason: e.target.value }))}
                placeholder="Ví dụ: Nhận hàng giờ hành chính"
              />
            </div>
          </div>

          <Button
            type="primary"
            onClick={handlePay}
            loading={loading}
            className="w-full mt-6"
          >
            Xác nhận thanh toán
          </Button>
        </div>
      </div>
    </div>
  )
}

