import { useState, useEffect } from 'react';
import { Card, Row, Col, Tabs, Progress, Tag, Button, Modal, Statistic, Timeline, Empty, Avatar, Divider } from 'antd';
import type { TabsProps } from 'antd';
import { 
  HeartOutlined, 
  MedicineBoxOutlined, 
  CalendarOutlined, 
  TrophyOutlined,
  EyeOutlined,
  PlusOutlined,
  LineChartOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MyPets.css';

interface Pet {
  _id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight?: number;
  images: string[];
  createdAt: string;
}

interface AdoptedPet {
  _id: string;
  pet: Pet;
  createdAt: string;
  status: string;
}

interface HealthProfile {
  pet: Pet;
  adoption: {
    date: string;
    daysSince: number;
  };
  statistics: {
    vaccination: {
      total: number;
      completed: number;
      scheduled: number;
      missed: number;
      completionRate: number;
    };
    health: {
      totalRecords: number;
      vaccinations: number;
      checkups: number;
      treatments: number;
      lastCheckup: string | null;
      nextCheckup: string | null;
    };
  };
  weightHistory: Array<{
    date: string;
    weight: number;
  }>;
  upcomingTasks: Array<{
    type: string;
    title: string;
    date: string;
    priority: string;
  }>;
}

export default function MyPets() {
  const [adoptedPets, setAdoptedPets] = useState<AdoptedPet[]>([]);
  const [selectedPet, setSelectedPet] = useState<AdoptedPet | null>(null);
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchAdoptedPets();
  }, []);

  const fetchAdoptedPets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API_URL}/adoption/my-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const approvedAdoptions = response.data.data
        .filter((req: any) => req.status === 'approved' && req.pet)
        .map((req: any) => ({
          ...req,
          pet: {
            ...req.pet,
            images: req.pet.images || [],
            name: req.pet.name || 'Unnamed Pet',
            breed: req.pet.breed || 'Unknown breed',
            age: req.pet.age || 0
          }
        }));
        
      setAdoptedPets(approvedAdoptions);
      
      if (approvedAdoptions.length > 0) {
        setSelectedPet(approvedAdoptions[0]);
        fetchHealthProfile(approvedAdoptions[0].pet._id);
      }
    } catch (error) {
      console.error('Error fetching adopted pets:', error);
      setAdoptedPets([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHealthProfile = async (petId: string) => {
    try {
      setProfileLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/health-records/pet/${petId}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setHealthProfile(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching health profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePetSelect = (pet: AdoptedPet) => {
    setSelectedPet(pet);
    fetchHealthProfile(pet.pet._id);
  };

  const getHealthScore = (profile: HealthProfile | null) => {
    if (!profile) return 0;
    
    const vaccinationScore = profile.statistics?.vaccination?.completionRate || 0;
    const checkupScore = (profile.statistics?.health?.checkups || 0) > 0 ? 100 : 0;
    const recordScore = Math.min(100, (profile.statistics?.health?.totalRecords || 0) * 20);
    
    return Math.round((vaccinationScore * 0.5 + checkupScore * 0.3 + recordScore * 0.2));
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#faad14';
    return '#ff4d4f';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      default: return 'green';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return 'https://via.placeholder.com/200x150/f0f0f0/999?text=No+Image';
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `${API_URL.replace('/api', '')}/${imagePath}`;
  };

  return (
    <div className="my-pets-page">
      <div className="container">
        {/* Header */}
        <div className="my-pets-header">
          <div>
            <h1>🐾 Thú Cưng Của Tôi</h1>
            <p>Quản lý và theo dõi sức khỏe thú cưng đã nhận nuôi</p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => navigate('/adopt')}
          >
            Nhận nuôi thêm
          </Button>
        </div>

        {loading ? (
          <div className="my-pets-loading">Đang tải...</div>
        ) : adoptedPets.length === 0 ? (
          <Card className="my-pets-empty">
            <Empty
              description={
                <div>
                  <h3>Bạn chưa nhận nuôi thú cưng nào</h3>
                  <p>Hãy nhận nuôi một bé để bắt đầu hành trình chăm sóc nhé!</p>
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
              {adoptedPets.map((adoption) => {
                // Safety check for pet data
                if (!adoption.pet || !adoption.pet.images) {
                  return null;
                }
                
                return (
                  <Card
                    key={adoption._id}
                    hoverable
                    className={`pet-card ${selectedPet?._id === adoption._id ? 'active' : ''}`}
                    onClick={() => handlePetSelect(adoption)}
                    cover={
                      <img
                        src={adoption.pet?.images?.[0] ? getImageUrl(adoption.pet.images[0]) : 'https://via.placeholder.com/200'}
                        alt={adoption.pet.name || 'Pet'}
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/200x150/f0f0f0/999?text=No+Image';
                        }}
                      />
                    }
                  >
                    <Card.Meta
                      title={adoption.pet.name || 'Unnamed Pet'}
                      description={
                        <div>
                          <div>{adoption.pet.breed || 'Unknown breed'} • {adoption.pet.age || 0} tuổi</div>
                          <div className="adoption-date">
                            Nhận nuôi: {formatDate(adoption.createdAt)}
                          </div>
                        </div>
                      }
                    />
                    {(healthProfile || profileLoading) && selectedPet?._id === adoption._id && (
                      <div className="pet-health-score">
                        {profileLoading ? (
                          <div style={{ width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div className="loading-spinner">...</div>
                          </div>
                        ) : (
                          <Progress
                            type="circle"
                            size={50}
                            percent={getHealthScore(healthProfile)}
                            strokeColor={getHealthScoreColor(getHealthScore(healthProfile))}
                            format={(percent) => `${percent}%`}
                          />
                        )}
                        <span>Sức khỏe</span>
                      </div>
                    )}
                  </Card>
                );
              }).filter(Boolean)}
            </div>

            {selectedPet && (
              <Tabs 
                defaultActiveKey="1" 
                className="pet-profile-tabs"
                items={[
                  {
                    key: "1",
                    label: (
                      <span>
                        <TrophyOutlined />
                        Tổng quan
                      </span>
                    ),
                    children: (
                  {profileLoading ? (
                    <div className="profile-loading">Đang tải hồ sơ...</div>
                  ) : healthProfile ? (
                    <Row gutter={[24, 24]}>
                      {/* Pet Info */}
                      <Col xs={24} lg={8}>
                        <Card className="pet-info-card">
                          <div className="pet-avatar">
                            <Avatar
                              size={120}
                              src={healthProfile.pet.images && healthProfile.pet.images[0] ? 
                                getImageUrl(healthProfile.pet.images[0]) : 
                                'https://via.placeholder.com/120x120/f0f0f0/999?text=Pet'
                              }
                              icon={<HeartOutlined />}
                            />
                          </div>
                          <div className="pet-details">
                            <h2>{healthProfile.pet.name || 'Unnamed Pet'}</h2>
                            <p>{healthProfile.pet.breed || 'Unknown breed'}</p>
                            <Divider />
                            <Row gutter={16}>
                              <Col span={12}>
                                <Statistic
                                  title="Tuổi"
                                  value={healthProfile.pet.age}
                                  suffix="tuổi"
                                />
                              </Col>
                              <Col span={12}>
                                <Statistic
                                  title="Ngày nhận nuôi"
                                  value={healthProfile.adoption.daysSince}
                                  suffix="ngày"
                                />
                              </Col>
                            </Row>
                          </div>
                        </Card>
                      </Col>

                      {/* Health Statistics */}
                      <Col xs={24} lg={16}>
                        <Card title="📊 Thống kê sức khỏe" className="health-stats-card">
                          <Row gutter={[16, 16]}>
                            <Col xs={12} sm={6}>
                              <Statistic
                                title="Điểm sức khỏe"
                                value={getHealthScore(healthProfile)}
                                suffix="/100"
                                valueStyle={{ color: getHealthScoreColor(getHealthScore(healthProfile)) }}
                              />
                            </Col>
                            <Col xs={12} sm={6}>
                              <Statistic
                                title="Mũi tiêm"
                                value={healthProfile.statistics.vaccination.completed}
                                suffix={`/${healthProfile.statistics.vaccination.total}`}
                                valueStyle={{ color: '#1890ff' }}
                              />
                            </Col>
                            <Col xs={12} sm={6}>
                              <Statistic
                                title="Lần khám"
                                value={healthProfile.statistics.health.checkups}
                                valueStyle={{ color: '#52c41a' }}
                              />
                            </Col>
                            <Col xs={12} sm={6}>
                              <Statistic
                                title="Hồ sơ y tế"
                                value={healthProfile.statistics.health.totalRecords}
                                valueStyle={{ color: '#722ed1' }}
                              />
                            </Col>
                          </Row>

                          <Divider />

                          <div className="vaccination-progress">
                            <h4>Tiến độ tiêm phòng</h4>
                            <Progress
                              percent={healthProfile.statistics.vaccination.completionRate}
                              strokeColor={{
                                '0%': '#108ee9',
                                '100%': '#87d068',
                              }}
                              format={(percent) => `${percent}% hoàn thành`}
                            />
                            <div className="vaccination-breakdown">
                              <Tag color="green">Hoàn thành: {healthProfile.statistics.vaccination.completed}</Tag>
                              <Tag color="blue">Đã lên lịch: {healthProfile.statistics.vaccination.scheduled}</Tag>
                              {healthProfile.statistics.vaccination.missed > 0 && (
                                <Tag color="red">Trễ hẹn: {healthProfile.statistics.vaccination.missed}</Tag>
                              )}
                            </div>
                          </div>
                        </Card>
                      </Col>

                      {/* Upcoming Tasks */}
                      <Col xs={24}>
                        <Card 
                          title="📅 Lịch chăm sóc sắp tới"
                          extra={
                            <Button
                              type="primary"
                              icon={<CalendarOutlined />}
                              onClick={() => navigate('/pet-care')}
                            >
                              Quản lý chi tiết
                            </Button>
                          }
                        >
                          {healthProfile.upcomingTasks.length > 0 ? (
                            <Timeline>
                              {healthProfile.upcomingTasks.map((task, index) => (
                                <Timeline.Item
                                  key={index}
                                  dot={
                                    task.priority === 'high' ? (
                                      <AlertOutlined style={{ fontSize: '16px', color: '#ff4d4f' }} />
                                    ) : task.type === 'vaccination' ? (
                                      <MedicineBoxOutlined style={{ fontSize: '16px', color: '#1890ff' }} />
                                    ) : (
                                      <CheckCircleOutlined style={{ fontSize: '16px', color: '#52c41a' }} />
                                    )
                                  }
                                  color={getPriorityColor(task.priority)}
                                >
                                  <div className="timeline-content">
                                    <strong>{task.title}</strong>
                                    <br />
                                    <span className="timeline-date">
                                      {formatDate(task.date)}
                                    </span>
                                    <Tag 
                                      color={getPriorityColor(task.priority)} 
                                      size="small"
                                      style={{ marginLeft: 8 }}
                                    >
                                      {task.priority === 'high' ? 'Khẩn cấp' : 
                                       task.priority === 'medium' ? 'Quan trọng' : 'Bình thường'}
                                    </Tag>
                                  </div>
                                </Timeline.Item>
                              ))}
                            </Timeline>
                          ) : (
                            <Empty 
                              description="Không có lịch sắp tới"
                              image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                          )}
                        </Card>
                      </Col>
                    </Row>
                  ) : (
                    <Empty description="Không thể tải hồ sơ sức khỏe" />
                  )}
                </TabPane>

                {/* Health Records */}
                <TabPane
                  tab={
                    <span>
                      <MedicineBoxOutlined />
                      Hồ sơ y tế
                    </span>
                  }
                  key="2"
                >
                  <Card>
                    <div className="health-records-actions">
                      <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        onClick={() => navigate('/pet-care')}
                      >
                        Xem chi tiết
                      </Button>
                      <Button
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/pet-care')}
                      >
                        Thêm hồ sơ
                      </Button>
                    </div>
                    
                    {healthProfile && (
                      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                        <Col xs={24} sm={8}>
                          <Card className="record-summary">
                            <Statistic
                              title="Tổng hồ sơ"
                              value={healthProfile.statistics.health.totalRecords}
                              prefix={<MedicineBoxOutlined />}
                            />
                          </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                          <Card className="record-summary">
                            <Statistic
                              title="Lần tiêm phòng"
                              value={healthProfile.statistics.health.vaccinations}
                              prefix={<MedicineBoxOutlined />}
                              valueStyle={{ color: '#1890ff' }}
                            />
                          </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                          <Card className="record-summary">
                            <Statistic
                              title="Lần khám bệnh"
                              value={healthProfile.statistics.health.checkups}
                              prefix={<HeartOutlined />}
                              valueStyle={{ color: '#52c41a' }}
                            />
                          </Card>
                        </Col>
                      </Row>
                    )}
                  </Card>
                </TabPane>

                {/* Weight Tracking */}
                <TabPane
                  tab={
                    <span>
                      <LineChartOutlined />
                      Theo dõi cân nặng
                    </span>
                  }
                  key="3"
                >
                  <Card title="📈 Biểu đồ cân nặng">
                    {healthProfile && healthProfile.weightHistory.length > 0 ? (
                      <div className="weight-chart">
                        <Timeline mode="left">
                          {healthProfile.weightHistory.map((record, index) => (
                            <Timeline.Item
                              key={index}
                              label={formatDate(record.date)}
                              color="blue"
                            >
                              <strong>{record.weight} kg</strong>
                              {index > 0 && (
                                <span style={{ marginLeft: 8 }}>
                                  {record.weight > healthProfile.weightHistory[index - 1].weight ? (
                                    <Tag color="green">+{(record.weight - healthProfile.weightHistory[index - 1].weight).toFixed(1)} kg</Tag>
                                  ) : record.weight < healthProfile.weightHistory[index - 1].weight ? (
                                    <Tag color="red">{(record.weight - healthProfile.weightHistory[index - 1].weight).toFixed(1)} kg</Tag>
                                  ) : (
                                    <Tag color="blue">Không đổi</Tag>
                                  )}
                                </span>
                              )}
                            </Timeline.Item>
                          ))}
                        </Timeline>
                      </div>
                    ) : (
                      <Empty 
                        description="Chưa có dữ liệu cân nặng"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    )}
                  </Card>
                </TabPane>
              </Tabs>
            )}
          </>
        )}
      </div>
    </div>
  );
}