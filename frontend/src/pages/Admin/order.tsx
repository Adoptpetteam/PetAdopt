import { useEffect, useState, useMemo } from "react";
import { Table, Tag, Space, Select, message, Button, Input, Modal, Card, Statistic, Row, Col, Divider, Avatar, Typography, Badge, Popconfirm, Alert } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ReloadOutlined, EyeOutlined, SearchOutlined, ShoppingOutlined, DollarOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, CarOutlined, BankOutlined, UserOutlined, TruckOutlined, GiftOutlined, DeleteOutlined, BoxPlotOutlined, SwapOutlined, StopOutlined } from "@ant-design/icons";
import { apiClient } from "../../api/http";

const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;

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
  
  // OLD STATUS (deprecated)
  status: string;
  
  // NEW STATUS (recommended)
  orderStatus?: "pending" | "confirmed" | "shipping" | "delivered" | "cancelled";
  paymentStatus?: "unpaid" | "pending" | "paid" | "refunding" | "refunded" | "failed";
  returnStatus?: null | "requested" | "approved" | "rejected" | "shipping" | "received" | "completed";
  
  paymentMethod: "cod" | "vnpay";
  customer: { name: string; phone: string; address: string };
  items: OrderItem[];
  totals: { subtotal: number; total: number };
  user?: { name: string; email: string };
}

// NEW STATUS CONFIGS - Giống app giao hàng (Shopee, Lazada, Grab...)
const orderStatusConfig = {
  pending:   { color: "orange",  label: "Chờ xác nhận",        icon: <ClockCircleOutlined />, desc: "Đơn hàng đang chờ shop xác nhận" },
  confirmed: { color: "blue",    label: "Đã xác nhận",         icon: <CheckCircleOutlined />, desc: "Shop đã xác nhận, đang chuẩn bị hàng" },
  shipping:  { color: "purple",  label: "Đang giao hàng",      icon: <TruckOutlined />,       desc: "Shipper đang giao hàng đến bạn" },
  delivered: { color: "green",   label: "Giao hàng thành công", icon: <GiftOutlined />,        desc: "Đã giao hàng thành công" },
  completed: { color: "cyan",    label: "Hoàn thành",           icon: <CheckCircleOutlined />, desc: "Đơn hàng đã hoàn tất" },
  cancelled: { color: "red",     label: "Đã hủy",              icon: <CloseCircleOutlined />, desc: "Đơn hàng đã bị hủy" },
  refund_pending: { color: "volcano", label: "Chờ duyệt hủy", icon: <StopOutlined />, desc: "Khách yêu cầu hủy đơn, chờ admin xét duyệt" },
};

const paymentStatusConfig = {
  unpaid:    { color: "default", label: "Chưa thanh toán",      icon: <DollarOutlined /> },
  pending:   { color: "orange",  label: "Chờ thanh toán",       icon: <ClockCircleOutlined /> },
  paid:      { color: "green",   label: "Đã thanh toán",        icon: <CheckCircleOutlined /> },
  refunding: { color: "blue",    label: "Đang hoàn tiền",       icon: <ReloadOutlined /> },
  refunded:  { color: "green",   label: "Đã hoàn tiền",         icon: <CheckCircleOutlined /> },
  failed:    { color: "red",     label: "Thanh toán thất bại",  icon: <CloseCircleOutlined /> },
};

const returnStatusConfig = {
  null:      { color: "default", label: "Không có",         icon: null },
  requested: { color: "orange",  label: "Yêu cầu hoàn trả", icon: <SwapOutlined /> },
  approved:  { color: "cyan",    label: "Đã chấp thuận",    icon: <CheckCircleOutlined /> },
  rejected:  { color: "red",     label: "Đã từ chối",       icon: <CloseCircleOutlined /> },
  shipping:  { color: "purple",  label: "Đang gửi về",      icon: <TruckOutlined /> },
  received:  { color: "blue",    label: "Đã nhận hàng",     icon: <CheckCircleOutlined /> },
  completed: { color: "green",   label: "Hoàn tất",         icon: <CheckCircleOutlined /> },
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
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelingOrderId, setCancelingOrderId] = useState<string | null>(null);

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

  // Hàm cập nhật trạng thái đơn hàng
  const handleUpdateOrderStatus = async (orderId: string, newOrderStatus: string) => {
    try {
      await apiClient.put(`/orders/${orderId}/status`, { 
        orderStatus: newOrderStatus,
        note: `Admin cập nhật trạng thái đơn hàng: ${newOrderStatus}`
      });
      message.success("Cập nhật trạng thái đơn hàng thành công");
      loadOrders();
      if (detailOrder?._id === orderId) {
        setDetailOrder({ ...detailOrder, orderStatus: newOrderStatus as any });
      }
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Cập nhật thất bại");
    }
  };

  // Hàm cập nhật trạng thái thanh toán
  const handleUpdatePaymentStatus = async (orderId: string, newPaymentStatus: string) => {
    try {
      await apiClient.put(`/orders/${orderId}/status`, { 
        paymentStatus: newPaymentStatus,
        note: `Admin cập nhật trạng thái thanh toán: ${newPaymentStatus}`
      });
      message.success("Cập nhật trạng thái thanh toán thành công");
      loadOrders();
      if (detailOrder?._id === orderId) {
        setDetailOrder({ ...detailOrder, paymentStatus: newPaymentStatus as any });
      }
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Cập nhật thất bại");
    }
  };

  // Hàm hủy đơn hàng với lý do
  const handleCancelOrder = (record: Order) => {
    setCancelingOrderId(record._id);
    setCancelReason("");
    setCancelModalVisible(true);
  };

  const confirmCancelOrder = async () => {
    if (!cancelReason || cancelReason.trim().length === 0) {
      message.error("Vui lòng nhập lý do hủy đơn");
      return;
    }

    try {
      await apiClient.post(`/orders/${cancelingOrderId}/admin-cancel`, {
        reason: cancelReason.trim()
      });
      
      message.success("Đã hủy đơn hàng và gửi thông báo cho khách hàng");
      setCancelModalVisible(false);
      setCancelReason("");
      setCancelingOrderId(null);
      loadOrders();
      
      if (detailOrder?._id === cancelingOrderId) {
        setDetailOrder(null);
      }
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Hủy đơn thất bại");
    }
  };

  // Hàm duyệt đơn hàng (pending → confirmed)
  const handleApproveOrder = async (record: Order) => {
    Modal.confirm({
      title: "Xác nhận duyệt đơn hàng",
      icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      content: (
        <div>
          <p>Bạn có chắc muốn duyệt đơn hàng này?</p>
          <Alert
            title="Lưu ý"
            description="Sau khi duyệt, voucher (nếu có) sẽ được tính vào số lần sử dụng và đơn hàng sẽ chuyển sang trạng thái 'Đã xác nhận'."
            type="info"
            showIcon
            className="mt-2"
          />
        </div>
      ),
      okText: "Duyệt đơn",
      cancelText: "Hủy",
      onOk: async () => {
        await handleUpdateOrderStatus(record._id, 'confirmed');
      },
    });
  };

  const handleDeleteOrder = async (record: Order) => {
    try {
      await apiClient.delete(`/orders/${record._id}`);
      setData((prev) => prev.filter((item) => item._id !== record._id));
      message.success("Đã xóa đơn hàng và hoàn lại kho");
      if (detailOrder?._id === record._id) {
        setDetailOrder(null);
      }
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Xóa thất bại");
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
    const revenue = filteredData.filter(o => 
      (o.orderStatus === "delivered" || o.status === "completed") ||
      (o.paymentStatus === "paid" || o.status === "paid")
    ).reduce((sum, o) => sum + o.totals.total, 0);
    
    const pending = filteredData.filter(o => o.orderStatus === "pending" || o.status === "pending").length;
    const confirmed = filteredData.filter(o => o.orderStatus === "confirmed" || o.status === "confirmed").length;
    const shipping = filteredData.filter(o => o.orderStatus === "shipping" || o.status === "shipping").length;
    const delivered = filteredData.filter(o => o.orderStatus === "delivered" || o.status === "completed" || o.status === "delivered").length;
    const completed = filteredData.filter(o => o.status === "completed").length;
    const cancelled = filteredData.filter(o => o.orderStatus === "cancelled" || o.status === "cancelled").length;
    
    return { total, revenue, pending, confirmed, shipping, delivered, completed, cancelled };
  }, [filteredData]);

  const columns: ColumnsType<Order> = [
    {
      title: "Mã đơn",
      dataIndex: "_id",
      render: (id: string) => <Text code className="text-xs font-bold">#{id.slice(-8).toUpperCase()}</Text>,
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
      width: 180,
    },
    {
      title: "Sản phẩm",
      render: (_, r) => (
        <div>
          <Text className="text-xs font-medium">{r.items.length} sản phẩm</Text>
          <div className="text-xs text-gray-400 truncate max-w-[150px]">{r.items.map(i => i.name).join(", ")}</div>
        </div>
      ),
      width: 160,
    },
    {
      title: "Tổng tiền",
      dataIndex: ["totals", "total"],
      render: (total: number) => <Text strong className="text-[#6272B6]">{total.toLocaleString()}đ</Text>,
      width: 110,
      sorter: (a, b) => a.totals.total - b.totals.total,
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentMethod",
      render: (method: string) => {
        const cfg = paymentConfig[method] || { label: method, color: "default", icon: null };
        return <Tag icon={cfg.icon} color={cfg.color}>{cfg.label}</Tag>;
      },
      width: 100,
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
      width: 100,
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: "descend",
    },
    {
      title: "Trạng thái",
      render: (_, record) => {
        const orderSt = record.orderStatus || 'pending';
        const paymentSt = record.paymentStatus || 'unpaid';
        const returnSt = record.returnStatus;
        
        const orderCfg = orderStatusConfig[orderSt as keyof typeof orderStatusConfig];
        const paymentCfg = paymentStatusConfig[paymentSt as keyof typeof paymentStatusConfig];
        const returnCfg = returnSt ? returnStatusConfig[returnSt as keyof typeof returnStatusConfig] : null;
        
        return (
          <Space orientation="vertical" size={2} style={{ width: '100%' }}>
            {/* Trạng thái đơn hàng */}
            <Tag icon={orderCfg?.icon} color={orderCfg?.color} className="w-full text-center text-xs">
              📦 {orderCfg?.label}
            </Tag>
            
            {/* Trạng thái thanh toán */}
            <Tag icon={paymentCfg?.icon} color={paymentCfg?.color} className="w-full text-center text-xs">
              💰 {paymentCfg?.label}
            </Tag>
            
            {/* Trạng thái hoàn trả (nếu có) */}
            {returnCfg && (
              <Tag icon={returnCfg?.icon} color={returnCfg?.color} className="w-full text-center text-xs">
                🔄 {returnCfg?.label}
              </Tag>
            )}
          </Space>
        );
      },
      width: 160,
    },
    {
      title: "Thao tác",
      render: (_, record) => {
        const orderSt = record.orderStatus || 'pending';
        const isPending = orderSt === 'pending';
        const canCancel = !['delivered', 'completed', 'cancelled'].includes(orderSt);
        
        return (
          <Space orientation="vertical" size="small">
            <Button 
              type="link" 
              icon={<EyeOutlined />} 
              onClick={() => setDetailOrder(record)}
              size="small"
              className="p-0 h-auto"
            >
              Chi tiết
            </Button>
            
            {isPending && (
              <Button 
                type="primary" 
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleApproveOrder(record)}
                className="w-full"
              >
                Duyệt đơn
              </Button>
            )}
            
            {canCancel && (
              <Button 
                danger
                size="small"
                icon={<StopOutlined />}
                onClick={() => handleCancelOrder(record)}
                className="w-full"
              >
                Hủy đơn
              </Button>
            )}
            
            <Popconfirm
              title="Xóa đơn hàng"
              description="Bạn có chắc muốn xóa đơn hàng này? Kho sẽ được hoàn lại."
              onConfirm={() => handleDeleteOrder(record)}
              okText="Xóa"
              cancelText="Hủy"
              okType="danger"
            >
              <Button 
                type="link" 
                danger 
                icon={<DeleteOutlined />}
                size="small"
                className="p-0 h-auto"
              >
                Xóa
              </Button>
            </Popconfirm>
          </Space>
        );
      },
      width: 120,
      fixed: 'right' as const,
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <Title level={3} className="m-0">
          <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6272B6] to-purple-600 flex items-center gap-2">
            Quản lý đơn hàng
          </div>
          
          </Title>
        <Button icon={<ReloadOutlined />} onClick={loadOrders} loading={loading}>Làm mới</Button>
      </div>

      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} md={6} lg={4}>
          <Card>
            <Statistic 
              title="Tổng đơn" 
              value={stats.total} 
              prefix={<ShoppingOutlined />} 
              valueStyle={{ color: "#3f8600" }} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={5}>
          <Card>
            <Statistic 
              title="Doanh thu" 
              value={stats.revenue} 
              suffix="đ" 
              prefix={<DollarOutlined />} 
              valueStyle={{ color: "#6272B6" }} 
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4} lg={3}>
          <Card>
            <Statistic 
              title="Chờ xác nhận" 
              value={stats.pending} 
              prefix={<ClockCircleOutlined />} 
              valueStyle={{ color: "#faad14" }} 
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4} lg={3}>
          <Card>
            <Statistic 
              title="Đã xác nhận" 
              value={stats.confirmed} 
              prefix={<CheckCircleOutlined />} 
              valueStyle={{ color: "#1890ff" }} 
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4} lg={3}>
          <Card>
            <Statistic 
              title="Đang giao" 
              value={stats.shipping} 
              prefix={<TruckOutlined />} 
              valueStyle={{ color: "#722ed1" }} 
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={3}>
          <Card>
            <Statistic 
              title="Đã giao" 
              value={stats.delivered} 
              prefix={<GiftOutlined />} 
              valueStyle={{ color: "#52c41a" }} 
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={3}>
          <Card>
            <Statistic 
              title="Hoàn thành" 
              value={stats.completed} 
              prefix={<CheckCircleOutlined />} 
              valueStyle={{ color: "#13c2c2" }} 
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={3}>
          <Card>
            <Statistic 
              title="Đã hủy" 
              value={stats.cancelled} 
              prefix={<CloseCircleOutlined />} 
              valueStyle={{ color: "#ff4d4f" }} 
            />
          </Card>
        </Col>
      </Row>

      <Card className="mb-4">
        <Space size="middle" className="w-full" wrap>
          <Input 
            placeholder="Tìm theo mã, tên, SĐT..." 
            prefix={<SearchOutlined />} 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            allowClear 
            style={{ width: 300 }} 
          />
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 180 }}>
            <Select.Option value="all">Tất cả trạng thái</Select.Option>
            <Select.Option value="pending">Chờ xác nhận</Select.Option>
            <Select.Option value="confirmed">Đã xác nhận</Select.Option>
            <Select.Option value="shipping">Đang giao hàng</Select.Option>
            <Select.Option value="delivered">Đã giao hàng</Select.Option>
            <Select.Option value="completed">Hoàn thành</Select.Option>
            <Select.Option value="refund_pending">
              <Badge status="processing" />
              Chờ duyệt hủy
            </Select.Option>
            <Select.Option value="cancelled">Đã hủy</Select.Option>
          </Select>
          <Tag color="blue">{filteredData.length} đơn</Tag>
        </Space>
      </Card>

      <Card>
        <Table 
          columns={columns} 
          dataSource={filteredData} 
          rowKey="_id" 
          loading={loading} 
          pagination={{ 
            pageSize: 20, 
            showSizeChanger: true, 
            showTotal: (total) => `Tổng ${total} đơn` 
          }} 
          scroll={{ x: 1200 }} 
        />
      </Card>

      {/* Modal chi tiết đơn hàng */}
      <Modal 
        open={!!detailOrder} 
        onCancel={() => setDetailOrder(null)} 
        footer={null} 
        title={
          <Space>
            <ShoppingOutlined />
            Chi tiết đơn hàng #{detailOrder?._id.slice(-8).toUpperCase()}
          </Space>
        } 
        width={800}
      >
        {detailOrder && (
          <div>
            {/* Thông tin khách hàng và đơn hàng */}
            <Row gutter={16} className="mb-4">
              <Col span={12}>
                <Card size="small" title={<Space><UserOutlined />Thông tin khách hàng</Space>}>
                  <p><Text strong>Họ tên:</Text> {detailOrder.customer?.name}</p>
                  <p><Text strong>SĐT:</Text> {detailOrder.customer?.phone}</p>
                  <p><Text strong>Địa chỉ:</Text> {detailOrder.customer?.address}</p>
                  {detailOrder.user?.email && (
                    <p><Text strong>Email:</Text> {detailOrder.user.email}</p>
                  )}
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="Thông tin đơn hàng">
                  <p>
                    <Text strong>Thanh toán:</Text>{" "}
                    <Tag 
                      icon={paymentConfig[detailOrder.paymentMethod]?.icon} 
                      color={paymentConfig[detailOrder.paymentMethod]?.color}
                    >
                      {paymentConfig[detailOrder.paymentMethod]?.label}
                    </Tag>
                  </p>
                  <p><Text strong>Ngày đặt:</Text> {new Date(detailOrder.createdAt).toLocaleString("vi-VN")}</p>
                  <p><Text strong>Cập nhật:</Text> {new Date(detailOrder.updatedAt).toLocaleString("vi-VN")}</p>
                </Card>
              </Col>
            </Row>

            {/* Trạng thái đơn hàng */}
            <Card size="small" title="Trạng thái đơn hàng" className="mb-4">
              <Row gutter={16}>
                <Col span={8}>
                  <div className="mb-2">
                    <Text strong>📦 Trạng thái đơn hàng:</Text>
                  </div>
                  <Select 
                    value={detailOrder.orderStatus || 'pending'} 
                    onChange={(value) => handleUpdateOrderStatus(detailOrder._id, value)}
                    style={{ width: '100%' }}
                    size="large"
                  >
                    <Select.Option value="pending">
                      <Space><ClockCircleOutlined style={{ color: '#faad14' }} />Chờ xác nhận</Space>
                    </Select.Option>
                    <Select.Option value="confirmed">
                      <Space><CheckCircleOutlined style={{ color: '#1890ff' }} />Đã xác nhận</Space>
                    </Select.Option>
                    <Select.Option value="shipping">
                      <Space><TruckOutlined style={{ color: '#722ed1' }} />Đang giao hàng</Space>
                    </Select.Option>
                    <Select.Option value="delivered">
                      <Space><GiftOutlined style={{ color: '#52c41a' }} />Giao hàng thành công</Space>
                    </Select.Option>
                    <Select.Option value="completed">
                      <Space><CheckCircleOutlined style={{ color: '#389e0d' }} />Hoàn thành</Space>
                    </Select.Option>
                    <Select.Option value="cancelled">
                      <Space><CloseCircleOutlined style={{ color: '#ff4d4f' }} />Đã hủy</Space>
                    </Select.Option>
                  </Select>
                </Col>
                <Col span={8}>
                  <div className="mb-2">
                    <Text strong>💰 Trạng thái thanh toán:</Text>
                  </div>
                  <Select 
                    value={detailOrder.paymentStatus || 'unpaid'} 
                    onChange={(value) => handleUpdatePaymentStatus(detailOrder._id, value)}
                    style={{ width: '100%' }}
                    size="large"
                  >
                    <Select.Option value="unpaid">
                      <Space><DollarOutlined />Chưa thanh toán (COD)</Space>
                    </Select.Option>
                    <Select.Option value="pending">
                      <Space><ClockCircleOutlined style={{ color: '#faad14' }} />Chờ thanh toán</Space>
                    </Select.Option>
                    <Select.Option value="paid">
                      <Space><CheckCircleOutlined style={{ color: '#52c41a' }} />Đã thanh toán</Space>
                    </Select.Option>
                    <Select.Option value="refunding">
                      <Space><ReloadOutlined style={{ color: '#1890ff' }} />Đang hoàn tiền</Space>
                    </Select.Option>
                    <Select.Option value="refunded">
                      <Space><CheckCircleOutlined style={{ color: '#52c41a' }} />Đã hoàn tiền</Space>
                    </Select.Option>
                    <Select.Option value="failed">
                      <Space><CloseCircleOutlined style={{ color: '#ff4d4f' }} />Thất bại</Space>
                    </Select.Option>
                  </Select>
                </Col>
                <Col span={8}>
                  <div className="mb-2">
                    <Text strong>🔄 Trạng thái hoàn trả:</Text>
                  </div>
                  {detailOrder.returnStatus ? (
                    <Tag 
                      color={returnStatusConfig[detailOrder.returnStatus as keyof typeof returnStatusConfig]?.color}
                      className="text-sm py-1 px-3"
                    >
                      {returnStatusConfig[detailOrder.returnStatus as keyof typeof returnStatusConfig]?.label}
                    </Tag>
                  ) : (
                    <Tag color="default" className="text-sm py-1 px-3">Không có</Tag>
                  )}
                </Col>
              </Row>
              
              {/* Nút duyệt đơn nếu đang pending */}
              {/* Nút duyệt đơn nếu đang pending */}
              {detailOrder.orderStatus === 'pending' && (
                <Alert
                  title="Đơn hàng chờ duyệt"
                  description={
                    <div>
                      <p>Đơn hàng này đang chờ bạn xác nhận. Sau khi duyệt, voucher (nếu có) sẽ được tính vào số lần sử dụng.</p>
                      <Button 
                        type="primary" 
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleApproveOrder(detailOrder)}
                        className="mt-2"
                      >
                        Duyệt đơn hàng
                      </Button>
                    </div>
                  }
                  type="warning"
                  showIcon
                  className="mt-4"
                />
              )}
            </Card>

            {/* Danh sách sản phẩm */}
            <Divider>Sản phẩm</Divider>
            <div className="space-y-3 mb-4">
              {detailOrder.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-16 h-16 rounded-lg object-cover" 
                    onError={(e) => { 
                      (e.target as HTMLImageElement).src = "https://placehold.co/64x64?text=No+Image"; 
                    }} 
                  />
                  <div className="flex-1">
                    <Text strong>{item.name}</Text>
                    <div className="text-xs text-gray-500">
                      {item.quantity} × {item.price.toLocaleString()}đ
                    </div>
                  </div>
                  <Text strong className="text-[#6272B6]">
                    {(item.price * item.quantity).toLocaleString()}đ
                  </Text>
                </div>
              ))}
            </div>

            {/* Tổng tiền */}
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <Text strong className="text-lg">Tổng cộng</Text>
                <Text strong className="text-2xl text-[#6272B6]">
                  {detailOrder.totals.total.toLocaleString()}đ
                </Text>
              </div>
            </div>

            {/* Nút thao tác */}
            <Divider />
            <Space>
              <Popconfirm
                title="Xóa đơn hàng"
                description="Bạn có chắc muốn xóa đơn hàng này? Kho sẽ được hoàn lại."
                onConfirm={() => handleDeleteOrder(detailOrder)}
                okText="Xóa"
                cancelText="Hủy"
                okType="danger"
              >
                <Button danger icon={<DeleteOutlined />}>Xóa đơn hàng</Button>
              </Popconfirm>
              <Button type="primary" onClick={() => setDetailOrder(null)}>Đóng</Button>
            </Space>
          </div>
        )}
      </Modal>

      {/* Modal hủy đơn hàng */}
      <Modal
        open={cancelModalVisible}
        onCancel={() => {
          setCancelModalVisible(false);
          setCancelReason("");
          setCancelingOrderId(null);
        }}
        onOk={confirmCancelOrder}
        title={
          <Space>
            <StopOutlined className="text-red-500" />
            <span>Hủy đơn hàng</span>
          </Space>
        }
        okText="Xác nhận hủy"
        cancelText="Quay lại"
        okButtonProps={{ danger: true }}
        width={600}
      >
        <Alert
          title="Lưu ý quan trọng"
          description={
            <div>
              <p className="mb-2">• Đơn hàng sẽ bị hủy và hoàn kho tự động</p>
              <p className="mb-2">• Nếu khách đã thanh toán VNPay, họ sẽ nhận được thông báo yêu cầu cập nhật thông tin ngân hàng để hoàn tiền</p>
              <p>• Nếu là đơn COD, khách sẽ nhận được thông báo với lý do hủy</p>
            </div>
          }
          type="warning"
          showIcon
          className="mb-4"
        />

        <div className="mb-4">
          <Text strong className="text-red-500">* Lý do hủy đơn:</Text>
          <Paragraph className="text-sm text-gray-500 mt-1">
            Lý do này sẽ được gửi đến khách hàng qua thông báo
          </Paragraph>
          <TextArea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="VD: Sản phẩm hết hàng, Khách yêu cầu hủy, Địa chỉ giao hàng không hợp lệ..."
            rows={4}
            maxLength={500}
            showCount
            className="mt-2"
          />
        </div>

        {cancelingOrderId && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <Text strong>Mã đơn hàng: </Text>
            <Text code>#{cancelingOrderId.slice(-8).toUpperCase()}</Text>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderPage;
