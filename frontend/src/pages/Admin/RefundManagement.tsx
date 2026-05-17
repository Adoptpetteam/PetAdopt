import { useEffect, useState, useRef } from "react";
import {
  Table, Tag, Button, Modal, Form, Input, message, Select, Card,
  Statistic, Row, Col, Image, Descriptions, Space, Tabs, Badge,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  DollarOutlined, ReloadOutlined, EyeOutlined, CheckOutlined, CloseOutlined,
  UploadOutlined, LoadingOutlined, SwapOutlined, RollbackOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { apiClient } from "../../api/http";

interface Refund {
  _id: string;
  order: any;
  user: { name: string; email: string };
  amount: number;
  cancelReason: string;
  originalPaymentMethod: string;
  bankInfo: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    qrCodeImage: string;
  };
  status: string;
  submittedAt: string | null;
  processedAt: string | null;
  adminNote: string;
  transactionRef: string;
  billImage?: string;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  awaiting_info: { label: "Chờ user nhập info", color: "orange" },
  pending: { label: "Chờ xử lý", color: "blue" },
  re_enter_info: { label: "Yêu cầu nhập lại STK", color: "volcano" },
  processing: { label: "Đang chuyển khoản", color: "cyan" },
  completed: { label: "Đã hoàn tiền", color: "green" },
  rejected: { label: "Đã từ chối", color: "red" },
};

// Trạng thái đổi/trả hàng từ Order.returnStatus
const returnStatusConfig: Record<string, { label: string; color: string }> = {
  requested: { label: "Chờ xét duyệt", color: "orange" },
  approved:  { label: "Đã chấp thuận", color: "cyan" },
  rejected:  { label: "Đã từ chối", color: "red" },
  shipping:  { label: "Đang gửi về", color: "purple" },
  received:  { label: "Đã nhận hàng", color: "blue" },
  completed: { label: "Hoàn tất", color: "green" },
};

interface ReturnOrder {
  _id: string;
  user?: { name: string; email: string };
  customer: { name: string; phone: string; address: string };
  paymentMethod: string;
  paymentStatus?: string;
  orderStatus?: string;
  returnStatus?: string;
  totals: { total: number };
  items: any[];
  returnExchange?: {
    type: "return" | "exchange";
    reason: string;
    requestedAt: string;
    images: string[];
    inspectionNote?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const fmt = (n: number) => new Intl.NumberFormat("vi-VN").format(n);

export default function RefundManagement() {
  const [activeTab, setActiveTab] = useState("refund");

  // Tab 1: Hoàn tiền (RefundRequest)
  const [data, setData] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [detail, setDetail] = useState<Refund | null>(null);
  const [processing, setProcessing] = useState<Refund | null>(null);
  const [form] = Form.useForm();
  const [billPreview, setBillPreview] = useState("");
  const [uploadingBill, setUploadingBill] = useState(false);
  const billFileRef = useRef<HTMLInputElement>(null);

  // Tab 2: Đổi/Trả hàng (Order.returnExchange - VNPay/đã thanh toán)
  const [returnOrders, setReturnOrders] = useState<ReturnOrder[]>([]);
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnDetail, setReturnDetail] = useState<ReturnOrder | null>(null);
  const [returnProcessModal, setReturnProcessModal] = useState<ReturnOrder | null>(null);
  const [returnForm] = Form.useForm();

  // Tab 3: Hoàn hàng COD
  const [codOrders, setCodOrders] = useState<ReturnOrder[]>([]);
  const [codLoading, setCodLoading] = useState(false);
  const [codDetail, setCodDetail] = useState<ReturnOrder | null>(null);
  const [codProcessModal, setCodProcessModal] = useState<ReturnOrder | null>(null);
  const [codForm] = Form.useForm();

  const getAdminHeader = () => {
    const token = localStorage.getItem("admin_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const load = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 100 };
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await apiClient.get("/refunds/admin", { params });
      setData(res.data.data || []);
    } catch {
      message.error("Không thể tải danh sách");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);
  useEffect(() => {
    if (activeTab === "return_exchange") loadReturnOrders();
    if (activeTab === "cod_return") loadCodOrders();
  }, [activeTab]);

  const loadReturnOrders = async () => {
    setReturnLoading(true);
    try {
      // Lấy đơn VNPay đã thanh toán có yêu cầu đổi/trả
      const res = await apiClient.get("/orders", { params: { limit: 200 } });
      const all: ReturnOrder[] = res.data.data || [];
      const filtered = all.filter(o =>
        (o.paymentMethod === "vnpay" || o.paymentStatus === "paid") &&
        o.returnStatus &&
        o.returnExchange?.type !== undefined
      );
      setReturnOrders(filtered);
    } catch {
      message.error("Không thể tải danh sách đổi/trả hàng");
    } finally {
      setReturnLoading(false);
    }
  };

  const loadCodOrders = async () => {
    setCodLoading(true);
    try {
      const res = await apiClient.get("/orders", { params: { limit: 200 } });
      const all: ReturnOrder[] = res.data.data || [];
      const filtered = all.filter(o =>
        o.paymentMethod === "cod" &&
        o.returnStatus &&
        o.returnExchange?.type === "return"
      );
      setCodOrders(filtered);
    } catch {
      message.error("Không thể tải danh sách hoàn hàng COD");
    } finally {
      setCodLoading(false);
    }
  };

  const handleProcessReturn = async (orderId: string, action: string, values: any) => {
    try {
      await apiClient.post(`/orders/${orderId}/process-return`, {
        action,
        note: values.note || "",
        inspectionNote: values.inspectionNote || "",
      });
      message.success(action === "approve_refund" ? "Đã chấp thuận trả hàng" : "Đã từ chối");
      setReturnProcessModal(null);
      setCodProcessModal(null);
      returnForm.resetFields();
      codForm.resetFields();
      loadReturnOrders();
      loadCodOrders();
    } catch (err: any) {
      message.error(err.response?.data?.message || "Lỗi xử lý");
    }
  };

  const handleUploadBill = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { message.error("Chỉ nhận file ảnh"); return; }
    if (file.size > 5 * 1024 * 1024) { message.error("Ảnh tối đa 5MB"); return; }
    setUploadingBill(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await apiClient.post("/products/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data", ...getAdminHeader() },
      });
      const url = res.data.imageUrl.startsWith("http")
        ? res.data.imageUrl
        : `http://localhost:5000${res.data.imageUrl}`;
      setBillPreview(url);
      form.setFieldValue("billImage", url);
      message.success("Tải ảnh bill thành công");
    } catch {
      message.error("Tải ảnh thất bại");
    } finally {
      setUploadingBill(false);
      if (billFileRef.current) billFileRef.current.value = "";
    }
  };

  const handleProcess = async (status: string) => {
    if (!processing) return;

    if (status === "completed") {
      const transRef = form.getFieldValue("transactionRef");
      if (!transRef?.trim()) {
        message.error("Vui lòng nhập mã chứng từ chuyển khoản");
        return;
      }
    }

    const values = form.getFieldsValue();
    try {
      await apiClient.put(`/refunds/admin/${processing._id}/process`, {
        status,
        adminNote: values.adminNote || "",
        transactionRef: values.transactionRef || "",
        billImage: billPreview || "",
      });
      message.success(`Đã cập nhật: ${statusConfig[status]?.label}`);
      setProcessing(null);
      setBillPreview("");
      form.resetFields();
      load();
    } catch (err: any) {
      message.error(err.response?.data?.message || "Lỗi");
    }
  };

  const stats = {
    total: data.length,
    awaiting: data.filter(r => r.status === "awaiting_info").length,
    pending: data.filter(r => r.status === "pending").length,
    completed: data.filter(r => r.status === "completed").length,
    totalAmount: data.filter(r => r.status === "completed").reduce((s, r) => s + r.amount, 0),
  };

  const columns: ColumnsType<Refund> = [
    {
      title: "Mã đơn",
      render: (_, r) => <span className="font-mono text-xs font-bold">#{String(r.order?._id || "").slice(-8).toUpperCase()}</span>,
      width: 110,
    },
    {
      title: "Khách hàng",
      render: (_, r) => (
        <div>
          <div className="font-medium">{r.user?.name || "—"}</div>
          <div className="text-xs text-gray-400">{r.user?.email || "—"}</div>
        </div>
      ),
      width: 180,
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      render: (a: number) => <span className="text-green-600 font-bold">{fmt(a)}đ</span>,
      sorter: (a, b) => a.amount - b.amount,
      width: 120,
    },
    {
      title: "Lý do hủy",
      dataIndex: "cancelReason",
      ellipsis: true,
      width: 200,
    },
    {
      title: "Thông tin NH",
      render: (_, r) => r.bankInfo?.accountNumber
        ? <Tag color="green">Đã nhập</Tag>
        : <Tag color="orange">Chưa có</Tag>,
      width: 100,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (s: string) => {
        const cfg = statusConfig[s];
        return <Tag color={cfg?.color}>{cfg?.label}</Tag>;
      },
      width: 150,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      render: (d: string) => <span className="text-xs">{new Date(d).toLocaleDateString("vi-VN")}</span>,
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: "descend",
      width: 100,
    },
    {
      title: "Hành động",
      render: (_, r) => (
        <Space size="small">
          <Button type="link" icon={<EyeOutlined />} onClick={() => setDetail(r)}>Xem</Button>
          {(r.status === "pending" || r.status === "processing") && (
            <Button type="primary" size="small" className="bg-[#6272B6]"
              onClick={() => { setProcessing(r); setBillPreview(""); form.resetFields(); }}>
              Xử lý
            </Button>
          )}
        </Space>
      ),
      width: 160,
      fixed: "right",
    },
  ];

  // Cột bảng đổi/trả hàng chung
  const returnColumns: ColumnsType<ReturnOrder> = [
    {
      title: "Mã đơn", render: (_, r) => <span className="font-mono text-xs font-bold">#{r._id.slice(-8).toUpperCase()}</span>, width: 110,
    },
    {
      title: "Khách hàng", render: (_, r) => (
        <div><div className="font-medium">{r.user?.name || r.customer?.name || "—"}</div><div className="text-xs text-gray-400">{r.user?.email || r.customer?.phone || "—"}</div></div>
      ), width: 160,
    },
    {
      title: "Loại yêu cầu", render: (_, r) => (
        <Tag color={r.returnExchange?.type === "exchange" ? "blue" : "orange"} icon={r.returnExchange?.type === "exchange" ? <SwapOutlined /> : <RollbackOutlined />}>
          {r.returnExchange?.type === "exchange" ? "Đổi hàng" : "Trả hàng"}
        </Tag>
      ), width: 110,
    },
    {
      title: "Lý do", dataIndex: ["returnExchange", "reason"], ellipsis: true, width: 200,
    },
    {
      title: "Tổng tiền", render: (_, r) => <span className="text-blue-600 font-bold">{fmt(r.totals.total)}đ</span>, width: 110,
    },
    {
      title: "Trạng thái", render: (_, r) => {
        const cfg = returnStatusConfig[r.returnStatus || "requested"];
        return <Tag color={cfg?.color}>{cfg?.label}</Tag>;
      }, width: 130,
    },
    {
      title: "Ngày yêu cầu", render: (_, r) => (
        <span className="text-xs">{new Date(r.returnExchange?.requestedAt || r.updatedAt).toLocaleDateString("vi-VN")}</span>
      ), width: 100,
    },
    {
      title: "Hành động", render: (_, r) => (
        <Space size="small">
          <Button type="link" icon={<EyeOutlined />} onClick={() => { setReturnDetail(r); }}>Xem</Button>
          {r.returnStatus === "requested" && (
            <Button type="primary" size="small" className="bg-[#6272B6]"
              onClick={() => { setReturnProcessModal(r); returnForm.resetFields(); }}>
              Xử lý
            </Button>
          )}
        </Space>
      ), width: 140, fixed: "right",
    },
  ];

  const codColumns: ColumnsType<ReturnOrder> = [
    ...returnColumns.slice(0, -1),
    {
      title: "Hành động", render: (_, r) => (
        <Space size="small">
          <Button type="link" icon={<EyeOutlined />} onClick={() => setCodDetail(r)}>Xem</Button>
          {r.returnStatus === "requested" && (
            <Button type="primary" size="small" className="bg-orange-500 border-0"
              onClick={() => { setCodProcessModal(r); codForm.resetFields(); }}>
              Xử lý
            </Button>
          )}
        </Space>
      ), width: 140, fixed: "right",
    },
  ];

  const tabItems = [
    {
      key: "refund",
      label: <span><DollarOutlined className="mr-1" />Hoàn tiền <Badge count={data.filter(r => r.status === "pending").length} color="blue" /></span>,
      children: (
        <div>
          <Row gutter={16} className="mb-4">
            <Col span={5}><Card size="small"><Statistic title="Tổng" value={stats.total} styles={{ content: { color: "#6272B6" } }} /></Card></Col>
            <Col span={5}><Card size="small"><Statistic title="Chờ nhập info" value={stats.awaiting} styles={{ content: { color: "#fa8c16" } }} /></Card></Col>
            <Col span={5}><Card size="small"><Statistic title="Chờ xử lý" value={stats.pending} styles={{ content: { color: "#1890ff" } }} /></Card></Col>
            <Col span={5}><Card size="small"><Statistic title="Đã hoàn" value={stats.completed} styles={{ content: { color: "#52c41a" } }} /></Card></Col>
            <Col span={4}><Card size="small"><Statistic title="Tổng đã hoàn" value={stats.totalAmount} suffix="đ" formatter={(v) => fmt(Number(v))} styles={{ content: { color: "#52c41a", fontSize: 16 } }} /></Card></Col>
          </Row>
          <div className="mb-3">
            <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 200 }}>
              <Select.Option value="all">Tất cả trạng thái</Select.Option>
              <Select.Option value="awaiting_info">Chờ user nhập info</Select.Option>
              <Select.Option value="pending">Chờ xử lý</Select.Option>
              <Select.Option value="re_enter_info">Yêu cầu nhập lại STK</Select.Option>
              <Select.Option value="processing">Đang chuyển khoản</Select.Option>
              <Select.Option value="completed">Đã hoàn tiền</Select.Option>
              <Select.Option value="rejected">Đã từ chối</Select.Option>
            </Select>
          </div>
          <Table columns={columns} dataSource={data} rowKey="_id" loading={loading}
            pagination={{ pageSize: 15, showTotal: (t) => `${t} yêu cầu` }} scroll={{ x: 1100 }} />
        </div>
      ),
    },
    {
      key: "return_exchange",
      label: <span><SwapOutlined className="mr-1" />Đổi/Trả hàng <Badge count={returnOrders.filter(o => o.returnStatus === "requested").length} color="orange" /></span>,
      children: (
        <div>
          <div className="mb-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
            💡 Áp dụng cho đơn đã thanh toán VNPay + đã giao hàng/hoàn thành, trong hạn <strong>7 ngày</strong> bị lỗi sản phẩm.
          </div>
          <Table columns={returnColumns} dataSource={returnOrders} rowKey="_id" loading={returnLoading}
            pagination={{ pageSize: 15, showTotal: (t) => `${t} yêu cầu` }} scroll={{ x: 1000 }} />
        </div>
      ),
    },
    {
      key: "cod_return",
      label: <span><ShoppingCartOutlined className="mr-1" />Hoàn hàng COD <Badge count={codOrders.filter(o => o.returnStatus === "requested").length} color="red" /></span>,
      children: (
        <div>
          <div className="mb-3 p-3 bg-orange-50 rounded-lg text-sm text-orange-700">
            📦 Khách đặt COD nhận hàng nhưng không ưng ý, muốn trả lại hàng.
          </div>
          <Table columns={codColumns} dataSource={codOrders} rowKey="_id" loading={codLoading}
            pagination={{ pageSize: 15, showTotal: (t) => `${t} yêu cầu` }} scroll={{ x: 1000 }} />
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#6272B6] flex items-center gap-2">
          <DollarOutlined /> Quản lý Hoàn hủy
        </h1>
        <Button icon={<ReloadOutlined />} onClick={() => { load(); loadReturnOrders(); loadCodOrders(); }} loading={loading || returnLoading}>
          Làm mới
        </Button>
      </div>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
        />
      </Card>

      {/* Modal chi tiết */}
      <Modal
        open={!!detail}
        onCancel={() => setDetail(null)}
        footer={<Button onClick={() => setDetail(null)}>Đóng</Button>}
        title={<span className="text-[#6272B6] font-bold">Chi tiết yêu cầu hoàn tiền</span>}
        width={700}
      >
        {detail && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Mã đơn">#{String(detail.order?._id).slice(-8).toUpperCase()}</Descriptions.Item>
            <Descriptions.Item label="Khách hàng">{detail.user?.name} — {detail.user?.email}</Descriptions.Item>
            <Descriptions.Item label="Số tiền"><span className="text-green-600 font-bold text-lg">{fmt(detail.amount)}đ</span></Descriptions.Item>
            <Descriptions.Item label="Lý do hủy">{detail.cancelReason}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái"><Tag color={statusConfig[detail.status]?.color}>{statusConfig[detail.status]?.label}</Tag></Descriptions.Item>
            <Descriptions.Item label="Ngân hàng">{detail.bankInfo?.bankName || "—"}</Descriptions.Item>
            <Descriptions.Item label="Số tài khoản">{detail.bankInfo?.accountNumber || "—"}</Descriptions.Item>
            <Descriptions.Item label="Chủ tài khoản">{detail.bankInfo?.accountHolder || "—"}</Descriptions.Item>
            {detail.bankInfo?.qrCodeImage && (
              <Descriptions.Item label="QR Code"><Image src={detail.bankInfo.qrCodeImage} width={200} /></Descriptions.Item>
            )}
            {detail.adminNote && <Descriptions.Item label="Ghi chú admin">{detail.adminNote}</Descriptions.Item>}
            {detail.transactionRef && <Descriptions.Item label="Mã giao dịch">{detail.transactionRef}</Descriptions.Item>}
            {detail.billImage && (
              <Descriptions.Item label="Bill chuyển khoản"><Image src={detail.billImage} width={240} /></Descriptions.Item>
            )}
            <Descriptions.Item label="Ngày tạo">{new Date(detail.createdAt).toLocaleString("vi-VN")}</Descriptions.Item>
            {detail.submittedAt && <Descriptions.Item label="User gửi lúc">{new Date(detail.submittedAt).toLocaleString("vi-VN")}</Descriptions.Item>}
            {detail.processedAt && <Descriptions.Item label="Xử lý lúc">{new Date(detail.processedAt).toLocaleString("vi-VN")}</Descriptions.Item>}
          </Descriptions>
        )}
      </Modal>

      {/* Modal xử lý */}
      <Modal
        open={!!processing}
        onCancel={() => { setProcessing(null); form.resetFields(); }}
        footer={null}
        title={<span className="text-[#6272B6] font-bold">Xử lý hoàn tiền</span>}
        width={600}
        destroyOnHidden
      >
        {processing && (
          <>
            <Card type="inner" className="bg-gray-50 mb-4">
              <p><strong>Khách:</strong> {processing.user?.name} — {processing.user?.email}</p>
              <p><strong>Số tiền hoàn:</strong> <span className="text-green-600 font-bold text-lg">{fmt(processing.amount)}đ</span></p>
              <p><strong>Ngân hàng:</strong> {processing.bankInfo?.bankName || "—"}</p>
              <p><strong>STK:</strong> {processing.bankInfo?.accountNumber || "—"}</p>
              <p><strong>Chủ TK:</strong> {processing.bankInfo?.accountHolder || "—"}</p>
              {processing.bankInfo?.qrCodeImage && (
                <div className="mt-2">
                  <p><strong>QR Code:</strong></p>
                  <Image src={processing.bankInfo.qrCodeImage} width={150} />
                </div>
              )}
            </Card>

            <Form form={form} layout="vertical">
              <Form.Item
                name="transactionRef"
                label="Mã chứng từ chuyển khoản"
                extra="Bắt buộc khi chọn 'Đã chuyển xong'"
              >
                <Input placeholder="VD: FT2026051200001234" size="large" />
              </Form.Item>

              <Form.Item name="billImage" label="Ảnh bill chuyển khoản">
                <div className="space-y-2">
                  {billPreview && (
                    <div className="flex justify-center">
                      <Image src={billPreview} width={240} className="rounded-lg border shadow-sm" />
                    </div>
                  )}
                  <input ref={billFileRef} type="file" accept="image/*" className="hidden" onChange={handleUploadBill} />
                  <Button
                    icon={uploadingBill ? <LoadingOutlined /> : <UploadOutlined />}
                    onClick={() => billFileRef.current?.click()}
                    loading={uploadingBill}
                    block
                  >
                    {uploadingBill ? "Đang tải..." : billPreview ? "Đổi ảnh bill" : "Tải lên ảnh bill chuyển khoản"}
                  </Button>
                  {billPreview && (
                    <Button danger size="small" block onClick={() => { setBillPreview(""); form.setFieldValue("billImage", ""); }}>
                      Xóa ảnh
                    </Button>
                  )}
                </div>
              </Form.Item>

              <Form.Item name="adminNote" label="Ghi chú">
                <Input.TextArea rows={2} placeholder="Ghi chú thêm (nếu có)" />
              </Form.Item>
            </Form>

            <div className="flex gap-2 justify-end mt-4">
              <Button onClick={() => { setProcessing(null); form.resetFields(); }}>Hủy</Button>
              <Button danger icon={<CloseOutlined />} onClick={() => handleProcess("rejected")}>Từ chối</Button>
              <Button
                icon={<ReloadOutlined />}
                className="border-orange-400 text-orange-500 hover:bg-orange-50"
                onClick={() => handleProcess("re_enter_info")}
              >
                Yêu cầu nhập lại STK
              </Button>
              <Button type="primary" icon={<CheckOutlined />} className="bg-green-500" onClick={() => handleProcess("completed")}>
                Đã chuyển xong
              </Button>
            </div>
          </>
        )}
      </Modal>
      {/* Modal chi tiết đổi/trả hàng */}
      <Modal open={!!returnDetail} onCancel={() => setReturnDetail(null)}
        footer={<Button onClick={() => setReturnDetail(null)}>Đóng</Button>}
        title={<span className="text-[#6272B6] font-bold">Chi tiết yêu cầu đổi/trả hàng</span>} width={680}>
        {returnDetail && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Mã đơn">#{returnDetail._id.slice(-8).toUpperCase()}</Descriptions.Item>
            <Descriptions.Item label="Khách hàng">{returnDetail.user?.name || returnDetail.customer?.name}</Descriptions.Item>
            <Descriptions.Item label="Loại">
              <Tag color={returnDetail.returnExchange?.type === "exchange" ? "blue" : "orange"}>
                {returnDetail.returnExchange?.type === "exchange" ? "🔄 Đổi hàng" : "↩️ Trả hàng"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Lý do">{returnDetail.returnExchange?.reason || "—"}</Descriptions.Item>
            <Descriptions.Item label="Tổng tiền"><span className="text-blue-600 font-bold">{fmt(returnDetail.totals.total)}đ</span></Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={returnStatusConfig[returnDetail.returnStatus || "requested"]?.color}>
                {returnStatusConfig[returnDetail.returnStatus || "requested"]?.label}
              </Tag>
            </Descriptions.Item>
            {returnDetail.returnExchange?.images && returnDetail.returnExchange.images.length > 0 && (
              <Descriptions.Item label="Ảnh chứng minh">
                <div className="flex gap-2 flex-wrap">
                  {returnDetail.returnExchange.images.map((img, i) => (
                    <Image key={i} src={img} width={80} height={80} style={{ objectFit: "cover", borderRadius: 4 }} />
                  ))}
                </div>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* Modal xử lý đổi/trả hàng */}
      <Modal open={!!returnProcessModal} onCancel={() => setReturnProcessModal(null)}
        footer={null} title={<span className="text-[#6272B6] font-bold">Xử lý yêu cầu đổi/trả hàng</span>} width={520} destroyOnHidden>
        {returnProcessModal && (
          <>
            <div className="bg-gray-50 p-3 rounded-lg mb-4 text-sm space-y-1">
              <p><strong>Khách:</strong> {returnProcessModal.user?.name}</p>
              <p><strong>Loại:</strong> {returnProcessModal.returnExchange?.type === "exchange" ? "Đổi hàng" : "Trả hàng"}</p>
              <p><strong>Lý do:</strong> {returnProcessModal.returnExchange?.reason}</p>
              <p><strong>Tổng tiền:</strong> <span className="text-blue-600 font-bold">{fmt(returnProcessModal.totals.total)}đ</span></p>
            </div>
            <Form form={returnForm} layout="vertical">
              <Form.Item name="inspectionNote" label="Ghi chú kiểm tra sản phẩm">
                <Input.TextArea rows={3} placeholder="Kết quả kiểm tra sản phẩm lỗi..." />
              </Form.Item>
              <Form.Item name="note" label="Ghi chú thêm">
                <Input.TextArea rows={2} placeholder="Ghi chú thêm..." />
              </Form.Item>
            </Form>
            <div className="flex gap-2 justify-end mt-3">
              <Button onClick={() => setReturnProcessModal(null)}>Hủy</Button>
              <Button danger icon={<CloseOutlined />}
                onClick={() => handleProcessReturn(returnProcessModal._id, "reject", returnForm.getFieldsValue())}>
                Từ chối
              </Button>
              <Button type="primary" icon={<CheckOutlined />} className="bg-green-500"
                onClick={() => handleProcessReturn(returnProcessModal._id, "approve_refund", returnForm.getFieldsValue())}>
                Chấp thuận
              </Button>
            </div>
          </>
        )}
      </Modal>

      {/* Modal chi tiết COD */}
      <Modal open={!!codDetail} onCancel={() => setCodDetail(null)}
        footer={<Button onClick={() => setCodDetail(null)}>Đóng</Button>}
        title={<span className="text-orange-500 font-bold">Chi tiết hoàn hàng COD</span>} width={680}>
        {codDetail && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Mã đơn">#{codDetail._id.slice(-8).toUpperCase()}</Descriptions.Item>
            <Descriptions.Item label="Khách hàng">{codDetail.user?.name || codDetail.customer?.name}</Descriptions.Item>
            <Descriptions.Item label="SĐT">{codDetail.customer?.phone}</Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">{codDetail.customer?.address}</Descriptions.Item>
            <Descriptions.Item label="Lý do">{codDetail.returnExchange?.reason}</Descriptions.Item>
            <Descriptions.Item label="Tổng đơn"><span className="font-bold">{fmt(codDetail.totals.total)}đ</span></Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={returnStatusConfig[codDetail.returnStatus || "requested"]?.color}>
                {returnStatusConfig[codDetail.returnStatus || "requested"]?.label}
              </Tag>
            </Descriptions.Item>
            {codDetail.returnExchange?.images && codDetail.returnExchange.images.length > 0 && (
              <Descriptions.Item label="Ảnh chứng minh">
                <div className="flex gap-2 flex-wrap">
                  {codDetail.returnExchange.images.map((img, i) => (
                    <Image key={i} src={img} width={80} height={80} style={{ objectFit: "cover", borderRadius: 4 }} />
                  ))}
                </div>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* Modal xử lý COD */}
      <Modal open={!!codProcessModal} onCancel={() => setCodProcessModal(null)}
        footer={null} title={<span className="text-orange-500 font-bold">Xử lý hoàn hàng COD</span>} width={520} destroyOnHidden>
        {codProcessModal && (
          <>
            <div className="bg-orange-50 p-3 rounded-lg mb-4 text-sm space-y-1">
              <p><strong>Khách:</strong> {codProcessModal.user?.name || codProcessModal.customer?.name}</p>
              <p><strong>Tổng đơn:</strong> <span className="font-bold">{fmt(codProcessModal.totals.total)}đ</span></p>
              <p><strong>Lý do hoàn:</strong> {codProcessModal.returnExchange?.reason}</p>
            </div>
            <Form form={codForm} layout="vertical">
              <Form.Item name="inspectionNote" label="Ghi chú kiểm tra hàng nhận lại">
                <Input.TextArea rows={3} placeholder="Tình trạng hàng khi nhận lại..." />
              </Form.Item>
              <Form.Item name="note" label="Ghi chú">
                <Input.TextArea rows={2} />
              </Form.Item>
            </Form>
            <div className="flex gap-2 justify-end mt-3">
              <Button onClick={() => setCodProcessModal(null)}>Hủy</Button>
              <Button danger icon={<CloseOutlined />}
                onClick={() => handleProcessReturn(codProcessModal._id, "reject", codForm.getFieldsValue())}>
                Từ chối
              </Button>
              <Button type="primary" icon={<CheckOutlined />} className="bg-orange-500 border-0"
                onClick={() => handleProcessReturn(codProcessModal._id, "approve_refund", codForm.getFieldsValue())}>
                Chấp thuận hoàn hàng
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
