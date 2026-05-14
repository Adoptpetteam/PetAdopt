import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Skeleton, Pagination, Empty, Input } from "antd"
import { SearchOutlined, CalendarOutlined, ReadOutlined } from "@ant-design/icons"
import { listNews } from "../api/newsApi"

export default function News() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const navigate = useNavigate()
  const PAGE_SIZE = 9

  const fetchNews = async (p = 1, q = "") => {
    setLoading(true)
    try {
      const res = await listNews({ limit: PAGE_SIZE, page: p } as any)
      let items = res.data || []
      // Filter client-side nếu có search
      if (q.trim()) {
        items = items.filter((n: any) =>
          n.title?.toLowerCase().includes(q.toLowerCase()) ||
          n.description?.toLowerCase().includes(q.toLowerCase())
        )
      }
      setData(items)
      setTotal(res.pagination?.total || items.length)
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchNews(page, search) }, [page, search])

  const handleSearch = () => {
    setPage(1)
    setSearch(searchInput)
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-[1100px] mx-auto py-16 px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            Tin tức & <span className="text-[#6272B6]">Hoạt động</span>
          </h1>
          <div className="h-1 w-20 bg-[#6272B6] rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Cập nhật những thông tin mới nhất về thú cưng và hoạt động của chúng tôi</p>
        </div>

        {/* Search */}
        <div className="flex justify-center mb-10">
          <Input
            placeholder="Tìm kiếm bài viết..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            onClear={() => { setSearchInput(""); setSearch(""); setPage(1); }}
            className="rounded-full h-11 max-w-md"
            style={{ width: "100%" }}
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(9).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <Skeleton.Image active className="!w-full !h-48" />
                <div className="p-4">
                  <Skeleton active paragraph={{ rows: 2 }} />
                </div>
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <Empty description="Không tìm thấy bài viết nào" className="py-20" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map(item => (
              <div
                key={item._id}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-blue-100"
                onClick={() => navigate(`/news/${item._id}`)}
              >
                {/* Ảnh */}
                <div className="relative overflow-hidden h-48">
                  <img
                    src={item.image || "https://placehold.co/400x200?text=No+Image"}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/400x200?text=No+Image"; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Content */}
                <div className="p-5">
                  <h2 className="font-bold text-gray-800 text-base mb-2 line-clamp-2 group-hover:text-[#6272B6] transition-colors leading-snug">
                    {item.title}
                  </h2>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed">
                    {item.description || "Đọc bài viết để biết thêm chi tiết..."}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <CalendarOutlined />
                      {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                    <span className="flex items-center gap-1 text-[#6272B6] font-medium group-hover:underline">
                      <ReadOutlined /> Đọc tiếp
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && total > PAGE_SIZE && (
          <div className="flex justify-center mt-10">
            <Pagination
              current={page}
              pageSize={PAGE_SIZE}
              total={total}
              onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              showSizeChanger={false}
            />
          </div>
        )}
      </div>
    </div>
  )
}
