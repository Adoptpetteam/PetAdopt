import React, { useState, useEffect } from 'react';
import { Badge, Dropdown, Button, Empty } from 'antd';
import { BellOutlined, CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './NotificationBell.css';

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

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_URL}/notifications/recent`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setNotifications(response.data.data);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
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
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    if (notification.link) {
      navigate(notification.link);
      setOpen(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diff = Math.floor((now.getTime() - notifDate.getTime()) / 1000);

    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
  };

  const dropdownContent = (
    <div className="notification-dropdown" onClick={(e) => e.stopPropagation()}>
      <div className="notification-header">
        <h3>Thông báo</h3>
        {unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            onClick={markAllAsRead}
            loading={loading}
            icon={<CheckOutlined />}
          >
            Đọc tất cả
          </Button>
        )}
      </div>
      <div className="notification-list">
        {notifications.length === 0 ? (
          <Empty
            description="Không có thông báo"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <div>
            {notifications.map((item) => (
              <div
                key={item._id}
                className={`notification-item ${!item.isRead ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(item)}
                style={{ cursor: item.link ? 'pointer' : 'default' }}
              >
                <div className="notification-content">
                  <div className="notification-icon">{item.icon}</div>
                  <div className="notification-text">
                    <div className="notification-title">{item.title}</div>
                    <div className="notification-message">{item.message}</div>
                    <div className="notification-time">{getTimeAgo(item.createdAt)}</div>
                  </div>
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={(e) => deleteNotification(item._id, e)}
                    className="notification-delete"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="notification-footer">
        <Button type="link" onClick={() => { navigate('/notifications'); setOpen(false); }}>
          Xem tất cả
        </Button>
      </div>
    </div>
  );

  return (
    <Dropdown
      popupRender={() => dropdownContent}
      trigger={['click']}
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
    >
      <Badge count={unreadCount} offset={[-5, 5]}>
        <BellOutlined style={{ fontSize: '20px', cursor: 'pointer' }} />
      </Badge>
    </Dropdown>
  );
};

export default NotificationBell;
