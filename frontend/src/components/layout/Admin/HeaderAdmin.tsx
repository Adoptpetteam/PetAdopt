import { Badge, Input, Avatar } from 'antd';
import { SearchOutlined, BellOutlined, UserOutlined } from '@ant-design/icons';

const HeaderAdmin = () => {
  return (
    <header className="admin-header-custom">
      <div style={{ width: '400px' }}>
        <Input 
          prefix={<SearchOutlined />} 
          placeholder="Search Fastkart..." 
          style={{ borderRadius: '8px', background: '#f5f5f5', border: 'none', height: '40px' }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Badge count={4} size="small">
          <BellOutlined style={{ fontSize: '20px', cursor: 'pointer' }} />
        </Badge>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ textAlign: 'right', lineHeight: '1.2' }}>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>Emay Walter</div>
            <small style={{ color: '#888' }}>Admin</small>
          </div>
          <Avatar size={40} icon={<UserOutlined />} />
        </div>
      </div>
    </header>
  );
};

export default HeaderAdmin;