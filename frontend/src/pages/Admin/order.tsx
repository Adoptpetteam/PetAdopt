import { useEffect, useState, useMemo } from "react";
import { Table, Tag, Space, Select, message, Button, Input, Modal, Card, Statistic, Row, Col, Divider, Timeline, Avatar, Typography, Progress, Empty, Spin } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ReloadOutlined, EyeOutlined, SearchOutlined, ShoppingOutlined, DollarOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, CarOutlined, BankOutlined, UserOutlined, PhoneOutlined, HomeOutlined, PrinterOutlined, InboxOutlined } from "@ant-design/icons";
import { apiClient } from "../../api/http";

const { Text, Title } = Typography;

interface OrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  createdAt: string;
  updatedAt: string;
  status: "pending" | "paid" | "cancelled";
  paymentMethod: "cod" | "vnpay";
  customer: { name: string; phone: string; address: string };
  items: OrderItem[];
  totals: { subtotal: number; total: number };
  user?: { name: string; email: string };
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Chờ xử lý", color: "orange", icon: <ClockCircleOutlined /> },
  paid: { label: "Đã thanh toán", color: "green", icon: <CheckCircleOutlined /> },
  cancelled: { label: "Đã hủy", color: "red", icon: <CloseCircleOutlined /> },
};

const paymentConfig: Record<string, { label: string; color: string; icon: any }> = {
  cod: { label: "COD", color: "orange", icon: <CarOutlined /> },
  vnpay: { label: "VNPay", color: "blue", icon: <BankOutlined /> },
};

const OrderPage = () => {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 1000 };
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await apiClient.get("/orders", { params });
      setData(res.data.data || []);
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Không thể tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const handleChangeStatus = async (value: string, record: Order) => {
    try {
      await apiClient.put(`/orders/${record._id}/status`, { status: value });
      setData((prev) => prev.map((item) => (item._id === record._id ? { ...item, status: value as any } : item)));
      message.success("Cập nhật trạng thái thành công");
      if (detailOrder?._id === record._id) {
        setDetailOrder({ ...detailOrder, status: value as any });
      }
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Cập nhật thất bại");
    }
  };

  const filteredData = useMemo(() => {
    return data.filter((o) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return o._id.toLowerCase().includes(q) || o.customer.name.toLowerCase().includes(q) || o.customer.phone.includes(q);
    });
  }, [data, search]);

  const stats = useMemo(() => {
    const total = filteredData.length;
    const revenue = filteredData.filter(o => o.status === "paid").reduce((sum, o) => sum + o.totals.total, 0);
    const pending = filteredData.filter(o => o.status === "pending").length;
    const paid = filteredData.filter(o => o.status === "paid").length;
    const cancelled = filteredData.filter(o => o.status === "cancelled").length;
    return { total, revenue, pending, paid, cancelled };
  }, [filteredData]);

  const columns: ColumnsType<Order> = [
    {
      title: "Mã đơn",
      dataIndex: "_id",
      render: (id: string) => <Text code className="text-xs">#{id.slice(-8).toUpperCase()}</Text>,
      width: 100,
    },
    {
      title: "Khách hàng",
      render: (_, r) => (
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          <div>
            <div className="font-semibold text-sm">{r.customer?.name || "—"}</div>
            <Text type="secondary" className="text-xs">{r.customer?.phone || "—"}</Text>
          </div>
        </Space>
      ),
      width: 200,
    },
    {
      title: "Sản phẩm",
      render: (_, r) => (
        <div>
          <Text className="text-xs">{r.items.length} sản phẩm</Text>
          <div className="text-xs text-gray-400 truncate max-w-[150px]">{r.items.map(i => i.name).join(", ")}</div>
        </div>
      ),
      width: 180,
    },
    {
      title: "Tổng tiền",
      dataIndex: ["totals", "total"],
      render: (total: number) => <Text strong className="text-[#6272B6]">{total.toLocaleString()}đ</Text>,
      width: 120,
      sorter: (a, b) => a.totals.total - b.totals.total,
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentMethod",
      render: (method: string) => {
        const cfg = paymentConfig[method] || { label: method, color: "default", icon: null };
        return <Tag icon={cfg.icon} color={cfg.color}>{cfg.label}</Tag>;
      },
      width: 110,
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdAt",
      render: (d: string) => (
        <div>
          <div className="text-xs">{new Date(d).toLocaleDateString("vi-VN")}</div>
          <Text type="secondary" className="text-xs">{new Date(d).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</Text>
        </div>
      ),
      width: 110,
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: "descend",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status: string, record: Order) => {
        const cfg = statusConfig[status] || { label: status, color: "default", icon: null };
        return (
          <Space size="small">
            <Tag icon={cfg.icon} color={cfg.color}>{cfg.label}</Tag>
            <Select value={status} size="small" style={{ width: 130 }} onChange={(value) => handleChangeStatus(value, record)}>
              <Select.Option value="pending">Chờ xử lý</Select.Option>
              <Select.Option value="paid">Đã thanh toán</Select.Option>
              <Select.Option value="cancelled">Đã hủy</Select.Option>
            </Select>
          </Space>
        );
      },
      width: 240,
    },
    {
      title: "",
      render: (_, record) => (
        <Button type="link" icon={<EyeOutlined />} onClick={() => setDetailOrder(record)}>Chi tiết</Button>
      ),
      width: 90,
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <Title level={3} className="m-0">📦 Quản lý đơn hàng</Title>
        <Button icon={<ReloadOutlined />} onClick={loadOrders} loading={loading}>Làm mới</Button>
      </div>

      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic title="Tổng đơn hàng" value={stats.total} prefix={<ShoppingOutlined />} valueStyle={{ color: "#3f8600" }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Doanh thu" value={stats.revenue} suffix="đ" prefix={<DollarOutlined />} valueStyle={{ color: "#6272B6" }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Chờ xử lý" value={stats.pending} prefix={<ClockCircleOutlined />} valueStyle={{ color: "#faad14" }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Đã thanh toán" value={stats.paid} prefix={<CheckCircleOutlined />} valueStyle={{ color: "#52c41a" }} />
          </Card>
        </Col>
      </Row>

      <Card className="mb-4">
        <Space size="middle" className="w-full" wrap>
          <Input placeholder="Tìm theo mã, tên, SĐT..." prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} allowClear style={{ width: 300 }} />
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 160 }}>
            <Select.Option value="all">Tất cả trạng thái</Select.Option>
            <Select.Option value="pending">Chờ xử lý</Select.Option>
            <Select.Option value="paid">Đã thanh toán</Select.Option>
            <Select.Option value="cancelled">Đã hủy</Select.Option>
          </Select>
          <Tag color="blue">{filteredData.length} đơn</Tag>
        </Space>
      </Card>

      <Card>
        <Table columns={columns} dataSource={filteredData} rowKey="_id" loading={loading} pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `Tổng ${total} đơn` }} scroll={{ x: 1200 }} />
      </Card>

      <Modal open={!!detailOrder} onCancel={() => setDetailOrder(null)} footer={null} title={<Space><ShoppingOutlined />Chi tiết đơn hàng #{detailOrder?._id.slice(-8).toUpperCase()}</Space>} width={700}>
        {detailOrder && (
          <div>
            <Row gutter={16} className="mb-4">
              <Col span={12}>
                <Card size="small" title={<Space><UserOutlined />Thông tin khách hàng</Space>}>
                  <p><Text strong>Họ tên:</Text> {detailOrder.customer?.name}</p>
                  <p><Text strong>SĐT:</Text> {detailOrder.customer?.phone}</p>
                  <p><Text strong>Địa chỉ:</Text> {detailOrder.customer?.address}</p>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="Thông tin đơn hàng">
                  <p><Text strong>Thanh toán:</Text> <Tag icon={paymentConfig[detailOrder.paymentMethod]?.icon} color={paymentConfig[detailOrder.paymentMethod]?.color}>{paymentConfig[detailOrder.paymentMethod]?.label}</Tag></p>
                  <p><Text strong>Trạng thái:</Text> <Tag icon={statusConfig[detailOrder.status]?.icon} color={statusConfig[detailOrder.status]?.color}>{statusConfig[detailOrder.status]?.label}</Tag></p>
                  <p><Text strong>Ngày đặt:</Text> {new Date(detailOrder.createdAt).toLocaleString("vi-VN")}</p>
                </Card>
              </Col>
            </Row>

            <Divider>Sản phẩm</Divider>
            <div className="space-y-3 mb-4">
              {detailOrder.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/64x64?text=No+Image"; }} />
                  <div className="flex-1">
                    <Text strong>{item.name}</Text>
                    <div className="text-xs text-gray-500">{item.quantity} × {item.price.toLocaleString()}đ</div>
                  </div>
                  <Text strong className="text-[#6272B6]">{(item.price * item.quantity).toLocaleString()}đ</Text>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <Text strong className="text-lg">Tổng cộng</Text>
                <Text strong className="text-2xl text-[#6272B6]">{detailOrder.totals.total.toLocaleString()}đ</Text>
              </div>
            </div>

            <Divider />
            <Space>
              <Select value={detailOrder.status} onChange={(value) => handleChangeStatus(value, detailOrder)} style={{ width: 200 }}>
                <Select.Option value="pending">Chờ xử lý</Select.Option>
                <Select.Option value="paid">Đã thanh toán</Select.Option>
                <Select.Option value="cancelled">Đã hủy</Select.Option>
              </Select>
              <Button type="primary" onClick={() => setDetailOrder(null)}>Đóng</Button>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderPage;
