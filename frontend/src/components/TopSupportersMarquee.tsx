import { useEffect, useState } from 'react';
import { Avatar, Card } from 'antd';
import { HeartOutlined, TrophyOutlined, CrownOutlined, StarOutlined } from '@ant-design/icons';
import { apiClient } from '../api/http';
import './TopSupportersMarquee.css';

export default function TopSupportersMarquee() {
  const [supporters, setSupporters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopSupporters();
  }, []);

  const fetchTopSupporters = async () => {
    try {
      console.log('[TopSupportersMarquee] Fetching...');
      const res = await apiClient.get('/donate/top-supporters?limit=20');
      console.log('[TopSupportersMarquee] Data:', res.data);
      setSupporters(res.data.data || []);
    } catch (error) {
      console.error('[TopSupportersMarquee] Error:', error);
      setSupporters([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading || supporters.length === 0) {
    console.log('[TopSupportersMarquee] Not rendering:', { loading, supportersCount: supporters.length });
    return null;
  }

  console.log('[TopSupportersMarquee] Rendering with', supporters.length, 'supporters');

  const getRankIcon = (index: number) => {
    if (index === 0) return <CrownOutlined className="text-yellow-500 text-2xl animate-pulse" />;
    if (index === 1) return <CrownOutlined className="text-gray-400 text-xl" />;
    if (index === 2) return <CrownOutlined className="text-orange-600 text-xl" />;
    return <TrophyOutlined className="text-[#6272B6]" />;
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return "🥇 Hạng 1";
    if (index === 1) return "🥈 Hạng 2";
    if (index === 2) return "🥉 Hạng 3";
    return `#${index + 1}`;
  };

  const getCardGradient = (index: number) => {
    if (index === 0) return 'linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #fff2a1 100%)';
    if (index === 1) return 'linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 50%, #f5f5f5 100%)';
    if (index === 2) return 'linear-gradient(135deg, #cd7f32 0%, #daa520 50%, #f4a460 100%)';
    return 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%)';
  };

  const getDisplayName = (supporter: any) => {
    if (supporter.isAnonymous) return 'Người ủng hộ ẩn danh';
    return supporter.displayName || supporter.name;
  };

  // Duplicate array để tạo hiệu ứng loop liền mạch
  const duplicatedSupporters = [...supporters, ...supporters];

  return (
    <div className="supporters-marquee-container">
      <div className="container mx-auto px-4 mb-6">
        <div className="text-center">
          <h2 className="supporters-title">
            <TrophyOutlined className="text-yellow-500 mr-2" />
            🏆 Top Người Ủng Hộ Nhiều Nhất
            <StarOutlined className="text-yellow-500 ml-2" />
          </h2>
          <p className="supporters-subtitle">
            Cảm ơn những tấm lòng vàng đã đồng hành cùng chúng tôi ❤️
          </p>
        </div>
      </div>

      <div className="marquee-wrapper">
        <div className="marquee-track">
          {duplicatedSupporters.map((supporter, index) => {
            const originalIndex = index % supporters.length;
            return (
              <Card
                key={`${supporter._id}-${index}`}
                className={`supporter-card ${originalIndex < 3 ? 'top-three' : ''}`}
                style={{
                  background: getCardGradient(originalIndex),
                  minWidth: '420px',
                  maxWidth: '420px',
                }}
              >
                <div className="supporter-content">
                  {/* Rank Badge */}
                  <div className="rank-badge">
                    <div className="rank-icon">
                      {getRankIcon(originalIndex)}
                    </div>
                    <div className="rank-text">
                      {getRankBadge(originalIndex)}
                    </div>
                  </div>

                  {/* Avatar */}
                  <Avatar
                    size={64}
                    className="supporter-avatar"
                    style={{
                      backgroundColor: supporter.isAnonymous ? '#9ca3af' : '#6272B6',
                      fontSize: '28px',
                      fontWeight: 'bold',
                      border: originalIndex < 3 ? '3px solid #fff' : '2px solid #e2e8f0',
                      boxShadow: originalIndex < 3 ? '0 4px 12px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    {supporter.isAnonymous ? '?' : getDisplayName(supporter).charAt(0).toUpperCase()}
                  </Avatar>

                  {/* Info */}
                  <div className="supporter-info">
                    <div className="supporter-name">
                      {getDisplayName(supporter)}
                    </div>
                    <div className="supporter-stats">
                      <span className="donation-count">
                        {supporter.donationCount} lần ủng hộ
                      </span>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="supporter-amount">
                    <div className="amount-value">
                      {supporter.totalAmount.toLocaleString('vi-VN')}
                    </div>
                    <div className="amount-currency">VNĐ</div>
                  </div>

                  {/* Heart icon */}
                  <HeartOutlined className="heart-icon" />
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
