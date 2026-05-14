import React, { useEffect, useState } from "react";
import {
  Button, Tag, Empty, Spin, Card, Timeline, Space, Typography,
  Row, Col, Divider, Progress, Modal, Table, Tabs, Badge,
  Statistic, DatePicker, Select, Input, Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "../api/http";
import { message } from "antd";
import {
  ShoppingOutlined, ClockCircleOutlined, CheckCircleOutlined,
  CloseCircleOutlined, CarOutlined, BankOutlined, TruckOutlined,
  GiftOutlined, PhoneOutlined, HomeOutlined, EyeOutlined,
  ReloadOutlined, BoxPlotOutlined, SearchOutlined, CalendarOutlined,
  DollarOutlined, ShoppingCartOutlined, DownloadOutlined,
} from "@ant-design/icons";
import dayjs from 'dayjs';

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
  status: "pending" | "confirmed" | "paid" | "shipping" | "completed" | "cancelled";
  paymentMethod: "cod" | "vnpay";
  customer: { name: string; phone: string; address: string };
  items: OrderItem[];
  totals: { subtotal: number; total: number };
}

const statusConfig = {
  pending:   { color: "orange",  label: "Chờ xử lý",         icon: <ClockCircleOutlined />,  desc: "Đơn hàng đang chờ xác nhận" },
  confirmed: { color: "cyan",    label: "Đã xác nhận",        icon: <CheckCircleOutlined />,  desc: "Đơn COD đã xác nhận, thanh toán khi nhận hàng" },
  paid:      { color: "blue",    label: "Đã thanh toán",      icon: <CheckCircleOutlined />,  desc: "Đã thanh toán, đang chuẩn bị hàng" },
  shipping:  { color: "purple",  label: "Đang giao hàng",     icon: <TruckOutlined />,        desc: "Đơn hàng đang trên đường giao đến bạn" },
  completed: { color: "green",   label: "Hoàn thành",         icon: <GiftOutlined />,         desc: "Đơn hàng đã giao thành công" },
  cancelled: { color: "red",     label: "Đã hủy",             icon: <CloseCircleOutlined />,  desc: "Đơn hàng đã bị hủy" },
};

const paymentConfig = {
  cod:   { label: "COD",   icon: <CarOutlined />,  color: "orange" },
  vnpay: { label: "VNPay", icon: <BankOutlined />, color: "blue"   },
};

// COD:   pending → confirmed → shipping → completed
// VNPay: pending → paid      → shipping → completed
const COD_STEPS   = ["pending", "confirmed", "shipping", "completed"];
const VNPAY_STEPS = ["pending", "paid",      "shipping", "completed"];

const getSteps = (order: OrderData) =>
  order.paymentMethod === "cod" ? COD_STEPS : VNPAY_STEPS;

const getProgress = (order: OrderData) => {
  if (order.status === "cancelled") return { percent: 100, status: "exception" as const };
  const steps = getSteps(order);
  const idx = steps.indexOf(order.status);
  const pct = idx < 0 ? 10 : Math.round(((idx + 1) / steps.length) * 100);
  return { percent: pct, status: "active" as const };
};

const getTimelineItems = (order: OrderData) => {
  const isCOD = order.paymentMethod === "cod";
  const steps = isCOD
    ? [
        { key: "pending",   title: "Đặt hàng thành công",  desc: "Đơn hàng đã được tạo",                        time: order.createdAt },
        { key: "confirmed", title: "Đã xác nhận",           desc: "Đơn COD đã xác nhận, thanh toán khi nhận",    time: order.updatedAt },
        { key: "shipping",  title: "Đang giao hàng",        desc: "Đơn hàng đang được vận chuyển",               time: order.updatedAt },
        { key: "completed", title: "Giao hàng thành công",  desc: "Đã giao và thu tiền COD thành công",          time: order.updatedAt },
      ]
    : [
        { key: "pending",   title: "Đặt hàng thành công",  desc: "Đơn hàng đã được tạo",                        time: order.createdAt },
        { key: "paid",      title: "Đã thanh toán VNPay",  desc: "Thanh toán online thành công",                time: order.updatedAt },
        { key: "shipping",  title: "Đang giao hàng",        desc: "Đơn hàng đang được vận chuyển",               time: order.updatedAt },
        { key: "completed", title: "Giao hàng thành công",  desc: "Đơn hàng đã được giao đến bạn",              time: order.updatedAt },
      ];

  const currentSteps = getSteps(order);
  const currentIdx = currentSteps.indexOf(order.status);

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
  { key: "confirmed", label: "Đã xác nhận" },
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
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const navigate = useNavigate();

  // Thống kê tổng quan
  const orderStats = {
    total: orders.length,
    totalAmount: orders.reduce((sum, order) => sum + order.totals.total, 0),
    completed: orders.filter(o => o.status === 'completed').length,
    pending: orders.filter(o => ['pending', 'confirmed', 'paid', 'shipping'].includes(o.status)).length,
  };

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

  const handleCancelOrder = (orderId: string) => {
    Modal.confirm({
      title: "Xác nhận hủy đơn",
      icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
      content: "Bạn có chắc muốn hủy đơn hàng này? Hàng sẽ được hoàn lại kho.",
      okText: "Hủy đơn",
      okType: "danger",
      cancelText: "Giữ lại",
      onOk: async () => {
        try {
          await apiClient.put(`/orders/me/${orderId}/cancel`);
          message.success("Đã hủy đơn hàng, hàng đã được hoàn kho");
          loadOrders();
          if (selected?._id === orderId) setSelected(null);
        } catch (e: any) {
          message.error(e?.response?.data?.message || "Không thể hủy đơn hàng");
        }
      },
    });
  };

  const filtered = orders.filter((order) => {
    // Filter by tab
    if (activeTab !== "all" && order.status !== activeTab) return false;
    
    // Filter by search text
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      const matchesId = order._id.toLowerCase().includes(searchLower);
      const matchesCustomer = order.customer.name.toLowerCase().includes(searchLower);
      const matchesProduct = order.items.some(item => 
        item.name.toLowerCase().includes(searchLower)
      );
      if (!matchesId && !matchesCustomer && !matchesProduct) return false;
    }
    
    // Filter by date range
    if (dateRange && dateRange[0] && dateRange[1]) {
      const orderDate = dayjs(order.createdAt);
      if (!orderDate.isBetween(dateRange[0], dateRange[1], 'day', '[]')) return false;
    }
    
    // Filter by payment method
    if (paymentFilter !== "all" && order.paymentMethod !== paymentFilter) return false;
    
    return true;
  });

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
      render: (s: string, record: OrderData) => {
        const cfg = statusConfig[s as keyof typeof statusConfig];
        return (
          <div>
            <Tag icon={cfg?.icon} color={cfg?.color} className="mb-1">{cfg?.label}</Tag>
            {s !== "cancelled" && (
              <Progress
                percent={getProgress(record).percent}
                status={getProgress(record).status}
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
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setSelected(record)}
            className="bg-[#6272B6] border-0 rounded-full"
          >
            Chi tiết
          </Button>
          {['pending', 'confirmed'].includes(record.status) && (
            <Button
              danger
              size="small"
              icon={<CloseCircleOutlined />}
              onClick={() => handleCancelOrder(record._id)}
              className="rounded-full"
            >
              Hủy
            </Button>
          )}
        </Space>
      ),
      width: 160,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spin size="large" description="Đang tải đơn hàng..." />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-16 px-4">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Title level={2} className="text-[#6272B6] m-0 flex items-center gap-2">
              <BoxPlotOutlined /> Lịch sử mua hàng
            </Title>
            <Text type="secondary">Quản lý và theo dõi đơn hàng của bạn</Text>
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

        {/* Thống kê tổng quan */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={12} sm={6}>
            <Card className="text-center border-0 shadow-sm">
              <Statistic
                title="Tổng đơn hàng"
                value={orderStats.total}
                prefix={<ShoppingCartOutlined className="text-blue-500" />}
                valueStyle={{ color: '#6272B6', fontSize: '20px' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="text-center border-0 shadow-sm">
              <Statistic
                title="Tổng chi tiêu"
                value={orderStats.totalAmount}
                prefix={<DollarOutlined className="text-green-500" />}
                suffix="đ"
                valueStyle={{ color: '#10b981', fontSize: '20px' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="text-center border-0 shadow-sm">
              <Statistic
                title="Đã hoàn thành"
                value={orderStats.completed}
                prefix={<CheckCircleOutlined className="text-green-500" />}
                valueStyle={{ color: '#10b981', fontSize: '20px' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="text-center border-0 shadow-sm">
              <Statistic
                title="Đang xử lý"
                value={orderStats.pending}
                prefix={<ClockCircleOutlined className="text-orange-500" />}
                valueStyle={{ color: '#f59e0b', fontSize: '20px' }}
              />
            </Card>
          </Col>
        </Row>

        <Card className="rounded-2xl shadow-sm border-0">
          {/* Bộ lọc nâng cao */}
          <div className="mb-4 p-4 bg-gray-50 rounded-xl">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={8}>
                <Input
                  placeholder="Tìm theo mã đơn, tên khách hàng, sản phẩm..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={6}>
                <DatePicker.RangePicker
                  placeholder={['Từ ngày', 'Đến ngày']}
                  value={dateRange}
                  onChange={setDateRange}
                  format="DD/MM/YYYY"
                  className="w-full"
                />
              </Col>
              <Col xs={24} sm={4}>
                <Select
                  placeholder="Thanh toán"
                  value={paymentFilter}
                  onChange={setPaymentFilter}
                  className="w-full"
                  options={[
                    { label: 'Tất cả', value: 'all' },
                    { label: 'COD', value: 'cod' },
                    { label: 'VNPay', value: 'vnpay' },
                  ]}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Space>
                  <Button 
                    onClick={() => {
                      setSearchText("");
                      setDateRange(null);
                      setPaymentFilter("all");
                      setActiveTab("all");
                    }}
                  >
                    Xóa bộ lọc
                  </Button>
                  <Tooltip title="Xuất Excel">
                    <Button icon={<DownloadOutlined />} type="primary" className="bg-green-500 border-0">
                      Xuất
                    </Button>
                  </Tooltip>
                </Space>
              </Col>
            </Row>
          </div>

          {/* Tabs lọc theo trạng thái */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            className="mb-4"
          />

          {filtered.length === 0 ? (
            <Empty
              description={
                <div className="text-center">
                  <div className="text-gray-500 mb-2">
                    {orders.length === 0 ? "Bạn chưa có đơn hàng nào" : "Không tìm thấy đơn hàng phù hợp"}
                  </div>
                  {searchText || dateRange || paymentFilter !== "all" ? (
                    <Button onClick={() => {
                      setSearchText("");
                      setDateRange(null);
                      setPaymentFilter("all");
                      setActiveTab("all");
                    }}>
                      Xóa bộ lọc
                    </Button>
                  ) : null}
                </div>
              }
              className="py-16"
            >
              {orders.length === 0 && (
                <Link to="/products">
                  <Button type="primary" className="bg-[#6272B6] border-0 rounded-full px-8">
                    Mua sắm ngay
                  </Button>
                </Link>
              )}
            </Empty>
          ) : (
            <Table
              columns={columns}
              dataSource={filtered}
              rowKey="_id"
              pagination={{ 
                pageSize: 10, 
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đơn hàng`,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
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
                  percent={getProgress(selected).percent}
                  status={getProgress(selected).status}
                  strokeColor={{ "0%": "#6272B6", "100%": "#a78bfa" }}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>🛒 Đặt hàng</span>
                  {selected.paymentMethod === "cod"
                    ? <span>✅ Xác nhận</span>
                    : <span>💳 Thanh toán</span>
                  }
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

            <div className="mt-4 flex justify-end gap-3">
              {['pending', 'confirmed'].includes(selected.status) && (
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleCancelOrder(selected._id)}
                  className="rounded-full px-6"
                >
                  Hủy đơn hàng
                </Button>
              )}
              <Button onClick={() => setSelected(null)} className="rounded-full px-8">Đóng</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
