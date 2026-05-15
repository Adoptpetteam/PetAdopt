import { useEffect, useState } from 'react';
import { Card, Table, Tag, Avatar } from 'antd';
import { TrophyOutlined, HeartOutlined, CrownOutlined } from '@ant-design/icons';
import { apiClient } from '../api/http';

export default function TopSupporters() {
  const [supporters, setSupporters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopSupporters();
  }, []);

  const fetchTopSupporters = async () => {
    try {
      const res = await apiClient.get('/donate/top-supporters?limit=10');
      setSupporters(res.data.data || []);
    } catch (error) {
      console.error('Error fetching top supporters:', error);
      setSupporters([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Hạng',
      key: 'rank',
      width: 80,
      render: (_: any, __: any, index: number) => {
        const icons = [
          <CrownOutlined className="text-yellow-500 text-xl" />,
          <CrownOutlined className="text-gray-400 text-xl" />,
          <CrownOutlined className="text-orange-600 text-xl" />
        ];
        return (
          <div className="flex items-center justify-center">
            {index < 3 ? icons[index] : <span className="font-bold text-gray-500">#{index + 1}</span>}
          </div>
        );
      }
    },
    {
      title: 'Người ủng hộ',
      key: 'name',
      render: (record: any) => {
        const displayName = record.isAnonymous 
          ? 'Người ủng hộ ẩn danh' 
          : (record.displayName || record.name);
        
        return (
          <div className="flex items-center gap-3">
            <Avatar 
              size={40} 
              style={{ 
                backgroundColor: record.isAnonymous ? '#9ca3af' : '#6272B6',
                fontSize: '16px'
              }}
            >
              {record.isAnonymous ? '?' : displayName.charAt(0).toUpperCase()}
            </Avatar>
            <div>
              <div className="font-medium text-gray-800">{displayName}</div>
              <div className="text-xs text-gray-500">
                {record.donationCount} lần ủng hộ
              </div>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Tổng ủng hộ',
      key: 'amount',
      align: 'right' as const,
      render: (record: any) => (
        <div className="text-right">
          <div className="text-lg font-bold text-[#6272B6]">
            {record.totalAmount.toLocaleString('vi-VN')} đ
          </div>
          <div className="text-xs text-gray-500">
            TB: {Math.round(record.totalAmount / record.donationCount).toLocaleString('vi-VN')} đ
          </div>
        </div>
      )
    },
    {
      title: 'Lần cuối',
      key: 'lastDonation',
      align: 'center' as const,
      render: (record: any) => (
        <div className="text-center text-sm text-gray-600">
          {new Date(record.lastDonation).toLocaleDateString('vi-VN')}
        </div>
      )
    }
  ];

  return (
    <Card
      title={
        <div className="flex items-center gap-3">
          <TrophyOutlined className="text-yellow-500 text-xl" />
          <span className="text-lg font-bold">🏆 Top Người Ủng Hộ</span>
        </div>
      }
      className="shadow-lg border-0"
      extra={
        <Tag color="gold" icon={<HeartOutlined />}>
          Cảm ơn sự hỗ trợ
        </Tag>
      }
    >
      <Table
        dataSource={supporters}
        columns={columns}
        loading={loading}
        pagination={false}
        rowKey={(record) => record._id || record.email || Math.random().toString()}
        className="top-supporters-table"
        rowClassName={(_, index) => {
          if (index === 0) return 'bg-yellow-50';
          if (index === 1) return 'bg-gray-50';
          if (index === 2) return 'bg-orange-50';
          return '';
        }}
        locale={{
          emptyText: (
            <div className="py-8 text-center">
              <HeartOutlined className="text-4xl text-gray-300 mb-2" />
              <p className="text-gray-500">Chưa có người ủng hộ</p>
              <p className="text-sm text-gray-400">Hãy là người đầu tiên ủng hộ chúng tôi!</p>
            </div>
          )
        }}
      />
      
      <style>{`
        .top-supporters-table .ant-table-tbody > tr:hover > td {
          background: rgba(98, 114, 182, 0.05) !important;
        }
      `}</style>
    </Card>
  );
}
