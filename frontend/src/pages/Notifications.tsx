import React, { useState, useEffect } from 'react';
import { Card, List, Button, Empty, Spin, message, Tag, Space } from 'antd';
import { CheckOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Notifications.css';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  icon: string;
  priority: string;
  createdAt: string;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const params: any = { page, limit: 20 };
      if (filter === 'unread') params.isRead = 'false';

      const response = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      if (response.data.success) {
        setNotifications(response.data.data);
        setTotal(response.data.pagination.total);
      }
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchNotifications();
    } catch (error) {
      message.error('Không thể đánh dấu đã đọc');
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success(response.data.message);
      fetchNotifications();
    } catch (error) {
      message.error('Không thể đánh dấu tất cả đã đọc');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success('Đã xóa thông báo');
      fetchNotifications();
    } catch (error) {
      message.error('Không thể xóa thông báo');
    }
  };

  const clearAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/notifications/clear-all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success(response.data.message);
      fetchNotifications();
    } catch (error) {
      message.error('Không thể xóa thông báo');
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diff = Math.floor((now.getTime() - notifDate.getTime()) / 1000);

    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
  };

  const getPriorityColor = (priority: string) => {
    const colors: any = {
      low: 'default',
      normal: 'blue',
      high: 'orange',
      urgent: 'red'
    };
    return colors[priority] || 'default';
  };

  useEffect(() => {
    fetchNotifications();
  }, [page, filter]);

  return (
    <div className="notifications-page">
      <div className="container">
        <Card
          title={
            <div className="notifications-header">
              <h2>🔔 Thông báo của bạn</h2>
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchNotifications}
                  loading={loading}
                >
                  Làm mới
                </Button>
                <Button
                  icon={<CheckOutlined />}
                  onClick={markAllAsRead}
                  type="primary"
                >
                  Đọc tất cả
                </Button>
                <Button
                  icon={<DeleteOutlined />}
                  onClick={clearAllRead}
                  danger
                >
                  Xóa đã đọc
                </Button>
              </Space>
            </div>
          }
          className="notifications-card"
        >
          <div className="notifications-filter">
            <Button
              type={filter === 'all' ? 'primary' : 'default'}
              onClick={() => { setFilter('all'); setPage(1); }}
            >
              Tất cả ({total})
            </Button>
            <Button
              type={filter === 'unread' ? 'primary' : 'default'}
              onClick={() => { setFilter('unread'); setPage(1); }}
            >
              Chưa đọc
            </Button>
          </div>

          <Spin spinning={loading}>
            {notifications.length === 0 ? (
              <Empty
                description="Không có thông báo"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <List
                dataSource={notifications}
                pagination={{
                  current: page,
                  pageSize: 20,
                  total,
                  onChange: setPage,
                  showSizeChanger: false
                }}
                renderItem={(item) => (
                  <List.Item
                    className={`notification-list-item ${!item.isRead ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(item)}
                    style={{ cursor: item.link ? 'pointer' : 'default' }}
                    actions={[
                      !item.isRead && (
                        <Button
                          type="link"
                          size="small"
                          icon={<CheckOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(item._id);
                          }}
                        >
                          Đánh dấu đã đọc
                        </Button>
                      ),
                      <Button
                        type="link"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(item._id);
                        }}
                      >
                        Xóa
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<div className="notification-list-icon">{item.icon}</div>}
                      title={
                        <div className="notification-list-title">
                          {item.title}
                          {item.priority !== 'normal' && (
                            <Tag color={getPriorityColor(item.priority)} style={{ marginLeft: 8 }}>
                              {item.priority === 'urgent' ? 'Khẩn cấp' : 
                               item.priority === 'high' ? 'Quan trọng' : 
                               item.priority === 'low' ? 'Thấp' : 'Bình thường'}
                            </Tag>
                          )}
                        </div>
                      }
                      description={
                        <div>
                          <div className="notification-list-message">{item.message}</div>
                          <div className="notification-list-time">{getTimeAgo(item.createdAt)}</div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Spin>
        </Card>
      </div>
    </div>
  );
};

export default Notifications;
