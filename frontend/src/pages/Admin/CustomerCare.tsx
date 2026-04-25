import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Tag,
  Card,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import axios from "axios";

interface Care {
  id: string; // 🔥 FIX: phải là string
  name: string;
  petName: string;
  phone: string;
  email: string;
  address: string;
  vaccineCount: number;
  createdAt: string;
}

const CustomerCare = () => {
  const [data, setData] = useState<Care[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Care | null>(null);
  const [form] = Form.useForm();

  // 👉 load data
  const fetchData = async () => {
    const res = await axios.get("http://localhost:3000/care");
    setData(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 👉 thêm
  const handleAdd = () => {
    setEditing(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  // 👉 sửa
  const handleEdit = (record: Care) => {
    setEditing(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  // 👉 submit
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      console.log("DATA SUBMIT:", values);

      if (editing) {
        // 👉 chỉ sửa SĐT
        await axios.patch(`http://localhost:3000/care/${editing.id}`, {
          phone: values.phone,
        });

        message.success("Cập nhật SĐT thành công");
      } else {
        const newItem = {
          id: Date.now().toString(), // 🔥 FIX ID
          name: values.name,
          petName: values.petName,
          phone: values.phone,
          email: values.email,
          address: values.address,
          vaccineCount: values.vaccineCount,
          createdAt: new Date().toLocaleDateString(),
        };

        await axios.post("http://localhost:3000/care", newItem);
        message.success("Thêm thành công");
      }

      fetchData();
      setIsModalOpen(false);
    } catch (err) {
      console.log("Lỗi:", err);
      message.error("Có lỗi xảy ra!");
    }
  };

  const columns: ColumnsType<Care> = [
    { title: "Tên chủ", dataIndex: "name" },
    { title: "Tên thú cưng", dataIndex: "petName" },
    { title: "SĐT", dataIndex: "phone" },
    { title: "Email", dataIndex: "email" },
    { title: "Địa chỉ", dataIndex: "address" },

    {
      title: "Số mũi tiêm",
      dataIndex: "vaccineCount",
      render: (count) => (
        <Tag color={count >= 3 ? "green" : "orange"}>
          {count} mũi
        </Tag>
      ),
    },

    { title: "Ngày tạo", dataIndex: "createdAt" },

    {
      title: "Hành động",
      render: (_, record) => (
        <Button onClick={() => handleEdit(record)}>
          Sửa SĐT
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Chăm sóc khách hàng</h2>

      <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
        <Card>👥 Tổng khách: {data.length}</Card>
      </div>

      <Button type="primary" onClick={handleAdd} style={{ marginBottom: 10 }}>
        Thêm khách
      </Button>

      <Table rowKey="id" columns={columns} dataSource={data} />

      <Modal
        title={editing ? "Sửa SĐT" : "Thêm khách"}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên chủ" rules={[{ required: true }]}>
            <Input disabled={!!editing} />
          </Form.Item>

          <Form.Item name="petName" label="Tên thú cưng" rules={[{ required: true }]}>
            <Input disabled={!!editing} />
          </Form.Item>

          <Form.Item
            name="phone"
            label="SĐT"
            rules={[{ required: true, message: "Nhập SĐT!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="email" label="Email">
            <Input disabled={!!editing} />
          </Form.Item>

          <Form.Item name="address" label="Địa chỉ">
            <Input disabled={!!editing} />
          </Form.Item>

          <Form.Item
            name="vaccineCount"
            label="Số mũi tiêm"
            rules={[{ required: true }]}
          >
            <Input type="number" disabled={!!editing} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomerCare;