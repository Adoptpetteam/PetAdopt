import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Empty, Spin, Tag } from "antd"
import { ShoppingOutlined } from "@ant-design/icons"
import { listProducts as listProductsApi } from "../api/productApi"
import type { Product } from "../data/products"

function stockLabel(q: number) {
  if (q <= 0) return { text: "Hết hàng", color: "default" as const }
  if (q <= 5) return { text: `Chỉ còn ${q}`, color: "orange" as const }
  return { text: "Còn hàng", color: "green" as const }
}

export default function Products() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const res = await listProductsApi()
        setProducts(Array.isArray(res?.data) ? res.data : [])
      } catch {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const sorted = useMemo(
    () => [...products].sort((a, b) => a.id - b.id),
    [products]
  )

  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-[#F4F6FF] via-white to-[#FAFBFF]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#E8ECFF] bg-gradient-to-r from-[#6272B6] via-[#6d7ebe] to-[#5567a8] text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/80">
            T1 Pet Adopt · Cửa hàng
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Sản phẩm cho thú cưng
          </h1>
          <p className="mt-4 max-w-2xl text-base text-white/90 leading-relaxed">
            Thức ăn, phụ kiện và đồ dùng được chọn lọc — giao diện mua sắm rõ ràng, kiểm tra tồn kho minh
            bạch.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/cart"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#6272B6] shadow-lg shadow-black/10 transition hover:bg-[#F4F6FF]"
            >
              <ShoppingOutlined />
              Xem giỏ hàng
            </Link>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 400, behavior: "smooth" })}
              className="rounded-full border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-medium backdrop-blur transition hover:bg-white/20"
            >
              Khám phá danh mục
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-2xl border border-[#E8ECFF] bg-white/80 py-20 shadow-sm">
            <Spin size="large" />
            <p className="text-gray-500">Đang tải sản phẩm…</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#6272B6]/30 bg-white py-16 shadow-sm">
            <Empty
              description="Chưa có sản phẩm nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Link
                to="/"
                className="text-[#6272B6] font-medium hover:underline"
              >
                Về trang chủ
              </Link>
            </Empty>
          </div>
        ) : (
          <>
            <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Tất cả sản phẩm</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {sorted.length} sản phẩm · Bấm vào thẻ để xem chi tiết
                </p>
              </div>
            </div>

            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sorted.map((p) => {
                const stock = stockLabel(p.quantity)
                return (
                  <li key={p.id}>
                    <article
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/products/${p.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          navigate(`/products/${p.id}`)
                        }
                      }}
                      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#E8ECFF] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#6272B6]/35 hover:shadow-xl hover:shadow-[#6272B6]/10"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-[#F4F6FF]">
                        <img
                          src={p.image}
                          alt=""
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute left-3 top-3">
                          <Tag color={stock.color} className="m-0 border-0 font-medium shadow-sm">
                            {stock.text}
                          </Tag>
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="line-clamp-2 min-h-[3rem] text-base font-semibold text-gray-900 group-hover:text-[#6272B6]">
                          {p.name}
                        </h3>
                        <p className="mt-2 line-clamp-2 flex-1 text-sm text-gray-500">
                          {p.description || "—"}
                        </p>
                        <div className="mt-4 flex items-baseline justify-between border-t border-[#F0F2FA] pt-4">
                          <span className="text-lg font-bold text-[#6272B6]">
                            {p.price.toLocaleString("vi-VN")}đ
                          </span>
                          <span className="text-xs font-medium text-[#6272B6] opacity-0 transition group-hover:opacity-100">
                            Xem chi tiết →
                          </span>
                        </div>
                      </div>
                    </article>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
