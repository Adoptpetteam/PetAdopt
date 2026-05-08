import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Tag,
  Card,
  Space,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import axios from "axios";

interface Care {
  id: string;
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
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Care | null>(null);

  const [form] = Form.useForm();

  // FETCH
  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await axios.get("http://localhost:3000/care");

      setData(res.data);
    } catch (error) {
      message.error("Không lấy được dữ liệu!");
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

  // EDIT
  const handleEdit = (record: Care) => {
    setEditing(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  // DELETE
  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc muốn xóa khách hàng này không?",
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: {
        danger: true,
      },

      async onOk() {
        try {
          await axios.delete(`http://localhost:3000/care/${id}`);

          message.success("Xóa thành công");

          fetchData();
        } catch (error) {
          message.error("Xóa thất bại!");
        }
      },
    });
  };

  // SUBMIT
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editing) {
        await axios.patch(
          `http://localhost:3000/care/${editing.id}`,
          {
            phone: values.phone,
          }
        );

        message.success("Cập nhật SĐT thành công");
      } else {
        const newItem = {
          id: Date.now().toString(),
          name: values.name,
          petName: values.petName,
          phone: values.phone,
          email: values.email,
          address: values.address,
          vaccineCount: Number(values.vaccineCount),
          createdAt: new Date().toLocaleString("vi-VN"),
        };

        await axios.post(
          "http://localhost:3000/care",
          newItem
        );

        message.success("Thêm khách thành công");
      }

      fetchData();

      setIsModalOpen(false);

      form.resetFields();
    } catch (err) {
      console.log("Lỗi:", err);

      message.error("Có lỗi xảy ra!");
    }
  };

  // COLUMNS
  const columns: ColumnsType<Care> = [
    {
      title: "Tên chủ",
      dataIndex: "name",
    },

    {
      title: "Tên thú cưng",
      dataIndex: "petName",
    },

    {
      title: "SĐT",
      dataIndex: "phone",
    },

    {
      title: "Email",
      dataIndex: "email",
    },

    {
      title: "Địa chỉ",
      dataIndex: "address",
    },

    {
      title: "Số mũi tiêm",
      dataIndex: "vaccineCount",
      render: (count) => (
        <Tag color={count >= 3 ? "green" : "orange"}>
          {count} mũi
        </Tag>
      ),
    },

    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
    },

    {
      title: "Hành động",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>

          <Button
            danger
            onClick={() => handleDelete(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>

      {/* TITLE */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h2
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#6272B6",
          }}
        >
          Chăm sóc khách hàng
        </h2>

        <Button
          type="primary"
          size="large"
          onClick={handleAdd}
        >
          Thêm khách
        </Button>
      </div>

      {/* CARD */}
      <div
        style={{
          display: "flex",
          gap: 20,
          marginBottom: 20,
        }}
      >
        <Card
          style={{
            width: 220,
            borderRadius: 12,
          }}
        >
          👥 Tổng khách: <b>{data.length}</b>
        </Card>
      </div>

      {/* TABLE */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        bordered
        pagination={{
          pageSize: 5,
        }}
      />

      {/* MODAL */}
      <Modal
        title={editing ? "Sửa SĐT" : "Thêm khách"}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        okText={editing ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
        >

          <Form.Item
            name="name"
            label="Tên chủ"
            rules={[
              {
                required: true,
                message: "Nhập tên chủ!",
              },
            ]}
          >
            <Input disabled={!!editing} />
          </Form.Item>

          <Form.Item
            name="petName"
            label="Tên thú cưng"
            rules={[
              {
                required: true,
                message: "Nhập tên thú cưng!",
              },
            ]}
          >
            <Input disabled={!!editing} />
          </Form.Item>

          <Form.Item
            name="phone"
            label="SĐT"
            rules={[
              {
                required: true,
                message: "Nhập SĐT!",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
          >
            <Input disabled={!!editing} />
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa chỉ"
          >
            <Input disabled={!!editing} />
          </Form.Item>

          <Form.Item
            name="vaccineCount"
            label="Số mũi tiêm"
            rules={[
              {
                required: true,
                message: "Nhập số mũi tiêm!",
              },
            ]}
          >
            <Input
              type="number"
              disabled={!!editing}
            />
          </Form.Item>

        </Form>
      </Modal>
    </div>
  );
};

export default CustomerCare;