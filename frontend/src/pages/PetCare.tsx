import { useState, useEffect } from 'react';
import { Card, Row, Col, Tabs, Timeline, Progress, Tag, Button, Modal, Form, Input, DatePicker, Select, message, Empty } from 'antd';
import type { TabsProps } from 'antd';
import { 
  HeartOutlined, 
  MedicineBoxOutlined, 
  CalendarOutlined, 
  FileTextOutlined,
  PlusOutlined,
  BellOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PetCare.css';

const { TextArea } = Input;

interface Pet {
  _id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  images: string[];
}

interface HealthRecord {
  _id: string;
  date: string;
  type: string;
  description: string;
  veterinarian: string;
  nextCheckup?: string;
}

interface VaccinationSchedule {
  _id: string;
  vaccineName: string;
  vaccineType: string;
  scheduledDate: string;
  status: string;
  description: string;
  veterinarian?: {
    name?: string;
    clinic?: string;
  };
  doseNumber?: number;
  totalDoses?: number;
}

export default function PetCare() {
  const [myPets, setMyPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [vaccinations, setVaccinations] = useState<VaccinationSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [vaccinationModalVisible, setVaccinationModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [vaccinationForm] = Form.useForm();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchMyPets();
  }, []);

  const fetchMyPets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch adopted pets from adoption requests
      const response = await axios.get(`${API_URL}/adoption/my-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const approvedAdoptions = response.data.data.filter((req: any) => req.status === 'approved');
      const pets = approvedAdoptions.map((req: any) => req.pet).filter(Boolean);
      
      setMyPets(pets);
      if (pets.length > 0) {
        setSelectedPet(pets[0]);
        fetchHealthRecords(pets[0]._id);
      }
      fetchVaccinations();
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHealthRecords = async (petId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/health-records/pet/${petId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHealthRecords(response.data.data || []);
    } catch (error) {
      console.error('Error fetching health records:', error);
      setHealthRecords([]);
    }
  };

  const fetchVaccinations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/vaccinations/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVaccinations(response.data.data || []);
    } catch (error) {
      console.error('Error fetching vaccinations:', error);
      setVaccinations([]);
    }
  };

  const handleCompleteVaccination = async (vaccinationId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/vaccinations/${vaccinationId}/complete`,
        { completedDate: new Date().toISOString() },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      message.success('Đã đánh dấu hoàn thành tiêm phòng');
      fetchVaccinations();
    } catch (error) {
      message.error('Không thể cập nhật trạng thái');
    }
  };

  const handleAddVaccination = async (values: any) => {
    try {
      if (!selectedPet) return;
      
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/vaccinations`,
        {
          petId: selectedPet._id,
          ...values,
          scheduledDate: values.scheduledDate.toISOString()
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      message.success('Đã thêm lịch tiêm phòng');
      setVaccinationModalVisible(false);
      vaccinationForm.resetFields();
      fetchVaccinations();
    } catch (error) {
      message.error('Không thể thêm lịch tiêm');
    }
  };

  const handleAddRecord = async (values: any) => {
    try {
      if (!selectedPet) return;
      
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/health-records/pet/${selectedPet._id}`,
        {
          ...values,
          date: values.date.toISOString(),
          nextCheckup: values.nextCheckup?.toISOString()
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      message.success('Đã thêm hồ sơ sức khỏe');
      setModalVisible(false);
      form.resetFields();
      fetchHealthRecords(selectedPet._id);
    } catch (error) {
      message.error('Không thể thêm hồ sơ');
    }
  };

  const careGuides = [
    {
      title: '🍖 Dinh dưỡng',
      items: [
        'Cho ăn 2-3 bữa/ngày với khẩu phần phù hợp',
        'Luôn có nước sạch để uống',
        'Tránh cho ăn đồ ăn người như chocolate, nho',
        'Bổ sung vitamin theo chỉ định bác sĩ'
      ]
    },
    {
      title: '🏃 Vận động',
      items: [
        'Dắt đi dạo ít nhất 30 phút/ngày',
        'Chơi đùa và tương tác thường xuyên',
        'Tạo không gian vận động trong nhà',
        'Tham gia các hoạt động ngoài trời'
      ]
    },
    {
      title: '🛁 Vệ sinh',
      items: [
        'Tắm 1-2 lần/tuần với sữa tắm chuyên dụng',
        'Chải lông hàng ngày',
        'Cắt móng định kỳ',
        'Vệ sinh tai và răng miệng'
      ]
    },
    {
      title: '💉 Y tế',
      items: [
        'Tiêm phòng đầy đủ theo lịch',
        'Tẩy giun 3-6 tháng/lần',
        'Khám sức khỏe định kỳ 6 tháng/lần',
        'Theo dõi dấu hiệu bất thường'
      ]
    }
  ];

  const upcomingTasks = [
    { task: 'Tiêm phòng dại', date: '15/06/2026', priority: 'high' },
    { task: 'Tẩy giun', date: '20/06/2026', priority: 'medium' },
    { task: 'Khám sức khỏe định kỳ', date: '01/07/2026', priority: 'low' },
    { task: 'Cắt móng', date: '10/06/2026', priority: 'low' }
  ];

  return (
    <div className="pet-care-page">
      <div className="container">
        {/* Header */}
        <div className="pet-care-header">
          <div>
            <h1>🐾 Chăm Sóc Thú Cưng</h1>
            <p>Quản lý sức khỏe và chăm sóc thú cưng của bạn</p>
          </div>
          <Button
            type="primary"
            icon={<CalendarOutlined />}
            size="large"
            onClick={() => navigate('/vaccination-schedule')}
          >
            Lịch tiêm phòng
          </Button>
        </div>

        {loading ? (
          <div className="pet-care-loading">Đang tải...</div>
        ) : myPets.length === 0 ? (
          <Card className="pet-care-empty">
            <Empty
              description={
                <div>
                  <h3>Bạn chưa nhận nuôi thú cưng nào</h3>
                  <p>Hãy nhận nuôi một bé để bắt đầu chăm sóc nhé!</p>
                </div>
              }
            />
            <Button type="primary" size="large" onClick={() => navigate('/adopt')}>
              Nhận nuôi ngay
            </Button>
          </Card>
        ) : (
          <>
            {/* Pet Selection */}
            <div className="pet-selection">
              {myPets.map((pet) => (
                <Card
                  key={pet._id}
                  hoverable
                  className={`pet-card ${selectedPet?._id === pet._id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedPet(pet);
                    fetchHealthRecords(pet._id);
                  }}
                  cover={
                    <img
                      src={pet.images[0]?.startsWith('http') ? pet.images[0] : `http://localhost:5000${pet.images[0]}` || 'https://via.placeholder.com/200'}
                      alt={pet.name}
                    />
                  }
                >
                  <Card.Meta
                    title={pet.name}
                    description={`${pet.breed} • ${pet.age} tuổi`}
                  />
                </Card>
              ))}
            </div>

            {selectedPet && (
              <Tabs 
                defaultActiveKey="1" 
                className="pet-care-tabs"
                items={[
                  {
                    key: "1",
                    label: (
                      <span>
                        <HeartOutlined />
                        Tổng quan
                      </span>
                    ),
                    children: (
                      <Row gutter={[24, 24]}>
                        {/* Health Status */}
                        <Col xs={24} lg={12}>
                          <Card title="📊 Tình trạng sức khỏe" className="health-card">
                            <div className="health-item">
                              <span>Tiêm phòng</span>
                              <Progress 
                                percent={Math.min(100, (vaccinations.filter(v => v.status === 'completed').length / Math.max(1, vaccinations.length)) * 100)} 
                                status="active" 
                                strokeColor="#52c41a" 
                              />
                              <small>{vaccinations.filter(v => v.status === 'completed').length}/{vaccinations.length} đã hoàn thành</small>
                            </div>
                            <div className="health-item">
                              <span>Khám sức khỏe</span>
                              <Progress 
                                percent={healthRecords.filter(r => r.type === 'checkup').length > 0 ? 100 : 0} 
                                strokeColor="#1890ff" 
                              />
                              <small>{healthRecords.filter(r => r.type === 'checkup').length} lần khám</small>
                            </div>
                            <div className="health-item">
                              <span>Hồ sơ y tế</span>
                              <Progress 
                                percent={Math.min(100, healthRecords.length * 10)} 
                                status="active" 
                                strokeColor="#722ed1" 
                              />
                              <small>{healthRecords.length} hồ sơ</small>
                            </div>
                          </Card>
                        </Col>

                        {/* Upcoming Tasks */}
                        <Col xs={24} lg={12}>
                          <Card 
                            title="📅 Lịch chăm sóc sắp tới"
                            extra={
                              <Button 
                                type="link" 
                                icon={<PlusOutlined />}
                                onClick={() => setVaccinationModalVisible(true)}
                              >
                                Thêm
                              </Button>
                            }
                          >
                            <Timeline
                              items={[
                                // Upcoming vaccinations
                                ...vaccinations
                                  .filter(v => v.status === 'scheduled' && new Date(v.scheduledDate) > new Date())
                                  .slice(0, 3)
                                  .map((vaccination, index) => ({
                                  key: `vaccination-${index}`,
                                  dot: <ClockCircleOutlined style={{ fontSize: '16px', color: '#1890ff' }} />,
                                  color: "blue",
                                  children: (
                                    <div className="timeline-content">
                                      <strong>💉 {vaccination.vaccineName}</strong>
                                      <br />
                                      <span className="timeline-date">
                                        {new Date(vaccination.scheduledDate).toLocaleDateString('vi-VN')}
                                      </span>
                                    </div>
                                  )
                                })),
                                
                                // Upcoming checkups
                                ...healthRecords
                                  .filter(r => r.nextCheckup && new Date(r.nextCheckup) > new Date())
                                  .slice(0, 2)
                                  .map((record, index) => ({
                                  key: `checkup-${index}`,
                                  dot: <CheckCircleOutlined style={{ fontSize: '16px', color: '#52c41a' }} />,
                                  color: "green",
                                  children: (
                                    <div className="timeline-content">
                                      <strong>🏥 Tái khám</strong>
                                      <br />
                                      <span className="timeline-date">
                                        {new Date(record.nextCheckup).toLocaleDateString('vi-VN')}
                                      </span>
                                    </div>
                                  )
                                })),

                                // Default tasks if no data
                                ...(vaccinations.filter(v => v.status === 'scheduled').length === 0 && 
                                   healthRecords.filter(r => r.nextCheckup && new Date(r.nextCheckup) > new Date()).length === 0 ? [
                                  {
                                    key: 'default-1',
                                    dot: <ClockCircleOutlined style={{ fontSize: '16px', color: '#faad14' }} />,
                                    color: "orange",
                                    children: (
                                      <div className="timeline-content">
                                        <strong>📋 Lên lịch khám định kỳ</strong>
                                        <br />
                                        <span className="timeline-date">Chưa có lịch</span>
                                      </div>
                                    )
                                  },
                                  {
                                    key: 'default-2',
                                    dot: <BellOutlined style={{ fontSize: '16px', color: '#722ed1' }} />,
                                    color: "purple",
                                    children: (
                                      <div className="timeline-content">
                                        <strong>💉 Cập nhật lịch tiêm</strong>
                                        <br />
                                        <span className="timeline-date">Chưa có lịch</span>
                                      </div>
                                    )
                                  }
                                ] : [])
                              ]}
                            />
                          </Card>
                        </Col>

                        {/* Care Guides */}
                        <Col xs={24}>
                          <Card title="📖 Hướng dẫn chăm sóc">
                            <Row gutter={[16, 16]}>
                              {careGuides.map((guide, index) => (
                                <Col xs={24} sm={12} lg={6} key={index}>
                                  <Card className="guide-card" hoverable>
                                    <h3>{guide.title}</h3>
                                    <ul>
                                      {guide.items.map((item, i) => (
                                        <li key={i}>{item}</li>
                                      ))}
                                    </ul>
                                  </Card>
                                </Col>
                              ))}
                            </Row>
                          </Card>
                        </Col>
                      </Row>
                    )
                  },
                  {
                    key: "2",
                    label: (
                      <span>
                        <MedicineBoxOutlined />
                        Hồ sơ sức khỏe
                      </span>
                    ),
                    children: (
                      <Card
                        title="Lịch sử khám bệnh"
                        extra={
                          <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setModalVisible(true)}
                          >
                            Thêm hồ sơ
                          </Button>
                        }
                      >
                        {healthRecords.length > 0 ? (
                          <Timeline 
                            mode="left"
                            items={healthRecords.map((record) => ({
                              key: record._id,
                              label: new Date(record.date).toLocaleDateString('vi-VN'),
                              color: record.type === 'vaccination' ? 'green' :
                                     record.type === 'checkup' ? 'blue' :
                                     record.type === 'treatment' ? 'orange' : 'gray',
                              children: (
                                <div>
                                  <strong>
                                    {record.type === 'vaccination' ? '💉 Tiêm phòng' :
                                     record.type === 'checkup' ? '🏥 Khám tổng quát' :
                                     record.type === 'treatment' ? '💊 Điều trị' : '📋 Khác'}
                                  </strong>
                                  <p>Bác sĩ: {record.veterinarian}</p>
                                  <p>{record.description}</p>
                                  {record.nextCheckup && (
                                    <p>Tái khám: {new Date(record.nextCheckup).toLocaleDateString('vi-VN')}</p>
                                  )}
                                  <Tag color={
                                    record.type === 'vaccination' ? 'success' :
                                    record.type === 'checkup' ? 'processing' :
                                    record.type === 'treatment' ? 'warning' : 'default'
                                  }>
                                    {record.type === 'vaccination' ? 'Hoàn thành' :
                                     record.type === 'checkup' ? 'Theo dõi' :
                                     record.type === 'treatment' ? 'Đang điều trị' : 'Ghi chú'}
                                  </Tag>
                                </div>
                              )
                            }))}
                          />
                        ) : (
                          <Empty description="Chưa có hồ sơ sức khỏe nào" />
                        )}
                      </Card>
                    )
                  },
                  {
                    key: "3",
                    label: (
                      <span>
                        <CalendarOutlined />
                        Lịch tiêm phòng
                      </span>
                    ),
                    children: (
                      <Card
                        title="Lịch tiêm phòng"
                        extra={
                          <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setVaccinationModalVisible(true)}
                          >
                            Thêm lịch tiêm
                          </Button>
                        }
                      >
                        {vaccinations.length > 0 ? (
                          <Timeline 
                            mode="left"
                            items={vaccinations.map((vaccination) => ({
                              key: vaccination._id,
                              label: new Date(vaccination.scheduledDate).toLocaleDateString('vi-VN'),
                              color: vaccination.status === 'completed' ? 'green' :
                                     vaccination.status === 'scheduled' ? 'blue' :
                                     vaccination.status === 'reminded' ? 'orange' : 'red',
                              children: (
                                <div className="vaccination-item">
                                  <strong>💉 {vaccination.vaccineName}</strong>
                                  <p>Loại: {vaccination.vaccineType}</p>
                                  {vaccination.description && <p>{vaccination.description}</p>}
                                  {vaccination.veterinarian?.name && (
                                    <p>Bác sĩ: {vaccination.veterinarian.name}</p>
                                  )}
                                  {vaccination.veterinarian?.clinic && (
                                    <p>Phòng khám: {vaccination.veterinarian.clinic}</p>
                                  )}
                                  {vaccination.doseNumber && vaccination.totalDoses && (
                                    <p>Liều: {vaccination.doseNumber}/{vaccination.totalDoses}</p>
                                  )}
                                  <Tag color={
                                    vaccination.status === 'completed' ? 'success' :
                                    vaccination.status === 'scheduled' ? 'processing' :
                                    vaccination.status === 'reminded' ? 'warning' : 'error'
                                  }>
                                    {vaccination.status === 'completed' ? 'Đã tiêm' :
                                     vaccination.status === 'scheduled' ? 'Đã lên lịch' :
                                     vaccination.status === 'reminded' ? 'Đã nhắc nhở' : 'Trễ hẹn'}
                                  </Tag>
                                  {vaccination.status === 'scheduled' && (
                                    <Button
                                      type="link"
                                      size="small"
                                      onClick={() => handleCompleteVaccination(vaccination._id)}
                                    >
                                      Đánh dấu hoàn thành
                                    </Button>
                                  )}
                                </div>
                              )
                            }))}
                          />
                        ) : (
                          <Empty description="Chưa có lịch tiêm phòng nào" />
                        )}
                      </Card>
                    )
                  },
                  {
                    key: "4",
                    label: (
                      <span>
                        <FileTextOutlined />
                        Mẹo chăm sóc
                      </span>
                    ),
                    children: (
                      <Row gutter={[24, 24]}>
                        <Col xs={24} md={12}>
                          <Card title="🌟 Mẹo hàng ngày" className="tips-card">
                            <ul className="tips-list">
                              <li>Chải lông mỗi ngày để giảm rụng lông</li>
                              <li>Kiểm tra tai và mắt thường xuyên</li>
                              <li>Tạo thói quen ăn uống đều đặn</li>
                              <li>Dành thời gian chơi đùa mỗi ngày</li>
                              <li>Giữ môi trường sống sạch sẽ</li>
                            </ul>
                          </Card>
                        </Col>
                        <Col xs={24} md={12}>
                          <Card title="⚠️ Dấu hiệu cần chú ý" className="tips-card warning">
                            <ul className="tips-list">
                              <li>Không ăn uống trong 24h</li>
                              <li>Nôn mửa hoặc tiêu chảy liên tục</li>
                              <li>Sốt cao hoặc run rẩy</li>
                              <li>Khó thở hoặc ho dai dẳng</li>
                              <li>Thay đổi hành vi đột ngột</li>
                            </ul>
                            <Button type="primary" danger block>
                              Liên hệ bác sĩ ngay
                            </Button>
                          </Card>
                        </Col>
                      </Row>
                    )
                  }
                ]}
              />
            )}
          </>
        )}

        {/* Add Vaccination Modal */}
        <Modal
          title="Thêm lịch tiêm phòng"
          open={vaccinationModalVisible}
          onCancel={() => setVaccinationModalVisible(false)}
          footer={null}
        >
          <Form form={vaccinationForm} layout="vertical" onFinish={handleAddVaccination}>
            <Form.Item
              name="vaccineName"
              label="Tên vaccine"
              rules={[{ required: true, message: 'Vui lòng nhập tên vaccine' }]}
            >
              <Input placeholder="VD: Vaccine dại, 5 bệnh..." />
            </Form.Item>

            <Form.Item
              name="vaccineType"
              label="Loại vaccine"
              rules={[{ required: true, message: 'Vui lòng chọn loại vaccine' }]}
            >
              <Select>
                <Select.Option value="basic">Cơ bản</Select.Option>
                <Select.Option value="rabies">Dại</Select.Option>
                <Select.Option value="combo">Tổng hợp</Select.Option>
                <Select.Option value="other">Khác</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="scheduledDate"
              label="Ngày tiêm"
              rules={[{ required: true, message: 'Vui lòng chọn ngày tiêm' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="description"
              label="Mô tả"
            >
              <TextArea rows={3} placeholder="Ghi chú về vaccine..." />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="doseNumber"
                  label="Liều thứ"
                >
                  <Input type="number" min={1} placeholder="1" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="totalDoses"
                  label="Tổng số liều"
                >
                  <Input type="number" min={1} placeholder="1" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Thông tin bác sĩ">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name={['veterinarian', 'name']}
                    label="Tên bác sĩ"
                  >
                    <Input placeholder="Bác sĩ Nguyễn Văn A" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name={['veterinarian', 'clinic']}
                    label="Phòng khám"
                  >
                    <Input placeholder="Phòng khám thú y ABC" />
                  </Form.Item>
                </Col>
              </Row>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Thêm lịch tiêm
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        {/* Add Health Record Modal */}
        <Modal
          title="Thêm hồ sơ sức khỏe"
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleAddRecord}>
            <Form.Item
              name="type"
              label="Loại"
              rules={[{ required: true, message: 'Vui lòng chọn loại' }]}
            >
              <Select>
                <Select.Option value="vaccination">Tiêm phòng</Select.Option>
                <Select.Option value="checkup">Khám bệnh</Select.Option>
                <Select.Option value="treatment">Điều trị</Select.Option>
                <Select.Option value="other">Khác</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="date"
              label="Ngày"
              rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="veterinarian"
              label="Bác sĩ thú y"
              rules={[{ required: true, message: 'Vui lòng nhập tên bác sĩ' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="description"
              label="Mô tả"
              rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
            >
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item
              name="weight"
              label="Cân nặng (kg)"
            >
              <Input type="number" step="0.1" />
            </Form.Item>

            <Form.Item
              name="nextCheckup"
              label="Ngày tái khám"
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Thêm hồ sơ
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
