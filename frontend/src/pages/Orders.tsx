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
  RollbackOutlined, SwapOutlined,
} from "@ant-design/icons";
import dayjs from 'dayjs';
import { RefundModal } from '../components/RefundModal';
import { ReturnExchangeModal } from '../components/ReturnExchangeModal';

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
  
  // OLD STATUS (deprecated)
  status: "pending" | "confirmed" | "paid" | "shipping" | "completed" | "cancelled" | 
           "refund_pending" | "refund_processing" | "refund_completed" |
           "return_requested" | "return_shipping" | "return_received" |
           "exchange_requested" | "exchange_shipping" | "exchange_completed";
  
  // NEW STATUS (recommended)
  orderStatus?: "pending" | "confirmed" | "shipping" | "delivered" | "cancelled";
  paymentStatus?: "unpaid" | "pending" | "paid" | "refunding" | "refunded" | "failed";
  returnStatus?: null | "requested" | "approved" | "rejected" | "shipping" | "received" | "completed";
  
  paymentMethod: "cod" | "vnpay";
  customer: { name: string; phone: string; address: string };
  items: OrderItem[];
  totals: { subtotal: number; total: number };
}

const statusConfig = {
  pending:             { color: "orange",  label: "Chờ xử lý",           icon: <ClockCircleOutlined />,  desc: "Đơn hàng đang chờ xác nhận" },
  confirmed:           { color: "cyan",    label: "Đã xác nhận",         icon: <CheckCircleOutlined />,  desc: "Đơn COD đã xác nhận, thanh toán khi nhận hàng" },
  paid:                { color: "blue",    label: "Đã thanh toán",       icon: <CheckCircleOutlined />,  desc: "Đã thanh toán, đang chuẩn bị hàng" },
  shipping:            { color: "purple",  label: "Đang giao hàng",      icon: <TruckOutlined />,        desc: "Đơn hàng đang trên đường giao đến bạn" },
  completed:           { color: "green",   label: "Hoàn thành",          icon: <GiftOutlined />,         desc: "Đơn hàng đã giao thành công" },
  cancelled:           { color: "red",     label: "Đã hủy",              icon: <CloseCircleOutlined />,  desc: "Đơn hàng đã bị hủy" },
  refund_pending:      { color: "orange",  label: "Chờ hoàn tiền",       icon: <DollarOutlined />,       desc: "Yêu cầu hoàn tiền đang chờ xử lý" },
  refund_processing:   { color: "blue",    label: "Đang hoàn tiền",      icon: <DollarOutlined />,       desc: "Đang xử lý hoàn tiền" },
  refund_completed:    { color: "green",   label: "Đã hoàn tiền",        icon: <CheckCircleOutlined />,  desc: "Hoàn tiền thành công" },
  return_requested:    { color: "orange",  label: "Yêu cầu trả hàng",    icon: <RollbackOutlined />,     desc: "Yêu cầu trả hàng đang chờ xử lý" },
  return_shipping:     { color: "purple",  label: "Đang trả hàng",       icon: <TruckOutlined />,        desc: "Hàng đang được gửi về" },
  return_received:     { color: "blue",    label: "Đã nhận hàng trả",    icon: <CheckCircleOutlined />,  desc: "Đã nhận hàng trả về" },
  exchange_requested:  { color: "orange",  label: "Yêu cầu đổi hàng",    icon: <SwapOutlined />,         desc: "Yêu cầu đổi hàng đang chờ xử lý" },
  exchange_shipping:   { color: "purple",  label: "Đang đổi hàng",       icon: <TruckOutlined />,        desc: "Đang xử lý đổi hàng" },
  exchange_completed:  { color: "green",   label: "Đã đổi hàng",         icon: <CheckCircleOutlined />,  desc: "Đổi hàng thành công" },
};

// NEW STATUS CONFIGS - Giống app giao hàng
const orderStatusConfig = {
  pending:   { color: "orange",  label: "Chờ xác nhận",        icon: <ClockCircleOutlined /> },
  confirmed: { color: "blue",    label: "Đã xác nhận",         icon: <CheckCircleOutlined /> },
  shipping:  { color: "purple",  label: "Đang giao hàng",      icon: <TruckOutlined /> },
  delivered: { color: "green",   label: "Giao hàng thành công", icon: <GiftOutlined /> },
  cancelled: { color: "red",     label: "Đã hủy",              icon: <CloseCircleOutlined /> },
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
  requested: { color: "orange",  label: "Yêu cầu hoàn trả", icon: <RollbackOutlined /> },
  approved:  { color: "cyan",    label: "Đã chấp thuận",    icon: <CheckCircleOutlined /> },
  rejected:  { color: "red",     label: "Đã từ chối",       icon: <CloseCircleOutlined /> },
  shipping:  { color: "purple",  label: "Đang gửi về",      icon: <TruckOutlined /> },
  received:  { color: "blue",    label: "Đã nhận hàng",     icon: <CheckCircleOutlined /> },
  completed: { color: "green",   label: "Hoàn tất",         icon: <CheckCircleOutlined /> },
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
  // Cancelled
  if (order.status === "cancelled") {
    return { percent: 100, status: "exception" as const };
  }
  
  // Refund flow
  if (order.status.startsWith("refund")) {
    const refundSteps = ["refund_pending", "refund_processing", "refund_completed"];
    const idx = refundSteps.indexOf(order.status);
    const pct = idx < 0 ? 10 : Math.round(((idx + 1) / refundSteps.length) * 100);
    return { percent: pct, status: "active" as const };
  }
  
  // Return flow
  if (order.status.startsWith("return")) {
    const returnSteps = ["return_requested", "return_shipping", "return_received"];
    const idx = returnSteps.indexOf(order.status);
    const pct = idx < 0 ? 10 : Math.round(((idx + 1) / returnSteps.length) * 100);
    return { percent: pct, status: "active" as const };
  }
  
  // Exchange flow
  if (order.status.startsWith("exchange")) {
    const exchangeSteps = ["exchange_requested", "exchange_completed"];
    const idx = exchangeSteps.indexOf(order.status);
    const pct = idx < 0 ? 50 : 100;
    return { percent: pct, status: "active" as const };
  }
  
  // Normal flow
  const steps = getSteps(order);
  const idx = steps.indexOf(order.status);
  const pct = idx < 0 ? 10 : Math.round(((idx + 1) / steps.length) * 100);
  return { percent: pct, status: "active" as const };
};

const getTimelineItems = (order: OrderData) => {
  const isCOD = order.paymentMethod === "cod";
  
  // Timeline cho trạng thái cancelled
  if (order.status === "cancelled") {
    return [
      {
        icon: React.cloneElement(statusConfig.pending.icon, { style: { fontSize: 16, color: "#1890ff" } }),
        content: (
          <div>
            <Text strong className="text-blue-600">Đặt hàng thành công</Text>
            <div className="text-xs text-gray-400 mt-1">Đơn hàng đã được tạo</div>
            <div className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString("vi-VN")}</div>
          </div>
        ),
      },
      {
        icon: React.cloneElement(statusConfig.cancelled.icon, { style: { fontSize: 16, color: "#ff4d4f" } }),
        content: (
          <div>
            <Text strong className="text-red-500">Đơn hàng đã hủy</Text>
            <div className="text-xs text-gray-400 mt-1">Đơn hàng bị hủy bỏ</div>
            <div className="text-xs text-gray-400">{new Date(order.updatedAt).toLocaleString("vi-VN")}</div>
          </div>
        ),
      },
    ];
  }
  
  // Timeline cho trạng thái refund
  if (order.status.startsWith("refund")) {
    const refundSteps = [
      { key: "refund_pending", title: "Yêu cầu hoàn tiền", desc: "Đang chờ admin xử lý" },
      { key: "refund_processing", title: "Đang xử lý hoàn tiền", desc: "Admin đang xử lý yêu cầu" },
      { key: "refund_completed", title: "Hoàn tiền thành công", desc: "Đã hoàn tiền vào tài khoản" },
    ];
    
    const currentIdx = refundSteps.findIndex(s => s.key === order.status);
    
    return refundSteps.map((step, i) => {
      const done = i <= currentIdx;
      const active = i === currentIdx;
      const cfg = statusConfig[step.key as keyof typeof statusConfig];
      
      return {
        icon: React.cloneElement(cfg.icon, {
          style: { fontSize: 16, color: done ? (active ? "#1890ff" : "#52c41a") : "#d9d9d9" },
        }),
        content: (
          <div>
            <Text strong className={done ? (active ? "text-blue-600" : "text-green-600") : "text-gray-300"}>
              {step.title}
            </Text>
            <div className={`text-xs mt-1 ${done ? "text-gray-500" : "text-gray-300"}`}>{step.desc}</div>
            {done && (
              <div className="text-xs text-gray-400">{new Date(order.updatedAt).toLocaleString("vi-VN")}</div>
            )}
          </div>
        ),
      };
    });
  }
  
  // Timeline cho trạng thái return
  if (order.status.startsWith("return")) {
    const returnSteps = [
      { key: "return_requested", title: "Yêu cầu trả hàng", desc: "Đang chờ admin xác nhận" },
      { key: "return_shipping", title: "Đang gửi hàng về", desc: "Hàng đang được vận chuyển về kho" },
      { key: "return_received", title: "Đã nhận hàng trả", desc: "Kho đã nhận hàng, chờ hoàn tiền" },
    ];
    
    const currentIdx = returnSteps.findIndex(s => s.key === order.status);
    
    return returnSteps.map((step, i) => {
      const done = i <= currentIdx;
      const active = i === currentIdx;
      const cfg = statusConfig[step.key as keyof typeof statusConfig];
      
      return {
        icon: React.cloneElement(cfg.icon, {
          style: { fontSize: 16, color: done ? (active ? "#1890ff" : "#52c41a") : "#d9d9d9" },
        }),
        content: (
          <div>
            <Text strong className={done ? (active ? "text-blue-600" : "text-green-600") : "text-gray-300"}>
              {step.title}
            </Text>
            <div className={`text-xs mt-1 ${done ? "text-gray-500" : "text-gray-300"}`}>{step.desc}</div>
            {done && (
              <div className="text-xs text-gray-400">{new Date(order.updatedAt).toLocaleString("vi-VN")}</div>
            )}
          </div>
        ),
      };
    });
  }
  
  // Timeline cho trạng thái exchange
  if (order.status.startsWith("exchange")) {
    const exchangeSteps = [
      { key: "exchange_requested", title: "Yêu cầu đổi hàng", desc: "Đang chờ admin xác nhận" },
      { key: "exchange_completed", title: "Đổi hàng thành công", desc: "Đã tạo đơn hàng mới (giá 0đ)" },
    ];
    
    const currentIdx = exchangeSteps.findIndex(s => s.key === order.status);
    
    return exchangeSteps.map((step, i) => {
      const done = i <= currentIdx;
      const active = i === currentIdx;
      const cfg = statusConfig[step.key as keyof typeof statusConfig];
      
      return {
        icon: React.cloneElement(cfg.icon, {
          style: { fontSize: 16, color: done ? (active ? "#1890ff" : "#52c41a") : "#d9d9d9" },
        }),
        content: (
          <div>
            <Text strong className={done ? (active ? "text-blue-600" : "text-green-600") : "text-gray-300"}>
              {step.title}
            </Text>
            <div className={`text-xs mt-1 ${done ? "text-gray-500" : "text-gray-300"}`}>{step.desc}</div>
            {done && (
              <div className="text-xs text-gray-400">{new Date(order.updatedAt).toLocaleString("vi-VN")}</div>
            )}
          </div>
        ),
      };
    });
  }
  
  // Timeline cho flow bình thường (pending → completed)
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

  return steps.map((step, i) => {
    const done = i <= currentIdx;
    const active = i === currentIdx;
    const cfg = statusConfig[step.key as keyof typeof statusConfig];
    return {
      icon: React.cloneElement(cfg.icon, {
        style: { fontSize: 16, color: done ? "#1890ff" : "#d9d9d9" },
      }),
      content: (
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
  const [refundModalVisible, setRefundModalVisible] = useState(false);
  const [returnExchangeModalVisible, setReturnExchangeModalVisible] = useState(false);
  const [selectedOrderForAction, setSelectedOrderForAction] = useState<OrderData | null>(null);
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
    // Tìm order để kiểm tra
    const order = orders.find(o => o._id === orderId);
    
    // Kiểm tra trạng thái - CHỈ CHO PHÉP HỦY KHI PENDING
    // Ưu tiên orderStatus (new), fallback về status (old)
    const currentOrderStatus = order?.orderStatus || order?.status;
    
    if (!order || currentOrderStatus !== 'pending') {
      message.error('Chỉ có thể hủy đơn hàng đang ở trạng thái "Chờ xác nhận"');
      return;
    }
    
    // Nếu đơn đã thanh toán VNPay ở trạng thái pending
    if (order.paymentMethod === 'vnpay' && order.paymentStatus === 'paid') {
      Modal.confirm({
        title: "Hủy đơn hàng đã thanh toán",
        icon: <DollarOutlined style={{ color: "#1890ff" }} />,
        content: (
          <div>
            <p>Đơn hàng này đã thanh toán qua VNPay.</p>
            <p className="mt-2 text-gray-600">
              Yêu cầu hủy đơn sẽ được gửi đến admin để xét duyệt. 
              Sau khi được chấp thuận, bạn sẽ nhận được thông báo và form để điền thông tin tài khoản nhận hoàn tiền.
            </p>
          </div>
        ),
        okText: "Gửi yêu cầu hủy",
        cancelText: "Hủy bỏ",
        onOk: async () => {
          try {
            // Gửi yêu cầu hủy đơn - chuyển sang refund_pending
            await apiClient.put(`/orders/me/${orderId}/request-cancel`);
            message.success("Đã gửi yêu cầu hủy đơn. Vui lòng chờ admin xét duyệt.");
            loadOrders();
            if (selected?._id === orderId) setSelected(null);
          } catch (e: any) {
            message.error(e?.response?.data?.message || "Không thể gửi yêu cầu hủy đơn");
          }
        },
      });
      return;
    }
    
    // Đơn COD hoặc VNPay chưa thanh toán - hủy bình thường
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

  const handleOpenRefundModal = (order: OrderData) => {
    setSelectedOrderForAction(order);
    setRefundModalVisible(true);
  };

  const handleOpenReturnExchangeModal = (order: OrderData) => {
    setSelectedOrderForAction(order);
    setReturnExchangeModalVisible(true);
  };

  const handleModalSuccess = () => {
    loadOrders();
    if (selected) {
      // Reload selected order details
      apiClient.get(`/orders/me/${selected._id}`)
        .then(res => setSelected(res.data.data))
        .catch(() => setSelected(null));
    }
  };

  // Kiểm tra xem đơn hàng có thể yêu cầu hoàn tiền không
  const canRequestRefund = (order: OrderData) => {
    const refundableStatuses = ['paid', 'confirmed', 'shipping', 'completed'];
    if (!refundableStatuses.includes(order.status)) return false;
    
    // Nếu completed, kiểm tra thời hạn 3 ngày
    if (order.status === 'completed') {
      const completedDate = new Date(order.updatedAt);
      const daysSince = (Date.now() - completedDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 3;
    }
    
    return true;
  };

  // Kiểm tra xem đơn hàng có thể yêu cầu trả/đổi hàng không
  const canRequestReturnExchange = (order: OrderData) => {
    // Sử dụng orderStatus mới hoặc fallback về status cũ
    const orderSt = order.orderStatus || order.status;
    if (orderSt !== 'delivered' && order.status !== 'completed') return false;
    
    const completedDate = new Date(order.updatedAt);
    const daysSince = (Date.now() - completedDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 3;
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
        // Sử dụng trạng thái mới nếu có, fallback về status cũ
        const orderSt = record.orderStatus || 'pending';
        const paymentSt = record.paymentStatus || 'unpaid';
        const returnSt = record.returnStatus;
        
        const orderCfg = orderStatusConfig[orderSt as keyof typeof orderStatusConfig];
        const paymentCfg = paymentStatusConfig[paymentSt as keyof typeof paymentStatusConfig];
        const returnCfg = returnSt ? returnStatusConfig[returnSt as keyof typeof returnStatusConfig] : null;
        
        return (
          <Space direction="vertical" size={2} style={{ width: '100%' }}>
            {/* Trạng thái đơn hàng */}
            <Tag icon={orderCfg?.icon} color={orderCfg?.color} className="w-full text-center">
              📦 {orderCfg?.label}
            </Tag>
            
            {/* Trạng thái thanh toán */}
            <Tag icon={paymentCfg?.icon} color={paymentCfg?.color} className="w-full text-center">
              💰 {paymentCfg?.label}
            </Tag>
            
            {/* Trạng thái hoàn trả (nếu có) */}
            {returnCfg && (
              <Tag icon={returnCfg?.icon} color={returnCfg?.color} className="w-full text-center">
                🔄 {returnCfg?.label}
              </Tag>
            )}
            
            {/* Progress bar */}
            {orderSt !== "cancelled" && (
              <Progress
                percent={getProgress(record).percent}
                status={getProgress(record).status}
                strokeColor="#6272B6"
                showInfo={false}
                size="small"
              />
            )}
          </Space>
        );
      },
      width: 180,
    },
    {
      title: "",
      render: (_, record) => (
        <Space orientation="vertical" size="small">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setSelected(record)}
            className="!bg-[#6272B6] border-0 rounded-full w-full"
          >
            Chi tiết
          </Button>
          {(record.orderStatus === 'pending' || (!record.orderStatus && record.status === 'pending')) && (
            <Button
              danger
              size="small"
              icon={<CloseCircleOutlined />}
              onClick={() => handleCancelOrder(record._id)}
              className="rounded-full w-full"
            >
              Hủy đơn
            </Button>
          )}
          {canRequestRefund(record) && (
            <Button
              size="small"
              icon={<DollarOutlined />}
              onClick={() => handleOpenRefundModal(record)}
              className="rounded-full w-full bg-blue-50 text-blue-600 border-blue-300"
            >
              Hoàn tiền
            </Button>
          )}
          {canRequestReturnExchange(record) && (
            <Button
              size="small"
              icon={<SwapOutlined />}
              onClick={() => handleOpenReturnExchangeModal(record)}
              className="rounded-full w-full bg-green-50 text-green-600 border-green-300"
            >
              Trả/Đổi
            </Button>
          )}
        </Space>
      ),
      width: 120,
      fixed: 'right' as const,
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
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen py-16 px-4">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Title level={2} className="!text-[#6272B6] m-0 flex items-center gap-2">
              <BoxPlotOutlined /> Lịch sử mua hàng
            </Title>
            <Text type="secondary">Quản lý và theo dõi đơn hàng của bạn</Text>
          </div>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadOrders} loading={loading} className="rounded-full">
              Làm mới
            </Button>
            <Link to="/products">
              <Button type="primary" icon={<ShoppingOutlined />} className="!bg-gradient-to-r from-[#6272B6] to-[#8B9FE8] border-0 rounded-full shadow-lg hover:shadow-xl">
                Mua thêm
              </Button>
            </Link>
          </Space>
        </div>

        {/* Thống kê tổng quan */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={12} sm={6}>
            <Card className="text-center border-0 shadow-md hover:shadow-lg transition-shadow bg-white/80 backdrop-blur">
              <Statistic
                title={<span className="text-gray-600 font-medium">Tổng đơn hàng</span>}
                value={orderStats.total}
                prefix={<ShoppingCartOutlined className="text-blue-500" />}
                valueStyle={{ color: '#6272B6', fontSize: '20px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="text-center border-0 shadow-md hover:shadow-lg transition-shadow bg-white/80 backdrop-blur">
              <Statistic
                title={<span className="text-gray-600 font-medium">Tổng chi tiêu</span>}
                value={orderStats.totalAmount}
                prefix={<DollarOutlined className="text-green-500" />}
                suffix="đ"
                valueStyle={{ color: '#10b981', fontSize: '20px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="text-center border-0 shadow-md hover:shadow-lg transition-shadow bg-white/80 backdrop-blur">
              <Statistic
                title={<span className="text-gray-600 font-medium">Đã hoàn thành</span>}
                value={orderStats.completed}
                prefix={<CheckCircleOutlined className="text-green-500" />}
                valueStyle={{ color: '#10b981', fontSize: '20px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="text-center border-0 shadow-md hover:shadow-lg transition-shadow bg-white/80 backdrop-blur">
              <Statistic
                title={<span className="text-gray-600 font-medium">Đang xử lý</span>}
                value={orderStats.pending}
                prefix={<ClockCircleOutlined className="text-orange-500" />}
                valueStyle={{ color: '#f59e0b', fontSize: '20px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
        </Row>

        <Card className="rounded-2xl shadow-xl border-0 bg-white/90 backdrop-blur">
          {/* Bộ lọc nâng cao */}
          <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={8}>
                <Input
                  placeholder="Tìm theo mã đơn, tên khách hàng, sản phẩm..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  size="large"
                  className="rounded-lg"
                />
              </Col>
              <Col xs={24} sm={6}>
                <DatePicker.RangePicker
                  placeholder={['Từ ngày', 'Đến ngày']}
                  value={dateRange}
                  onChange={setDateRange}
                  format="DD/MM/YYYY"
                  className="w-full rounded-lg"
                  size="large"
                />
              </Col>
              <Col xs={24} sm={4}>
                <Select
                  placeholder="Thanh toán"
                  value={paymentFilter}
                  onChange={setPaymentFilter}
                  className="w-full"
                  size="large"
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
                    size="large"
                    className="rounded-full"
                  >
                    Xóa bộ lọc
                  </Button >
                  <Tooltip title="Xuất Excel">
                    <Button icon={<DownloadOutlined />} size="large" className="!bg-green-500 text-white border-0 rounded-full hover:!bg-green-600">
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
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4 text-lg">
                    {orders.length === 0 ? "🛒 Bạn chưa có đơn hàng nào" : "🔍 Không tìm thấy đơn hàng phù hợp"}
                  </div>
                  {searchText || dateRange || paymentFilter !== "all" ? (
                    <Button onClick={() => {
                      setSearchText("");
                      setDateRange(null);
                      setPaymentFilter("all");
                      setActiveTab("all");
                    }} className="rounded-full">
                      Xóa bộ lọc
                    </Button>
                  ) : null}
                </div>
              }
              className="py-16"
            >
              {orders.length === 0 && (
                <Link to="/products">
                  <Button type="primary" size="large" className="!bg-gradient-to-r from-[#6272B6] to-[#8B9FE8] border-0 rounded-full px-8 shadow-lg hover:shadow-xl">
                    🛍️ Mua sắm ngay
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
        className="top-8"
        title={
          <div className="flex items-center gap-2 text-[#6272B6]">
            <BoxPlotOutlined />
            <span>Chi tiết đơn hàng <Text code className="text-sm">#{selected?._id.slice(-8).toUpperCase()}</Text></span>
          </div>
        }
      >
        {selected && (
          <div>
            {/* Progress bar */}
            {selected.status !== "cancelled" && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-xl shadow-sm">
                <Progress
                  percent={getProgress(selected).percent}
                  status={getProgress(selected).status}
                  strokeColor={{ "0%": "#6272B6", "100%": "#a78bfa" }}
                  className="mb-2"
                  strokeWidth={10}
                />
                <div className="flex justify-between text-xs text-gray-500 font-medium">
                  {selected.status.startsWith("refund") ? (
                    <>
                      <span>💰 Yêu cầu</span>
                      <span>⏳ Xử lý</span>
                      <span>✅ Hoàn tiền</span>
                    </>
                  ) : selected.status.startsWith("return") ? (
                    <>
                      <span>📦 Yêu cầu</span>
                      <span>🚚 Gửi về</span>
                      <span>✅ Đã nhận</span>
                    </>
                  ) : selected.status.startsWith("exchange") ? (
                    <>
                      <span>🔄 Yêu cầu</span>
                      <span>✅ Đổi hàng</span>
                    </>
                  ) : (
                    <>
                      <span>🛒 Đặt hàng</span>
                      {selected.paymentMethod === "cod"
                        ? <span>✅ Xác nhận</span>
                        : <span>💳 Thanh toán</span>
                      }
                      <span>🚚 Vận chuyển</span>
                      <span>✅ Hoàn thành</span>
                    </>
                  )}
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

            <div className="mt-4 p-5 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-xl shadow-sm flex justify-between items-center">
              <div>
                <Text type="secondary" className="block text-sm mb-1">Tổng thanh toán</Text>
                <Text strong className="text-3xl text-[#6272B6]">{selected.totals.total.toLocaleString()}đ</Text>
              </div>
              <div className="text-right">
                <Text type="secondary" className="block text-xs">Đã bao gồm VAT</Text>
                <Text type="secondary" className="block text-xs">và phí vận chuyển</Text>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-3 flex-wrap">
              {(selected.orderStatus === 'pending' || (!selected.orderStatus && selected.status === 'pending')) && (
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleCancelOrder(selected._id)}
                  className="rounded-full px-6 shadow-md hover:shadow-lg"
                  size="large"
                >
                  Hủy đơn hàng
                </Button>
              )}
              {canRequestRefund(selected) && (
                <Button
                  icon={<DollarOutlined />}
                  onClick={() => {
                    handleOpenRefundModal(selected);
                    setSelected(null);
                  }}
                  className="rounded-full px-6 bg-blue-50 text-blue-600 border-blue-300 shadow-md hover:shadow-lg"
                  size="large"
                >
                  Yêu cầu hoàn tiền
                </Button>
              )}
              {canRequestReturnExchange(selected) && (
                <Button
                  icon={<SwapOutlined />}
                  onClick={() => {
                    handleOpenReturnExchangeModal(selected);
                    setSelected(null);
                  }}
                  className="rounded-full px-6 bg-green-50 text-green-600 border-green-300 shadow-md hover:shadow-lg"
                  size="large"
                >
                  Trả/Đổi hàng
                </Button>
              )}
              <Button onClick={() => setSelected(null)} className="rounded-full px-8 shadow-md hover:shadow-lg" size="large">
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Refund Modal */}
      {selectedOrderForAction && (
        <RefundModal
          visible={refundModalVisible}
          orderId={selectedOrderForAction._id}
          orderTotal={selectedOrderForAction.totals.total}
          onClose={() => {
            setRefundModalVisible(false);
            setSelectedOrderForAction(null);
          }}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* Return/Exchange Modal */}
      {selectedOrderForAction && (
        <ReturnExchangeModal
          visible={returnExchangeModalVisible}
          orderId={selectedOrderForAction._id}
          orderItems={selectedOrderForAction.items}
          onClose={() => {
            setReturnExchangeModalVisible(false);
            setSelectedOrderForAction(null);
          }}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}

