import { useEffect, useState } from "react";
import { 
  Card, 
  Button, 
  Table, 
  Tag, 
  Input, 
  Select, 
  DatePicker, 
  message, 
  Tabs,
  Descriptions,
  Modal,
  Statistic,
  Row,
  Col,
  Tooltip,
  Space,
  Badge
} from "antd";
import { 
  CalendarOutlined, 
  MedicineBoxOutlined, 
  SendOutlined,
  SearchOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined
} from "@ant-design/icons";
import { apiClient } from "../../api/http";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

interface Pet {
  _id: string;
  name: string;
  breed: string;
  age: number;
  image: string;
}

interface Owner {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

interface VaccinationSchedule {
  _id: string;
  pet: Pet;
  owner: Owner;
  petName: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  vaccineName: string;
  vaccineType: string;
  scheduledDate: string;
  completedDate?: string;
  status: 'scheduled' | 'reminded' | 'completed' | 'missed' | 'cancelled';
  description: string;
  veterinarian: {
    name?: string;
    clinic?: string;
    phone?: string;
  };
  doseNumber: number;
  totalDoses: number;
  notes: string;
  reminderSent: boolean;
  reminderSentAt?: string;
  createdAt: string;
}

const VaccinationAdmin = () => {
  const [schedules, setSchedules] = useState<VaccinationSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<VaccinationSchedule | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [sendingReminders, setSendingReminders] = useState(false);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/vaccinations/admin/all", {
        params: {
          limit: 100,
          search: searchText,
          status: statusFilter
        }
      });

      if (response.data.success) {
        setSchedules(response.data.data);
      }
    } catch (error) {
      console.error("Error loading schedules:", error);
      message.error("Không thể tải dữ liệu lịch tiêm");
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminders = async () => {
    try {
      setSendingReminders(true);
      const response = await apiClient.post("/vaccinations/admin/send-reminders");
      
      if (response.data.success) {
        const { sent, errors, total } = response.data.data;
        message.success(`Đã gửi ${sent}/${total} email nhắc nhở thành công! ${errors > 0 ? `(${errors} lỗi)` : ''}`);
        loadSchedules(); // Reload để cập nhật trạng thái
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra khi gửi nhắc nhở");
    } finally {
      setSendingReminders(false);
    }
  };

  const getDaysUntilVaccination = (scheduledDate: string) => {
    const today = dayjs();
    const scheduled = dayjs(scheduledDate);
    return scheduled.diff(today, 'day');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'scheduled': return 'blue';
      case 'reminded': return 'orange';
      case 'missed': return 'red';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Đã hoàn thành';
      case 'scheduled': return 'Đã lên lịch';
      case 'reminded': return 'Đã nhắc nhở';
      case 'missed': return 'Đã bỏ lỡ';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const filteredSchedules = schedules.filter(schedule => {
    // Filter by tab
    if (activeTab === "upcoming") {
      const daysUntil = getDaysUntilVaccination(schedule.scheduledDate);
      return schedule.status === 'scheduled' && daysUntil >= 0;
    }
    if (activeTab === "overdue") {
      const daysUntil = getDaysUntilVaccination(schedule.scheduledDate);
      return schedule.status === 'scheduled' && daysUntil < 0;
    }
    if (activeTab === "completed") return schedule.status === 'completed';
    if (activeTab === "need-reminder") {
      const daysUntil = getDaysUntilVaccination(schedule.scheduledDate);
      return schedule.status === 'scheduled' && !schedule.reminderSent && daysUntil <= 3 && daysUntil >= 0;
    }
    
    // Filter by date range
    if (dateRange) {
      const scheduleDate = dayjs(schedule.scheduledDate);
      return scheduleDate.isAfter(dateRange[0]) && scheduleDate.isBefore(dateRange[1]);
    }
    
    return true;
  });

  // Statistics
  const stats = {
    total: schedules.length,
    upcoming: schedules.filter(s => {
      const daysUntil = getDaysUntilVaccination(s.scheduledDate);
      return s.status === 'scheduled' && daysUntil >= 0;
    }).length,
    overdue: schedules.filter(s => {
      const daysUntil = getDaysUntilVaccination(s.scheduledDate);
      return s.status === 'scheduled' && daysUntil < 0;
    }).length,
    completed: schedules.filter(s => s.status === 'completed').length,
    needReminder: schedules.filter(s => {
      const daysUntil = getDaysUntilVaccination(s.scheduledDate);
      return s.status === 'scheduled' && !s.reminderSent && daysUntil <= 3 && daysUntil >= 0;
    }).length
  };

  const columns = [
    {
      title: 'Chủ nuôi',
      key: 'owner',
      render: (record: VaccinationSchedule) => (
        <div>
          <div className="font-medium flex items-center gap-2">
            <UserOutlined className="text-gray-400" />
            {record.ownerName}
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
            <MailOutlined className="text-gray-400" />
            {record.ownerEmail}
          </div>
          {record.ownerPhone && (
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <PhoneOutlined className="text-gray-400" />
              {record.ownerPhone}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Thú cưng',
      key: 'pet',
      render: (record: VaccinationSchedule) => (
        <div className="flex items-center gap-3">
          <img 
            src={record.pet?.image || "https://placehold.co/40x40?text=Pet"} 
            alt={record.petName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <div className="font-medium">{record.petName}</div>
            <div className="text-xs text-gray-500">{record.pet?.breed}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Vaccine',
      key: 'vaccine',
      render: (record: VaccinationSchedule) => (
        <div>
          <div className="font-medium">{record.vaccineName}</div>
          <Tag size="small" color="blue">{record.vaccineType}</Tag>
          {record.totalDoses > 1 && (
            <div className="text-xs text-gray-500 mt-1">
              Liều {record.doseNumber}/{record.totalDoses}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Ngày tiêm',
      dataIndex: 'scheduledDate',
      key: 'scheduledDate',
      render: (date: string, record: VaccinationSchedule) => {
        const daysUntil = getDaysUntilVaccination(date);
        const isOverdue = daysUntil < 0 && record.status === 'scheduled';
        const isToday = daysUntil === 0;
        const isSoon = daysUntil > 0 && daysUntil <= 3;
        
        return (
          <div>
            <div className={`font-medium ${isOverdue ? 'text-red-500' : isToday ? 'text-orange-500' : isSoon ? 'text-yellow-600' : ''}`}>
              {dayjs(date).format('DD/MM/YYYY HH:mm')}
            </div>
            <div className={`text-xs ${isOverdue ? 'text-red-400' : 'text-gray-500'}`}>
              {isOverdue ? `Quá hạn ${Math.abs(daysUntil)} ngày` : 
               isToday ? 'Hôm nay' :
               daysUntil === 1 ? 'Ngày mai' :
               daysUntil > 0 ? `Còn ${daysUntil} ngày` : 
               dayjs(date).fromNow()}
            </div>
          </div>
        );
      }
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (record: VaccinationSchedule) => (
        <div>
          <Tag color={getStatusColor(record.status)}>
            {getStatusText(record.status)}
          </Tag>
          {record.reminderSent && (
            <div className="text-xs text-green-600 mt-1">
              ✓ Đã nhắc nhở {record.reminderSentAt && dayjs(record.reminderSentAt).format('DD/MM HH:mm')}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Bác sĩ thú y',
      key: 'veterinarian',
      render: (record: VaccinationSchedule) => (
        <div>
          {record.veterinarian.name && (
            <div className="font-medium">{record.veterinarian.name}</div>
          )}
          {record.veterinarian.clinic && (
            <div className="text-sm text-gray-600">{record.veterinarian.clinic}</div>
          )}
          {record.veterinarian.phone && (
            <div className="text-xs text-gray-500">{record.veterinarian.phone}</div>
          )}
        </div>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (record: VaccinationSchedule) => (
        <Button
          size="small"
          onClick={() => {
            setSelectedSchedule(record);
            setDetailModalVisible(true);
          }}
        >
          Chi tiết
        </Button>
      )
    }
  ];

  const tabItems = [
    {
      key: "all",
      label: (
        <span className="flex items-center gap-2">
          <CalendarOutlined />
          Tất cả ({stats.total})
        </span>
      ),
    },
    {
      key: "upcoming",
      label: (
        <span className="flex items-center gap-2">
          <ClockCircleOutlined />
          Sắp tới ({stats.upcoming})
        </span>
      ),
    },
    {
      key: "overdue",
      label: (
        <span className="flex items-center gap-2">
          <ExclamationCircleOutlined />
          Quá hạn ({stats.overdue})
        </span>
      ),
    },
    {
      key: "need-reminder",
      label: (
        <span className="flex items-center gap-2">
          <SendOutlined />
          Cần nhắc nhở ({stats.needReminder})
        </span>
      ),
    },
    {
      key: "completed",
      label: (
        <span className="flex items-center gap-2">
          <CheckCircleOutlined />
          Đã hoàn thành ({stats.completed})
        </span>
      ),
    }
  ];

  return (
    <div className="p-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <MedicineBoxOutlined className="text-[#6272B6]" />
            Quản Lý Lịch Tiêm Phòng 💉
          </h1>
          <p className="text-gray-600 mt-1">Theo dõi và quản lý lịch tiêm phòng của tất cả thú cưng</p>
        </div>
        
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadSchedules}
            loading={loading}
          >
            Làm mới
          </Button>
          
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendReminders}
            loading={sendingReminders}
            className="bg-[#6272B6] hover:bg-[#4a569d]"
          >
            Gửi nhắc nhở ({stats.needReminder})
          </Button>
        </Space>
      </div>

      {/* Statistics */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng lịch tiêm"
              value={stats.total}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Sắp tới"
              value={stats.upcoming}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Quá hạn"
              value={stats.overdue}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Cần nhắc nhở"
              value={stats.needReminder}
              prefix={<SendOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Tìm kiếm theo tên chủ, thú cưng, vaccine..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={loadSchedules}
          />
          
          <Select
            placeholder="Lọc theo trạng thái"
            value={statusFilter}
            onChange={setStatusFilter}
            allowClear
          >
            <Select.Option value="scheduled">Đã lên lịch</Select.Option>
            <Select.Option value="reminded">Đã nhắc nhở</Select.Option>
            <Select.Option value="completed">Đã hoàn thành</Select.Option>
            <Select.Option value="missed">Đã bỏ lỡ</Select.Option>
            <Select.Option value="cancelled">Đã hủy</Select.Option>
          </Select>
          
          <DatePicker.RangePicker
            placeholder={['Từ ngày', 'Đến ngày']}
            value={dateRange}
            onChange={setDateRange}
            format="DD/MM/YYYY"
          />
          
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={loadSchedules}
            className="bg-[#6272B6]"
          >
            Tìm kiếm
          </Button>
        </div>
      </Card>

      {/* Tabs */}
      <Card className="mb-6">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="vaccination-admin-tabs"
        />
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredSchedules}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} lịch tiêm`
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết lịch tiêm phòng"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedSchedule && (
          <div>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Chủ nuôi" span={2}>
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-medium">{selectedSchedule.ownerName}</div>
                    <div className="text-sm text-gray-600">{selectedSchedule.ownerEmail}</div>
                    {selectedSchedule.ownerPhone && (
                      <div className="text-sm text-gray-600">{selectedSchedule.ownerPhone}</div>
                    )}
                  </div>
                </div>
              </Descriptions.Item>
              
              <Descriptions.Item label="Thú cưng">
                <div className="flex items-center gap-3">
                  <img 
                    src={selectedSchedule.pet?.image || "https://placehold.co/40x40?text=Pet"} 
                    alt={selectedSchedule.petName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-medium">{selectedSchedule.petName}</div>
                    <div className="text-sm text-gray-600">{selectedSchedule.pet?.breed}</div>
                  </div>
                </div>
              </Descriptions.Item>
              
              <Descriptions.Item label="Vaccine">
                <div>
                  <div className="font-medium">{selectedSchedule.vaccineName}</div>
                  <Tag color="blue">{selectedSchedule.vaccineType}</Tag>
                </div>
              </Descriptions.Item>
              
              <Descriptions.Item label="Ngày tiêm">
                {dayjs(selectedSchedule.scheduledDate).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              
              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(selectedSchedule.status)}>
                  {getStatusText(selectedSchedule.status)}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Liều tiêm">
                {selectedSchedule.doseNumber}/{selectedSchedule.totalDoses}
              </Descriptions.Item>
              
              <Descriptions.Item label="Nhắc nhở">
                {selectedSchedule.reminderSent ? (
                  <div className="text-green-600">
                    ✓ Đã gửi {selectedSchedule.reminderSentAt && dayjs(selectedSchedule.reminderSentAt).format('DD/MM/YYYY HH:mm')}
                  </div>
                ) : (
                  <div className="text-gray-500">Chưa gửi</div>
                )}
              </Descriptions.Item>
              
              {selectedSchedule.veterinarian.name && (
                <Descriptions.Item label="Bác sĩ thú y" span={2}>
                  <div>
                    <div className="font-medium">{selectedSchedule.veterinarian.name}</div>
                    {selectedSchedule.veterinarian.clinic && (
                      <div className="text-sm text-gray-600">{selectedSchedule.veterinarian.clinic}</div>
                    )}
                    {selectedSchedule.veterinarian.phone && (
                      <div className="text-sm text-gray-600">{selectedSchedule.veterinarian.phone}</div>
                    )}
                  </div>
                </Descriptions.Item>
              )}
              
              {selectedSchedule.description && (
                <Descriptions.Item label="Mô tả" span={2}>
                  {selectedSchedule.description}
                </Descriptions.Item>
              )}
              
              {selectedSchedule.notes && (
                <Descriptions.Item label="Ghi chú" span={2}>
                  {selectedSchedule.notes}
                </Descriptions.Item>
              )}
              
              <Descriptions.Item label="Ngày tạo">
                {dayjs(selectedSchedule.createdAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              
              {selectedSchedule.completedDate && (
                <Descriptions.Item label="Ngày hoàn thành">
                  {dayjs(selectedSchedule.completedDate).format('DD/MM/YYYY HH:mm')}
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>

      <style jsx>{`
        .vaccination-admin-tabs .ant-tabs-tab {
          border-radius: 8px !important;
          margin-right: 8px !important;
        }
        .vaccination-admin-tabs .ant-tabs-tab-active {
          background: #6272B6 !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
};

export default VaccinationAdmin;