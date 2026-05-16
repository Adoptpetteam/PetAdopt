import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Empty, Spin, message, Tag, Badge, Modal } from "antd";
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { apiClient } from "../api/http";

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  order?: any;
  refundRequest?: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
  actionUrl?: string;
  actionLabel?: string;
}

export default function Notifications() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/notifications/me");
      setItems(res.data.data || []);
    } catch {
      message.error("Không thể tải thông báo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      setItems((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      window.dispatchEvent(new Event("notification-change"));
    } catch {
      message.error("Lỗi");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient.put("/notifications/read-all");
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      message.success("Đã đánh dấu tất cả đã đọc");
      window.dispatchEvent(new Event("notification-change"));
    } catch {
      message.error("Lỗi");
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Xóa thông báo này?",
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        try {
          await apiClient.delete(`/notifications/${id}`);
          setItems((prev) => prev.filter((n) => n._id !== id));
        } catch {
          message.error("Lỗi");
        }
      },
    });
  };

  const handleAction = (n: Notification) => {
    if (!n.isRead) handleMarkRead(n._id);
    if (n.actionUrl) navigate(n.actionUrl);
  };

  const unreadCount = items.filter((n) => !n.isRead).length;

  const typeColor: Record<string, string> = {
    order_cancelled: "red",
    order_refund_required: "orange",
    order_status_update: "blue",
    refund_approved: "cyan",
    refund_completed: "green",
    voucher_received: "purple",
    general: "default",
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#6272B6] flex items-center gap-3">
            <BellOutlined />
            Thông báo
            {unreadCount > 0 && <Badge count={unreadCount} />}
          </h1>
          <div className="flex gap-2">
            <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>
              Làm mới
            </Button>
            {unreadCount > 0 && (
              <Button icon={<CheckOutlined />} onClick={handleMarkAllRead}>
                Đánh dấu tất cả đã đọc
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <Spin size="large" />
          </div>
        ) : items.length === 0 ? (
          <Card>
            <Empty description="Chưa có thông báo nào" />
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map((n) => (
              <Card
                key={n._id}
                className={`shadow-sm hover:shadow-md transition-all cursor-pointer ${
                  !n.isRead ? "border-l-4 border-l-[#6272B6] bg-blue-50/30" : ""
                }`}
                onClick={() => handleAction(n)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Tag color={typeColor[n.type] || "default"}>
                          {n.type === "order_cancelled" && "❌ Đơn hàng bị hủy"}
                          {n.type === "order_refund_required" && "💰 Cần hoàn tiền"}
                          {n.type === "order_status_update" && "📦 Cập nhật đơn hàng"}
                          {n.type === "refund_approved" && "✅ Hoàn tiền được duyệt"}
                          {n.type === "refund_completed" && "💵 Hoàn tiền xong"}
                          {n.type === "voucher_received" && "🎁 Voucher"}
                          {n.type === "general" && "📢 Thông báo"}
                        </Tag>
                        {!n.isRead && <Tag color="blue">Mới</Tag>}
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(n.createdAt).toLocaleString("vi-VN")}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-1">{n.title}</h3>
                    <p className="text-gray-600 text-sm whitespace-pre-line">
                      {n.message}
                    </p>
                    {n.actionUrl && n.actionLabel && (
                      <Button
                        type="primary"
                        className="mt-3 bg-[#6272B6] border-0 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(n);
                        }}
                      >
                        {n.actionLabel} →
                      </Button>
                    )}
                  </div>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(n._id);
                    }}
                  />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
