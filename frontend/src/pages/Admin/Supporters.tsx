import { useEffect, useState } from "react"
import { Table, Tag, Button, message, Card, Statistic, Row, Col, Popconfirm, Select, Space } from "antd"
import type { ColumnsType } from "antd/es/table"
import { ReloadOutlined, DeleteOutlined, HeartOutlined, DollarOutlined, ClockCircleOutlined } from "@ant-design/icons"
import { apiClient } from "../../api/http"

interface Donation {
  _id: string
  orderId: string
  name: string
  email: string
  amount: number
  status: "pending" | "completed" | "failed"
  paymentMethod: string
  paidAt: string | null
  createdAt: string
}

const statusConfig = {
  completed: { label: "Thành công", color: "green" },
  pending: { label: "Chờ xử lý", color: "orange" },
  failed:  { label: "Thất bại",   color: "red" },
}

const fmt = (n: number) => new Intl.NumberFormat("vi-VN").format(n)

export default function Supporters() {
  const [data, setData] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("completed")

  const load = async () => {
    setLoading(true)
    try {
      console.log('[Supporters] Loading with status:', statusFilter);
      const res = await apiClient.get("/donate/admin/list", {
        params: { limit: 200, status: statusFilter !== "all" ? statusFilter : undefined },
      })
      console.log('[Supporters] API Response:', res.data);
      setData(res.data.data || [])
    } catch (error) {
      console.error('[Supporters] API Error:', error);
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

  const successDonations = data.filter(d => d.status === "completed")
  const totalRevenue = successDonations.reduce((s, d) => s + d.amount, 0)
  const totalCount = successDonations.length

  const columns: ColumnsType<Donation> = [
    {
      title: "Tên",
      dataIndex: "name",
      render: (n: string) => n || <span className="text-gray-400 italic">Ẩn danh</span>,
      width: 160,
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
      render: (a: number) => (
        <span className="text-green-600 font-bold">{fmt(a)}đ</span>
      ),
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
            <div className="text-gray-400">{new Date(date).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</div>
          </div>
        )
      },
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: "descend",
      width: 120,
    },
    {
      title: "",
      render: (_, record) => (
        <Popconfirm
          title="Xóa bản ghi này?"
          onConfirm={() => handleDelete(record._id)}
          okText="Xóa"
          cancelText="Hủy"
          okType="danger"
        >
          <Button type="text" danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      ),
      width: 60,
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6272B6] to-purple-600 flex items-center gap-2">
          Danh sách người ủng hộ
        </h1>
        <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>
          Làm mới
        </Button>
      </div>

      {/* Stats */}
      <Row gutter={16} className="mb-6">
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng lượt ủng hộ"
              value={totalCount}
              prefix={<HeartOutlined />}
              styles={{ content: { color: "#6272B6"  }}}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng tiền nhận được"
              value={totalRevenue}
              suffix="đ"
              prefix={<DollarOutlined />}
              styles={{ content: { color: "#52c41a"  }}}
              formatter={(v) => fmt(Number(v))}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Chờ xử lý"
              value={data.filter(d => d.status === "pending").length}
              prefix={<ClockCircleOutlined />}
              styles={{ content: { color: "#faad14"  }}}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Space className="mb-4">
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 160 }}
          >
            <Select.Option value="all">Tất cả</Select.Option>
            <Select.Option value="completed">Thành công</Select.Option>
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
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  )
}
