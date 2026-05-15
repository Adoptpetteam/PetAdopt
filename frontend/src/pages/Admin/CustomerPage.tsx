import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Tag,
  Card,
} from "antd";
import axios from "axios";
import type { ColumnsType } from "antd/es/table";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  petName: string;
  lastVaccineDate: string;
  nextVaccineDate: string;
  createdAt: string;
}

export default function CustomerInfo() {
  const [data, setData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);

  const [form] = Form.useForm();

  // LOAD DATA
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:3000/customers");
      setData(res.data);
    } catch (err) {
      console.log(err);
      message.error("Không tải được dữ liệu khách hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ADD
  const handleAdd = () => {
    setEditing(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  // EDIT PHONE
  const handleEdit = (record: Customer) => {
    setEditing(record);

    form.setFieldsValue({
      phone: record.phone,
    });

    setIsModalOpen(true);
  };

  // SUBMIT
  const handleSubmit = async () => {
    const values = await form.validateFields();

    setSubmitting(true);

    try {
      // EDIT
      if (editing) {
        await axios.patch(
          `http://localhost:3000/customers/${editing.id}`,
          {
            phone: values.phone,
          }
        );

        message.success("Cập nhật SĐT thành công");
      }

      // ADD
      else {
        const newCustomer = {
          id: Date.now().toString(),
          name: values.name,
          phone: values.phone,
          email: values.email,
          petName: values.petName,
          lastVaccineDate: values.lastVaccineDate,
          nextVaccineDate: values.nextVaccineDate,
          createdAt: new Date().toLocaleDateString(),
        };

        await axios.post(
          "http://localhost:3000/customers",
          newCustomer
        );

        message.success("Thêm khách hàng thành công");
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.log(err);
      message.error("Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnsType<Customer> = [
    {
      title: "Tên khách",
      dataIndex: "name",
      width: 150,
    },
    {
      title: "SĐT",
      dataIndex: "phone",
      width: 140,
    },
    {
      title: "Gmail",
      dataIndex: "email",
    },
    {
      title: "Tên pet",
      dataIndex: "petName",
      render: (text) => <Tag color="blue">{text}</Tag>,
      width: 120,
    },
    {
      title: "Ngày tiêm gần nhất",
      dataIndex: "lastVaccineDate",
      width: 150,
    },
    {
      title: "Ngày tiêm tiếp",
      dataIndex: "nextVaccineDate",
      render: (date) => <Tag color="green">{date}</Tag>,
      width: 150,
    },
    {
      title: "Ngày tạo đơn",
      dataIndex: "createdAt",
      width: 120,
    },
    {
      title: "Hành động",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button onClick={() => handleEdit(record)}>
            Sửa SĐT
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <h2>Thông tin khách hàng</h2>

          <Button type="primary" onClick={handleAdd}>
            Thêm khách hàng
          </Button>
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          bordered
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <Modal
        title={editing ? "Sửa SĐT" : "Thêm khách hàng"}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên khách hàng"
            rules={[{ required: true }]}
          >
            <Input
              placeholder="Nhập tên khách hàng"
              disabled={!!editing}
            />
          </Form.Item>

          <Form.Item
            name="phone"
            label="SĐT"
            rules={[{ required: true }]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Gmail"
            rules={[{ required: true }]}
          >
            <Input
              placeholder="Nhập email"
              disabled={!!editing}
            />
          </Form.Item>

          <Form.Item
            name="petName"
            label="Tên pet"
            rules={[{ required: true }]}
          >
            <Input
              placeholder="Nhập tên thú cưng"
              disabled={!!editing}
            />
          </Form.Item>

          <Form.Item
            name="lastVaccineDate"
            label="Ngày tiêm gần nhất"
            rules={[{ required: true }]}
          >
            <Input
              placeholder="VD: 10/05/2026"
              disabled={!!editing}
            />
          </Form.Item>

          <Form.Item
            name="nextVaccineDate"
            label="Ngày tiêm tiếp theo"
            rules={[{ required: true }]}
          >
            <Input
              placeholder="VD: 10/06/2026"
              disabled={!!editing}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}