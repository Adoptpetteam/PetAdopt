import { useEffect, useState } from "react";
import {
  Table, Button, Modal, Form, Input, Select, InputNumber,
  Switch, Tag, Space, message, Card, Statistic, Row, Col,
  DatePicker, Tooltip, Popconfirm,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  TagOutlined, ReloadOutlined, CopyOutlined,
} from "@ant-design/icons";
import { apiClient } from "../../api/http";
import dayjs from "dayjs";

interface Voucher {
  _id: string;
  code: string;
  description: string;
  type: "percent" | "fixed";
  value: number;
  maxDiscount: number;
  minOrder: number;
  usageLimit: number;
  usedCount: number;
  userLimit: number;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("vi-VN").format(n);

export default function VoucherPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Voucher | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/vouchers/admin", { params: { limit: 100 } });
      setVouchers(res.data.data || []);
    } catch {
      message.error("Không thể tải danh sách voucher");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ type: "percent", isActive: true, userLimit: 1, usageLimit: 0, minOrder: 0, maxDiscount: 0 });
    setModalOpen(true);
  };

  const openEdit = (v: Voucher) => {
    setEditing(v);
    form.setFieldsValue({
      ...v,
      startDate: v.startDate ? dayjs(v.startDate) : null,
      endDate: v.endDate ? dayjs(v.endDate) : null,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const payload = {
        ...values,
        startDate: values.startDate ? values.startDate.toISOString() : null,
        endDate: values.endDate ? values.endDate.toISOString() : null,
      };
      if (editing) {
        await apiClient.put(`/vouchers/admin/${editing._id}`, payload);
        message.success("Đã cập nhật voucher");
      } else {
        await apiClient.post("/vouchers/admin", payload);
        message.success("Đã tạo voucher");
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      if (err?.response) message.error(err.response.data?.message || "Lỗi lưu voucher");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/vouchers/admin/${id}`);
      message.success("Đã xóa voucher");
      load();
    } catch {
      message.error("Không thể xóa voucher");
    }
  };

  const handleToggle = async (v: Voucher) => {
    try {
      await apiClient.put(`/vouchers/admin/${v._id}`, { isActive: !v.isActive });
      setVouchers(prev => prev.map(item => item._id === v._id ? { ...item, isActive: !v.isActive } : item));
    } catch {
      message.error("Không thể cập nhật trạng thái");
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    message.success(`Đã copy mã ${code}`);
  };

  // Stats
  const total = vouchers.length;
  const active = vouchers.filter(v => v.isActive).length;
  const totalUsed = vouchers.reduce((s, v) => s + v.usedCount, 0);
  const expired = vouchers.filter(v => v.endDate && new Date(v.endDate) < new Date()).length;

  const columns: ColumnsType<Voucher> = [
    {
      title: "Mã voucher",
      dataIndex: "code",
      render: (code: string) => (
        <Space>
          <Tag color="blue" className="font-bold text-base px-3 py-1">{code}</Tag>
          <Tooltip title="Copy mã">
            <Button type="text" size="small" icon={<CopyOutlined />} onClick={() => copyCode(code)} />
          </Tooltip>
        </Space>
      ),
      width: 200,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      render: (d: string) => d || <span className="text-gray-400">—</span>,
      width: 180,
    },
    {
      title: "Giảm giá",
      render: (_, v) => (
        <div>
          <span className="font-bold text-green-600 text-base">
            {v.type === "percent" ? `${v.value}%` : `${fmt(v.value)}đ`}
          </span>
          {v.type === "percent" && v.maxDiscount > 0 && (
            <div className="text-xs text-gray-400">Tối đa {fmt(v.maxDiscount)}đ</div>
          )}
          {v.minOrder > 0 && (
            <div className="text-xs text-gray-400">Đơn tối thiểu {fmt(v.minOrder)}đ</div>
          )}
        </div>
      ),
      width: 160,
    },
    {
      title: "Lượt dùng",
      render: (_, v) => (
        <div className="text-center">
          <div className="font-bold text-[#6272B6]">
            {v.usedCount}{v.usageLimit > 0 ? ` / ${v.usageLimit}` : ""}
          </div>
          <div className="text-xs text-gray-400">
            {v.userLimit > 0 ? `${v.userLimit} lần/người` : "Không giới hạn/người"}
          </div>
        </div>
      ),
      width: 120,
    },
    {
      title: "Thời hạn",
      render: (_, v) => {
        const now = new Date();
        const isExpired = v.endDate && new Date(v.endDate) < now;
        const notStarted = v.startDate && new Date(v.startDate) > now;
        return (
          <div className="text-xs">
            {v.startDate ? (
              <div>Từ: {dayjs(v.startDate).format("DD/MM/YYYY")}</div>
            ) : <div className="text-gray-400">Không giới hạn từ</div>}
            {v.endDate ? (
              <div className={isExpired ? "text-red-500 font-semibold" : ""}>
                Đến: {dayjs(v.endDate).format("DD/MM/YYYY")}
                {isExpired && " (Hết hạn)"}
              </div>
            ) : <div className="text-gray-400">Không giới hạn đến</div>}
          </div>
        );
      },
      width: 150,
    },
    {
      title: "Trạng thái",
      render: (_, v) => (
        <Switch
          checked={v.isActive}
          onChange={() => handleToggle(v)}
          checkedChildren="Bật"
          unCheckedChildren="Tắt"
          className={v.isActive ? "bg-green-500" : ""}
        />
      ),
      width: 90,
    },
    {
      title: "",
      render: (_, v) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(v)}>Sửa</Button>
          <Popconfirm
            title="Xóa voucher này?"
            onConfirm={() => handleDelete(v._id)}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
      width: 140,
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#6272B6] flex items-center gap-2">
          <TagOutlined /> Quản lý Voucher
        </h1>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>Làm mới</Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreate}
            className="bg-[#6272B6] border-0 rounded-xl"
          >
            Tạo voucher
          </Button>
        </Space>
      </div>

      {/* Stats */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic title="Tổng voucher" value={total} prefix={<TagOutlined />} valueStyle={{ color: "#6272B6" }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Đang hoạt động" value={active} valueStyle={{ color: "#52c41a" }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Tổng lượt dùng" value={totalUsed} valueStyle={{ color: "#1890ff" }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Đã hết hạn" value={expired} valueStyle={{ color: "#ff4d4f" }} />
          </Card>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={vouchers}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 20, showTotal: (t) => `${t} voucher` }}
          scroll={{ x: 1100 }}
        />
      </Card>

      {/* Modal tạo/sửa */}
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        title={
          <span className="text-[#6272B6] font-bold">
            {editing ? "✏️ Sửa voucher" : "➕ Tạo voucher mới"}
          </span>
        }
        okText={editing ? "Lưu" : "Tạo"}
        cancelText="Hủy"
        width={560}
      >
        <Form form={form} layout="vertical" className="mt-4">
          {!editing && (
            <Form.Item
              name="code"
              label="Mã voucher"
              rules={[{ required: true, message: "Nhập mã voucher" }]}
            >
              <Input
                placeholder="VD: SUMMER20"
                className="rounded-xl h-10 uppercase"
                onChange={(e) => form.setFieldValue("code", e.target.value.toUpperCase())}
              />
            </Form.Item>
          )}

          <Form.Item name="description" label="Mô tả (hiển thị cho khách)">
            <Input placeholder="VD: Giảm 20% cho đơn từ 200k" className="rounded-xl h-10" />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="type" label="Loại giảm giá" rules={[{ required: true }]}>
                <Select className="rounded-xl">
                  <Select.Option value="percent">Phần trăm (%)</Select.Option>
                  <Select.Option value="fixed">Số tiền cố định (đ)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="value" label="Giá trị" rules={[{ required: true, message: "Nhập giá trị" }]}>
                <InputNumber
                  min={1} max={form.getFieldValue("type") === "percent" ? 100 : undefined}
                  className="w-full rounded-xl h-10"
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="maxDiscount" label="Giảm tối đa (đ, 0=không giới hạn)">
                <InputNumber min={0} className="w-full rounded-xl h-10"
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="minOrder" label="Đơn tối thiểu (đ)">
                <InputNumber min={0} className="w-full rounded-xl h-10"
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="usageLimit" label="Tổng lượt dùng (0=không giới hạn)">
                <InputNumber min={0} className="w-full rounded-xl h-10" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="userLimit" label="Lượt/người (0=không giới hạn)">
                <InputNumber min={0} className="w-full rounded-xl h-10" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="startDate" label="Ngày bắt đầu">
                <DatePicker className="w-full rounded-xl h-10" format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endDate" label="Ngày hết hạn">
                <DatePicker className="w-full rounded-xl h-10" format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
            <Switch checkedChildren="Đang bật" unCheckedChildren="Đang tắt" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
