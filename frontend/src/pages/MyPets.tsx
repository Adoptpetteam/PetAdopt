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
    healthRecords: {
      total: number;
      lastCheckup: string | null;
      nextCheckup: string | null;
    };
    healthScore: number;
  };
  weightHistory: Array<{
    date: string;
    weight: number;
  }>;
}

export default function MyPets() {
  const [adoptedPets, setAdoptedPets] = useState<AdoptedPet[]>([]);
  const [selectedPet, setSelectedPet] = useState<AdoptedPet | null>(null);
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchAdoptedPets();
  }, []);

  useEffect(() => {
    // Error boundary effect
    const handleError = (error: any) => {
      console.error('MyPets component error:', error);
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
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

      const approvedAdoptions = response.data.data?.filter((req: any) => req.status === 'approved') || [];
      setAdoptedPets(approvedAdoptions);
      
      if (approvedAdoptions.length > 0) {
        setSelectedPet(approvedAdoptions[0]);
        fetchHealthProfile(approvedAdoptions[0].pet._id);
      }
    } catch (error) {
      console.error('Error fetching adopted pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHealthProfile = async (petId: string) => {
    if (!petId) {
      console.warn('No petId provided to fetchHealthProfile');
      return;
    }
    
    try {
      setProfileLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found for health profile request');
        return;
      }
      
      const response = await axios.get(`${API_URL}/health-records/pet/${petId}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setHealthProfile(response.data.data);
      } else {
        console.warn('Health profile request unsuccessful:', response.data);
        setHealthProfile(null);
      }
    } catch (error) {
      console.error('Error fetching health profile:', error);
      setHealthProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePetSelect = (adoption: AdoptedPet) => {
    setSelectedPet(adoption);
    if (adoption.pet?._id) {
      fetchHealthProfile(adoption.pet._id);
    }
  };

  const getHealthScore = (profile: HealthProfile | null) => {
    if (!profile?.statistics?.healthScore) return 0;
    return profile.statistics.healthScore;
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#faad14';
    return '#ff4d4f';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return 'https://via.placeholder.com/200x150/f0f0f0/999?text=No+Image';
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `${API_URL.replace('/api', '')}${imagePath}`;
  };

  const tabItems: TabsProps['items'] = [
    {
      key: "1",
      label: (
        <span>
          <TrophyOutlined />
          Tổng quan
        </span>
      ),
      children: profileLoading ? (
        <div className="profile-loading">Đang tải hồ sơ...</div>
      ) : healthProfile ? (
        <Row gutter={[24, 24]}>
          {/* Pet Info */}
          <Col xs={24} lg={8}>
            <Card className="pet-info-card">
              <div className="pet-avatar-section">
                <Avatar
                  size={120}
                  src={healthProfile?.pet?.images?.[0] ? 
                    getImageUrl(healthProfile.pet.images[0]) : 
                    'https://via.placeholder.com/120x120/f0f0f0/999?text=Pet'
                  }
                  className="pet-avatar"
                />
                <div className="pet-basic-info">
                  <h2>{healthProfile?.pet?.name || 'Unknown Pet'}</h2>
                  <p>{healthProfile?.pet?.breed || 'Unknown breed'} • {healthProfile?.pet?.age || 0} tuổi</p>
                  <Tag color="green">Đã nhận nuôi {healthProfile?.adoption?.daysSince || 0} ngày</Tag>
                </div>
              </div>
            </Card>
          </Col>

          {/* Health Score */}
          <Col xs={24} lg={8}>
            <Card className="health-score-card">
              <div className="health-score-section">
                <Progress
                  type="circle"
                  size={120}
                  percent={getHealthScore(healthProfile)}
                  strokeColor={getHealthScoreColor(getHealthScore(healthProfile))}
                  format={(percent) => (
                    <div className="health-score-text">
                      <div className="score-number">{percent}%</div>
                      <div className="score-label">Sức khỏe</div>
                    </div>
                  )}
                />
              </div>
            </Card>
          </Col>

          {/* Quick Stats */}
          <Col xs={24} lg={8}>
            <Card className="quick-stats-card">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title="Tiêm phòng"
                    value={healthProfile?.statistics?.vaccination?.completionRate || 0}
                    suffix="%"
                    prefix={<MedicineBoxOutlined />}
                    valueStyle={{ color: '#52c41a', fontSize: '18px' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Khám bệnh"
                    value={healthProfile?.statistics?.healthRecords?.total || 0}
                    prefix={<HeartOutlined />}
                    valueStyle={{ color: '#1890ff', fontSize: '18px' }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      ) : (
        <Empty description="Không thể tải hồ sơ sức khỏe" />
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
        <Card title="Lịch sử sức khỏe" className="health-records-card">
          {healthProfile?.statistics?.healthRecords?.total > 0 ? (
            <div className="health-records-content">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card size="small" title="Tiêm phòng">
                    <Statistic
                      title="Hoàn thành"
                      value={healthProfile?.statistics?.vaccination?.completed || 0}
                      suffix={`/ ${healthProfile?.statistics?.vaccination?.total || 0}`}
                      prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                    />
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card size="small" title="Khám bệnh">
                    <Statistic
                      title="Lần khám cuối"
                      value={healthProfile?.statistics?.healthRecords?.lastCheckup ? 
                        formatDate(healthProfile.statistics.healthRecords.lastCheckup) : 'Chưa có'
                      }
                      prefix={<CalendarOutlined style={{ color: '#1890ff' }} />}
                    />
                  </Card>
                </Col>
              </Row>
            </div>
          ) : (
            <Empty description="Chưa có hồ sơ sức khỏe" />
          )}
        </Card>
      )
    },
    {
      key: "3",
      label: (
        <span>
          <LineChartOutlined />
          Theo dõi cân nặng
        </span>
      ),
      children: (
        <Card title="Biểu đồ cân nặng" className="weight-tracking-card">
          {healthProfile?.weightHistory && healthProfile.weightHistory.length > 0 ? (
            <Timeline mode="left">
              {healthProfile.weightHistory.map((record, index) => (
                <Timeline.Item
                  key={index}
                  label={formatDate(record.date)}
                  color="blue"
                >
                  <span className="weight-value">
                    {record.weight}kg
                    {index > 0 && (
                      <span className={`weight-change ${
                        record.weight > healthProfile.weightHistory[index - 1].weight 
                          ? 'increase' : 'decrease'
                      }`}>
                        {record.weight > healthProfile.weightHistory[index - 1].weight ? '↗' : '↘'}
                        {Math.abs(record.weight - healthProfile.weightHistory[index - 1].weight).toFixed(1)}kg
                      </span>
                    )}
                  </span>
                </Timeline.Item>
              ))}
            </Timeline>
          ) : (
            <Empty 
              description="Chưa có dữ liệu cân nặng"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Card>
      )
    }
  ];

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
            onClick={() => navigate('/pet-care')}
          >
            Chăm sóc thú cưng
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
                const pet = adoption?.pet;
                if (!pet) return null;
                
                const petImages = pet.images || [];
                
                return (
                  <Card
                    key={adoption._id}
                    hoverable
                    className={`pet-card ${selectedPet?._id === adoption._id ? 'active' : ''}`}
                    onClick={() => handlePetSelect(adoption)}
                    cover={
                      <img
                        src={petImages.length > 0 ? getImageUrl(petImages[0]) : 'https://via.placeholder.com/200'}
                        alt={pet.name || 'Pet'}
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/200x150/f0f0f0/999?text=No+Image';
                        }}
                      />
                    }
                  >
                    <Card.Meta
                      title={pet.name || 'Unnamed Pet'}
                      description={
                        <div>
                          <div>{pet.breed || 'Unknown breed'} • {pet.age || 0} tuổi</div>
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
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>

            {selectedPet && (
              <Tabs 
                defaultActiveKey="1" 
                className="pet-profile-tabs"
                items={tabItems}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}