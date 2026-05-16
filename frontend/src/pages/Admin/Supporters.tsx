import { useEffect, useState } from "react"
import {
  Table, Tag, Button, message, Card, Statistic, Row, Col,
  Popconfirm, Select, Space, Modal, Form, Input, InputNumber,
  DatePicker, Switch, Divider, Alert,
} from "antd"
import type { ColumnsType } from "antd/es/table"
import {
  ReloadOutlined, DeleteOutlined, HeartOutlined, DollarOutlined,
  ClockCircleOutlined, GiftOutlined, TagOutlined, SendOutlined,
} from "@ant-design/icons"
import { apiClient } from "../../api/http"
import dayjs from "dayjs"

interface Donation {
  _id: string
  orderId: string
  name: string
  email: string
  amount: number
  status: "pending" | "success" | "failed"
  paymentMethod: string
  paidAt: string | null
  createdAt: string
}

const statusConfig = {
  success:   { label: "Thành công", color: "green" },
  completed: { label: "Thành công", color: "green" },
  pending:   { label: "Chờ xử lý", color: "orange" },
  failed:    { label: "Thất bại",   color: "red" },
}

const fmt = (n: number) => new Intl.NumberFormat("vi-VN").format(n)

export default function Supporters() {
  const [data, setData] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("success")

  // Voucher modal
  const [voucherModal, setVoucherModal] = useState(false)
  const [selectedDonor, setSelectedDonor] = useState<Donation | null>(null)
  const [voucherForm] = Form.useForm()
  const [sendingVoucher, setSendingVoucher] = useState(false)
  const [sendAll, setSendAll] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get("/donate/admin/list", {
        params: { limit: 200, status: statusFilter !== "all" ? statusFilter : undefined },
      })
      setData(res.data.data || [])
    } catch {
      message.error("Không thể tải danh sách người ủng hộ")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [statusFilter])

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/donate/admin/${id}`)
      message.success("Đã xóa")
      setData(prev => prev.filter(d => d._id !== id))
    } catch {
      message.error("Không thể xóa")
    }
  }

  // Mở modal gửi voucher cho 1 donor
  const openVoucherModal = (donor: Donation) => {
    setSelectedDonor(donor)
    setSendAll(false)
    voucherForm.resetFields()
    voucherForm.setFieldsValue({
      type: "percent",
      value: 10,
      usageLimit: 1,
      userLimit: 1,
      description: `Cảm ơn bạn ${donor.name || "ẩn danh"} đã ủng hộ ${fmt(donor.amount)}đ`,
    })
    setVoucherModal(true)
  }

  // Mở modal gửi voucher cho tất cả
  const openVoucherModalAll = () => {
    setSelectedDonor(null)
    setSendAll(true)
    voucherForm.resetFields()
    voucherForm.setFieldsValue({
      type: "percent",
      value: 10,
      usageLimit: 1,
      userLimit: 1,
      description: "Cảm ơn bạn đã ủng hộ PetAdopt",
    })
    setVoucherModal(true)
  }

  const handleSendVoucher = async () => {
    try {
      const values = await voucherForm.validateFields()
      setSendingVoucher(true)

      // Xác định danh sách donors cần gửi
      const donors = sendAll
        ? data.filter(d => (d.status === "success" || d.status === "completed") && d.email)
        : selectedDonor && selectedDonor.email ? [selectedDonor] : []

      if (donors.length === 0) {
        message.warning("Không có email nào để gửi voucher")
        setSendingVoucher(false)
        return
      }

      let successCount = 0
      let failCount = 0

      for (const donor of donors) {
        // Tạo mã voucher unique cho mỗi donor: DONATE + 6 ký tự random
        const code = `DONATE${Math.random().toString(36).substring(2, 8).toUpperCase()}`
        try {
          await apiClient.post("/vouchers/admin", {
            code,
            description: values.description,
            type: values.type,
            value: values.value,
            maxDiscount: values.maxDiscount || 0,
            minOrder: values.minOrder || 0,
            usageLimit: values.usageLimit || 1,
            userLimit: values.userLimit || 1,
            startDate: values.startDate ? values.startDate.toISOString() : null,
            endDate: values.endDate ? values.endDate.toISOString() : null,
            isActive: true,
          })

          // Gửi email kèm mã voucher
          await apiClient.post("/donate/admin/send-voucher-email", {
            email: donor.email,
            name: donor.name || "bạn",
            code,
            type: values.type,
            value: values.value,
            description: values.description,
            endDate: values.endDate ? values.endDate.toISOString() : null,
          }).catch(() => {}) // không block nếu email lỗi

          successCount++
        } catch (err: any) {
          console.error(`Failed for ${donor.email}:`, err.response?.data?.message)
          failCount++
        }
      }

      if (successCount > 0) {
        message.success(`Đã tạo và gửi ${successCount} voucher thành công${failCount > 0 ? `, ${failCount} thất bại` : ""}`)
      } else {
        message.error("Tất cả đều thất bại")
      }

      setVoucherModal(false)
    } catch (err: any) {
      if (!err?.errorFields) {
        message.error(err?.response?.data?.message || "Lỗi gửi voucher")
      }
    } finally {
      setSendingVoucher(false)
    }
  }

  const successDonations = data.filter(d => d.status === "success" || d.status === "completed")
  const totalRevenue = successDonations.reduce((s, d) => s + d.amount, 0)
  const totalCount = successDonations.length

  const columns: ColumnsType<Donation> = [
    {
      title: "Tên",
      dataIndex: "name",
      render: (n: string) => n || <span className="text-gray-400 italic">Ẩn danh</span>,
      width: 150,
    },
    {
      title: "Email",
      dataIndex: "email",
      render: (e: string) => e || <span className="text-gray-400">—</span>,
      width: 200,
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      render: (a: number) => <span className="text-green-600 font-bold">{fmt(a)}đ</span>,
      sorter: (a, b) => a.amount - b.amount,
      width: 130,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (s: string) => {
        const cfg = statusConfig[s as keyof typeof statusConfig]
        return <Tag color={cfg?.color}>{cfg?.label}</Tag>
      },
      width: 120,
    },
    {
      title: "Thời gian",
      dataIndex: "paidAt",
      render: (d: string, r: Donation) => {
        const date = d || r.createdAt
        return (
          <div className="text-xs">
            <div>{new Date(date).toLocaleDateString("vi-VN")}</div>
            <div className="text-gray-400">
              {new Date(date).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        )
      },
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: "descend",
      width: 110,
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <Space size="small">
          {(record.status === "success" || record.status === "completed") && record.email && (
            <Button
              type="primary"
              size="small"
              icon={<GiftOutlined />}
              onClick={() => openVoucherModal(record)}
              className="bg-[#6272B6] border-0 rounded-lg"
            >
              Gửi voucher
            </Button>
          )}
          <Popconfirm
            title="Xóa bản ghi này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
      width: 160,
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-[#6272B6]">Danh sách người ủng hộ</h1>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>Làm mới</Button>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={openVoucherModalAll}
            className="bg-green-500 border-0 rounded-xl"
            disabled={successDonations.filter(d => d.email).length === 0}
          >
            Gửi voucher tất cả ({successDonations.filter(d => d.email).length})
          </Button>
        </Space>
      </div>

      {/* Stats */}
      <Row gutter={16} className="mb-6">
        <Col span={8}>
          <Card>
            <Statistic title="Tổng lượt ủng hộ" value={totalCount}
              prefix={<HeartOutlined />} valueStyle={{ color: "#6272B6" }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Tổng tiền nhận được" value={totalRevenue} suffix="đ"
              prefix={<DollarOutlined />} valueStyle={{ color: "#52c41a" }}
              formatter={(v) => fmt(Number(v))} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Chờ xử lý" value={data.filter(d => d.status === "pending").length}
              prefix={<ClockCircleOutlined />} valueStyle={{ color: "#faad14" }} />
          </Card>
        </Col>
      </Row>

      <Card>
        <Space className="mb-4">
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 160 }}>
            <Select.Option value="all">Tất cả</Select.Option>
            <Select.Option value="success">Thành công</Select.Option>
            <Select.Option value="pending">Chờ xử lý</Select.Option>
            <Select.Option value="failed">Thất bại</Select.Option>
          </Select>
          <Tag color="blue">{data.length} bản ghi</Tag>
        </Space>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 20, showTotal: (t) => `${t} bản ghi` }}
          scroll={{ x: 900 }}
        />
      </Card>

      {/* Modal tạo + gửi voucher */}
      <Modal
        open={voucherModal}
        onCancel={() => setVoucherModal(false)}
        onOk={handleSendVoucher}
        confirmLoading={sendingVoucher}
        title={
          <span className="text-[#6272B6] font-bold text-lg">
            <GiftOutlined className="mr-2" />
            {sendAll
              ? `Gửi voucher cho ${successDonations.filter(d => d.email).length} người ủng hộ`
              : `Gửi voucher cho ${selectedDonor?.name || "ẩn danh"}`
            }
          </span>
        }
        okText={<><SendOutlined /> Tạo & Gửi voucher</>}
        cancelText="Hủy"
        width={580}
        destroyOnClose
      >
        {sendAll && (
          <Alert
            type="info"
            showIcon
            className="mb-4"
            message={`Sẽ tạo ${successDonations.filter(d => d.email).length} voucher riêng biệt với mã ngẫu nhiên (DONATE + 6 ký tự) và gửi email cho từng người.`}
          />
        )}
        {!sendAll && selectedDonor && (
          <Alert
            type="success"
            showIcon
            className="mb-4"
            message={`Gửi cho: ${selectedDonor.name || "Ẩn danh"} — ${selectedDonor.email}`}
            description={`Đã ủng hộ: ${fmt(selectedDonor.amount)}đ`}
          />
        )}

        <Form form={voucherForm} layout="vertical" className="mt-2">
          <Form.Item name="description" label="Mô tả voucher (hiển thị cho khách)">
            <Input placeholder="VD: Cảm ơn bạn đã ủng hộ PetAdopt" className="rounded-lg" />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="type" label="Loại giảm giá" rules={[{ required: true }]}>
                <Select className="rounded-lg">
                  <Select.Option value="percent">Phần trăm (%)</Select.Option>
                  <Select.Option value="fixed">Số tiền cố định (đ)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="value" label="Giá trị" rules={[{ required: true, message: "Nhập giá trị" }]}>
                <InputNumber
                  min={1}
                  className="w-full rounded-lg"
                  placeholder="VD: 10 (%) hoặc 50000 (đ)"
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="maxDiscount" label="Giảm tối đa (đ, để trống = không giới hạn)">
                <InputNumber min={0} className="w-full rounded-lg"
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  placeholder="0 = không giới hạn" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="minOrder" label="Đơn tối thiểu (đ)">
                <InputNumber min={0} className="w-full rounded-lg"
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  placeholder="0 = không yêu cầu" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="usageLimit" label="Tổng lượt dùng (0 = không giới hạn)">
                <InputNumber min={0} className="w-full rounded-lg" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="userLimit" label="Lượt/người (0 = không giới hạn)">
                <InputNumber min={0} className="w-full rounded-lg" />
              </Form.Item>
            </Col>
          </Row>

          <Divider className="my-3">Thời hạn sử dụng</Divider>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="startDate" label="Bắt đầu">
                <DatePicker className="w-full rounded-lg" format="DD/MM/YYYY" placeholder="Ngay lập tức" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endDate" label="Hết hạn">
                <DatePicker className="w-full rounded-lg" format="DD/MM/YYYY"
                  disabledDate={(d) => d.isBefore(dayjs())}
                  placeholder="Không giới hạn" />
              </Form.Item>
            </Col>
          </Row>

          <div className="bg-blue-50 rounded-lg p-3 mt-2 text-sm text-gray-600">
            <TagOutlined className="mr-1 text-[#6272B6]" />
            Mã voucher sẽ được tạo tự động dạng <strong>DONATE + 6 ký tự</strong> (VD: DONATEAB12XY) và gửi qua email cho người ủng hộ.
          </div>
        </Form>
      </Modal>
    </div>
  )
}
