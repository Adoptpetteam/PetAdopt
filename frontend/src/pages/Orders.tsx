import { useEffect, useState } from "react";
import { Button, Tag, Empty, Spin, Divider, Modal } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "../api/http";
import { message } from "antd";
import {
  ShoppingOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CarOutlined,
  BankOutlined,
  EyeOutlined,
} from "@ant-design/icons";

interface OrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface OrderData {
  _id: string;
  createdAt: string;
  status: "pending" | "paid" | "cancelled";
  paymentMethod: "cod" | "vnpay";
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  items: OrderItem[];
  totals: { subtotal: number; total: number };
}

const statusConfig = {
  pending: {
    color: "orange",
    label: "Chờ xử lý",
    icon: <ClockCircleOutlined />,
  },
  paid: {
    color: "green",
    label: "Đã thanh toán",
    icon: <CheckCircleOutlined />,
  },
  cancelled: {
    color: "red",
    label: "Đã hủy",
    icon: <CloseCircleOutlined />,
  },
};

const paymentConfig = {
  cod: { label: "COD", icon: <CarOutlined />, color: "orange" },
  vnpay: { label: "VNPay", icon: <BankOutlined />, color: "blue" },
};

export default function Orders() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailOrder, setDetailOrder] = useState<OrderData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      message.warning("Vui lòng đăng nhập để xem đơn hàng");
      navigate("/login");
      return;
    }
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/orders/me");
      setOrders(res.data.data || []);
    } catch (e: any) {
      if (e?.response?.status === 401) {
        message.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
        navigate("/login");
      } else {
        message.error("Không thể tải đơn hàng");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spin size="large" tip="Đang tải đơn hàng..." />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-16 px-4">
      <div className="max-w-[900px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#6272B6]">Đơn hàng của tôi</h1>
            <p className="text-gray-400 mt-1">{orders.length} đơn hàng</p>
          </div>
          <Link to="/products">
            <Button
              type="primary"
              icon={<ShoppingOutlined />}
              className="rounded-full bg-[#6272B6] border-0 h-10"
            >
              Mua thêm
            </Button>
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm">
            <Empty
              description={
                <span className="text-gray-500">Bạn chưa có đơn hàng nào</span>
              }
            />
            <Link to="/products">
              <Button
                type="primary"
                className="mt-6 bg-[#6272B6] border-0 rounded-full h-10 px-8"
              >
                Mua sắm ngay
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const payment =
                paymentConfig[order.paymentMethod] || paymentConfig.cod;

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden"
                >
                  {/* Order header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-b border-gray-50">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Mã đơn hàng</p>
                      <p className="font-mono text-sm font-bold text-gray-700">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-1">Ngày đặt</p>
                      <p className="text-sm font-semibold text-gray-700">
                        {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-1">Thanh toán</p>
                      <Tag
                        color={payment.color}
                        icon={payment.icon}
                        className="rounded-full px-3"
                      >
                        {payment.label}
                      </Tag>
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-1">Trạng thái</p>
                      <Tag
                        color={status.color}
                        icon={status.icon}
                        className="rounded-full px-3"
                      >
                        {status.label}
                      </Tag>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-400 mb-1">Tổng tiền</p>
                      <p className="text-xl font-black text-[#6272B6]">
                        {order.totals.total.toLocaleString()}đ
                      </p>
                    </div>

                    <div>
                      <Button
                        icon={<EyeOutlined />}
                        onClick={() => setDetailOrder(order)}
                        className="rounded-full border-[#6272B6] text-[#6272B6]"
                      >
                        Chi tiết
                      </Button>
                    </div>
                  </div>

                  {/* Order items */}
                  <div className="p-5">
                    <div className="space-y-3">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-14 h-14 rounded-xl object-cover border flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://placehold.co/56x56?text=No+Image";
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 truncate text-sm">
                              {item.name}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {item.quantity} × {item.price.toLocaleString()}đ
                            </p>
                          </div>
                          <p className="font-bold text-gray-700 text-sm flex-shrink-0">
                            {(item.price * item.quantity).toLocaleString()}đ
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Delivery info */}
                    <Divider className="my-4" />
                    <div className="text-sm text-gray-500">
                      <span className="font-semibold text-gray-700">
                        Giao đến:{" "}
                      </span>
                      {order.customer.name} · {order.customer.phone} ·{" "}
                      {order.customer.address}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        open={!!detailOrder}
        onCancel={() => setDetailOrder(null)}
        footer={null}
        title={
          detailOrder
            ? `Chi tiết đơn #${detailOrder._id.slice(-8).toUpperCase()}`
            : ""
        }
        width={600}
      >
        {detailOrder && (() => {
          const status = statusConfig[detailOrder.status] || statusConfig.pending;
          const payment = paymentConfig[detailOrder.paymentMethod] || paymentConfig.cod;
          return (
            <div className="space-y-5 pt-2">
              {/* Thông tin chung */}
              <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 rounded-xl p-4">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Mã đơn hàng</p>
                  <p className="font-mono font-bold text-gray-700">#{detailOrder._id.slice(-8).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Ngày đặt</p>
                  <p className="font-semibold text-gray-700">
                    {new Date(detailOrder.createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit", month: "2-digit", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Phương thức thanh toán</p>
                  <Tag color={payment.color} icon={payment.icon} className="rounded-full">
                    {payment.label}
                  </Tag>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Trạng thái</p>
                  <Tag color={status.color} icon={status.icon} className="rounded-full">
                    {status.label}
                  </Tag>
                </div>
              </div>

              {/* Thông tin giao hàng */}
              <div className="text-sm bg-blue-50 rounded-xl p-4">
                <p className="font-semibold text-gray-700 mb-2">📦 Thông tin giao hàng</p>
                <p><span className="text-gray-400">Người nhận:</span> <span className="font-semibold">{detailOrder.customer?.name || '—'}</span></p>
                <p className="mt-1"><span className="text-gray-400">Điện thoại:</span> <span className="font-semibold">{detailOrder.customer?.phone || '—'}</span></p>
                <p className="mt-1"><span className="text-gray-400">Địa chỉ:</span> <span className="font-semibold">{detailOrder.customer?.address || '—'}</span></p>
              </div>

              {/* Danh sách sản phẩm */}
              <div>
                <p className="font-semibold text-gray-700 mb-3">🛍️ Sản phẩm đặt mua</p>
                <div className="space-y-3">
                  {detailOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 border-b pb-3 last:border-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover border flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://placehold.co/56x56?text=No+Image";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {item.quantity} × {item.price.toLocaleString()}đ
                        </p>
                      </div>
                      <p className="font-bold text-[#6272B6] text-sm flex-shrink-0">
                        {(item.price * item.quantity).toLocaleString()}đ
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tổng tiền */}
              <div className="flex justify-between items-center pt-2 border-t font-bold text-lg">
                <span className="text-gray-700">Tổng cộng</span>
                <span className="text-[#6272B6] text-xl">{detailOrder.totals.total.toLocaleString()}đ</span>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
