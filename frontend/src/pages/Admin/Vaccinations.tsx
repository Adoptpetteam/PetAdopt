import { useEffect, useState } from "react";
import { Card, Table, Tag, Button, Space, Modal, Input, message, Row, Col, Statistic, Select, DatePicker, Tooltip } from "antd";
import {
  EyeOutlined, CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined, SearchOutlined, 
  ReloadOutlined, MedicineBoxOutlined, CalendarOutlined, BellOutlined, UserOutlined,
  PlusOutlined, SendOutlined
} from "@ant-design/icons";
import { apiClient } from "../../api/http";
import type { ColumnsType } from "antd/es/table";

interface VaccinationSchedule {
  _id: string;
  petName: string;
  ownerName: string;
  ownerEmail: string;
  vaccineName: string;
  vaccineType: string;
  scheduledDate: string;
  completedDate?: string;
  status: string;
  description: string;
  veterinarian?: {
    name?: string;
    clinic?: string;
  };
  doseNumber?: number;
  totalDoses?: number;
  pet: {
    _id: string;
    name: string;
    images: string[];
    species: string;
  };
  owner: {
    _id: string;
    name: string;
    email: string;
  };
}

export default function Vaccinations() {
  const [vaccinations, setVaccinations] = useState<VaccinationSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    completed: 0,
    overdue: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/vaccinations/admin/all");
      
      if (response.data.success) {
        const data = response.data.data || [];
        setVaccinations(data);
        
        // Calculate stats
        const now = new Date();
        const stats = {
          total: data.length,
          scheduled: data.filter((v: VaccinationSchedule) => v.status === 'scheduled').length,
          completed: data.filter((v: VaccinationSchedule) => v.status === 'completed').length,
          overdue: data.filter((v: VaccinationSchedule) => 
            v.status === 'scheduled' && new Date(v.scheduledDate) < now
          ).length
        };
        setStats(stats);
      }
    } catch (error) {
      console.error(error);
      message.error("Không thể tải dữ liệu lịch tiêm");
    } finally {
      setLoading(false);
    }
  };

  const sendReminders = async () => {
    try {
      const response = await apiClient.post("/vaccinations/admin/send-reminders");
      if (response.data.success) {
        message.success(response.data.message);
        fetchData();
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể gửi nhắc nhở");
    }
  };

  const deleteVaccination = async (id: string) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc muốn xóa lịch tiêm này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await apiClient.delete(`/vaccinations/${id}`);
          message.success("Đã xóa lịch tiêm");
          fetchData();
        } catch (error) {
          message.error("Không thể xóa lịch tiêm");
        }
      },
    });
  };

  const statusConfig: Record<string, { color: string; label: string; icon: any }> = {
    scheduled: { color: "blue", label: "Đã lên lịch", icon: <CalendarOutlined /> },
    reminded: { color: "orange", label: "Đã nhắc nhở", icon: <BellOutlined /> },
    completed: { color: "green", label: "Đã hoàn thành", icon: <CheckCircleOutlined /> },
    missed: { color: "red", label: "Trễ hẹn", icon: <CloseCircleOutlined /> },
    cancelled: { color: "default", label: "Đã hủy", icon: <CloseCircleOutlined /> },
  };

  const getImageUrl = (imagePath: string) => {
    if (imagePath?.startsWith('http')) {
      return imagePath;
    }
    return `http://localhost:5000${imagePath}`;
  };

  const filteredVaccinations = vaccinations.filter((vaccination) => {
    const matchStatus = statusFilter === "all" || vaccination.status === statusFilter;
    const matchSearch = 
      searchText === "" ||
      vaccination.petName.toLowerCase().includes(searchText.toLowerCase()) ||
      vaccination.ownerName.toLowerCase().includes(searchText.toLowerCase()) ||
      vaccination.vaccineName.toLowerCase().includes(searchText.toLowerCase()) ||
      vaccination.ownerEmail.toLowerCase().includes(searchText.toLowerCase());
    
    return matchStatus && matchSearch;
  });

  const columns: ColumnsType<VaccinationSchedule> = [
    {
      title: "Thú cưng",
      key: "pet",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          {record.pet?.images?.[0] && (
            <img
              src={getImageUrl(record.pet.images[0])}
              alt={record.petName}
              className="w-12 h-12 rounded-lg object-cover border-2 border-white shadow"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://placehold.co/48x48?text=Pet";
              }}
            />
          )}
          <div>
            <div className="font-semibold text-gray-800">{record.petName}</div>
            <div className="text-xs text-gray-500">{record.pet?.species}</div>
          </div>
        </div>
      ),
      width: 150,
    },
    {
      title: "Chủ nuôi",
      key: "owner",
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#6272B6] to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {record.ownerName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-gray-800">{record.ownerName}</div>
            <div className="text-xs text-gray-500">{record.ownerEmail}</div>
          </div>
        </div>
      ),
      width: 180,
    },
    {
      title: "Vaccine",
      key: "vaccine",
      render: (_, record) => (
        <div>
          <div className="font-semibold text-gray-800">{record.vaccineName}</div>
          <div className="text-xs text-gray-500">
            {record.vaccineType} 
            {record.doseNumber && record.totalDoses && (
              <span> • Liều {record.doseNumber}/{record.totalDoses}</span>
            )}
          </div>
          {record.veterinarian?.name && (
            <div className="text-xs text-blue-600">BS: {record.veterinarian.name}</div>
          )}
        </div>
      ),
      width: 200,
    },
    {
      title: "Ngày tiêm",
      key: "scheduledDate",
      render: (_, record) => {
        const scheduledDate = new Date(record.scheduledDate);
        const isOverdue = record.status === 'scheduled' && scheduledDate < new Date();
        
        return (
          <div className="text-sm">
            <div className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-800'}`}>
              {scheduledDate.toLocaleDateString("vi-VN")}
            </div>
            <div className="text-gray-400">
              {scheduledDate.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
            </div>
            {record.completedDate && (
              <div className="text-xs text-green-600">
                Hoàn thành: {new Date(record.completedDate).toLocaleDateString("vi-VN")}
              </div>
            )}
          </div>
        );
      },
      width: 130,
      sorter: (a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime(),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string, record) => {
        const config = statusConfig[status] || statusConfig.scheduled;
        const isOverdue = status === 'scheduled' && new Date(record.scheduledDate) < new Date();
        
        if (isOverdue) {
          return (
            <Tag icon={<CloseCircleOutlined />} color="red" className="px-3 py-1">
              Trễ hẹn
            </Tag>
          );
        }
        
        return (
          <Tag icon={config.icon} color={config.color} className="px-3 py-1">
            {config.label}
          </Tag>
        );
      },
      width: 130,
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
              className="bg-[#6272B6] border-0"
            />
          </Tooltip>

          <Tooltip title="Xóa">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => deleteVaccination(record._id)}
            />
          </Tooltip>
        </Space>
      ),
      width: 100,
      fixed: "right",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6272B6] to-purple-600 flex items-center gap-2">
            <MedicineBoxOutlined /> Quản lý lịch tiêm phòng
          </h1>
          <p className="text-gray-500 mt-1">Theo dõi và quản lý lịch tiêm phòng cho thú cưng</p>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={sendReminders}
            className="bg-orange-500 border-0"
          >
            Gửi nhắc nhở
          </Button>
        </Space>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Tổng lịch tiêm"
              value={stats.total}
              prefix={<MedicineBoxOutlined className="text-[#6272B6]" />}
              valueStyle={{ color: "#6272B6", fontSize: "24px", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Đã lên lịch"
              value={stats.scheduled}
              prefix={<CalendarOutlined className="text-blue-500" />}
              valueStyle={{ color: "#3b82f6", fontSize: "24px", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Đã hoàn thành"
              value={stats.completed}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              valueStyle={{ color: "#10b981", fontSize: "24px", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Trễ hẹn"
              value={stats.overdue}
              prefix={<CloseCircleOutlined className="text-red-500" />}
              valueStyle={{ color: "#ef4444", fontSize: "24px", fontWeight: "bold" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Tìm theo tên pet, chủ nuôi, vaccine..."
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
                { label: "Đã lên lịch", value: "scheduled" },
                { label: "Đã nhắc nhở", value: "reminded" },
                { label: "Đã hoàn thành", value: "completed" },
                { label: "Trễ hẹn", value: "missed" },
                { label: "Đã hủy", value: "cancelled" },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="text-gray-600">
              Hiển thị <strong>{filteredVaccinations.length}</strong> / {vaccinations.length} lịch tiêm
            </div>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <Table
          columns={columns}
          dataSource={filteredVaccinations}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} lịch tiêm`,
          }}
          scroll={{ x: 1200 }}
          rowClassName="hover:bg-blue-50 transition-colors"
        />
      </Card>
    </div>
  );
}