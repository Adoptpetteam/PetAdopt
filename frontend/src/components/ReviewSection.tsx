import { useState, useEffect } from "react"
import { Rate, Button, Input, message, Avatar, Progress, Modal, Upload } from "antd"
import { 
  StarOutlined, 
  LikeOutlined, 
  LikeFilled,
  UserOutlined,
  CheckCircleOutlined,
  PlusOutlined
} from "@ant-design/icons"
import { apiClient } from "../api/http"
import type { UploadFile } from 'antd'

const { TextArea } = Input

interface ReviewSectionProps {
  type: 'pet' | 'product'
  id: string
}

export default function ReviewSection({ type, id }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<any[]>([])
  const [statistics, setStatistics] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {}
    }
    fetchReviews()
  }, [type, id])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get(`/reviews/${type}/${id}`)
      setReviews(res.data.data || [])
      setStatistics(res.data.statistics || {})
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!user) {
      message.warning('Vui lòng đăng nhập để đánh giá')
      return
    }

    if (!comment.trim()) {
      message.warning('Vui lòng nhập nội dung đánh giá')
      return
    }

    setSubmitting(true)
    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('reviewType', type)
      formData.append('rating', rating.toString())
      formData.append('comment', comment.trim())
      
      if (type === 'pet') {
        formData.append('petId', id)
      } else {
        formData.append('productId', id)
      }

      // Append images
      fileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append('images', file.originFileObj)
        }
      })

      await apiClient.post('/reviews', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      message.success('Đánh giá thành công!')
      setShowForm(false)
      setRating(5)
      setComment('')
      setFileList([])
      fetchReviews()
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Đánh giá thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  const handleVoteHelpful = async (reviewId: string) => {
    if (!user) {
      message.warning('Vui lòng đăng nhập')
      return
    }

    try {
      await apiClient.post(`/reviews/${reviewId}/helpful`)
      fetchReviews()
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lỗi')
    }
  }

  const getRatingPercentage = (ratingValue: number) => {
    if (!statistics || statistics.totalReviews === 0) return 0
    const count = statistics[`rating${ratingValue}`] || 0
    return Math.round((count / statistics.totalReviews) * 100)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          ⭐ Đánh Giá & Nhận Xét
        </h2>
        {user && !showForm && (
          <Button
            type="primary"
            icon={<StarOutlined />}
            onClick={() => setShowForm(true)}
            className="bg-[#6272B6]"
          >
            Viết đánh giá
          </Button>
        )}
      </div>

      {/* Statistics */}
      {statistics && statistics.totalReviews > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
          <div className="text-center">
            <div className="text-5xl font-bold text-[#6272B6] mb-2">
              {statistics.avgRating.toFixed(1)}
            </div>
            <Rate disabled value={statistics.avgRating} allowHalf className="text-2xl" />
            <div className="text-gray-600 mt-2">
              {statistics.totalReviews} đánh giá
            </div>
          </div>

          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(star => (
              <div key={star} className="flex items-center gap-3">
                <span className="text-sm font-medium w-12">{star} sao</span>
                <Progress
                  percent={getRatingPercentage(star)}
                  strokeColor="#6272B6"
                  trailColor="#e5e7eb"
                  showInfo={false}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-12 text-right">
                  {statistics[`rating${star}`] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Form */}
      {showForm && (
        <div className="mb-8 p-6 border-2 border-[#6272B6] rounded-lg bg-blue-50">
          <h3 className="text-lg font-semibold mb-4">Viết đánh giá của bạn</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Đánh giá của bạn</label>
            <Rate value={rating} onChange={setRating} className="text-3xl" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Nội dung đánh giá</label>
            <TextArea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn..."
              maxLength={1000}
              showCount
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Hình ảnh (Tùy chọn, tối đa 5 ảnh)</label>
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={({ fileList: newFileList }) => setFileList(newFileList)}
              beforeUpload={() => false}
              maxCount={5}
              accept="image/*"
            >
              {fileList.length < 5 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </div>

          <div className="flex gap-3">
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={submitting}
              className="bg-[#6272B6]"
            >
              Gửi đánh giá
            </Button>
            <Button onClick={() => {
              setShowForm(false)
              setRating(5)
              setComment('')
            }}>
              Hủy
            </Button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-[#6272B6] border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <StarOutlined className="text-5xl mb-4 opacity-30" />
            <p>Chưa có đánh giá nào</p>
            <p className="text-sm">Hãy là người đầu tiên đánh giá!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="border-b pb-6 last:border-b-0">
              <div className="flex items-start gap-4">
                <Avatar size={48} icon={<UserOutlined />} className="bg-[#6272B6]" />
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{review.user?.name || 'Anonymous'}</span>
                    {review.verifiedPurchase && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1">
                        <CheckCircleOutlined /> Đã mua hàng
                      </span>
                    )}
                    {review.verifiedAdoption && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center gap-1">
                        <CheckCircleOutlined /> Đã nhận nuôi
                      </span>
                    )}
                  </div>

                  <Rate disabled value={review.rating} className="text-sm mb-2" />
                  
                  <p className="text-gray-700 mb-3">{review.comment}</p>

                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {review.images.map((img: string, idx: number) => (
                        <img
                          key={idx}
                          src={`http://localhost:5000${img}`}
                          alt="Review"
                          className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition border border-gray-200"
                          onClick={() => {
                            // Open image in modal
                            Modal.info({
                              title: 'Hình ảnh đánh giá',
                              content: (
                                <img 
                                  src={`http://localhost:5000${img}`} 
                                  alt="Review" 
                                  className="w-full rounded-lg"
                                />
                              ),
                              width: 600,
                              okText: 'Đóng'
                            })
                          }}
                        />
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                    <button
                      onClick={() => handleVoteHelpful(review._id)}
                      className="flex items-center gap-1 hover:text-[#6272B6] transition"
                    >
                      {review.helpfulBy?.includes(user?._id) ? (
                        <LikeFilled className="text-[#6272B6]" />
                      ) : (
                        <LikeOutlined />
                      )}
                      Hữu ích ({review.helpfulCount || 0})
                    </button>
                  </div>

                  {/* Admin Response */}
                  {review.adminResponse && (
                    <div className="mt-4 ml-4 p-4 bg-blue-50 rounded-lg border-l-4 border-[#6272B6]">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar size={32} className="bg-[#6272B6]">A</Avatar>
                        <span className="font-semibold text-sm">Phản hồi từ Admin</span>
                      </div>
                      <p className="text-sm text-gray-700">{review.adminResponse.comment}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
