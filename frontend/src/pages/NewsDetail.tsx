import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { Button, Spin, Tag, Divider, Card, Row, Col } from "antd"
import { ArrowLeftOutlined, ClockCircleOutlined, EyeOutlined, ShareAltOutlined } from "@ant-design/icons"
import { getNewsById, listNews } from "../api/newsApi"
import "./NewsDetail.css"

export default function NewsDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [article, setArticle] = useState<any>(null)
  const [relatedNews, setRelatedNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    
    // Scroll to top
    window.scrollTo(0, 0)
    
    setLoading(true)
    Promise.all([
      getNewsById(id),
      listNews({ limit: 3 })
    ])
      .then(([articleRes, newsRes]) => {
        setArticle(articleRes.data)
        // Filter out current article from related news
        setRelatedNews((newsRes.data || []).filter((item: any) => item._id !== id))
      })
      .catch(() => {
        setArticle(null)
        setRelatedNews([])
      })
      .finally(() => setLoading(false))
  }, [id])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", {
      weekday: 'long',
      day: "2-digit",
      month: "long",
      year: "numeric"
    })
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.description,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Đã sao chép link!')
    }
  }

  if (loading) {
    return (
      <div className="news-detail-loading">
        <Spin size="large" />
        <p>Đang tải bài viết...</p>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="news-detail-error">
        <h2>😔 Không tìm thấy bài viết</h2>
        <Button type="primary" onClick={() => navigate('/news')}>
          Quay lại trang tin tức
        </Button>
      </div>
    )
  }

  return (
    <div className="news-detail-page">
      {/* Header */}
      <div className="news-detail-header">
        <div className="container">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/news')}
            className="news-detail-back"
            size="large"
          >
            Quay lại
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="container news-detail-container">
        <Row gutter={[32, 32]}>
          {/* Main Content */}
          <Col xs={24} lg={16}>
            <Card className="news-detail-card">
              {/* Meta */}
              <div className="news-detail-meta">
                <Tag color="purple" className="news-detail-tag">Tin tức</Tag>
                <span className="news-detail-date">
                  <ClockCircleOutlined /> {formatDate(article.createdAt)}
                </span>
                <span className="news-detail-views">
                  <EyeOutlined /> 1,234 lượt xem
                </span>
              </div>

              {/* Title */}
              <h1 className="news-detail-title">{article.title}</h1>

              {/* Description */}
              <p className="news-detail-description">{article.description}</p>

              {/* Featured Image */}
              <div className="news-detail-image">
                <img
                  src={article.image || "https://images.unsplash.com/photo-1444212477490-ca407925329e?w=1200"}
                  alt={article.title}
                />
              </div>

              <Divider />

              {/* Content */}
              <div className="news-detail-content">
                {article.content ? (
                  <div dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br/>') }} />
                ) : (
                  <p>Nội dung đang được cập nhật...</p>
                )}
              </div>

              <Divider />

              {/* Share */}
              <div className="news-detail-share">
                <Button
                  icon={<ShareAltOutlined />}
                  onClick={handleShare}
                  size="large"
                >
                  Chia sẻ bài viết
                </Button>
              </div>
            </Card>
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={8}>
            {/* Related News */}
            {relatedNews.length > 0 && (
              <Card title="📰 Tin tức liên quan" className="news-detail-sidebar">
                {relatedNews.map((item) => (
                  <div
                    key={item._id}
                    className="related-news-item"
                    onClick={() => navigate(`/news/${item._id}`)}
                  >
                    <img
                      src={item.image || "https://images.unsplash.com/photo-1444212477490-ca407925329e?w=400"}
                      alt={item.title}
                    />
                    <div className="related-news-content">
                      <h4>{item.title}</h4>
                      <span className="related-news-date">
                        <ClockCircleOutlined /> {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                ))}
              </Card>
            )}

            {/* CTA Card */}
            <Card className="news-detail-cta">
              <h3>💝 Hãy giúp đỡ các bé</h3>
              <p>Mỗi đóng góp của bạn đều có ý nghĩa lớn lao với các bé thú cưng đang cần được cứu trợ.</p>
              <Button
                type="primary"
                size="large"
                block
                onClick={() => navigate('/donate')}
              >
                Ủng hộ ngay
              </Button>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}