import { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Space,
  Select,
  message,
  Popconfirm,
  Spin,
  Button,
  Input,
  Tooltip,
  Modal,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ReloadOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { apiClient } from "../../api/http";

const { Option } = Select;

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
  status: "pending" | "paid" | "cancelled";
  paymentMethod: "cod" | "vnpay";
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  items: OrderItem[];
  totals: { subtotal: number; total: number };
  user?: { name: string; email: string };
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "Chờ xử lý", color: "orange" },
  paid: { label: "Đã thanh toán", color: "green" },
  cancelled: { label: "Đã hủy", color: "red" },
};

const paymentLabels: Record<string, { label: string; color: string }> = {
  cod: { label: "COD", color: "orange" },
  vnpay: { label: "VNPay", color: "blue" },
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
      const params: any = { limit: 100 };
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
      setData((prev) =>
        prev.map((item) =>
          item._id === record._id ? { ...item, status: value as any } : item
        )
      );
      message.success("Cập nhật trạng thái thành công");
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Cập nhật thất bại");
    }
  };

  const filteredData = data.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o._id.toLowerCase().includes(q) ||
      o.customer.name.toLowerCase().includes(q) ||
      o.customer.phone.includes(q)
    );
  });

  const columns: ColumnsType<Order> = [
    {
      title: "Mã đơn",
      dataIndex: "_id",
      render: (id: string) => (
        <span className="font-mono text-xs text-gray-600">
          #{id.slice(-8).toUpperCase()}
        </span>
      ),
      width: 110,
    },
    {
      title: "Khách hàng",
      render: (_, r) => (
        <div>
          <p className="font-semibold text-gray-800">{r.customer?.name || '—'}</p>
          <p className="text-xs text-gray-400">{r.customer?.phone || '—'}</p>
        </div>
      ),
    },
    {
      title: "Địa chỉ",
      dataIndex: ["customer", "address"],
      render: (val: string) => val || '—',
      ellipsis: true,
      width: 180,
    },
    {
      title: "Sản phẩm",
      render: (_, r) => (
        <span className="text-sm text-gray-600">
          {r.items.length} sản phẩm
        </span>
      ),
      width: 100,
    },
    {
      title: "Tổng tiền",
      dataIndex: ["totals", "total"],
      render: (total: number) => (
        <span className="font-bold text-[#6272B6]">
          {total.toLocaleString()}đ
        </span>
      ),
      width: 130,
      sorter: (a, b) => a.totals.total - b.totals.total,
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentMethod",
      render: (method: string) => {
        const cfg = paymentLabels[method] || { label: method, color: "default" };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
      width: 100,
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdAt",
      render: (d: string) =>
        new Date(d).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
      width: 110,
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: "descend",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status: string, record: Order) => {
        const cfg = statusLabels[status] || { label: status, color: "default" };
        return (
          <Space>
            <Tag color={cfg.color}>{cfg.label}</Tag>
            <Select
              value={status}
              style={{ width: 150 }}
              size="small"
              onChange={(value) => handleChangeStatus(value, record)}
            >
              <Option value="pending">Chờ xử lý</Option>
              <Option value="paid">Đã thanh toán</Option>
              <Option value="cancelled">Đã hủy</Option>
            </Select>
          </Space>
        );
      },
      width: 260,
    },
    {
      title: "Chi tiết",
      render: (_, record) => (
        <Tooltip title="Xem chi tiết">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => setDetailOrder(record)}
          />
        </Tooltip>
      ),
      width: 70,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý đơn hàng</h2>
        <Button
          icon={<ReloadOutlined />}
          onClick={loadOrders}
          loading={loading}
        >
          Làm mới
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <Input
          placeholder="Tìm theo mã, tên, SĐT..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          style={{ width: 280 }}
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 160 }}
        >
          <Option value="all">Tất cả trạng thái</Option>
          <Option value="pending">Chờ xử lý</Option>
          <Option value="paid">Đã thanh toán</Option>
          <Option value="cancelled">Đã hủy</Option>
        </Select>
        <Tag color="blue">{filteredData.length} đơn</Tag>
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="_id"
        bordered
        loading={loading}
        pagination={{ pageSize: 15, showSizeChanger: true }}
        scroll={{ x: 1100 }}
        size="middle"
      />

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
        {detailOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Khách hàng</p>
                <p className="font-semibold">{detailOrder.customer?.name || '—'}</p>
              </div>
              <div>
                <p className="text-gray-400">Điện thoại</p>
                <p className="font-semibold">{detailOrder.customer?.phone || '—'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-400">Địa chỉ</p>
                <p className="font-semibold">{detailOrder.customer?.address || '—'}</p>
              </div>
              <div>
                <p className="text-gray-400">Thanh toán</p>
                <Tag
                  color={
                    paymentLabels[detailOrder.paymentMethod]?.color || "default"
                  }
                >
                  {paymentLabels[detailOrder.paymentMethod]?.label ||
                    detailOrder.paymentMethod}
                </Tag>
              </div>
              <div>
                <p className="text-gray-400">Trạng thái</p>
                <Tag
                  color={statusLabels[detailOrder.status]?.color || "default"}
                >
                  {statusLabels[detailOrder.status]?.label || detailOrder.status}
                </Tag>
              </div>
            </div>

            <div>
              <p className="font-semibold text-gray-700 mb-2">Sản phẩm:</p>
              <div className="space-y-2">
                {detailOrder.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 border-b pb-2">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://placehold.co/48x48?text=No+Image";
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-xs text-gray-400">
                        {item.quantity} × {item.price.toLocaleString()}đ
                      </p>
                    </div>
                    <p className="font-bold text-[#6272B6] text-sm">
                      {(item.price * item.quantity).toLocaleString()}đ
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-lg mt-3 pt-2 border-t">
                <span>Tổng cộng</span>
                <span className="text-[#6272B6]">
                  {detailOrder.totals.total.toLocaleString()}đ
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderPage;
