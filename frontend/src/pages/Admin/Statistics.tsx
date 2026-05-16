import { useEffect, useState } from "react";
import {
  getOrderOverview,
  getRevenueByTime,
  getTopProducts,
  getInventory,
  type OverviewResponse,
  type RevenueByTimeItem,
  type TopProduct,
  type InventoryResponse,
} from "../../api/statisticsApi";
import dayjs from "dayjs";

// ─── helpers ────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const fmtNum = (n: number) =>
  new Intl.NumberFormat("vi-VN").format(n);

// ─── StatCard ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  color = "#6272B6",
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
        style={{ background: color + "20" }}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold mt-0.5" style={{ color }}>
          {value}
        </p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function Statistics() {
  const [period, setPeriod] = useState<"day" | "week" | "month">("day");
  const [dateRange, setDateRange] = useState({
    startDate: dayjs().subtract(30, "day").format("YYYY-MM-DD"),
    endDate: dayjs().format("YYYY-MM-DD"),
  });

  const [overview, setOverview] = useState<OverviewResponse["data"] | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueByTimeItem[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [inventory, setInventory] = useState<InventoryResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"revenue" | "inventory">("revenue");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchAll();
  }, [period, dateRange]);

  // Auto-refresh mỗi 30 giây
  useEffect(() => {
    const timer = setInterval(() => fetchAll(), 30000);
    return () => clearInterval(timer);
  }, [period, dateRange]);

  async function fetchAll() {
    setLoading(true);
    try {
      const [ov, rv, tp, inv] = await Promise.all([
        getOrderOverview(dateRange),
        getRevenueByTime({ period, ...dateRange }),
        getTopProducts({ limit: 10, ...dateRange }),
        getInventory({ lowStockThreshold: 10 }),
      ]);
      setOverview(ov.data);
      setRevenueData(rv.data);
      setTopProducts(tp.data);
      setInventory(inv.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Statistics fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  // Format label trục X cho biểu đồ
  function formatLabel(item: RevenueByTimeItem) {
    const { year, month, day, week } = item._id;
    if (period === "day") return `${day}/${month}`;
    if (period === "week") return `T${week}/${year}`;
    if (period === "month") return `${month}/${year}`;
    return `${year}`;
  }

  // Tính max để vẽ bar chart đơn giản
  const maxRevenue = Math.max(...revenueData.map((d) => d.totalRevenue), 1);

  const tabClass = (t: string) =>
    `px-5 py-2 rounded-lg font-medium text-sm transition-all ${
      activeTab === t
        ? "bg-[#6272B6] text-white shadow"
        : "bg-white text-gray-600 hover:bg-gray-100"
    }`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6272B6] to-purple-600 flex items-center gap-2">Thống kê</h1>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-gray-400">
              Cập nhật lúc: {lastUpdated.toLocaleTimeString("vi-VN")}
            </span>
          )}
          <button
            onClick={fetchAll}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 hover:border-[#6272B6] hover:text-[#6272B6] transition-all disabled:opacity-50"
          >
            <span className={loading ? "animate-spin" : ""}>🔄</span>
            Làm mới
          </button>
        </div>
      </div>

      {/* ── Bộ lọc thời gian ── */}
      <div className="bg-white rounded-xl shadow p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Từ:</label>
          <input
            type="date"
            value={dateRange.startDate}
            max={dateRange.endDate}
            onChange={(e) =>
              setDateRange((d) => ({ ...d, startDate: e.target.value }))
            }
            className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6272B6]"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Đến:</label>
          <input
            type="date"
            value={dateRange.endDate}
            min={dateRange.startDate}
            max={dayjs().format("YYYY-MM-DD")}
            onChange={(e) =>
              setDateRange((d) => ({ ...d, endDate: e.target.value }))
            }
            className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6272B6]"
          />
        </div>
        <div className="flex gap-2 ml-auto">
          {(["day", "week", "month"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                period === p
                  ? "bg-[#6272B6] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {p === "day" ? "Ngày" : p === "week" ? "Tuần" : "Tháng"}
            </button>
          ))}
        </div>
        {/* Shortcuts */}
        <div className="flex gap-2">
          {[
            { label: "7 ngày", days: 7 },
            { label: "30 ngày", days: 30 },
            { label: "90 ngày", days: 90 },
          ].map(({ label, days }) => (
            <button
              key={days}
              onClick={() =>
                setDateRange({
                  startDate: dayjs().subtract(days, "day").format("YYYY-MM-DD"),
                  endDate: dayjs().format("YYYY-MM-DD"),
                })
              }
              className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 text-lg">
          Đang tải dữ liệu...
        </div>
      ) : (
        <>
          {/* ── Tổng quan ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon="📦"
              label="Tổng đơn hàng"
              value={fmtNum(overview?.totalOrders ?? 0)}
              color="#6272B6"
            />
            <StatCard
              icon="💰"
              label="Doanh thu"
              value={fmt(overview?.totalRevenue ?? 0)}
              color="#10b981"
            />
            <StatCard
              icon="🧾"
              label="Giá trị TB/đơn"
              value={fmt(overview?.avgOrderValue ?? 0)}
              color="#f59e0b"
            />
            <StatCard
              icon="✅"
              label="Đơn đã thanh toán"
              value={fmtNum(overview?.ordersByStatus?.paid?.count ?? 0)}
              sub={`Doanh thu: ${fmt(overview?.ordersByStatus?.paid?.revenue ?? 0)}`}
              color="#3b82f6"
            />
          </div>

          {/* ── Trạng thái đơn hàng ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { key: "pending", label: "Chờ xử lý", color: "#f59e0b", icon: "⏳" },
              { key: "shipping", label: "Đang giao", color: "#3b82f6", icon: "🚚" },
              { key: "completed", label: "Hoàn thành", color: "#10b981", icon: "🎉" },
              { key: "cancelled", label: "Đã hủy", color: "#ef4444", icon: "❌" },
            ].map(({ key, label, color, icon }) => (
              <StatCard
                key={key}
                icon={icon}
                label={label}
                value={fmtNum(overview?.ordersByStatus?.[key]?.count ?? 0)}
                color={color}
              />
            ))}
          </div>

          {/* ── Tabs ── */}
          <div className="flex gap-3">
            <button className={tabClass("revenue")} onClick={() => setActiveTab("revenue")}>
              📈 Doanh thu & Sản phẩm
            </button>
            <button className={tabClass("inventory")} onClick={() => setActiveTab("inventory")}>
              🏪 Tồn kho
            </button>
          </div>

          {activeTab === "revenue" && (
            <>
              {/* ── Biểu đồ doanh thu ── */}
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                  Doanh thu theo{" "}
                  {period === "day" ? "ngày" : period === "week" ? "tuần" : "tháng"}
                </h2>
                {revenueData.length === 0 ? (
                  <p className="text-gray-400 text-center py-10">Không có dữ liệu</p>
                ) : (
                  <div className="overflow-x-auto">
                    <div
                      className="flex items-end gap-1 min-w-max"
                      style={{ height: 200 }}
                    >
                      {revenueData.map((item, i) => {
                        const h = Math.max(
                          4,
                          Math.round((item.totalRevenue / maxRevenue) * 180)
                        );
                        return (
                          <div
                            key={i}
                            className="flex flex-col items-center gap-1 group"
                            style={{ minWidth: 36 }}
                          >
                            {/* Tooltip */}
                            <div className="hidden group-hover:block absolute -translate-y-full bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                              {fmt(item.totalRevenue)}
                              <br />
                              {item.orderCount} đơn
                            </div>
                            <div
                              className="w-7 rounded-t-md bg-[#6272B6] hover:bg-[#4f5fa0] transition-all cursor-pointer relative"
                              style={{ height: h }}
                              title={`${fmt(item.totalRevenue)} | ${item.orderCount} đơn`}
                            />
                            <span className="text-xs text-gray-500 rotate-45 origin-left mt-1">
                              {formatLabel(item)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Top sản phẩm bán chạy ── */}
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                  Top 10 sản phẩm bán chạy
                </h2>
                {topProducts.length === 0 ? (
                  <p className="text-gray-400 text-center py-10">Không có dữ liệu</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500 border-b">
                          <th className="pb-3 pr-4">#</th>
                          <th className="pb-3 pr-4">Sản phẩm</th>
                          <th className="pb-3 pr-4 text-right">Đã bán</th>
                          <th className="pb-3 pr-4 text-right">Doanh thu</th>
                          <th className="pb-3 text-right">Số đơn</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topProducts.map((p, i) => (
                          <tr key={p._id} className="border-b last:border-0 hover:bg-gray-50">
                            <td className="py-3 pr-4 text-gray-400 font-bold">{i + 1}</td>
                            <td className="py-3 pr-4">
                              <div className="flex items-center gap-3">
                                {p.productImage && (
                                  <img
                                    src={
                                      p.productImage.startsWith("http")
                                        ? p.productImage
                                        : `http://localhost:5000${p.productImage}`
                                    }
                                    alt={p.productName}
                                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                    onError={(e) =>
                                      ((e.target as HTMLImageElement).style.display = "none")
                                    }
                                  />
                                )}
                                <span className="font-medium text-gray-700">
                                  {p.productName}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 pr-4 text-right font-semibold text-[#6272B6]">
                              {fmtNum(p.totalQuantity)}
                            </td>
                            <td className="py-3 pr-4 text-right text-green-600 font-semibold">
                              {fmt(p.totalRevenue)}
                            </td>
                            <td className="py-3 text-right text-gray-500">
                              {fmtNum(p.orderCount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* ── Phương thức thanh toán ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Phương thức thanh toán
                  </h2>
                  <div className="space-y-3">
                    {[
                      { key: "cod", label: "💵 COD (Tiền mặt)", color: "#f59e0b" },
                      { key: "vnpay", label: "💳 VNPay", color: "#3b82f6" },
                    ].map(({ key, label, color }) => {
                      const count = overview?.paymentMethods?.[key]?.count ?? 0;
                      const revenue = overview?.paymentMethods?.[key]?.revenue ?? 0;
                      const total = overview?.totalOrders ?? 1;
                      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                      return (
                        <div key={key}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">{label}</span>
                            <span className="text-gray-500">
                              {fmtNum(count)} đơn ({pct}%) — {fmt(revenue)}
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${pct}%`, background: color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "inventory" && inventory && (
            <>
              {/* ── Tổng quan tồn kho ── */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                  icon="📦"
                  label="Tổng sản phẩm"
                  value={fmtNum(inventory.summary.totalProducts)}
                  color="#6272B6"
                />
                <StatCard
                  icon="💎"
                  label="Giá trị tồn kho"
                  value={fmt(inventory.summary.totalInventoryValue)}
                  color="#10b981"
                />
                <StatCard
                  icon="✅"
                  label="Còn hàng"
                  value={fmtNum(inventory.summary.inStockCount)}
                  color="#3b82f6"
                />
                <StatCard
                  icon="⚠️"
                  label="Sắp hết (≤10)"
                  value={fmtNum(inventory.summary.lowStockCount)}
                  color="#f59e0b"
                />
                <StatCard
                  icon="❌"
                  label="Hết hàng"
                  value={fmtNum(inventory.summary.outOfStockCount)}
                  color="#ef4444"
                />
              </div>

              {/* ── Hết hàng ── */}
              {inventory.outOfStock.length > 0 && (
                <div className="bg-white rounded-xl shadow p-6">
                  <h2 className="text-lg font-semibold text-red-500 mb-4">
                    ❌ Sản phẩm hết hàng ({inventory.outOfStock.length})
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500 border-b">
                          <th className="pb-3 pr-4">Sản phẩm</th>
                          <th className="pb-3 pr-4">Danh mục</th>
                          <th className="pb-3 text-right">Giá</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventory.outOfStock.map((p) => (
                          <tr key={p._id} className="border-b last:border-0 hover:bg-red-50">
                            <td className="py-3 pr-4">
                              <div className="flex items-center gap-3">
                                {p.image && (
                                  <img
                                    src={
                                      p.image.startsWith("http")
                                        ? p.image
                                        : `http://localhost:5000${p.image}`
                                    }
                                    alt={p.name}
                                    className="w-10 h-10 rounded-lg object-cover"
                                    onError={(e) =>
                                      ((e.target as HTMLImageElement).style.display = "none")
                                    }
                                  />
                                )}
                                <span className="font-medium text-gray-700">{p.name}</span>
                              </div>
                            </td>
                            <td className="py-3 pr-4 text-gray-500">{p.category || "—"}</td>
                            <td className="py-3 text-right text-gray-700">{fmt(p.price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── Sắp hết hàng ── */}
              {inventory.lowStock.length > 0 && (
                <div className="bg-white rounded-xl shadow p-6">
                  <h2 className="text-lg font-semibold text-yellow-500 mb-4">
                    ⚠️ Sắp hết hàng — tồn kho ≤ 10 ({inventory.lowStock.length})
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500 border-b">
                          <th className="pb-3 pr-4">Sản phẩm</th>
                          <th className="pb-3 pr-4">Danh mục</th>
                          <th className="pb-3 pr-4 text-right">Tồn kho</th>
                          <th className="pb-3 text-right">Giá</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventory.lowStock.map((p) => (
                          <tr key={p._id} className="border-b last:border-0 hover:bg-yellow-50">
                            <td className="py-3 pr-4">
                              <div className="flex items-center gap-3">
                                {p.image && (
                                  <img
                                    src={
                                      p.image.startsWith("http")
                                        ? p.image
                                        : `http://localhost:5000${p.image}`
                                    }
                                    alt={p.name}
                                    className="w-10 h-10 rounded-lg object-cover"
                                    onError={(e) =>
                                      ((e.target as HTMLImageElement).style.display = "none")
                                    }
                                  />
                                )}
                                <span className="font-medium text-gray-700">{p.name}</span>
                              </div>
                            </td>
                            <td className="py-3 pr-4 text-gray-500">{p.category || "—"}</td>
                            <td className="py-3 pr-4 text-right">
                              <span className="bg-yellow-100 text-yellow-700 font-bold px-2 py-0.5 rounded-full">
                                {p.quantity}
                              </span>
                            </td>
                            <td className="py-3 text-right text-gray-700">{fmt(p.price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── Tất cả sản phẩm ── */}
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                  Toàn bộ tồn kho ({inventory.summary.totalProducts} sản phẩm)
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="pb-3 pr-4">Sản phẩm</th>
                        <th className="pb-3 pr-4">Danh mục</th>
                        <th className="pb-3 pr-4 text-right">Tồn kho</th>
                        <th className="pb-3 pr-4 text-right">Giá</th>
                        <th className="pb-3 text-right">Giá trị</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.allProducts.map((p) => (
                        <tr key={p._id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-3">
                              {p.image && (
                                <img
                                  src={
                                    p.image.startsWith("http")
                                      ? p.image
                                      : `http://localhost:5000${p.image}`
                                  }
                                  alt={p.name}
                                  className="w-10 h-10 rounded-lg object-cover"
                                  onError={(e) =>
                                    ((e.target as HTMLImageElement).style.display = "none")
                                  }
                                />
                              )}
                              <span className="font-medium text-gray-700">{p.name}</span>
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-gray-500">{p.category || "—"}</td>
                          <td className="py-3 pr-4 text-right">
                            <span
                              className={`font-bold px-2 py-0.5 rounded-full text-xs ${
                                p.quantity === 0
                                  ? "bg-red-100 text-red-600"
                                  : p.quantity <= 10
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {p.quantity}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-right text-gray-700">{fmt(p.price)}</td>
                          <td className="py-3 text-right font-semibold text-[#6272B6]">
                            {fmt(p.price * p.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── Theo danh mục ── */}
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                  Tồn kho theo danh mục
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="pb-3 pr-4">Danh mục</th>
                        <th className="pb-3 pr-4 text-right">Số loại</th>
                        <th className="pb-3 pr-4 text-right">Tổng tồn kho</th>
                        <th className="pb-3 text-right">Giá trị</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(inventory.byCategory)
                        .sort((a, b) => b[1].totalValue - a[1].totalValue)
                        .map(([cat, info]) => (
                          <tr key={cat} className="border-b last:border-0 hover:bg-gray-50">
                            <td className="py-3 pr-4 font-medium text-gray-700">{cat}</td>
                            <td className="py-3 pr-4 text-right text-gray-500">{info.count}</td>
                            <td className="py-3 pr-4 text-right text-[#6272B6] font-semibold">
                              {fmtNum(info.totalQuantity)}
                            </td>
                            <td className="py-3 text-right text-green-600 font-semibold">
                              {fmt(info.totalValue)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
