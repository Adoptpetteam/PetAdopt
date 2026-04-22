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
import { apiClient } from "../../api/http";
import {
  listNews,
  createNews,
  updateNews,
  deleteNews,
} from "../../api/newsApi";

const Post = () => {
  const [data, setData] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    try {
      const res = await listNews({ limit: 100 });
      setData(res.data || []);
    } catch {
      message.error("Không tải được danh sách tin tức");
    }
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

    try {
      if (editing) {
        await updateNews(editing._id, values);
        message.success("Sửa thành công");
      } else {
        await createNews({ ...values, status: "published" });
        message.success("Thêm thành công");
      }
      setOpen(false);
      fetchData();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Thao tác thất bại");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNews(id);
      message.success("Xóa thành công");
      fetchData();
    } catch {
      message.error("Xóa thất bại");
    }
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
        rowKey="_id"
        columns={[
          { title: "Tiêu đề", dataIndex: "title" },
          { title: "Mô tả", dataIndex: "description" },
          {
            title: "Ảnh",
            dataIndex: "image",
            render: (img) =>
              img ? <img src={img} width={80} style={{ borderRadius: 8 }} /> : null,
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
                <Button danger onClick={() => handleDelete(record._id)}>
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

          <Form.Item name="content" label="Nội dung">
            <Input.TextArea rows={4} />
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