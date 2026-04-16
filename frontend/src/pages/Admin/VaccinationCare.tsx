import { useEffect, useState, type Key } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Popconfirm,
  Tag,
  Alert,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  listVaccinationsAdmin,
  createVaccination,
  updateVaccination,
  deleteVaccination,
  sendReminderManual,
  sendInfoEmail,
  bulkSendReminders,
  type VaccinationSchedule,
  type VaccinationStatus,
} from "../../api/vaccinationApi";
import { listPets, type PetEntity } from "../../api/petApi";

function toDatetimeLocalValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const STATUS_OPTIONS: { value: VaccinationStatus; label: string }[] = [
  { value: "scheduled", label: "Đã lên lịch" },
  { value: "completed", label: "Đã tiêm" },
  { value: "missed", label: "Bỏ lỡ" },
  { value: "cancelled", label: "Đã hủy" },
];

export default function VaccinationCare() {
  const [data, setData] = useState<VaccinationSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pets, setPets] = useState<PetEntity[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<VaccinationSchedule | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | VaccinationStatus>("all");
  const [reminderFilter, setReminderFilter] = useState<"all" | "sent" | "unsent">("all");
  const [form] = Form.useForm();

  const loadPage = async (p: number) => {
    setLoading(true);
    try {
      const res = await listVaccinationsAdmin({ page: p, limit: 20 });
      setData(res.data);
      setTotal(res.pagination?.total ?? res.data.length);
    } catch {
      message.error("Không tải được danh sách lịch tiêm.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPage(page);
  }, [page]);

  useEffect(() => {
    listPets({ page: 1, limit: 500 })
      .then((r) => setPets(r.data ?? []))
      .catch(() => message.error("Không tải danh sách thú cưng."));
  }, []);

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      status: "scheduled",
      doseNumber: 1,
    });
    setModalOpen(true);
  };

  const openEdit = (row: VaccinationSchedule) => {
    setEditing(row);
    const petId =
      typeof row.pet === "object" && row.pet
        ? String((row.pet as { _id?: string; id?: string })._id ?? (row.pet as { _id?: string; id?: string }).id)
        : String(row.pet);
    form.setFieldsValue({
      petId,
      ownerName: row.ownerName,
      ownerEmail: row.ownerEmail,
      ownerPhone: row.ownerPhone,
      vaccineName: row.vaccineName,
      doseNumber: row.doseNumber,
      scheduledAt: toDatetimeLocalValue(row.scheduledAt),
      status: row.status,
      notes: row.notes,
    });
    setModalOpen(true);
  };

  const submit = async () => {
    try {
      const v = await form.validateFields();
      const scheduledIso = new Date(v.scheduledAt as string).toISOString();
      if (editing) {
        await updateVaccination(editing._id, {
          ownerName: v.ownerName,
          ownerEmail: v.ownerEmail,
          ownerPhone: v.ownerPhone,
          vaccineName: v.vaccineName,
          doseNumber: v.doseNumber,
          scheduledAt: scheduledIso,
          status: v.status,
          notes: v.notes,
        });
        message.success("Đã cập nhật lịch tiêm");
      } else {
        await createVaccination({
          petId: v.petId,
          ownerName: v.ownerName,
          ownerEmail: v.ownerEmail,
          ownerPhone: v.ownerPhone,
          vaccineName: v.vaccineName,
          doseNumber: v.doseNumber,
          scheduledAt: scheduledIso,
          status: v.status,
          notes: v.notes,
        });
        message.success("Đã tạo lịch tiêm");
      }
      setModalOpen(false);
      await loadPage(page);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      message.error(err?.response?.data?.message || "Thao tác thất bại");
    }
  };

  const onDelete = async (id: string) => {
    try {
      await deleteVaccination(id);
      message.success("Đã xóa");
      setSelectedRowKeys((k) => k.filter((x) => x !== id));
      await loadPage(page);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      message.error(err?.response?.data?.message || "Xóa thất bại");
    }
  };

  const onSendReminder = async (id: string) => {
    try {
      const res = await sendReminderManual(id);
      message.success(res.message || `Đã gửi: ${res.sentType ?? ""}`);
      await loadPage(page);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      message.error(err?.response?.data?.message || "Gửi nhắc thất bại");
    }
  };

  const onSendInfo = async (id: string) => {
    try {
      await sendInfoEmail(id);
      message.success("Đã gửi email thông tin lịch");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      message.error(err?.response?.data?.message || "Gửi email thất bại");
    }
  };

  const onBulkSend = async () => {
    const selectedRows = data.filter((row) => selectedRowKeys.includes(row._id));
    const eligibleIds = selectedRows
      .filter((row) => row.status === "scheduled" && !row.isReminderSent)
      .map((row) => row._id);

    if (eligibleIds.length === 0) {
      message.warning("Chọn ít nhất một dòng.");
      return;
    }
    try {
      const res = await bulkSendReminders(eligibleIds);
      message.success(
        `Hoàn tất: gửi OK ${(res.results as { ok?: number })?.ok ?? 0}, bỏ qua ${(res.results as { skip?: number })?.skip ?? 0}`
      );
      await loadPage(page);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      message.error(err?.response?.data?.message || "Gửi hàng loạt thất bại");
    }
  };

  const columns: ColumnsType<VaccinationSchedule> = [
    {
      title: "Thú cưng",
      render: (_, row) =>
        row.petNameSnapshot ||
        (typeof row.pet === "object" && row.pet && "name" in row.pet
          ? (row.pet as { name?: string }).name
          : "—"),
      width: 120,
    },
    { title: "Chủ nuôi", dataIndex: "ownerName", width: 120 },
    { title: "Email", dataIndex: "ownerEmail", width: 180, ellipsis: true },
    { title: "Điện thoại", dataIndex: "ownerPhone", width: 110 },
    { title: "Vaccine", dataIndex: "vaccineName", width: 120 },
    {
      title: "Mũi",
      dataIndex: "doseNumber",
      width: 56,
    },
    {
      title: "Ngày giờ tiêm",
      render: (_, row) => new Date(row.scheduledAt).toLocaleString("vi-VN"),
      width: 160,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 110,
      render: (s: VaccinationStatus) => {
        const color =
          s === "completed" ? "green" : s === "scheduled" ? "blue" : s === "cancelled" ? "default" : "orange";
        return <Tag color={color}>{STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s}</Tag>;
      },
    },
    {
      title: "Nhắc đã gửi",
      width: 120,
      render: (_, row) =>
        row.isReminderSent ? <Tag color="green">Đã gửi</Tag> : <Tag color="gold">Chưa gửi</Tag>,
    },
    {
      title: "Lần gửi gần nhất",
      width: 170,
      render: (_, row) => (row.lastReminderAt ? new Date(row.lastReminderAt).toLocaleString("vi-VN") : "—"),
    },
    {
      title: "Thao tác",
      fixed: "right",
      width: 280,
      render: (_, row) => (
        <Space wrap size="small">
          <Button size="small" onClick={() => openEdit(row)}>
            Sửa
          </Button>
          <Button
            size="small"
            type="primary"
            onClick={() => onSendReminder(row._id)}
            disabled={row.isReminderSent || row.status !== "scheduled"}
          >
            Gửi nhắc
          </Button>
          <Button size="small" onClick={() => onSendInfo(row._id)}>
            Gửi email
          </Button>
          <Popconfirm title="Xóa lịch này?" onConfirm={() => onDelete(row._id)}>
            <Button size="small" danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filteredData = data.filter((row) => {
    if (statusFilter !== "all" && row.status !== statusFilter) return false;
    if (reminderFilter === "sent" && !row.isReminderSent) return false;
    if (reminderFilter === "unsent" && row.isReminderSent) return false;
    return true;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#6272B6] mb-4">Chăm sóc lịch tiêm phòng</h1>
      <Alert
        type="info"
        showIcon
        className="mb-4"
        message="Nhắc email tự động chạy mỗi ngày 08:00 (server). Hệ thống chỉ gửi khi lịch còn từ 0 đến 3 ngày và chưa gửi trước đó."
      />
      <Space className="mb-4" wrap>
        <Button type="primary" onClick={openAdd}>
          Thêm lịch tiêm
        </Button>
        <Button onClick={onBulkSend} disabled={selectedRowKeys.length === 0}>
          Gửi nhắc hàng loạt ({selectedRowKeys.length})
        </Button>
        <Select
          value={statusFilter}
          style={{ width: 170 }}
          onChange={(v: "all" | VaccinationStatus) => setStatusFilter(v)}
          options={[
            { value: "all", label: "Tất cả trạng thái" },
            ...STATUS_OPTIONS,
          ]}
        />
        <Select
          value={reminderFilter}
          style={{ width: 190 }}
          onChange={(v: "all" | "sent" | "unsent") => setReminderFilter(v)}
          options={[
            { value: "all", label: "Tất cả nhắc email" },
            { value: "sent", label: "Đã gửi nhắc" },
            { value: "unsent", label: "Chưa gửi nhắc" },
          ]}
        />
        <Button onClick={() => void loadPage(page)} loading={loading}>
          Làm mới
        </Button>
      </Space>

      <Table<VaccinationSchedule>
        rowKey="_id"
        loading={loading}
        columns={columns}
        dataSource={filteredData}
        scroll={{ x: 1200 }}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
          getCheckboxProps: (record) => ({
            disabled: record.status !== "scheduled" || !!record.isReminderSent,
          }),
        }}
        pagination={{
          current: page,
          total,
          pageSize: 20,
          onChange: (p) => setPage(p),
        }}
      />

      <Modal
        title={editing ? "Sửa lịch tiêm" : "Thêm lịch tiêm"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={submit}
        width={640}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-2">
          {!editing && (
            <Form.Item name="petId" label="Thú cưng" rules={[{ required: true, message: "Chọn thú cưng" }]}>
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Chọn thú cưng"
                options={pets.map((p) => ({
                  value: p.id,
                  label: `${p.name} (${p.species})`,
                }))}
              />
            </Form.Item>
          )}
          <Form.Item name="ownerName" label="Họ tên chủ nuôi" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="ownerEmail" label="Email" rules={[{ required: true, type: "email" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="ownerPhone" label="Số điện thoại">
            <Input />
          </Form.Item>
          <Form.Item name="vaccineName" label="Tên vaccine / mũi tiêm" rules={[{ required: true }]}>
            <Input placeholder="VD: Vaccine dại, 5 bệnh..." />
          </Form.Item>
          <Form.Item name="doseNumber" label="Số mũi" rules={[{ required: true }]}>
            <InputNumber min={1} className="w-full" />
          </Form.Item>
          <Form.Item name="scheduledAt" label="Ngày giờ tiêm" rules={[{ required: true }]}>
            <Input type="datetime-local" />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
            <Select options={STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
