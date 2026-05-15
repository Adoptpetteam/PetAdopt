import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, Row, Col, Spin, Empty, Pagination, Tag, Input } from "antd"
import { ClockCircleOutlined, EyeOutlined, SearchOutlined } from "@ant-design/icons"
import { listNews } from "../api/newsApi"
import "./News.css"

const { Search } = Input

export default function News() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [searchText, setSearchText] = useState("")
  const navigate = useNavigate()

  const limit = 9

  useEffect(() => {
    fetchNews()
  }, [page])

  const fetchNews = () => {
    setLoading(true)
    listNews({ limit, page })
      .then(res => {
        setData(res.data || [])
        setTotal(res.pagination?.total || 0)
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }

  const handleSearch = (value: string) => {
    setSearchText(value)
    // TODO: Implement search API
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    })
  }

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return ""
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  return (
    <div className="news-page">
      {/* Hero Section */}
      <div className="news-hero">
        <div className="news-hero-overlay">
          <div className="container">
            <h1 className="news-hero-title">📰 Tin Tức & Hoạt Động</h1>
            <p className="news-hero-subtitle">
              Cập nhật những tin tức mới nhất về hoạt động cứu trợ và chăm sóc thú cưng
            </p>
            <Search
              placeholder="Tìm kiếm tin tức..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              className="news-search"
            />
          </div>
        </div>
      </div>

      {/* News Grid */}
      <div className="container news-content">
        {loading ? (
          <div className="news-loading">
            <Spin size="large" />
            <p>Đang tải tin tức...</p>
          </div>
        ) : data.length === 0 ? (
          <Empty
            description="Chưa có tin tức nào"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <>
            <Row gutter={[24, 24]}>
              {data.map((item, index) => (
                <Col xs={24} sm={12} lg={8} key={item._id}>
                  <Card
                    hoverable
                    className={`news-card ${index === 0 ? 'featured' : ''}`}
                    cover={
                      <div className="news-card-image">
                        <img
                          alt={item.title}
                          src={item.image || "https://images.unsplash.com/photo-1444212477490-ca407925329e?w=800"}
                        />
                        <div className="news-card-overlay">
                          <EyeOutlined /> Xem chi tiết
                        </div>
                      </div>
                    }
                    onClick={() => navigate(`/news/${item._id}`)}
                  >
                    <div className="news-card-meta">
                      <Tag color="purple">Tin tức</Tag>
                      <span className="news-card-date">
                        <ClockCircleOutlined /> {formatDate(item.createdAt)}
                      </span>
                    </div>
                    <h3 className="news-card-title">{item.title}</h3>
                    <p className="news-card-description">
                      {truncateText(item.description, 100)}
                    </p>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Pagination */}
            {total > limit && (
              <div className="news-pagination">
                <Pagination
                  current={page}
                  total={total}
                  pageSize={limit}
                  onChange={setPage}
                  showSizeChanger={false}
                  showTotal={(total) => `Tổng ${total} tin tức`}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}