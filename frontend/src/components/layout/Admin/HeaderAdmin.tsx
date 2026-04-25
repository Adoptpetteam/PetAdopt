import { Badge, Input, Avatar } from 'antd';
import { SearchOutlined, BellOutlined, UserOutlined } from '@ant-design/icons';

const HeaderAdmin = () => {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 24px',
      background: '#fff',
      borderBottom: '1px solid #e5e7eb',
      height: '70px'
    }}>
      <div style={{ width: '400px' }}>
        <Input 
          prefix={<SearchOutlined />} 
          placeholder="Tìm kiếm..." 
          style={{ 
            borderRadius: '8px', 
            background: '#f5f5f5', 
            border: 'none', 
            height: '40px' 
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Badge count={4} size="small">
          <BellOutlined style={{ fontSize: '20px', cursor: 'pointer', color: '#6272B6' }} />
        </Badge>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ textAlign: 'right', lineHeight: '1.2' }}>
            <div style={{ fontWeight: 600, fontSize: '14px', color: '#333' }}>Admin</div>
            <small style={{ color: '#888' }}>Quản trị viên</small>
          </div>
          <Avatar size={40} icon={<UserOutlined />} style={{ background: '#6272B6' }} />
        </div>
      </div>
    </header>
  );
};

export default HeaderAdmin;