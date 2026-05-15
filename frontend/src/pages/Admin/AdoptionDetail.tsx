import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAdoptionRequestById } from "../../api/adoptionApi";
import {
  Card,
  Row,
  Col,
  Tag,
  Button,
  Descriptions,
  Image,
  Avatar,
  Divider,
  Space,
  Typography,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  HeartOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

// Adoption detail admin page
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
        console.error("Fetch adoption detail error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id]);

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: {
        color: "orange",
        label: "Chờ xử lý",
        icon: <ClockCircleOutlined />,
      },
      approved: {
        color: "green",
        label: "Đã duyệt",
        icon: <CheckCircleOutlined />,
      },
      rejected: {
        color: "red",
        label: "Từ chối",
        icon: <CloseCircleOutlined />,
      },
      cancelled: {
        color: "default",
        label: "Đã hủy",
        icon: <CloseCircleOutlined />,
      },
    };

    return configs[status as keyof typeof configs] || configs.pending;
  };

  const getImageUrl = (imagePath: string) => {
    if (imagePath.startsWith("http")) {
      return imagePath;
    }
    return `http://localhost:5000${imagePath}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-gray-50 rounded-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6272B6] mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải dữ liệu chi tiết...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-gray-50 rounded-xl">
        <div className="text-center">
          <HeartOutlined className="text-6xl text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-3">
            Không tìm thấy đơn nhận nuôi
          </h3>
          <Button type="primary" onClick={() => navigate(-1)}>
            ← Quay lại
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(request.status);

  return (
    <div className="space-y-6 bg-gray-50 p-4 rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="mb-4 hover:border-[#6272B6]"
          >
            ← Quay lại
          </Button>

          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6272B6] to-purple-600 flex items-center gap-2">
            <HeartOutlined />
            Chi tiết đơn nhận nuôi
          </h1>

          <Text copyable className="text-gray-500">
            Mã đơn: {request._id}
          </Text>
        </div>

        <Tag
          icon={statusConfig.icon}
          color={statusConfig.color}
          className="px-4 py-2 text-base"
        >
          {statusConfig.label}
        </Tag>
      </div>

      <Row gutter={[24, 24]}>
        {/* Pet info */}
        <Col xs={24} lg={8}>
          <Card
            className="shadow-md rounded-xl"
            title={
              <Space>
                <HeartOutlined className="text-[#6272B6]" />
                Thông tin thú cưng
              </Space>
            }
          >
            <div className="text-center mb-4">
              {request.pet?.images?.[0] ? (
                <Image
                  src={getImageUrl(request.pet.images[0])}
                  alt={request.pet.name}
                  className="rounded-lg"
                  style={{ maxHeight: 220, objectFit: "cover" }}
                />
              ) : (
                <div className="w-full h-52 bg-gray-100 rounded-lg flex items-center justify-center">
                  <HeartOutlined className="text-4xl text-gray-300" />
                </div>
              )}
            </div>

            <Descriptions column={1} size="small">
              <Descriptions.Item label="Tên">
                {request.pet?.name || "Chưa cập nhật"}
              </Descriptions.Item>
              <Descriptions.Item label="Loài">
                {request.pet?.species || "Chưa cập nhật"}
              </Descriptions.Item>
              <Descriptions.Item label="Giống">
                {request.pet?.breed || "Chưa cập nhật"}
              </Descriptions.Item>
              <Descriptions.Item label="Tuổi">
                {request.pet?.age || "Chưa cập nhật"} tuổi
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* User info */}
        <Col xs={24} lg={16}>
          <Card
            className="shadow-md rounded-xl"
            title={
              <Space>
                <UserOutlined className="text-[#6272B6]" />
                Thông tin người nhận nuôi
              </Space>
            }
          >
            <div className="flex items-center gap-3 mb-4">
              <Avatar
                size={64}
                className="bg-gradient-to-br from-[#6272B6] to-purple-600"
              >
                {request.fullName?.charAt(0)?.toUpperCase()}
              </Avatar>

              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {request.fullName}
                </h3>
                <p className="text-gray-500">
                  {request.user?.email || "Chưa có email"}
                </p>
              </div>
            </div>

            <Divider />

            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label={<><PhoneOutlined /> SĐT</>}>
                {request.phone}
              </Descriptions.Item>

              <Descriptions.Item label={<><MailOutlined /> Email</>}>
                {request.user?.email || "Chưa có"}
              </Descriptions.Item>

              <Descriptions.Item label={<><HomeOutlined /> Địa chỉ</>} span={2}>
                {request.address}
              </Descriptions.Item>

              <Descriptions.Item label="Ngày gửi">
                {new Date(request.createdAt).toLocaleString("vi-VN")}
              </Descriptions.Item>

              <Descriptions.Item label="Kinh nghiệm">
                <Tag color="blue">
                  {request.experience || "Chưa cập nhật"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <div>
              <h4 className="font-semibold text-gray-800 mb-2">
                Lý do nhận nuôi:
              </h4>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                {request.reason}
              </p>
            </div>

            {request.adminNote && (
              <>
                <Divider />
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Ghi chú của admin:
                  </h4>
                  <p className="text-gray-600 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                    {request.adminNote}
                  </p>
                </div>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}