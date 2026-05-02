import { useEffect, useState } from "react";
import { Table, Tag, Space, Button, Popconfirm, message } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
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
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 👉 Load data
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
    } catch (error) {
      message.error("Lỗi khi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(pagination.current, pagination.pageSize);
  }, []);

  // 👉 Xử lý khi đổi trang
  const handleTableChange: TableProps<UserType>['onChange'] = (newPagination) => {
    fetchUsers(newPagination.current, newPagination.pageSize);
  };

  // 👉 Khóa / Mở khóa người dùng
  const handleToggleBan = async (user: UserType) => {
    try {
      if (user.isBanned) {
        await apiClient.put(`${API}/${user._id}/unban`);
        message.success(`Đã mở khóa tài khoản ${user.name}`);
      } else {
        await apiClient.put(`${API}/${user._id}/ban`);
        message.success(`Đã khóa tài khoản ${user.name}`);
      }
      fetchUsers(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error("Thao tác thất bại");
    }
  };

  // 👉 Columns
  const columns: ColumnsType<UserType> = [
    {
      title: "Tên",
      dataIndex: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Quyền",
      dataIndex: "role",
      render: (role) => (
        <Tag color={role === "admin" ? "volcano" : "blue"}>{role}</Tag>
      ),
    },
    {
      title: "Xác thực",
      dataIndex: "isVerified",
      render: (isVerified) =>
        isVerified ? (
          <Tag color="green">Đã xác thực</Tag>
        ) : (
          <Tag color="orange">Chưa xác thực</Tag>
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isBanned",
      render: (isBanned) =>
        isBanned ? (
          <Tag color="red">Bị khóa</Tag>
        ) : (
          <Tag color="green">Hoạt động</Tag>
        ),
    },
    {
      title: "Ngày tham gia",
      dataIndex: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Action",
      render: (_, record) => (
        <Space>
          {record.role !== "admin" && (
            <Popconfirm
              title={
                record.isBanned
                  ? "Bạn có chắc muốn mở khóa người dùng này?"
                  : "Bạn có chắc muốn khóa người dùng này?"
              }
              onConfirm={() => handleToggleBan(record)}
            >
              <Button danger={!record.isBanned} type={record.isBanned ? "primary" : "default"}>
                {record.isBanned ? "Mở khóa" : "Khóa"}
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginBottom: 20 }}>Quản lý người dùng</h2>
      <Table 
        rowKey="_id" 
        columns={columns} 
        dataSource={data} 
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
        }}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default User;