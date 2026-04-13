import React, { useState, useEffect } from "react";
import {
  Table,
  Space,
  Button,
  Modal,
  Form,
  Input,
  message,
  Upload,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import axios from "axios";

const Post = () => {
  const [data, setData] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    const res = await axios.get("http://localhost:5000/api/news");
    setData(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔥 FIX UPLOAD → BASE64
  const handleUpload = (info: any) => {
    const file = info.fileList[0];

    if (file?.originFileObj) {
      const reader = new FileReader();

      reader.onload = () => {
        form.setFieldsValue({
          image: reader.result,
        });
      };

      reader.readAsDataURL(file.originFileObj);
    }
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();

    const newData = {
      ...values,
      createdAt: new Date().toLocaleDateString(),
    };

    if (editing) {
      await axios.put(
        `http://localhost:5000/api/news/${editing.id}`,
        newData
      );
      message.success("Sửa thành công");
    } else {
      await axios.post("http://localhost:5000/api/news", newData);
      message.success("Thêm thành công");
    }

    setOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await axios.delete(`http://localhost:5000/api/news/${id}`);
    message.success("Xóa thành công");
    fetchData();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Quản lý tin tức</h2>

      <Button
        type="primary"
        onClick={() => {
          setEditing(null);
          form.resetFields();
          setOpen(true);
        }}
      >
        Thêm bài viết
      </Button>

      <Table
        dataSource={data}
        rowKey="id"
        columns={[
          { title: "Tiêu đề", dataIndex: "title" },
          { title: "Mô tả", dataIndex: "description" },
          {
            title: "Ảnh",
            dataIndex: "image",
            render: (img) => (
              <img src={img} width={80} style={{ borderRadius: 8 }} />
            ),
          },
          {
            title: "Hành động",
            render: (_, record) => (
              <Space>
                <Button
                  onClick={() => {
                    setEditing(record);
                    form.setFieldsValue(record);
                    setOpen(true);
                  }}
                >
                  Sửa
                </Button>
                <Button danger onClick={() => handleDelete(record.id)}>
                  Xóa
                </Button>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title={editing ? "Sửa bài" : "Thêm bài"}
        open={open}
        onOk={handleSubmit}
        onCancel={() => setOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            name="image"
            label="Ảnh"
            rules={[{ required: true }]}
          >
            <Upload beforeUpload={() => false} onChange={handleUpload}>
              <Button icon={<PlusOutlined />}>Upload ảnh</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Post;