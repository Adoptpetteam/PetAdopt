import { useEffect, useState } from 'react';
import { Avatar, Card } from 'antd';
import { HeartOutlined, TrophyOutlined, CrownOutlined } from '@ant-design/icons';
import { apiClient } from '../api/http';

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
    if (index === 0) return <CrownOutlined className="text-yellow-500 text-xl" />;
    if (index === 1) return <CrownOutlined className="text-gray-400 text-xl" />;
    if (index === 2) return <CrownOutlined className="text-orange-600 text-xl" />;
    return <TrophyOutlined className="text-[#6272B6]" />;
  };

  const getDisplayName = (supporter: any) => {
    if (supporter.isAnonymous) return 'Người ủng hộ ẩn danh';
    return supporter.displayName || supporter.name;
  };

  // Duplicate array để tạo hiệu ứng loop liền mạch
  const duplicatedSupporters = [...supporters, ...supporters];

  return (
    <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-pink-50 py-8 overflow-hidden">
      <div className="container mx-auto px-4 mb-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6272B6] to-purple-600 mb-2 flex items-center justify-center gap-2">
            <TrophyOutlined className="text-yellow-500" />
            🏆 Top Người Ủng Hộ Nhiều Nhất
          </h2>
          <p className="text-gray-600">Cảm ơn những tấm lòng vàng đã đồng hành cùng chúng tôi</p>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <div 
          className="flex gap-6 animate-marquee"
          style={{
            animation: 'marquee 60s linear infinite',
            width: 'fit-content'
          }}
        >
          {duplicatedSupporters.map((supporter, index) => {
            const originalIndex = index % supporters.length;
            return (
              <Card
                key={`${supporter._id}-${index}`}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 flex-shrink-0"
                style={{
                  background: originalIndex < 3 
                    ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
                    : 'white',
                  minWidth: '400px',
                  maxWidth: '400px',
                  borderRadius: '1rem',
                  padding: '1rem'
                }}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                    {getRankIcon(originalIndex)}
                  </div>

                  {/* Avatar */}
                  <Avatar
                    size={56}
                    style={{
                      backgroundColor: supporter.isAnonymous ? '#9ca3af' : '#6272B6',
                      fontSize: '24px',
                      fontWeight: 'bold'
                    }}
                  >
                    {supporter.isAnonymous ? '?' : getDisplayName(supporter).charAt(0).toUpperCase()}
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-800 truncate text-lg">
                      {getDisplayName(supporter)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {supporter.donationCount} lần ủng hộ
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-xl font-bold text-[#6272B6]">
                      {supporter.totalAmount.toLocaleString('vi-VN')}
                    </div>
                    <div className="text-xs text-gray-500">VNĐ</div>
                  </div>

                  {/* Heart icon */}
                  <HeartOutlined className="text-2xl text-red-500 flex-shrink-0" />
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
