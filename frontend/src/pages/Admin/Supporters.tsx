import { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Space, message, Statistic, Row, Col } from 'antd';
import { HeartOutlined, DollarOutlined, UserOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { apiClient } from '../../api/http';

export default function Supporters() {
  const [supporters, setSupporters] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    totalAmount: 0,
    avgAmount: 0,
    pending: 0,
    completed: 0,
    failed: 0
  });
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    fetchData();
    fetchStats();
  }, [pagination.current]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/donate/supporters', {
        params: { page: pagination.current, limit: pagination.pageSize }
      });
      setSupporters(res.data.data || []);
      setPagination(prev => ({ ...prev, total: res.data.pagination?.total || 0 }));
    } catch (error) {
      message.error('Không thể tải danh sách người ủng hộ');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await apiClient.get('/donate/statistics');
      setStats(res.data.data.overview);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const columns = [
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <div>
          <div className="font-medium">{record.isAnonymous ? '🎭 Ẩn danh' : name}</div>
          <div className="text-xs text-gray-500">{record.email}</div>
        </div>
      )
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right' as const,
      render: (amount: number) => (
        <span className="font-bold text-[#6272B6]">
          {amount.toLocaleString('vi-VN')} đ
        </span>
      )
    },
    {
      title: 'Phương thức',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method: string) => {
        const methodMap: any = {
          vnpay: { text: 'VNPay', color: 'blue' },
          bank_transfer: { text: 'Chuyển khoản', color: 'green' },
          cash: { text: 'Tiền mặt', color: 'orange' }
        };
        const m = methodMap[method] || { text: method, color: 'default' };
        return <Tag color={m.color}>{m.text}</Tag>;
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: any = {
          pending: { text: 'Chờ xử lý', color: 'orange', icon: <CloseCircleOutlined /> },
          completed: { text: 'Thành công', color: 'green', icon: <CheckCircleOutlined /> },
          failed: { text: 'Thất bại', color: 'red', icon: <CloseCircleOutlined /> }
        };
        const s = statusMap[status] || { text: status, color: 'default' };
        return <Tag color={s.color} icon={s.icon}>{s.text}</Tag>;
      }
    },
    {
      title: 'Lời nhắn',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
      render: (msg: string) => msg || <span className="text-gray-400">-</span>
    },
    {
      title: 'Ngày ủng hộ',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('vi-VN')
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6272B6] to-purple-600">
            💝 Quản Lý Người Ủng Hộ
          </h1>
          <p className="text-gray-500 mt-1">Danh sách những người đã ủng hộ chúng tôi</p>
        </div>
        <Button type="primary" icon={<HeartOutlined />} onClick={fetchData}>
          Làm mới
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-lg">
            <Statistic
              title="Tổng người ủng hộ"
              value={stats.total}
              prefix={<UserOutlined style={{ color: '#6272B6' }} />}
              valueStyle={{ color: '#6272B6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-lg">
            <Statistic
              title="Tổng số tiền"
              value={stats.totalAmount}
              prefix={<DollarOutlined style={{ color: '#10b981' }} />}
              valueStyle={{ color: '#10b981' }}
              suffix="đ"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-lg">
            <Statistic
              title="Trung bình"
              value={stats.avgAmount}
              prefix={<DollarOutlined style={{ color: '#f59e0b' }} />}
              valueStyle={{ color: '#f59e0b' }}
              suffix="đ"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-lg">
            <Statistic
              title="Thành công"
              value={stats.completed}
              prefix={<CheckCircleOutlined style={{ color: '#10b981' }} />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card className="border-0 shadow-lg">
        <Table
          dataSource={supporters}
          columns={columns}
          loading={loading}
          rowKey="_id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} người ủng hộ`,
            onChange: (page, pageSize) => {
              setPagination(prev => ({ ...prev, current: page, pageSize: pageSize || 10 }));
            }
          }}
        />
      </Card>
    </div>
  );
}
