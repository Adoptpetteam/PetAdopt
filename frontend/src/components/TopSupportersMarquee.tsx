import { useEffect, useState } from 'react';
import { Avatar, Card } from 'antd';
import { HeartOutlined, TrophyOutlined, CrownOutlined, StarOutlined } from '@ant-design/icons';
import { apiClient } from '../api/http';
import './TopSupportersMarquee.css';

interface Supporter {
  _id: string;
  isAnonymous: boolean;
  name?: string;
  donationCount: number;
  totalAmount: number;
}

export default function TopSupportersMarquee() {
  const [supporters, setSupporters] = useState<Supporter[]>([]);
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
                  minWidth: '450px',
                  maxWidth: '450px',
                }}
              >
                <div className="supporter-content-new">
                  {/* Top Row: Rank + Name + Heart */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    {/* Rank Badge */}
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      gap: '4px',
                      minWidth: '60px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.3)',
                        backdropFilter: 'blur(10px)',
                      }}>
                        {getRankIcon(originalIndex)}
                      </div>
                      <div style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: '#1f2937',
                        textAlign: 'center',
                        background: 'rgba(255,255,255,0.8)',
                        padding: '2px 8px',
                        borderRadius: '8px',
                      }}>
                        {getRankBadge(originalIndex)}
                      </div>
                    </div>

                    {/* Avatar */}
                    <Avatar
                      size={70}
                      style={{
                        backgroundColor: supporter.isAnonymous ? '#9ca3af' : '#6272B6',
                        fontSize: '32px',
                        fontWeight: 'bold',
                        border: originalIndex < 3 ? '4px solid #fff' : '3px solid #e2e8f0',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                        flexShrink: 0,
                      }}
                    >
                      {supporter.isAnonymous ? '?' : getDisplayName(supporter).charAt(0).toUpperCase()}
                    </Avatar>

                    {/* Name */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '1.25rem',
                        fontWeight: 900,
                        color: '#1a202c',
                        marginBottom: '6px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        background: 'rgba(255,255,255,0.85)',
                        padding: '6px 12px',
                        borderRadius: '10px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      }}>
                        {getDisplayName(supporter)}
                      </div>
                      <div style={{
                        fontSize: '0.875rem',
                        color: '#4a5568',
                        fontWeight: 600,
                        background: 'rgba(255, 255, 255, 0.7)',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        display: 'inline-block',
                      }}>
                        {supporter.donationCount} lần ủng hộ
                      </div>
                    </div>

                    {/* Heart icon */}
                    <HeartOutlined style={{
                      fontSize: '2rem',
                      color: '#e53e3e',
                      flexShrink: 0,
                      animation: 'heartbeat 2s ease-in-out infinite',
                      filter: 'drop-shadow(0 2px 4px rgba(229, 62, 62, 0.3))',
                    }} />
                  </div>

                  {/* Bottom Row: Amount */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '2px solid rgba(98, 114, 182, 0.3)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <span style={{
                      fontSize: '0.875rem',
                      color: '#718096',
                      fontWeight: 700,
                      letterSpacing: '0.5px',
                    }}>
                      TỔNG ỦNG HỘ
                    </span>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: '1.75rem',
                        fontWeight: 900,
                        color: '#2d3748',
                        lineHeight: 1.2,
                        letterSpacing: '-0.5px',
                      }}>
                        {(supporter.totalAmount || supporter.amount || 0).toLocaleString('vi-VN')}
                      </div>
                      <div style={{
                        fontSize: '0.875rem',
                        color: '#718096',
                        fontWeight: 700,
                        letterSpacing: '0.5px',
                      }}>
                        VNĐ
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
