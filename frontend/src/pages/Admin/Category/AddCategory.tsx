import { Form, Input, Button, Select, Card, message } from 'antd';
import { apiClient } from "../../../api/http";
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const AddCategory = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [isPending, setIsPending] = useState(false);

  const onFinish = async (values: any) => {
    setIsPending(true);
    try {
      await apiClient.post("/category", values);
      message.success("Thêm danh mục mới thành công!");
      navigate("/admin/categories");
    } catch (error: any) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra khi thêm danh mục.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 min-h-screen">
      <Card 
        title={
          <span className="text-xl font-bold text-[#6272B6]">
            ➕ Thêm danh mục mới
          </span>
        }
        className="max-w-2xl mx-auto border-0 shadow-lg rounded-2xl"
      >
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={onFinish} 
          initialValues={{ isActive: true, type: 'pet' }}
        >
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
          >
            <Input placeholder="Ví dụ: Chó, Mèo, Thức ăn..." size="large" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Loại danh mục"
            rules={[{ required: true, message: 'Vui lòng chọn loại danh mục!' }]}
          >
            <Select size="large">
              <Select.Option value="pet">🐾 Thú cưng</Select.Option>
              <Select.Option value="product">📦 Sản phẩm</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea 
              rows={3} 
              placeholder="Mô tả về danh mục này..."
              size="large"
            />
          </Form.Item>

          <Form.Item name="icon" label="Icon">
            <Input 
              placeholder="Ví dụ: 🐕, 🐈, 📦, 🧸" 
              size="large"
            />
          </Form.Item>

          <Form.Item name="color" label="Màu chủ đề">
            <Input 
              placeholder="Ví dụ: #6272B6, blue, green" 
              size="large"
            />
          </Form.Item>

          <Form.Item name="image" label="URL hình ảnh">
            <Input 
              placeholder="https://example.com/image.jpg hoặc /uploads/image.jpg" 
              size="large"
            />
          </Form.Item>

          <Form.Item name="isActive" label="Trạng thái">
            <Select size="large">
              <Select.Option value={true}>Hoạt động</Select.Option>
              <Select.Option value={false}>Tạm dừng</Select.Option>
            </Select>
          </Form.Item>

          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-600">
              💡 <strong>Gợi ý:</strong> Chọn loại danh mục phù hợp (Thú cưng hoặc Sản phẩm) và điền đầy đủ thông tin
            </p>
          </div>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isPending} 
              block
              size="large"
              className="bg-gradient-to-r from-[#6272B6] to-purple-600 border-0 h-12 rounded-full"
            >
              Tạo danh mục
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddCategory;