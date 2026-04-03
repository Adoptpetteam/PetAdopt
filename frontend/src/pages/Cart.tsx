import { useEffect, useMemo, useState } from "react"
import { Button, Checkbox, InputNumber, Modal, message } from "antd"
import { Link, useNavigate } from "react-router-dom"
import type { CheckoutLocationState } from "../types/checkout"
import {
  calculateCartTotal,
  loadCartItems,
  removeCartItemsByProductIds,
  removeFromCart,
  setCartItemQuantity,
  type CartItem,
} from "../utils/cartStore"
import { MSG_STOCK_INSUFFICIENT_WITH_MAX } from "../constants/productMessages"
import { adjustProductStockDelta } from "../utils/inventoryAdjust"
import { getStockMap } from "../utils/stockInventory"

export default function Cart() {
  const navigate = useNavigate()
  const [refreshTick, setRefreshTick] = useState(0)
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([])
  const [stockById, setStockById] = useState<Map<number, number>>(() => new Map())

  const items = useMemo(() => {
    // Re-read from localStorage to keep source of truth.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    void refreshTick
    return loadCartItems()
  }, [refreshTick])

  const subtotal = useMemo(() => calculateCartTotal(items), [items])
  const selectedItems = useMemo(
    () => items.filter((i) => selectedProductIds.includes(i.productId)),
    [items, selectedProductIds]
  )
  const subtotalSelected = useMemo(() => calculateCartTotal(selectedItems), [selectedItems])
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0)

  const allIds = useMemo(() => items.map((i) => i.productId), [items])
  const allSelected = allIds.length > 0 && selectedProductIds.length === allIds.length

  const productIdsKey = useMemo(() => {
    const s = new Set(items.map((i) => i.productId))
    return [...s].sort((a, b) => a - b).join(",")
  }, [items])

  useEffect(() => {
    const ids = items.map((i) => i.productId)
    setSelectedProductIds((prev) => {
      const inCart = new Set(ids)
      const kept = prev.filter((id) => inCart.has(id))
      let next = [...kept]
      for (const id of ids) {
        if (!next.includes(id)) next = [...next, id]
      }
      return next
    })
  }, [productIdsKey])

  useEffect(() => {
    let cancelled = false
    getStockMap().then((m) => {
      if (!cancelled) setStockById(m)
    })
    return () => {
      cancelled = true
    }
  }, [refreshTick, productIdsKey])

  async function handleRemove(productId: number) {
    const line = items.find((x) => x.productId === productId)
    if (!line) return
    try {
      await adjustProductStockDelta(productId, line.quantity)
    } catch {
      message.error("Không thể hoàn lại kho. Thử lại.")
      return
    }
    removeFromCart(productId)
    setRefreshTick((t) => t + 1)
  }

  async function handleQtyChange(productId: number, nextQty: number | null) {
    const q = typeof nextQty === "number" ? nextQty : 1
    const line = items.find((x) => x.productId === productId)
    if (!line) return
    const dbUnallocated = stockById.get(productId)
    const maxAllowed = dbUnallocated === undefined ? undefined : line.quantity + dbUnallocated
    if (maxAllowed !== undefined && q > maxAllowed) {
      message.error(MSG_STOCK_INSUFFICIENT_WITH_MAX(maxAllowed))
      return
    }
    const cartDelta = q - line.quantity
    if (cartDelta === 0) return
    try {
      await adjustProductStockDelta(productId, -cartDelta)
    } catch {
      message.error("Không thể cập nhật kho. Thử lại.")
      return
    }
    setCartItemQuantity(productId, q)
    setRefreshTick((t) => t + 1)
  }

  function toggleProduct(id: number) {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function toggleSelectAll(checked: boolean) {
    setSelectedProductIds(checked ? [...allIds] : [])
  }

  function goCheckout() {
    if (selectedProductIds.length === 0) return
    navigate("/checkout", {
      state: { checkoutProductIds: selectedProductIds } satisfies CheckoutLocationState,
    })
  }

  function removeSelectedFromCart() {
    if (selectedProductIds.length === 0) return
    const count = selectedProductIds.length
    Modal.confirm({
      title: "Xóa sản phẩm đã chọn?",
      content: `Bạn sắp xóa ${count} mặt hàng khỏi giỏ hàng. Thao tác này không thể hoàn tác.`,
      okText: "Xóa khỏi giỏ",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        for (const id of selectedProductIds) {
          const line = items.find((x) => x.productId === id)
          if (line) {
            try {
              await adjustProductStockDelta(id, line.quantity)
            } catch {
              message.error("Không thể hoàn lại kho. Thử lại.")
              return
            }
          }
        }
        removeCartItemsByProductIds(selectedProductIds)
        setSelectedProductIds([])
        setRefreshTick((t) => t + 1)
      },
    })
  }

  return (
    <div className="max-w-[1100px] mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold text-[#6272B6] mb-6 text-center">Giỏ hàng</h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-600 mb-6">Giỏ hàng hiện đang trống.</p>
          <Link
            to="/products"
            className="inline-block bg-[#6272B6] text-white px-8 py-3 rounded-full"
          >
            Xem sản phẩm
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-3">
              <Checkbox checked={allSelected} indeterminate={selectedProductIds.length > 0 && !allSelected} onChange={(e) => toggleSelectAll(e.target.checked)}>
                Chọn tất cả
              </Checkbox>
              <Button danger type="default" disabled={selectedProductIds.length === 0} onClick={removeSelectedFromCart}>
                Xóa đã chọn
              </Button>
              <p className="text-gray-600">{cartCount} sản phẩm trong giỏ</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Tổng giỏ: {subtotal.toLocaleString("vi-VN")}đ</p>
              <p className="font-semibold text-[#6272B6]">
                Đã chọn thanh toán: {subtotalSelected.toLocaleString("vi-VN")}đ
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {items.map((i: CartItem) => (
              <div
                key={i.productId}
                className="flex items-center gap-4 border rounded-xl p-4"
              >
                <Checkbox
                  checked={selectedProductIds.includes(i.productId)}
                  onChange={() => toggleProduct(i.productId)}
                  aria-label={`Chọn ${i.name}`}
                />
                <img
                  src={i.image}
                  alt={i.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="font-semibold">{i.name}</p>
                  <p className="text-gray-600">
                    {i.price.toLocaleString("vi-VN")}đ
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <span className="text-gray-600">Số lượng</span>
                    <InputNumber
                      min={1}
                      max={
                        stockById.has(i.productId)
                          ? i.quantity + stockById.get(i.productId)!
                          : undefined
                      }
                      value={i.quantity}
                      onChange={(v) => void handleQtyChange(i.productId, v)}
                    />
                    <span className="font-medium">
                      = {(i.price * i.quantity).toLocaleString("vi-VN")}đ
                    </span>
                    {stockById.has(i.productId) && (
                      <span className="text-sm text-gray-500">
                        Kho chưa gán: {stockById.get(i.productId)}
                      </span>
                    )}
                  </div>
                </div>
                <Button danger onClick={() => void handleRemove(i.productId)}>
                  Xóa
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-4 items-center">
            <Link
              to="/products"
              className="inline-block bg-gray-100 text-gray-800 px-6 py-3 rounded-full"
            >
              Tiếp tục mua
            </Link>
            <Button
              type="primary"
              size="large"
              disabled={selectedProductIds.length === 0}
              onClick={goCheckout}
              className="!bg-[#6272B6] !h-auto !px-8 !py-3 !rounded-full"
            >
              Thanh toán ({selectedProductIds.length} sản phẩm)
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

