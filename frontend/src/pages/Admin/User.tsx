import { useEffect, useState } from "react";
import {
  Table, Tag, Space, Button, Popconfirm, message,
  Input, Card, Statistic, Row, Col,
} from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import {
  SearchOutlined, UserOutlined, LockOutlined, CheckCircleOutlined,
} from "@ant-design/icons";
import { apiClient } from "../../api/http";

interface UserType {
  _id: string;
  name: string;
  email: string;
  role: string;
  isBanned: boolean;
  isVerified: boolean;
  createdAt: string;
}

const API = "/admin/users";

const User = () => {
  const [data, setData] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const fetchUsers = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const res = await apiClient.get(`${API}?page=${page}&limit=${limit}`);
      setData(res.data.data);
      setPagination({
        current: res.data.pagination.page,
        pageSize: res.data.pagination.limit,
        total: res.data.pagination.total,
      });
    } catch {
      message.error("Lỗi khi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleTableChange: TableProps<UserType>["onChange"] = (p) =>
    fetchUsers(p.current, p.pageSize);

  const handleToggleBan = async (user: UserType) => {
    try {
      if (user.isBanned) {
        await apiClient.put(`${API}/${user._id}/unban`);
        message.success(`Đã mở khóa ${user.name}`);
      } else {
        await apiClient.put(`${API}/${user._id}/ban`);
        message.success(`Đã khóa ${user.name}`);
      }
      fetchUsers(pagination.current, pagination.pageSize);
    } catch {
      message.error("Thao tác thất bại");
    }
  };

  const filtered = search
    ? data.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      )
    : data;

  const bannedCount = data.filter((u) => u.isBanned).length;
  const verifiedCount = data.filter((u) => u.isVerified).length;

  const columns: ColumnsType<UserType> = [
    {
      title: "Tên",
      dataIndex: "name",
      render: (n) => <span className="font-medium">{n}</span>,
      width: 160,
    },
    { title: "Email", dataIndex: "email", width: 220 },
    {
      title: "Quyền",
      dataIndex: "role",
      width: 90,
      render: (role) => (
        <Tag color={role === "admin" ? "volcano" : "blue"}>{role}</Tag>
      ),
    },
    {
      title: "Xác thực",
      dataIndex: "isVerified",
      width: 130,
      render: (v) =>
        v ? (
          <Tag color="green">✅ Đã xác thực</Tag>
        ) : (
          <Tag color="orange">⏳ Chưa xác thực</Tag>
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isBanned",
      width: 120,
      render: (b) =>
        b ? (
          <Tag color="red">🔒 Bị khóa</Tag>
        ) : (
          <Tag color="green">✅ Hoạt động</Tag>
        ),
    },
    {
      title: "Ngày tham gia",
      dataIndex: "createdAt",
      width: 120,
      render: (d) => (
        <span className="text-xs text-gray-400">
          {new Date(d).toLocaleDateString("vi-VN")}
        </span>
      ),
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: "descend",
    },
    {
      title: "Hành động",
      width: 110,
      fixed: "right",
      render: (_, record) => (
        <Space>
          {record.role !== "admin" && (
            <Popconfirm
              title={
                record.isBanned
                  ? "Mở khóa tài khoản này?"
                  : "Khóa tài khoản này?"
              }
              onConfirm={() => handleToggleBan(record)}
              okText="Xác nhận"
              cancelText="Hủy"
              okType={record.isBanned ? "primary" : "danger"}
            >
              <Button
                size="small"
                danger={!record.isBanned}
                type={record.isBanned ? "primary" : "default"}
                className="rounded-lg"
              >
                {record.isBanned ? "Mở khóa" : "Khóa"}
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6272B6] to-purple-600 flex items-center gap-2 mb-4">
        Quản lý người dùng
      </h2>

      {/* Stats */}
      <Row gutter={16} className="mb-6">
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng người dùng"
              value={pagination.total}
              prefix={<UserOutlined />}
              styles={{ content: { color: "#6272B6"  }}}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Đã xác thực"
              value={verifiedCount}
              prefix={<CheckCircleOutlined />}
              styles={{ content: { color: "#52c41a"  }}}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Bị khóa"
              value={bannedCount}
              prefix={<LockOutlined />}
              styles={{ content: { color: "#ff4d4f"  }}}
            />
          </Card>
        </Col>
      </Row>

      {/* Search */}
      <div className="bg-white rounded-xl shadow p-4 mb-4">
        <Input
          placeholder="Tìm theo tên hoặc email..."
          prefix={<SearchOutlined className="text-gray-400" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          className="rounded-lg max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow">
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={filtered}
          loading={loading}
          scroll={{ x: 900 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (t) => `${t} người dùng`,
          }}
          onChange={handleTableChange}
        />
      </div>
    </div>
  );
};

export default User;
