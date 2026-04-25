import { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Space,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Popconfirm,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import axios from "axios";

const { Option } = Select;

interface UserType {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  status: boolean;
  online: boolean;
}

const API = "http://localhost:3000/users";

const User = () => {
  const [data, setData] = useState<UserType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [form] = Form.useForm();

  // 👉 Load data
  const fetchUsers = async () => {
    const res = await axios.get(API);
    setData(res.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 👉 Add
  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  // 👉 Edit (fill full data)
  const handleEdit = (record: UserType) => {
    setEditingUser(record);

    form.setFieldsValue({
      name: record.name,
      email: record.email,
      password: record.password,
      role: record.role,
      status: record.status,
      online: record.online,
    });

    setIsModalOpen(true);
  };

  // 👉 Delete (chỉ xóa khi status = false)
  const handleDelete = async (user: UserType) => {
    if (user.status) {
      alert("Chỉ được xóa user đang bị khóa!");
      return;
    }

    await axios.delete(`${API}/${user.id}`);
    fetchUsers();
  };

  // 👉 Submit
  const handleSubmit = async () => {
    const values = await form.validateFields();

    if (editingUser) {
      // 👉 giữ nguyên data cũ + update role, status
      await axios.put(`${API}/${editingUser.id}`, {
        ...editingUser,
        name: values.name,
        email: values.email,
        role: values.role,
        status: values.status,
      });
    } else {
      await axios.post(API, values);
    }

    setIsModalOpen(false);
    fetchUsers();
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
      title: "Mật khẩu",
      dataIndex: "password",
      render: () => "*****",
    },
    {
      title: "Quyền",
      dataIndex: "role",
      render: (role) => (
        <Tag color={role === "admin" ? "volcano" : "blue"}>
          {role}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) =>
        status ? (
          <Tag color="green">Hoạt động</Tag>
        ) : (
          <Tag color="red">Bị khóa</Tag>
        ),
    },
    {
      title: "Hoạt động",
      dataIndex: "online",
      render: (online) =>
        online ? (
          <Tag color="processing">Online</Tag>
        ) : (
          <Tag>Offline</Tag>
        ),
    },
    {
      title: "Action",
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => handleEdit(record)}>
            Sửa
          </Button>

          <Popconfirm
            title="Bạn có chắc muốn xóa?"
            onConfirm={() => handleDelete(record)}
          >
            <Button danger disabled={record.status}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Quản lý người dùng</h2>

      <Button type="primary" onClick={handleAdd} style={{ marginBottom: 10 }}>
        Thêm người dùng
      </Button>

      <Table rowKey="id" columns={columns} dataSource={data} />

      <Modal
        title={editingUser ? "Sửa người dùng" : "Thêm người dùng"}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
            <Input disabled={!!editingUser} />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input disabled={!!editingUser} />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={editingUser ? [] : [{ required: true }]}
          >
            <Input.Password disabled={!!editingUser} />
          </Form.Item>

          <Form.Item name="role" label="Quyền" rules={[{ required: true }]}>
            <Select>
              <Option value="admin">Admin</Option>
              <Option value="user">User</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            valuePropName="checked"
          >
            <Switch checkedChildren="Active" unCheckedChildren="Block" />
          </Form.Item>

          <Form.Item
            name="online"
            label="Hoạt động"
            valuePropName="checked"
          >
            <Switch disabled={!!editingUser} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default User;