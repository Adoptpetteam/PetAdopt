import React, { useEffect, useState } from "react";
import {
  Button, Tag, Empty, Spin, Card, Timeline, Space, Typography,
  Row, Col, Divider, Progress, Modal, Table, Tabs, Badge,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "../api/http";
import { message } from "antd";
import {
  ShoppingOutlined, ClockCircleOutlined, CheckCircleOutlined,
  CloseCircleOutlined, CarOutlined, BankOutlined, TruckOutlined,
  GiftOutlined, PhoneOutlined, HomeOutlined, EyeOutlined,
  ReloadOutlined, BoxPlotOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

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
  updatedAt: string;
  status: "pending" | "paid" | "shipping" | "completed" | "cancelled";
  paymentMethod: "cod" | "vnpay";
  customer: { name: string; phone: string; address: string };
  items: OrderItem[];
  totals: { subtotal: number; total: number };
}

const statusConfig = {
  pending:   { color: "orange",  label: "Chờ xử lý",      icon: <ClockCircleOutlined />,  desc: "Đơn hàng đang chờ xác nhận" },
  paid:      { color: "blue",    label: "Đã thanh toán",   icon: <CheckCircleOutlined />,  desc: "Đã thanh toán, đang chuẩn bị hàng" },
  shipping:  { color: "purple",  label: "Đang giao hàng",  icon: <TruckOutlined />,        desc: "Đơn hàng đang trên đường giao đến bạn" },
  completed: { color: "green",   label: "Hoàn thành",      icon: <GiftOutlined />,         desc: "Đơn hàng đã giao thành công" },
  cancelled: { color: "red",     label: "Đã hủy",          icon: <CloseCircleOutlined />,  desc: "Đơn hàng đã bị hủy" },
};

const paymentConfig = {
  cod:   { label: "COD",   icon: <CarOutlined />,  color: "orange" },
  vnpay: { label: "VNPay", icon: <BankOutlined />, color: "blue"   },
};

const STEPS = ["pending", "paid", "shipping", "completed"];

const getProgress = (status: string) => {
  if (status === "cancelled") return { percent: 100, status: "exception" as const };
  const idx = STEPS.indexOf(status);
  return { percent: Math.round(((idx + 1) / STEPS.length) * 100), status: "active" as const };
};

const getTimelineItems = (order: OrderData) => {
  const currentIdx = STEPS.indexOf(order.status);

  const steps = [
    { key: "pending",   title: "Đặt hàng thành công",   desc: "Đơn hàng đã được tạo",              time: order.createdAt },
    { key: "paid",      title: "Đã thanh toán",          desc: "Thanh toán thành công",              time: order.updatedAt },
    { key: "shipping",  title: "Đang giao hàng",         desc: "Đơn hàng đang được vận chuyển",      time: order.updatedAt },
    { key: "completed", title: "Giao hàng thành công",   desc: "Đơn hàng đã được giao đến bạn",      time: order.updatedAt },
  ];

  if (order.status === "cancelled") {
    return [
      {
        dot: React.cloneElement(statusConfig.pending.icon, { style: { fontSize: 16, color: "#1890ff" } }),
        children: (
          <div>
            <Text strong className="text-blue-600">Đặt hàng thành công</Text>
            <div className="text-xs text-gray-400 mt-1">Đơn hàng đã được tạo</div>
            <div className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString("vi-VN")}</div>
          </div>
        ),
      },
      {
        dot: React.cloneElement(statusConfig.cancelled.icon, { style: { fontSize: 16, color: "#ff4d4f" } }),
        children: (
          <div>
            <Text strong className="text-red-500">Đơn hàng đã hủy</Text>
            <div className="text-xs text-gray-400 mt-1">Đơn hàng bị hủy bỏ</div>
            <div className="text-xs text-gray-400">{new Date(order.updatedAt).toLocaleString("vi-VN")}</div>
          </div>
        ),
      },
    ];
  }

  return steps.map((step, i) => {
    const done = i <= currentIdx;
    const active = i === currentIdx;
    const cfg = statusConfig[step.key as keyof typeof statusConfig];
    return {
      dot: React.cloneElement(cfg.icon, {
        style: { fontSize: 16, color: done ? "#1890ff" : "#d9d9d9" },
      }),
      children: (
        <div>
          <Text strong className={done ? (active ? "text-blue-600" : "text-blue-400") : "text-gray-300"}>
            {step.title}
          </Text>
          <div className={`text-xs mt-1 ${done ? "text-gray-500" : "text-gray-300"}`}>{step.desc}</div>
          {done && (
            <div className="text-xs text-gray-400">{new Date(step.time).toLocaleString("vi-VN")}</div>
          )}
        </div>
      ),
    };
  });
};

const TAB_ITEMS = [
  { key: "all",       label: "Tất cả" },
  { key: "pending",   label: "Chờ xử lý" },
  { key: "paid",      label: "Đã thanh toán" },
  { key: "shipping",  label: "Đang giao" },
  { key: "completed", label: "Hoàn thành" },
  { key: "cancelled", label: "Đã hủy" },
];

export default function Orders() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selected, setSelected] = useState<OrderData | null>(null);
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
        message.error("Phiên đăng nhập hết hạn");
        navigate("/login");
      } else {
        message.error("Không thể tải đơn hàng");
      }
    } finally {
      setLoading(false);
    }
  };

  const filtered = activeTab === "all" ? orders : orders.filter((o) => o.status === activeTab);

  const tabItems = TAB_ITEMS.map((t) => {
    const count = t.key === "all" ? orders.length : orders.filter((o) => o.status === t.key).length;
    return {
      key: t.key,
      label: (
        <span>
          {t.label}
          {count > 0 && (
            <Badge count={count} size="small" className="ml-1"
              style={{ backgroundColor: t.key === "pending" ? "#faad14" : t.key === "shipping" ? "#722ed1" : "#6272B6" }}
            />
          )}
        </span>
      ),
    };
  });

  const columns: ColumnsType<OrderData> = [
    {
      title: "Mã đơn",
      dataIndex: "_id",
      render: (id: string) => (
        <Text code className="text-xs font-bold">#{id.slice(-8).toUpperCase()}</Text>
      ),
      width: 110,
    },
    {
      title: "Sản phẩm",
      render: (_, r) => (
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {r.items.slice(0, 3).map((item, i) => (
              <img
                key={i}
                src={item.image}
                alt={item.name}
                className="w-10 h-10 rounded-lg object-cover border-2 border-white shadow-sm"
                onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/40x40?text=?"; }}
              />
            ))}
            {r.items.length > 3 && (
              <div className="w-10 h-10 rounded-lg bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-500 font-bold shadow-sm">
                +{r.items.length - 3}
              </div>
            )}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-800 max-w-[180px] truncate">
              {r.items[0]?.name}{r.items.length > 1 ? ` +${r.items.length - 1} sp` : ""}
            </div>
            <div className="text-xs text-gray-400">{r.items.length} sản phẩm</div>
          </div>
        </div>
      ),
      width: 260,
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdAt",
      render: (d: string) => (
        <div>
          <div className="text-sm font-medium">{new Date(d).toLocaleDateString("vi-VN")}</div>
          <div className="text-xs text-gray-400">{new Date(d).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</div>
        </div>
      ),
      width: 110,
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: "descend",
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentMethod",
      render: (m: string) => {
        const cfg = paymentConfig[m as keyof typeof paymentConfig];
        return <Tag icon={cfg?.icon} color={cfg?.color}>{cfg?.label}</Tag>;
      },
      width: 100,
    },
    {
      title: "Tổng tiền",
      dataIndex: ["totals", "total"],
      render: (v: number) => <Text strong className="text-[#6272B6] text-base">{v.toLocaleString()}đ</Text>,
      width: 130,
      sorter: (a, b) => a.totals.total - b.totals.total,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (s: string) => {
        const cfg = statusConfig[s as keyof typeof statusConfig];
        return (
          <div>
            <Tag icon={cfg?.icon} color={cfg?.color} className="mb-1">{cfg?.label}</Tag>
            {s !== "cancelled" && (
              <Progress
                percent={getProgress(s).percent}
                status={getProgress(s).status}
                strokeColor="#6272B6"
                showInfo={false}
                size="small"
                style={{ width: 100 }}
              />
            )}
          </div>
        );
      },
      width: 160,
    },
    {
      title: "",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => setSelected(record)}
          className="bg-[#6272B6] border-0 rounded-full"
        >
          Chi tiết
        </Button>
      ),
      width: 100,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spin size="large" tip="Đang tải đơn hàng..." />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-16 px-4">
      <div className="max-w-[1100px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Title level={2} className="text-[#6272B6] m-0 flex items-center gap-2">
              <BoxPlotOutlined /> Đơn hàng của tôi
            </Title>
            <Text type="secondary">{orders.length} đơn hàng</Text>
          </div>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadOrders} loading={loading}>Làm mới</Button>
            <Link to="/products">
              <Button type="primary" icon={<ShoppingOutlined />} className="bg-[#6272B6] border-0 rounded-full">
                Mua thêm
              </Button>
            </Link>
          </Space>
        </div>

        <Card className="rounded-2xl shadow-sm border-0">
          {/* Tabs lọc theo trạng thái */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            className="mb-4"
          />

          {filtered.length === 0 ? (
            <Empty
              description={<span className="text-gray-500">Không có đơn hàng nào</span>}
              className="py-16"
            >
              <Link to="/products">
                <Button type="primary" className="bg-[#6272B6] border-0 rounded-full px-8">
                  Mua sắm ngay
                </Button>
              </Link>
            </Empty>
          ) : (
            <Table
              columns={columns}
              dataSource={filtered}
              rowKey="_id"
              pagination={{ pageSize: 10, showTotal: (t) => `${t} đơn hàng` }}
              scroll={{ x: 900 }}
              rowClassName="hover:bg-blue-50 cursor-pointer transition-colors"
              onRow={(record) => ({ onClick: () => setSelected(record) })}
            />
          )}
        </Card>
      </div>

      {/* Modal chi tiết đơn hàng */}
      <Modal
        open={!!selected}
        onCancel={() => setSelected(null)}
        footer={null}
        width={720}
        title={
          <Space>
            <BoxPlotOutlined className="text-[#6272B6]" />
            <span>Chi tiết đơn hàng <Text code>#{selected?._id.slice(-8).toUpperCase()}</Text></span>
          </Space>
        }
      >
        {selected && (
          <div>
            {/* Progress bar */}
            {selected.status !== "cancelled" && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <Progress
                  percent={getProgress(selected.status).percent}
                  status={getProgress(selected.status).status}
                  strokeColor={{ "0%": "#6272B6", "100%": "#a78bfa" }}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>🛒 Đặt hàng</span>
                  <span>💳 Thanh toán</span>
                  <span>🚚 Vận chuyển</span>
                  <span>✅ Hoàn thành</span>
                </div>
              </div>
            )}

            <Row gutter={24}>
              {/* Timeline */}
              <Col span={12}>
                <Title level={5} className="mb-3">📍 Lịch sử đơn hàng</Title>
                <Timeline items={getTimelineItems(selected)} />
              </Col>

              {/* Thông tin giao hàng */}
              <Col span={12}>
                <Title level={5} className="mb-3">📋 Thông tin giao hàng</Title>
                <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 w-5">👤</span>
                    <div>
                      <div className="text-xs text-gray-400">Người nhận</div>
                      <Text strong>{selected.customer.name}</Text>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <PhoneOutlined className="text-gray-400 w-5" />
                    <div>
                      <div className="text-xs text-gray-400">Số điện thoại</div>
                      <Text>{selected.customer.phone}</Text>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <HomeOutlined className="text-gray-400 w-5 mt-0.5" />
                    <div>
                      <div className="text-xs text-gray-400">Địa chỉ</div>
                      <Text>{selected.customer.address}</Text>
                    </div>
                  </div>
                  <Divider className="my-2" />
                  <div className="flex items-center justify-between">
                    <Text type="secondary">Phương thức thanh toán</Text>
                    <Tag
                      icon={paymentConfig[selected.paymentMethod]?.icon}
                      color={paymentConfig[selected.paymentMethod]?.color}
                    >
                      {paymentConfig[selected.paymentMethod]?.label}
                    </Tag>
                  </div>
                  <div className="flex items-center justify-between">
                    <Text type="secondary">Trạng thái</Text>
                    <Tag
                      icon={statusConfig[selected.status]?.icon}
                      color={statusConfig[selected.status]?.color}
                    >
                      {statusConfig[selected.status]?.label}
                    </Tag>
                  </div>
                </div>
              </Col>
            </Row>

            <Divider>🛍️ Sản phẩm ({selected.items.length})</Divider>

            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {selected.items.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 rounded-xl object-cover border shadow-sm"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/56x56?text=?"; }}
                  />
                  <div className="flex-1 min-w-0">
                    <Text strong className="block truncate">{item.name}</Text>
                    <Text type="secondary" className="text-sm">
                      {item.quantity} × {item.price.toLocaleString()}đ
                    </Text>
                  </div>
                  <Text strong className="text-[#6272B6] whitespace-nowrap">
                    {(item.price * item.quantity).toLocaleString()}đ
                  </Text>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl flex justify-between items-center">
              <Text strong className="text-base">Tổng cộng</Text>
              <Text strong className="text-2xl text-[#6272B6]">{selected.totals.total.toLocaleString()}đ</Text>
            </div>

            <div className="mt-4 flex justify-end">
              <Button onClick={() => setSelected(null)} className="rounded-full px-8">Đóng</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
