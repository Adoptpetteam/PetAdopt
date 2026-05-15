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
  const [filteredData, setFilteredData] = useState<Customer[]>([]);
  const [searchText, setSearchText] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);

  const [form] = Form.useForm();

  // LOAD DATA
  const fetchData = async () => {
    setLoading(true);

    try {
      const res = await axios.get(
        "http://localhost:3000/customers"
      );

      setData(res.data);
      setFilteredData(res.data);
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

  // SEARCH
  useEffect(() => {
    const result = data.filter((item) =>
      item.name
        .toLowerCase()
        .includes(searchText.toLowerCase())
    );

    setFilteredData(result);
  }, [searchText, data]);

  // ADD
  const handleAdd = () => {
    setEditing(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  // EDIT
  const handleEdit = (record: Customer) => {
    setEditing(record);

    form.setFieldsValue({
      phone: record.phone,
    });

    setIsModalOpen(true);
  };

  // CLOSE MODAL
  const handleCloseModal = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  // SUBMIT
  const handleSubmit = async () => {
    const values = await form.validateFields();

    setSubmitting(true);

    try {
      if (editing) {
        await axios.patch(
          `http://localhost:3000/customers/${editing.id}`,
          {
            phone: values.phone,
          }
        );

        message.success("Cập nhật SĐT thành công");
      } else {
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

      handleCloseModal();
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
      sorter: (a, b) =>
        a.phone.localeCompare(b.phone),
    },
    {
      title: "Gmail",
      dataIndex: "email",
    },
    {
      title: "Tên pet",
      dataIndex: "petName",
      render: (text) => (
        <Tag color="blue">{text}</Tag>
      ),
    },
    {
      title: "Ngày tiêm gần nhất",
      dataIndex: "lastVaccineDate",
    },
    {
      title: "Ngày tiêm tiếp",
      dataIndex: "nextVaccineDate",
      render: (date) => (
        <Tag color="green">{date}</Tag>
      ),
    },
    {
      title: "Ngày tạo đơn",
      dataIndex: "createdAt",
      sorter: (a, b) =>
        a.createdAt.localeCompare(b.createdAt),
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <Space>
          <Button
            onClick={() =>
              handleEdit(record)
            }
          >
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
            gap: 12,
            marginBottom: 20,
          }}
        >
          <h2>Thông tin khách hàng</h2>

          <Space>
            <Input
              placeholder="Tìm theo tên..."
              value={searchText}
              onChange={(e) =>
                setSearchText(
                  e.target.value
                )
              }
              style={{ width: 220 }}
            />

            <Button
              onClick={fetchData}
            >
              Refresh
            </Button>

            <Button
              type="primary"
              onClick={handleAdd}
            >
              Thêm khách hàng
            </Button>
          </Space>
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          bordered
          pagination={{
            pageSize: 5,
          }}
          scroll={{
            x: "max-content",
          }}
        />
      </Card>

      <Modal
        title={
          editing
            ? "Sửa SĐT"
            : "Thêm khách hàng"
        }
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Tên khách hàng"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input
              disabled={!!editing}
            />
          </Form.Item>

          <Form.Item
            name="phone"
            label="SĐT"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Gmail"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input
              disabled={!!editing}
            />
          </Form.Item>

          <Form.Item
            name="petName"
            label="Tên pet"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input
              disabled={!!editing}
            />
          </Form.Item>

          <Form.Item
            name="lastVaccineDate"
            label="Ngày tiêm gần nhất"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input
              disabled={!!editing}
            />
          </Form.Item>

          <Form.Item
            name="nextVaccineDate"
            label="Ngày tiêm tiếp theo"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input
              disabled={!!editing}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}