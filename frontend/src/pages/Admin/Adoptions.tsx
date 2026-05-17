import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiClient } from "../../api/http";
import { 
  Card, Table, Tag, Button, Space, Modal, Input, message, 
  Row, Col, Statistic, Select, DatePicker, Badge, Tooltip 
} from "antd";
import {
  EyeOutlined, CheckCircleOutlined, CloseCircleOutlined,
  DeleteOutlined, SearchOutlined, ReloadOutlined, HeartOutlined,
  ClockCircleOutlined, UserOutlined, PhoneOutlined, HomeOutlined,
  FilterOutlined, BarChartOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

interface AdoptionRequest {
  _id: string;
  fullName: string;
  phone: string;
  address: string;
  status: string;
  createdAt: string;
  pet: {
    _id: string;
    name: string;
    images: string[];
  };
  user: {
    _id: string;
    name: string;
    email: string;
  };
}

export default function Adoptions() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<AdoptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    approvalRate: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [requestsRes, statsRes] = await Promise.all([
        apiClient.get("/adoption"),
        apiClient.get("/adoption/statistics")
      ]);
      
      setOrders(requestsRes.data.data || []);
      
      if (statsRes.data.success) {
        setStats(statsRes.data.data.overview);
      }
    } catch (error) {
      console.error(error);
      message.error("Không thể tải dữ liệu");
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

  const updateStatus = async (id: string, status: "approved" | "rejected", note?: string) => {
    try {
      const action = status === "approved" ? "approve" : "reject";
      await apiClient.put(`/adoption/${id}/${action}`, { adminNote: note });
      message.success(`Đã ${status === "approved" ? "duyệt" : "từ chối"} đơn nhận nuôi`);
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleApprove = (record: AdoptionRequest) => {
    Modal.confirm({
      title: "Xác nhận duyệt đơn",
      icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      content: (
        <div>
          <p>Bạn có chắc muốn duyệt đơn nhận nuôi của <strong>{record.fullName}</strong>?</p>
          <Input.TextArea
            id="approve-note"
            placeholder="Ghi chú cho người nhận nuôi (không bắt buộc)"
            rows={3}
            className="mt-3"
          />
        </div>
      ),
      okText: "Duyệt đơn",
      okType: "primary",
      cancelText: "Hủy",
      onOk: () => {
        const note = (document.getElementById("approve-note") as HTMLTextAreaElement)?.value;
        updateStatus(record._id, "approved", note);
      },
    });
  };

  const handleReject = (record: AdoptionRequest) => {
    Modal.confirm({
      title: "Xác nhận từ chối đơn",
      icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
      content: (
        <div>
          <p>Bạn có chắc muốn từ chối đơn nhận nuôi của <strong>{record.fullName}</strong>?</p>
          <Input.TextArea
            id="reject-note"
            placeholder="Lý do từ chối (không bắt buộc)"
            rows={3}
            className="mt-3"
          />
        </div>
      ),
      okText: "Từ chối",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        const note = (document.getElementById("reject-note") as HTMLTextAreaElement)?.value;
        updateStatus(record._id, "rejected", note);
      },
    });
  };

  const deleteOrder = async (id: string) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc muốn xóa đơn nhận nuôi này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await apiClient.delete(`/adoption/${id}`);
          message.success("Đã xóa đơn nhận nuôi");
          fetchData();
        } catch (error) {
          message.error("Không thể xóa đơn");
        }
      },
    });
  };

  const filteredOrders = orders.filter((order) => {
    const matchStatus = statusFilter === "all" || order.status === statusFilter;
    const matchSearch = 
      searchText === "" ||
      order.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
      order.phone.includes(searchText) ||
      order.pet?.name.toLowerCase().includes(searchText.toLowerCase()) ||
      order.user?.email.toLowerCase().includes(searchText.toLowerCase());
    
    return matchStatus && matchSearch;
  });

  const columns: ColumnsType<AdoptionRequest> = [
    {
      title: "Người nhận nuôi",
      key: "user",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#6272B6] to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
            {record.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-gray-800">{record.fullName}</div>
            <div className="text-xs text-gray-500">{record.user?.email || "N/A"}</div>
          </div>
        </div>
      ),
      width: 200,
    },
    {
      title: "Thú cưng",
      key: "pet",
      render: (_, record) => (
        <div className="flex items-center gap-2">
          {record.pet?.images?.[0] && (
            <img
              src={record.pet.images[0].startsWith('http') ? record.pet.images[0] : `http://localhost:5000${record.pet.images[0]}`}
              alt={record.pet.name}
              className="w-12 h-12 rounded-lg object-cover border-2 border-white shadow"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://placehold.co/48x48?text=Pet";
              }}
            />
          )}
          <span className="font-medium text-gray-700">{record.pet?.name || "N/A"}</span>
        </div>
      ),
      width: 150,
    },
    {
      title: "Liên hệ",
      key: "contact",
      render: (_, record) => (
        <div className="text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <PhoneOutlined className="text-[#6272B6]" />
            {record.phone}
          </div>
          <div className="flex items-center gap-1 text-gray-500 mt-1">
            <HomeOutlined className="text-gray-400" />
            <span className="truncate max-w-[150px]">{record.address}</span>
          </div>
        </div>
      ),
      width: 180,
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
      width: 120,
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
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
      width: 120,
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/admin/adoptions/${record._id}`)}
              className="bg-[#6272B6] border-0"
            />
          </Tooltip>

          {record.status === "pending" && (
            <>
              <Tooltip title="Duyệt đơn">
                <Button
                  size="small"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleApprove(record)}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                />
              </Tooltip>

              <Tooltip title="Từ chối">
                <Button
                  size="small"
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleReject(record)}
                />
              </Tooltip>
            </>
          )}

          <Tooltip title="Xóa">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => deleteOrder(record._id)}
            />
          </Tooltip>
        </Space>
      ),
      width: 180,
      fixed: "right",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6272B6] to-purple-600 flex items-center gap-2">
             Quản lý nhận nuôi 
          </h1>
          <p className="text-gray-500 mt-1">Xem và xử lý các đơn nhận nuôi thú cưng</p>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<BarChartOutlined />}
            className="bg-[#6272B6] border-0"
          >
            Thống kê
          </Button>
        </Space>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Tổng đơn"
              value={stats.total}
              prefix={<HeartOutlined className="text-[#6272B6]" />}
              valueStyle={{ color: "#6272B6", fontSize: "24px", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Chờ xử lý"
              value={stats.pending}
              prefix={<ClockCircleOutlined className="text-orange-500" />}
              valueStyle={{ color: "#f59e0b", fontSize: "24px", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Đã duyệt"
              value={stats.approved}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              valueStyle={{ color: "#10b981", fontSize: "24px", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Tỷ lệ duyệt"
              value={stats.approvalRate}
              suffix="%"
              prefix={<BarChartOutlined className="text-blue-500" />}
              valueStyle={{ color: "#3b82f6", fontSize: "24px", fontWeight: "bold" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Tìm theo tên, SĐT, email, thú cưng..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              size="large"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Lọc theo trạng thái"
              value={statusFilter}
              onChange={setStatusFilter}
              size="large"
              className="w-full"
              options={[
                { label: "Tất cả", value: "all" },
                { label: "Chờ xử lý", value: "pending" },
                { label: "Đã duyệt", value: "approved" },
                { label: "Từ chối", value: "rejected" },
                { label: "Đã hủy", value: "cancelled" },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="text-gray-600">
              Hiển thị <strong>{filteredOrders.length}</strong> / {orders.length} đơn
            </div>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đơn`,
          }}
          scroll={{ x: 1200 }}
          rowClassName="hover:bg-blue-50 transition-colors"
        />
      </Card>
    </div>
  );
}
