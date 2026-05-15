import { useEffect, useState } from "react";
import { Card, Table, Tag, Button, Modal, Timeline, Spin, message, Empty, Rate } from "antd";
import { 
  EyeOutlined, HeartOutlined, ClockCircleOutlined, CheckCircleOutlined,
  CloseCircleOutlined, ReloadOutlined, StarOutlined
} from "@ant-design/icons";
import { apiClient } from "../api/http";
import { useNavigate } from "react-router-dom";
import type { ColumnsType } from "antd/es/table";

interface AdoptionRequest {
  _id: string;
  fullName: string;
  phone: string;
  address: string;
  reason: string;
  status: string;
  createdAt: string;
  processedAt?: string;
  adminNote?: string;
  rating?: number;
  feedback?: string;
  pet: {
    _id: string;
    name: string;
    images: string[];
    species: string;
    age: string;
    gender: string;
  };
  statusHistory?: Array<{
    status: string;
    timestamp: string;
    note?: string;
  }>;
}

export default function MyAdoptions() {
  const [requests, setRequests] = useState<AdoptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<AdoptionRequest | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/adoption/my-requests");
      if (response.data.success) {
        setRequests(response.data.data);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        message.error("Vui lòng đăng nhập");
        navigate("/login");
      } else {
        message.error("Không thể tải danh sách đơn nhận nuôi");
      }
    } finally {
      setLoading(false);
    }
  };

  const statusConfig: Record<string, { color: string; label: string; icon: any }> = {
    pending: { color: "orange", label: "Chờ xử lý", icon: <ClockCircleOutlined /> },
    approved: { color: "green", label: "Đã duyệt", icon: <CheckCircleOutlined /> },
    rejected: { color: "red", label: "Từ chối", icon: <CloseCircleOutlined /> },
    cancelled: { color: "default", label: "Đã hủy", icon: <CloseCircleOutlined /> },
  };

  const showDetail = (request: AdoptionRequest) => {
    setSelectedRequest(request);
    setDetailModalVisible(true);
  };

  const showRatingModal = (request: AdoptionRequest) => {
    setSelectedRequest(request);
    setRating(request.rating || 5);
    setFeedback(request.feedback || "");
    setRatingModalVisible(true);
  };

  const submitRating = async () => {
    if (!selectedRequest) return;

    try {
      await apiClient.put(`/adoption/${selectedRequest._id}/rate`, {
        rating,
        feedback
      });
      message.success("Cảm ơn bạn đã đánh giá!");
      setRatingModalVisible(false);
      fetchRequests();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể gửi đánh giá");
    }
  };

  const columns: ColumnsType<AdoptionRequest> = [
    {
      title: "Thú cưng",
      key: "pet",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <img
            src={record.pet?.images?.[0] ? 
              (record.pet.images[0].startsWith('http') ? record.pet.images[0] : `http://localhost:5000${record.pet.images[0]}`) : 
              "https://placehold.co/60x60?text=Pet"
            }
            alt={record.pet?.name}
            className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://placehold.co/60x60?text=Pet";
            }}
          />
          <div>
            <div className="font-semibold text-gray-800">{record.pet?.name || "N/A"}</div>
            <div className="text-xs text-gray-500">
              {record.pet?.species} • {record.pet?.age} • {record.pet?.gender}
            </div>
          </div>
        </div>
      ),
      width: 200,
    },
    {
      title: "Ngày gửi",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => (
        <div className="text-sm">
          <div className="font-medium">{new Date(date).toLocaleDateString("vi-VN")}</div>
          <div className="text-gray-400">{new Date(date).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</div>
        </div>
      ),
      width: 130,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const config = statusConfig[status] || statusConfig.pending;
        return (
          <Tag icon={config.icon} color={config.color} className="px-3 py-1">
            {config.label}
          </Tag>
        );
      },
      width: 130,
    },
    {
      title: "Đánh giá",
      key: "rating",
      render: (_, record) => (
        <div>
          {record.rating ? (
            <div className="flex items-center gap-2">
              <Rate disabled value={record.rating} className="text-sm" />
              <span className="text-xs text-gray-500">({record.rating}/5)</span>
            </div>
          ) : record.status === "approved" ? (
            <Button
              size="small"
              type="link"
              icon={<StarOutlined />}
              onClick={() => showRatingModal(record)}
              className="text-[#6272B6]"
            >
              Đánh giá
            </Button>
          ) : (
            <span className="text-gray-400 text-xs">Chưa có</span>
          )}
        </div>
      ),
      width: 150,
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => showDetail(record)}
          className="bg-[#6272B6] border-0"
        >
          Chi tiết
        </Button>
      ),
      width: 100,
    },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6272B6] to-purple-600 mb-2">
              <HeartOutlined /> Đơn Nhận Nuôi Của Tôi
            </h1>
            <div className="absolute -inset-1 bg-gradient-to-r from-[#6272B6] to-purple-600 rounded-lg blur opacity-25"></div>
          </div>
          <p className="text-gray-600 mt-4">Theo dõi trạng thái các đơn nhận nuôi thú cưng</p>
        </div>

        {/* Table */}
        <Card 
          className="shadow-xl border-0 rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
            backdropFilter: 'blur(10px)'
          }}
          extra={
            <Button icon={<ReloadOutlined />} onClick={fetchRequests} loading={loading}>
              Làm mới
            </Button>
          }
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Spin size="large" />
            </div>
          ) : requests.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Bạn chưa có đơn nhận nuôi nào"
            >
              <Button
                type="primary"
                onClick={() => navigate("/adopt")}
                className="bg-[#6272B6] border-0"
              >
                Tìm thú cưng để nhận nuôi
              </Button>
            </Empty>
          ) : (
            <Table
              columns={columns}
              dataSource={requests}
              rowKey="_id"
              pagination={{
                pageSize: 10,
                showTotal: (total) => `Tổng ${total} đơn`,
              }}
            />
          )}
        </Card>

        {/* Detail Modal */}
        <Modal
          title={
            <div className="flex items-center gap-3">
              <HeartOutlined className="text-[#6272B6]" />
              <span>Chi tiết đơn nhận nuôi</span>
            </div>
          }
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={null}
          width={700}
        >
          {selectedRequest && (
            <div className="space-y-6">
              {/* Pet Info */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <img
                  src={selectedRequest.pet?.images?.[0] ? 
                    (selectedRequest.pet.images[0].startsWith('http') ? selectedRequest.pet.images[0] : `http://localhost:5000${selectedRequest.pet.images[0]}`) : 
                    "https://placehold.co/100x100?text=Pet"
                  }
                  alt={selectedRequest.pet?.name}
                  className="w-20 h-20 rounded-xl object-cover border-2 border-white shadow"
                />
                <div>
                  <h3 className="text-xl font-bold text-[#6272B6]">{selectedRequest.pet?.name}</h3>
                  <p className="text-gray-600">
                    {selectedRequest.pet?.species} • {selectedRequest.pet?.age} • {selectedRequest.pet?.gender}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Trạng thái</h4>
                <Tag
                  icon={statusConfig[selectedRequest.status]?.icon}
                  color={statusConfig[selectedRequest.status]?.color}
                  className="px-4 py-2 text-base"
                >
                  {statusConfig[selectedRequest.status]?.label}
                </Tag>
              </div>

              {/* Timeline */}
              {selectedRequest.statusHistory && selectedRequest.statusHistory.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Lịch sử xử lý</h4>
                  <Timeline>
                    {selectedRequest.statusHistory.map((history, index) => (
                      <Timeline.Item
                        key={index}
                        color={statusConfig[history.status]?.color || "blue"}
                        dot={statusConfig[history.status]?.icon}
                      >
                        <div>
                          <div className="font-medium">{statusConfig[history.status]?.label}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(history.timestamp).toLocaleString("vi-VN")}
                          </div>
                          {history.note && (
                            <div className="text-sm text-gray-600 mt-1">{history.note}</div>
                          )}
                        </div>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </div>
              )}

              {/* Admin Note */}
              {selectedRequest.adminNote && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <h4 className="font-semibold text-gray-700 mb-2">Ghi chú từ admin</h4>
                  <p className="text-gray-600">{selectedRequest.adminNote}</p>
                </div>
              )}

              {/* Rating */}
              {selectedRequest.rating && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <h4 className="font-semibold text-gray-700 mb-2">Đánh giá của bạn</h4>
                  <Rate disabled value={selectedRequest.rating} />
                  {selectedRequest.feedback && (
                    <p className="text-gray-600 mt-2">{selectedRequest.feedback}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Rating Modal */}
        <Modal
          title="Đánh giá trải nghiệm nhận nuôi"
          open={ratingModalVisible}
          onCancel={() => setRatingModalVisible(false)}
          onOk={submitRating}
          okText="Gửi đánh giá"
          cancelText="Hủy"
        >
          <div className="space-y-4">
            <div>
              <p className="mb-2">Bạn đánh giá như thế nào về trải nghiệm nhận nuôi?</p>
              <Rate value={rating} onChange={setRating} className="text-2xl" />
            </div>
            <div>
              <p className="mb-2">Chia sẻ thêm về trải nghiệm của bạn (không bắt buộc)</p>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full p-3 border rounded-xl"
                rows={4}
                placeholder="Chia sẻ cảm nhận của bạn..."
              />
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
