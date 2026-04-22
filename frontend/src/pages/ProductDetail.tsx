import { addToCart, getCartQuantityForProduct } from "../utils/cartStore"
import {
  MSG_OUT_OF_STOCK,
  MSG_STOCK_INSUFFICIENT,
  MSG_STOCK_INSUFFICIENT_WITH_MAX,
} from "../constants/productMessages"
import { adjustProductStockDelta } from "../utils/inventoryAdjust"
import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { getProductById as getProductByIdApi, listProducts as listProductsApi } from "../api/productApi"
import type { Product } from "../data/products"
import { Breadcrumb, Button, Divider, InputNumber, message, Spin, Tag } from "antd"
import {
  HomeOutlined,
  SafetyCertificateOutlined,
  ShoppingCartOutlined,
  TruckOutlined,
} from "@ant-design/icons"

function stockBadge(q: number) {
  if (q <= 0) return { text: "Hết hàng", color: "default" as const }
  if (q <= 5) return { text: `Chỉ còn ${q} sản phẩm`, color: "orange" as const }
  return { text: "Còn hàng", color: "green" as const }
}

export default function ProductDetail() {
  const { id } = useParams()

  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [quantityToAdd, setQuantityToAdd] = useState(1)
  const [cartBump, setCartBump] = useState(0)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const numericId = Number(id)
        if (!Number.isFinite(numericId)) {
          setProduct(null)
          return
        }
        const loaded = await getProductByIdApi(numericId)
        setProduct(loaded)
        setQuantityToAdd(1)

        try {
          const list = await listProductsApi()
          const all = Array.isArray(list?.data) ? list.data : []
          setRelated(all.filter((p) => p.id !== numericId).slice(0, 4))
        } catch {
          setRelated([])
        }
      } catch {
        setProduct(null)
        setRelated([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const inCartQty = useMemo(() => {
    void cartBump
    return product ? getCartQuantityForProduct(product.id) : 0
  }, [product, cartBump])

  const stockRemaining = product?.quantity ?? 0
  const maxCanAdd = product ? Math.max(0, stockRemaining) : 0
  const badge = product ? stockBadge(stockRemaining) : stockBadge(0)
  const cap = maxCanAdd > 0 ? maxCanAdd : 1

  const handleAddToCart = async () => {
    if (!product) return
    if (stockRemaining <= 0) {
      message.error(MSG_OUT_OF_STOCK)
      return
    }
    if (quantityToAdd > maxCanAdd) {
      message.error(MSG_STOCK_INSUFFICIENT_WITH_MAX(maxCanAdd))
      return
    }

    setAdding(true)
    try {
      try {
        await adjustProductStockDelta(product.id, -quantityToAdd)
      } catch (e) {
        const err = e as Error
        if (err.message === "INSUFFICIENT_STOCK") {
          message.error(MSG_STOCK_INSUFFICIENT)
        } else {
          message.error("Không thể cập nhật kho. Kiểm tra kết nối và thử lại.")
        }
        return
      }

      const res = addToCart(product, quantityToAdd, { skipStockCheck: true })
      if (!res.ok) {
        await adjustProductStockDelta(product.id, quantityToAdd).catch(() => {})
        message.error(res.error || MSG_STOCK_INSUFFICIENT)
        return
      }

      setProduct((p) => (p ? { ...p, quantity: p.quantity - quantityToAdd } : p))
      message.success("Đã thêm vào giỏ hàng.")
      setCartBump((n) => n + 1)
      setQuantityToAdd(1)
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-gradient-to-b from-[#F4F6FF] to-white">
        <Spin size="large" />
        <p className="text-gray-500">Đang tải sản phẩm…</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Không tìm thấy sản phẩm</h1>
        <p className="mt-2 text-gray-500">Có thể sản phẩm đã ngừng bán hoặc đường dẫn không đúng.</p>
        <Link
          to="/products"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-[#6272B6] px-8 py-3 font-semibold text-white shadow-lg shadow-[#6272B6]/30 transition hover:bg-[#5567a8]"
        >
          Quay lại cửa hàng
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F4F6FF] via-white to-[#FAFBFF] pb-28 md:pb-16">
      <div className="border-b border-[#E8ECFF] bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              {
                title: (
                  <Link to="/" className="text-gray-600 hover:text-[#6272B6]">
                    <HomeOutlined /> Trang chủ
                  </Link>
                ),
              },
              {
                title: (
                  <Link to="/products" className="text-gray-600 hover:text-[#6272B6]">
                    Sản phẩm
                  </Link>
                ),
              },
              { title: <span className="text-gray-900 line-clamp-1">{product.name}</span> },
            ]}
          />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14 lg:items-start">
          {/* Ảnh */}
          <div className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-3xl border border-[#E8ECFF] bg-white shadow-xl shadow-[#6272B6]/10 ring-1 ring-black/5">
              <div className="aspect-square bg-[#F4F6FF]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Thông tin */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Tag color={badge.color} className="m-0 px-3 py-0.5 text-sm font-medium">
                {badge.text}
              </Tag>
              <span className="text-xs text-gray-400">Mã SP: #{product.id}</span>
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-6 flex flex-wrap items-end gap-3">
              <span className="text-3xl font-bold text-[#6272B6] sm:text-4xl">
                {product.price.toLocaleString("vi-VN")}
                <span className="text-xl font-semibold">đ</span>
              </span>
              <span className="rounded-full bg-[#F4F6FF] px-3 py-1 text-xs font-medium text-[#6272B6]">
                Đã bao gồm VAT (demo)
              </span>
            </div>

            <Divider className="my-8" />

            <section className="rounded-2xl border border-[#E8ECFF] bg-[#FAFBFF] p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Mô tả sản phẩm
              </h2>
              <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-gray-700">
                {product.description || "Đang cập nhật mô tả."}
              </p>
            </section>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="flex gap-3 rounded-xl border border-[#E8ECFF] bg-white p-4 shadow-sm">
                <TruckOutlined className="text-xl text-[#6272B6]" />
                <div>
                  <p className="text-xs font-semibold text-gray-900">Giao hàng</p>
                  <p className="text-xs text-gray-500">Demo — liên hệ khi đặt</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-xl border border-[#E8ECFF] bg-white p-4 shadow-sm">
                <SafetyCertificateOutlined className="text-xl text-[#6272B6]" />
                <div>
                  <p className="text-xs font-semibold text-gray-900">Chất lượng</p>
                  <p className="text-xs text-gray-500">Hàng minh bạch nguồn</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-xl border border-[#E8ECFF] bg-white p-4 shadow-sm">
                <ShoppingCartOutlined className="text-xl text-[#6272B6]" />
                <div>
                  <p className="text-xs font-semibold text-gray-900">Giỏ hàng</p>
                  <p className="text-xs text-gray-500">Thanh toán an toàn</p>
                </div>
              </div>
            </div>

            <Divider className="my-8" />

            <div className="rounded-2xl border border-[#E8ECFF] bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-700">Số lượng</p>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <InputNumber
                  size="large"
                  min={1}
                  max={cap}
                  value={Math.min(quantityToAdd, cap)}
                  onChange={(v) => {
                    const n = typeof v === "number" ? v : 1
                    setQuantityToAdd(Math.min(Math.max(1, n), cap))
                  }}
                  disabled={product.quantity <= 0 || maxCanAdd <= 0}
                  className="!min-w-[120px]"
                />
                <div className="text-sm text-gray-600">
                  <span className="block">
                    Kho khả dụng:{" "}
                    <strong className="text-[#6272B6]">{stockRemaining}</strong> sản phẩm
                  </span>
                  <span className="block text-gray-500">
                    Trong giỏ của bạn: <strong>{inCartQty}</strong>
                  </span>
                </div>
              </div>

              <Button
                type="primary"
                size="large"
                block
                loading={adding}
                icon={<ShoppingCartOutlined />}
                onClick={() => void handleAddToCart()}
                disabled={product.quantity <= 0 || maxCanAdd <= 0}
                className="mt-6 !h-12 !rounded-xl !bg-[#6272B6] !font-semibold hover:!bg-[#5567a8]"
              >
                {maxCanAdd <= 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
              </Button>
              <p className="mt-3 text-center text-xs text-gray-400">
                Nếu chọn quá số lượng trong kho, hệ thống sẽ báo:{" "}
                <span className="font-medium text-gray-600">«{MSG_STOCK_INSUFFICIENT}»</span>
              </p>
            </div>
          </div>
        </div>

        {/* Sản phẩm liên quan */}
        {related.length > 0 && (
          <section className="mt-16 border-t border-[#E8ECFF] pt-14">
            <h2 className="text-xl font-bold text-gray-900">Có thể bạn cũng thích</h2>
            <p className="mt-1 text-sm text-gray-500">Gợi ý thêm từ cửa hàng</p>
            <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {related.map((p) => {
                const b = stockBadge(p.quantity)
                return (
                  <li key={p.id}>
                    <Link
                      to={`/products/${p.id}`}
                      className="group block overflow-hidden rounded-2xl border border-[#E8ECFF] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="aspect-square overflow-hidden bg-[#F4F6FF]">
                        <img
                          src={p.image}
                          alt=""
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                      </div>
                      <div className="p-3">
                        <p className="line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-[#6272B6]">
                          {p.name}
                        </p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="font-bold text-[#6272B6]">
                            {p.price.toLocaleString("vi-VN")}đ
                          </span>
                          <Tag color={b.color} className="m-0 text-[10px]">
                            {b.text}
                          </Tag>
                        </div>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        )}
      </div>

      {/* Thanh CTA cố định mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#E8ECFF] bg-white/95 p-4 shadow-[0_-8px_30px_rgba(98,114,182,0.12)] backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">{product.name}</p>
            <p className="text-lg font-bold text-[#6272B6]">
              {product.price.toLocaleString("vi-VN")}đ
            </p>
          </div>
          <Button
            type="primary"
            size="large"
            loading={adding}
            disabled={product.quantity <= 0 || maxCanAdd <= 0}
            icon={<ShoppingCartOutlined />}
            onClick={() => void handleAddToCart()}
            className="!h-11 !rounded-xl !bg-[#6272B6] !px-5 !font-semibold shrink-0"
          >
            Thêm
          </Button>
        </div>
      </div>
    </div>
  )
}
