import { useEffect, useState } from "react";
import { 
  Card, 
  Button, 
  Table, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  DatePicker, 
  Select, 
  message, 
  Tabs, 
  Timeline,
  Descriptions,
  Popconfirm,
  Empty,
  Tooltip
} from "antd";
import { 
  PlusOutlined, 
  CalendarOutlined, 
  MedicineBoxOutlined, 
  EditOutlined, 
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import { apiClient } from "../api/http";
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

interface VaccinationSchedule {
  _id: string;
  pet: Pet;
  petName: string;
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
  createdAt: string;
}

const VaccinationSchedule = () => {
  const [schedules, setSchedules] = useState<VaccinationSchedule[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<VaccinationSchedule | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Chỉ load schedules trước, pets sẽ load sau
      const schedulesRes = await apiClient.get("/vaccinations/me");

      if (schedulesRes.data.success) {
        setSchedules(schedulesRes.data.data);
      }

      // Tạm thời dùng mock data cho pets
      setPets([
        { _id: "1", name: "Buddy", breed: "Golden Retriever", age: 2, image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=100" },
        { _id: "2", name: "Mimi", breed: "Persian Cat", age: 1, image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=100" },
        { _id: "3", name: "Max", breed: "German Shepherd", age: 3, image: "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=100" }
      ]);
    } catch (error) {
      console.error("Error loading data:", error);
      message.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async (values: any) => {
    try {
      const payload = {
        ...values,
        scheduledDate: values.scheduledDate.toISOString(),
        veterinarian: {
          name: values.veterinarianName,
          clinic: values.veterinarianClinic,
          phone: values.veterinarianPhone
        }
      };

      const response = await apiClient.post("/vaccinations", payload);
      
      if (response.data.success) {
        message.success("Đã tạo lịch tiêm phòng thành công!");
        setModalVisible(false);
        form.resetFields();
        loadData();
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleUpdateSchedule = async (values: any) => {
    if (!editingSchedule) return;

    try {
      const payload = {
        ...values,
        scheduledDate: values.scheduledDate.toISOString(),
        veterinarian: {
          name: values.veterinarianName,
          clinic: values.veterinarianClinic,
          phone: values.veterinarianPhone
        }
      };

      const response = await apiClient.put(`/vaccinations/${editingSchedule._id}`, payload);
      
      if (response.data.success) {
        message.success("Đã cập nhật lịch tiêm phòng!");
        setModalVisible(false);
        setEditingSchedule(null);
        form.resetFields();
        loadData();
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleCompleteVaccination = async (id: string) => {
    try {
      const response = await apiClient.put(`/vaccinations/${id}/complete`, {
        completedDate: new Date().toISOString(),
        notes: "Đã hoàn thành tiêm phòng"
      });
      
      if (response.data.success) {
        message.success("Đã đánh dấu hoàn thành!");
        loadData();
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      const response = await apiClient.delete(`/vaccinations/${id}`);
      
      if (response.data.success) {
        message.success("Đã xóa lịch tiêm phòng!");
        loadData();
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const openModal = (schedule?: VaccinationSchedule) => {
    if (schedule) {
      setEditingSchedule(schedule);
      form.setFieldsValue({
        petId: schedule.pet._id,
        vaccineName: schedule.vaccineName,
        vaccineType: schedule.vaccineType,
        scheduledDate: dayjs(schedule.scheduledDate),
        description: schedule.description,
        veterinarianName: schedule.veterinarian.name,
        veterinarianClinic: schedule.veterinarian.clinic,
        veterinarianPhone: schedule.veterinarian.phone,
        doseNumber: schedule.doseNumber,
        totalDoses: schedule.totalDoses
      });
    } else {
      setEditingSchedule(null);
      form.resetFields();
    }
    setModalVisible(true);
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

  const getDaysUntilVaccination = (scheduledDate: string) => {
    const today = dayjs();
    const scheduled = dayjs(scheduledDate);
    return scheduled.diff(today, 'day');
  };

  const filteredSchedules = schedules.filter(schedule => {
    if (activeTab === "all") return true;
    if (activeTab === "upcoming") {
      const daysUntil = getDaysUntilVaccination(schedule.scheduledDate);
      return schedule.status === 'scheduled' && daysUntil >= 0;
    }
    if (activeTab === "completed") return schedule.status === 'completed';
    if (activeTab === "overdue") {
      const daysUntil = getDaysUntilVaccination(schedule.scheduledDate);
      return schedule.status === 'scheduled' && daysUntil < 0;
    }
    return true;
  });

  const columns = [
    {
      title: 'Thú cưng',
      dataIndex: 'petName',
      key: 'petName',
      render: (text: string, record: VaccinationSchedule) => (
        <div className="flex items-center gap-3">
          <img 
            src={record.pet?.image || "https://placehold.co/40x40?text=Pet"} 
            alt={text}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <div className="font-medium">{text}</div>
            <div className="text-xs text-gray-500">{record.pet?.breed}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Vaccine',
      dataIndex: 'vaccineName',
      key: 'vaccineName',
      render: (text: string, record: VaccinationSchedule) => (
        <div>
          <div className="font-medium">{text}</div>
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
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
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
        <div className="flex gap-2">
          {record.status === 'scheduled' && (
            <Tooltip title="Đánh dấu hoàn thành">
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleCompleteVaccination(record._id)}
                className="bg-green-500 hover:bg-green-600"
              />
            </Tooltip>
          )}
          
          <Tooltip title="Chỉnh sửa">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => openModal(record)}
            />
          </Tooltip>
          
          <Popconfirm
            title="Bạn có chắc muốn xóa lịch tiêm này?"
            onConfirm={() => handleDeleteSchedule(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </div>
      )
    }
  ];

  const tabItems = [
    {
      key: "all",
      label: (
        <span className="flex items-center gap-2">
          <CalendarOutlined />
          Tất cả ({schedules.length})
        </span>
      ),
    },
    {
      key: "upcoming",
      label: (
        <span className="flex items-center gap-2">
          <ClockCircleOutlined />
          Sắp tới ({schedules.filter(s => {
            const daysUntil = getDaysUntilVaccination(s.scheduledDate);
            return s.status === 'scheduled' && daysUntil >= 0;
          }).length})
        </span>
      ),
    },
    {
      key: "completed",
      label: (
        <span className="flex items-center gap-2">
          <CheckCircleOutlined />
          Đã hoàn thành ({schedules.filter(s => s.status === 'completed').length})
        </span>
      ),
    },
    {
      key: "overdue",
      label: (
        <span className="flex items-center gap-2">
          <ExclamationCircleOutlined />
          Quá hạn ({schedules.filter(s => {
            const daysUntil = getDaysUntilVaccination(s.scheduledDate);
            return s.status === 'scheduled' && daysUntil < 0;
          }).length})
        </span>
      ),
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <MedicineBoxOutlined className="text-[#6272B6]" />
              Lịch Tiêm Phòng 💉
            </h1>
            <p className="text-gray-600 mt-2">Quản lý lịch tiêm phòng cho thú cưng của bạn</p>
          </div>
          
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
            className="bg-[#6272B6] hover:bg-[#4a569d] rounded-xl"
          >
            Thêm lịch tiêm
          </Button>
        </div>

        {/* Tabs */}
        <Card className="mb-6">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            className="vaccination-tabs"
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
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `Tổng ${total} lịch tiêm`
            }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Chưa có lịch tiêm phòng nào"
                />
              )
            }}
          />
        </Card>

        {/* Modal */}
        <Modal
          title={editingSchedule ? "Chỉnh sửa lịch tiêm" : "Thêm lịch tiêm mới"}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setEditingSchedule(null);
            form.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={editingSchedule ? handleUpdateSchedule : handleCreateSchedule}
          >
            <Form.Item
              name="petId"
              label="Thú cưng"
              rules={[{ required: true, message: 'Vui lòng chọn thú cưng' }]}
            >
              <Select placeholder="Chọn thú cưng">
                {pets.map(pet => (
                  <Select.Option key={pet._id} value={pet._id}>
                    {pet.name} - {pet.breed}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="vaccineName"
                label="Tên vaccine"
                rules={[{ required: true, message: 'Vui lòng nhập tên vaccine' }]}
              >
                <Input placeholder="VD: Vaccine 5 bệnh" />
              </Form.Item>

              <Form.Item
                name="vaccineType"
                label="Loại vaccine"
                rules={[{ required: true, message: 'Vui lòng chọn loại vaccine' }]}
              >
                <Select placeholder="Chọn loại vaccine">
                  <Select.Option value="basic">Cơ bản</Select.Option>
                  <Select.Option value="rabies">Dại</Select.Option>
                  <Select.Option value="combo">Tổng hợp</Select.Option>
                  <Select.Option value="other">Khác</Select.Option>
                </Select>
              </Form.Item>
            </div>

            <Form.Item
              name="scheduledDate"
              label="Ngày giờ tiêm"
              rules={[{ required: true, message: 'Vui lòng chọn ngày giờ tiêm' }]}
            >
              <DatePicker
                showTime
                format="DD/MM/YYYY HH:mm"
                placeholder="Chọn ngày giờ tiêm"
                className="w-full"
              />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="doseNumber"
                label="Liều thứ"
                initialValue={1}
              >
                <Input type="number" min={1} />
              </Form.Item>

              <Form.Item
                name="totalDoses"
                label="Tổng số liều"
                initialValue={1}
              >
                <Input type="number" min={1} />
              </Form.Item>
            </div>

            <Form.Item
              name="description"
              label="Mô tả"
            >
              <Input.TextArea rows={3} placeholder="Ghi chú thêm về vaccine..." />
            </Form.Item>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-3">Thông tin bác sĩ thú y</h4>
              
              <Form.Item
                name="veterinarianName"
                label="Tên bác sĩ"
              >
                <Input placeholder="VD: BS. Nguyễn Văn A" />
              </Form.Item>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="veterinarianClinic"
                  label="Phòng khám"
                >
                  <Input placeholder="VD: Phòng khám thú y ABC" />
                </Form.Item>

                <Form.Item
                  name="veterinarianPhone"
                  label="Số điện thoại"
                >
                  <Input placeholder="VD: 0123456789" />
                </Form.Item>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button onClick={() => setModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" className="bg-[#6272B6]">
                {editingSchedule ? 'Cập nhật' : 'Tạo lịch tiêm'}
              </Button>
            </div>
          </Form>
        </Modal>
      </div>

      <style jsx="true">{`
        .vaccination-tabs .ant-tabs-tab {
          border-radius: 8px !important;
          margin-right: 8px !important;
        }
        .vaccination-tabs .ant-tabs-tab-active {
          background: #6272B6 !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
};

export default VaccinationSchedule;