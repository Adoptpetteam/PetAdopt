import React from 'react';
import { Form, Input, Button, Select, Card, message } from 'antd';
import { useCreateCategory } from "../../../hook/huyHook";
import { useNavigate } from 'react-router-dom';

const AddCategory = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { mutate: addCategory, isPending } = useCreateCategory({ resource: "category" });

  const onFinish = (values: any) => {
    addCategory(values, {
      onSuccess: () => {
        message.success("Thêm danh mục mới thành công!");
        navigate("/admin/categories"); // Quay lại danh sách
      },
      onError: () => {
        message.error("Có lỗi xảy ra khi thêm danh mục.");
      }
    });
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Thêm danh mục mới" style={{ maxWidth: 600, margin: '0 auto' }}>
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ status: 'on' }}>
          <Form.Item
            name="name"
            label="Tên danh mục (Ví dụ: Chó, Mèo, Bò...)"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
          >
            <Input placeholder="Nhập tên con vật..." />
          </Form.Item>

          <Form.Item name="status" label="Trạng thái">
            <Select>
              <Select.Option value="on">Hoạt động</Select.Option>
              <Select.Option value="off">Tạm dừng</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isPending} block>
              Tạo danh mục
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddCategory;