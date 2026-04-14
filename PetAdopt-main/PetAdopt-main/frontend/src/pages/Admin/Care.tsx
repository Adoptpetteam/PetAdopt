import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  DatePicker,
  message,
  Tag,
  Card,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import axios from "axios";
import dayjs from "dayjs";
import emailjs from "emailjs-com";

interface Care {
  id: number;
  name: string;
  petName: string;
  phone: string;
  email: string;
  address: string;
  vaccineDate: string;
  createdAt: string;
  mailSent?: boolean; // 🔥 chống gửi spam
}

const CarePage = () => {
  const [data, setData] = useState<Care[]>([]);
  const [filteredData, setFilteredData] = useState<Care[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Care | null>(null);
  const [form] = Form.useForm();

  // 👉 load data
  const fetchData = async () => {
    const res = await axios.get("http://localhost:3000/care");
    setData(res.data);
    setFilteredData(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔥 AUTO GỬI MAIL KHI ĐẾN NGÀY (KHÔNG SPAM)
  useEffect(() => {
    const today = dayjs().format("YYYY-MM-DD");

    data.forEach((item) => {
      if (item.vaccineDate === today && !item.mailSent) {
        sendMail(item);

        // update lại DB để không gửi lại
        axios.patch(`http://localhost:3000/care/${item.id}`, {
          mailSent: true,
        });
      }
    });
  }, [data]);

  // 👉 gửi mail
  const sendMail = (item: Care) => {
    emailjs
      .send(
        "service_4bt161g",
        "template_7qxsmme", 
        {
          email: item.email, 
          name: item.name,
          date: item.vaccineDate,
        },
        "YOUR_PUBLIC_KEY" 
      )
      .then(() => {
        message.success(`Đã gửi mail cho ${item.name}`);
      })
      .catch((err) => {
        console.log(err);
        message.error("Lỗi gửi mail");
      });
  };

  // 👉 filter
  const handleFilter = (date: any) => {
    if (!date) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter(
      (item) =>
        dayjs(item.vaccineDate).format("YYYY-MM-DD") ===
        date.format("YYYY-MM-DD")
    );

    setFilteredData(filtered);
  };

  // 👉 thêm
  const handleAdd = () => {
    setEditing(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  // 👉 sửa
  const handleEdit = (record: Care) => {
    setEditing(record);
    form.setFieldsValue({
      ...record,
      vaccineDate: dayjs(record.vaccineDate),
    });
    setIsModalOpen(true);
  };


  const handleDelete = async (id: number) => {
    await axios.delete(`http://localhost:3000/care/${id}`);
    message.success("Xóa thành công");
    fetchData();
  };

  
  const handleSubmit = async () => {
const values = await form.validateFields();
    if (editing) {
      await axios.patch(`http://localhost:3000/care/${editing.id}`, {
        phone: values.phone,
      });
      message.success("Cập nhật SĐT thành công");
    } else {
      const newItem = {
        name: values.name,
        petName: values.petName,
        phone: values.phone,
        email: values.email,
        address: values.address,
        vaccineDate: values.vaccineDate.format("YYYY-MM-DD"),
        createdAt: new Date().toLocaleDateString(),
        mailSent: false, 
      };

      await axios.post("http://localhost:3000/care", newItem);
      message.success("Thêm thành công");
    }

    fetchData();
    setIsModalOpen(false);
  };

  const isNearDate = (date: string) => {
    const diff = dayjs(date).diff(dayjs(), "day");
    return diff >= 0 && diff <= 3;
  };

  const total = data.length;
  const near = data.filter((i) => isNearDate(i.vaccineDate)).length;

  const columns: ColumnsType<Care> = [
    { title: "Tên chủ", dataIndex: "name" },
    { title: "Tên thú cưng", dataIndex: "petName" },
    { title: "SĐT", dataIndex: "phone" },
    { title: "Email", dataIndex: "email" },
    { title: "Địa chỉ", dataIndex: "address" },
    {
      title: "Ngày tiêm",
      dataIndex: "vaccineDate",
      render: (date) => (
        <Tag color={isNearDate(date) ? "red" : "blue"}>
          {date} {isNearDate(date) && " (Sắp đến hạn)"}
        </Tag>
      ),
    },
    { title: "Ngày tạo", dataIndex: "createdAt" },
    {
      title: "Hành động",
      render: (_, record) => (
        <Space>
          <Button onClick={() => handleEdit(record)}>Sửa SĐT</Button>

          <Button onClick={() => sendMail(record)}>Gửi mail</Button>

          <Button danger onClick={() => handleDelete(record.id)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];
  return (
    <div style={{ padding: 20 }}>
      <h2>Chăm sóc khách hàng</h2>
      <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
        <Card> Tổng khách: {total}</Card>
        <Card> Sắp tiêm: {near}</Card>
      </div>
      <DatePicker
        onChange={handleFilter}
        style={{ marginBottom: 10 }}
        placeholder="Lọc theo ngày tiêm"
      />
      <br />
      <Button type="primary" onClick={handleAdd} style={{ marginBottom: 10 }}>
        Thêm
      </Button>
      <Table rowKey="id" columns={columns} dataSource={filteredData} />
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

          <Form.Item
            name="petName"
            label="Tên thú cưng"
            rules={[{ required: true }]}
          >
            <Input disabled={!!editing} />
          </Form.Item>

          <Form.Item name="phone" label="SĐT" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="email" label="Email">
            <Input disabled={!!editing} />
          </Form.Item>

          <Form.Item name="address" label="Địa chỉ">
            <Input disabled={!!editing} />
          </Form.Item>

          <Form.Item name="vaccineDate" label="Ngày tiêm">
            <DatePicker style={{ width: "100%" }} disabled={!!editing} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
export default CarePage;