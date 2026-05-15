import { useEffect, useState } from "react"
import { Table, Tag, Button, message, Modal, Input, Space, Card, Statistic, Row, Col, Rate, Avatar, Image } from "antd"
import { 
  StarOutlined,
  DeleteOutlined,
  EyeOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined
} from "@ant-design/icons"
import { apiClient } from "../../api/http"

const { TextArea } = Input

export default function Reviews() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedReview, setSelectedReview] = useState<any>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [responseModalVisible, setResponseModalVisible] = useState(false)
  const [adminResponse, setAdminResponse] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    pet: 0,
    product: 0,
    avgRating: 0
  })
  const [filter, setFilter] = useState<'all' | 'pet' | 'product'>('all')

  const fetchReviews = async () => {
    setLoading(true)
    try {
      // Fetch all reviews (cần tạo API endpoint mới)
      const res = await apiClient.get('/reviews/admin/all')
      const data = res.data.data || []
      setReviews(data)
      
      // Calculate stats
      const petReviews = data.filter((r: any) => r.reviewType === 'pet')
      const productReviews = data.filter((r: any) => r.reviewType === 'product')
      const avgRating = data.length > 0 
        ? data.reduce((sum: number, r: any) => sum + r.rating, 0) / data.length 
        : 0
      
      setStats({
        total: data.length,
        pet: petReviews.length,
        product: productReviews.length,
        avgRating: Math.round(avgRating * 10) / 10
      })
    } catch (error: any) {
      message.error('Không thể tải danh sách đánh giá')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa đánh giá này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await apiClient.delete(`/reviews/${id}`)
          message.success('Đã xóa đánh giá')
          fetchReviews()
        } catch (error: any) {
          message.error('Xóa thất bại')
        }
      }
    })
  }

  const handleResponse = async () => {
    if (!selectedReview || !adminResponse.trim()) {
      message.warning('Vui lòng nhập nội dung phản hồi')
      return
    }

    try {
      await apiClient.post(`/reviews/${selectedReview._id}/response`, {
        comment: adminResponse.trim()
      })
      message.success('Đã phản hồi đánh giá')
      setResponseModalVisible(false)
      setAdminResponse('')
      fetchReviews()
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Phản hồi thất bại')
    }
  }

  const filteredReviews = filter === 'all' 
    ? reviews 
    : reviews.filter(r => r.reviewType === filter)

  const columns = [
    {
      title: 'Loại',
      dataIndex: 'reviewType',
      key: 'reviewType',
      width: 100,
      render: (type: string) => (
        <Tag color={type === 'pet' ? 'blue' : 'green'}>
          {type === 'pet' ? 'Thú cưng' : 'Sản phẩm'}
        </Tag>
      )
    },
    {
      title: 'Đối tượng',
      key: 'target',
      render: (_: any, record: any) => (
        <div>
          <div className="font-semibold">
            {record.pet?.name || record.product?.name || 'N/A'}
          </div>
          {record.verifiedPurchase && (
            <Tag color="green" className="text-xs mt-1">
              <CheckCircleOutlined /> Đã mua
            </Tag>
          )}
          {record.verifiedAdoption && (
            <Tag color="blue" className="text-xs mt-1">
              <CheckCircleOutlined /> Đã nhận nuôi
            </Tag>
          )}
        </div>
      )
    },
    {
      title: 'Người đánh giá',
      dataIndex: 'user',
      key: 'user',
      render: (user: any) => (
        <div className="flex items-center gap-2">
          <Avatar size={32} icon={<UserOutlined />} className="bg-[#6272B6]" />
          <span>{user?.name || 'Anonymous'}</span>
        </div>
      )
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      width: 150,
      render: (rating: number) => <Rate disabled value={rating} className="text-sm" />
    },
    {
      title: 'Nội dung',
      dataIndex: 'comment',
      key: 'comment',
      ellipsis: true,
      render: (text: string) => (
        <div className="max-w-xs truncate">{text}</div>
      )
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'images',
      key: 'images',
      width: 100,
      render: (images: string[]) => (
        images && images.length > 0 ? (
          <span className="text-blue-600">{images.length} ảnh</span>
        ) : (
          <span className="text-gray-400">Không có</span>
        )
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Thao tác',
      key: 'actions',
      fixed: 'right' as const,
      width: 200,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedReview(record)
              setDetailModalVisible(true)
            }}
          >
            Chi tiết
          </Button>
          
          <Button
            type="link"
            icon={<MessageOutlined />}
            onClick={() => {
              setSelectedReview(record)
              setAdminResponse(record.adminResponse?.comment || '')
              setResponseModalVisible(true)
            }}
            className="text-blue-600"
          >
            Phản hồi
          </Button>
          
          <Button
            type="link"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
            danger
          >
            Xóa
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#6272B6] to-purple-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">⭐ Quản Lý Đánh Giá</h1>
        <p className="opacity-90">Xem và quản lý tất cả đánh giá từ người dùng</p>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-lg">
            <Statistic
              title="Tổng đánh giá"
              value={stats.total}
              prefix={<StarOutlined style={{ color: '#6272B6' }} />}
              valueStyle={{ color: '#6272B6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-lg">
            <Statistic
              title="Thú cưng"
              value={stats.pet}
              prefix={<StarOutlined style={{ color: '#3b82f6' }} />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-lg">
            <Statistic
              title="Sản phẩm"
              value={stats.product}
              prefix={<StarOutlined style={{ color: '#10b981' }} />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-lg">
            <Statistic
              title="Đánh giá TB"
              value={stats.avgRating}
              suffix="/ 5"
              prefix={<StarOutlined style={{ color: '#f59e0b' }} />}
              valueStyle={{ color: '#f59e0b' }}
              precision={1}
            />
          </Card>
        </Col>
      </Row>

      {/* Filter */}
      <Card className="shadow-lg border-0">
        <Space className="mb-4">
          <Button
            type={filter === 'all' ? 'primary' : 'default'}
            onClick={() => setFilter('all')}
          >
            Tất cả ({stats.total})
          </Button>
          <Button
            type={filter === 'pet' ? 'primary' : 'default'}
            onClick={() => setFilter('pet')}
          >
            Thú cưng ({stats.pet})
          </Button>
          <Button
            type={filter === 'product' ? 'primary' : 'default'}
            onClick={() => setFilter('product')}
          >
            Sản phẩm ({stats.product})
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredReviews}
          rowKey="_id"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} đánh giá`
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <StarOutlined className="text-[#6272B6]" />
            <span>Chi Tiết Đánh Giá</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedReview && (
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <Avatar size={48} icon={<UserOutlined />} className="bg-[#6272B6]" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">{selectedReview.user?.name}</span>
                  {selectedReview.verifiedPurchase && (
                    <Tag color="green"><CheckCircleOutlined /> Đã mua hàng</Tag>
                  )}
                  {selectedReview.verifiedAdoption && (
                    <Tag color="blue"><CheckCircleOutlined /> Đã nhận nuôi</Tag>
                  )}
                </div>
                <Rate disabled value={selectedReview.rating} className="mb-2" />
                <p className="text-gray-700">{selectedReview.comment}</p>
              </div>
            </div>

            {selectedReview.images && selectedReview.images.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Hình ảnh đính kèm:</h4>
                <div className="flex gap-2 flex-wrap">
                  <Image.PreviewGroup>
                    {selectedReview.images.map((img: string, idx: number) => (
                      <Image
                        key={idx}
                        src={`http://localhost:5000${img}`}
                        alt="Review"
                        width={100}
                        height={100}
                        className="object-cover rounded"
                      />
                    ))}
                  </Image.PreviewGroup>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Loại đánh giá</p>
                <Tag color={selectedReview.reviewType === 'pet' ? 'blue' : 'green'}>
                  {selectedReview.reviewType === 'pet' ? 'Thú cưng' : 'Sản phẩm'}
                </Tag>
              </div>
              <div>
                <p className="text-sm text-gray-600">Đối tượng</p>
                <p className="font-semibold">
                  {selectedReview.pet?.name || selectedReview.product?.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ngày tạo</p>
                <p className="font-semibold">
                  {new Date(selectedReview.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Hữu ích</p>
                <p className="font-semibold">{selectedReview.helpfulCount || 0} người</p>
              </div>
            </div>

            {selectedReview.adminResponse && (
              <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                <h4 className="font-semibold mb-2 text-green-700">Phản hồi từ Admin</h4>
                <p className="text-gray-700">{selectedReview.adminResponse.comment}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(selectedReview.adminResponse.respondedAt).toLocaleString('vi-VN')}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Response Modal */}
      <Modal
        title="💬 Phản Hồi Đánh Giá"
        open={responseModalVisible}
        onCancel={() => {
          setResponseModalVisible(false)
          setAdminResponse('')
        }}
        onOk={handleResponse}
        okText="Gửi phản hồi"
        cancelText="Hủy"
        okButtonProps={{ className: 'bg-[#6272B6]' }}
      >
        {selectedReview && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Đánh giá từ:</p>
              <p className="font-semibold">{selectedReview.user?.name}</p>
              <Rate disabled value={selectedReview.rating} className="my-2" />
              <p className="text-gray-700">{selectedReview.comment}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Nội dung phản hồi
              </label>
              <TextArea
                rows={4}
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                placeholder="Nhập nội dung phản hồi của bạn..."
                maxLength={500}
                showCount
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
