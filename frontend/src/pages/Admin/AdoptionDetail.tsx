import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAdoptionRequestById } from "../../api/adoptionApi";
import { Card, Row, Col, Tag, Button, Descriptions, Image, Avatar, Divider, Space } from "antd";
import { 
  ArrowLeftOutlined, 
  UserOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  HomeOutlined,
  HeartOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";

export default function AdoptionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchRequest = async () => {
      try {
        const response = await getAdoptionRequestById(id);
        if (response.success) {
          setRequest(response.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id]);

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { color: "orange", label: "Chờ xử lý", icon: <ClockCircleOutlined /> },
      approved: { color: "green", label: "Đã duyệt", icon: <CheckCircleOutlined /> },
      rejected: { color: "red", label: "Từ chối", icon: <CloseCircleOutlined /> },
      cancelled: { color: "default", label: "Đã hủy", icon: <CloseCircleOutlined /> },
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const getImageUrl = (imagePath: string) => {
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `http://localhost:5000${imagePath}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6272B6] mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <HeartOutlined className="text-6xl text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Không tìm thấy đơn nhận nuôi</h3>
          <Button type="primary" onClick={() => navigate(-1)}>
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(request.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            Quay lại
          </Button>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6272B6] to-purple-600 flex items-center gap-2">
            <HeartOutlined /> Chi tiết đơn nhận nuôi
          </h1>
          <p className="text-gray-500 mt-1">Mã đơn: {request._id}</p>
        </div>
        <Tag icon={statusConfig.icon} color={statusConfig.color} className="px-4 py-2 text-lg">
          {statusConfig.label}
        </Tag>
      </div>

      <Row gutter={[24, 24]}>
        {/* Pet Information */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <div className="flex items-center gap-2">
                <HeartOutlined className="text-[#6272B6]" />
                Thông tin thú cưng
              </div>
            }
            className="h-full"
          >
            <div className="text-center mb-4">
              {request.pet?.images?.[0] ? (
                <Image
                  src={getImageUrl(request.pet.images[0])}
                  alt={request.pet.name}
                  className="rounded-lg"
                  style={{ maxHeight: 200, objectFit: 'cover' }}
                  fallback="https://placehold.co/200x200/f0f0f0/999?text=No+Image"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <HeartOutlined className="text-4xl text-gray-400" />
                </div>
              )}
            </div>
            
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Tên">{request.pet?.name || "Không rõ"}</Descriptions.Item>
              <Descriptions.Item label="Loài">{request.pet?.species || "Không rõ"}</Descriptions.Item>
              <Descriptions.Item label="Giống">{request.pet?.breed || "Không rõ"}</Descriptions.Item>
              <Descriptions.Item label="Tuổi">{request.pet?.age || "Không rõ"} tuổi</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={request.pet?.status === 'available' ? 'green' : 'orange'}>
                  {request.pet?.status === 'available' ? 'Có sẵn' : 'Đã được nhận nuôi'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {/* Additional pet images */}
            {request.pet?.images && request.pet.images.length > 1 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 mb-2">Ảnh khác:</p>
                <div className="flex gap-2 flex-wrap">
                  {request.pet.images.slice(1).map((image: string, index: number) => (
                    <Image
                      key={index}
                      src={getImageUrl(image)}
                      alt={`${request.pet.name} ${index + 2}`}
                      width={60}
                      height={60}
                      className="rounded object-cover"
                      fallback="https://placehold.co/60x60/f0f0f0/999?text=Pet"
                    />
                  ))}
                </div>
              </div>
            )}
          </Card>
        </Col>

        {/* Adopter Information */}
        <Col xs={24} lg={16}>
          <Card 
            title={
              <div className="flex items-center gap-2">
                <UserOutlined className="text-[#6272B6]" />
                Thông tin người nhận nuôi
              </div>
            }
            className="h-full"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar 
                    size={64} 
                    className="bg-gradient-to-br from-[#6272B6] to-purple-600"
                  >
                    {request.fullName?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{request.fullName}</h3>
                    <p className="text-gray-500">{request.user?.email || "Không có email"}</p>
                  </div>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Ngày gửi đơn</p>
                  <p className="text-lg font-semibold">
                    {new Date(request.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </Col>
            </Row>

            <Divider />

            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label={<><PhoneOutlined /> Số điện thoại</>}>
                {request.phone}
              </Descriptions.Item>
              <Descriptions.Item label={<><MailOutlined /> Email</>}>
                {request.user?.email || "Không có"}
              </Descriptions.Item>
              <Descriptions.Item label={<><HomeOutlined /> Địa chỉ</>} span={2}>
                {request.address}
              </Descriptions.Item>
              <Descriptions.Item label="Kinh nghiệm">
                <Tag color="blue">{request.experience || "Không có"}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Loại nhà ở">
                <Tag color="green">{request.housingType}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Số thành viên gia đình">
                {request.familyMembers}
              </Descriptions.Item>
              <Descriptions.Item label="Thu nhập hàng tháng">
                <Tag color="orange">{request.monthlyIncome}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Có sân vườn">
                <Tag color={request.hasYard ? "green" : "red"}>
                  {request.hasYard ? "Có" : "Không"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Có thú cưng khác">
                <Tag color={request.hasOtherPets ? "orange" : "blue"}>
                  {request.hasOtherPets ? "Có" : "Không"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Lý do nhận nuôi:</h4>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{request.reason}</p>
            </div>

            {request.adminNote && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-800 mb-2">Ghi chú của admin:</h4>
                <p className="text-gray-600 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                  {request.adminNote}
                </p>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
