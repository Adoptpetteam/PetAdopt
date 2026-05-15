import { useState, useEffect } from "react";
import { Table, Button, Space, Popconfirm, Typography, Tag, Modal, Form, Input, message, Card, Upload } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../api/http";

interface IPetCategory {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  type: 'pet';
}

const PetCategories: React.FC = () => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [data, setData] = useState<IPetCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<IPetCategory | null>(null);

  // Fetch pet categories
  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get("/category?type=pet");
      setData(res.data.data || []);
    } catch (error) {
      message.error("Không thể tải danh mục");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
    form.resetFields();
  };

  const handleOpenEditModal = (record: IPetCategory) => {
    setEditingCategory(record);
    setIsModalOpen(true);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      image: record.image
    });
  };

  const onFinish = async (values: any) => {
    try {
      const payload = {
        ...values,
        type: 'pet'
      };

      if (editingCategory) {
        await apiClient.put(`/category/${editingCategory._id}`, payload);
        message.success("Cập nhật thành công!");
      } else {
        await apiClient.post("/category", payload);
        message.success("Thêm mới thành công!");
      }
      
      setIsModalOpen(false);
      fetchCategories();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/category/${id}`);
      message.success("Xóa thành công!");
      fetchCategories();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể xóa danh mục");
    }
  };

  const columns: ColumnsType<IPetCategory> = [
    {
      title: "Hình ảnh",
      dataIndex: "image",
      width: 100,
      render: (image) => (
        image ? (
          <img 
            src={image.startsWith('http') ? image : `http://localhost:5000${image}`} 
            alt="category" 
            className="w-16 h-16 object-cover rounded-lg"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-2xl">🐾</span>
          </div>
        )
      )
    },
    {
      title: "Tên danh mục",
      dataIndex: "name",
      render: (text) => <b style={{ color: "#6272B6" }}>{text}</b>
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      render: (text) => text || <span className="text-gray-400">Chưa có mô tả</span>
    },
    {
      title: "Loại",
      dataIndex: "type",
      render: () => <Tag color="blue">Pet</Tag>
    },
    {
      title: "Hành động",
      width: 150,
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            ghost 
            size="small" 
            icon={<EditOutlined />} 
            onClick={() => handleOpenEditModal(record)}
            className="border-[#6272B6] text-[#6272B6] hover:bg-[#6272B6] hover:text-white"
          />
          <Popconfirm
            title="Xóa danh mục?"
            description="Bạn có chắc muốn xóa danh mục này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 min-h-screen">
      <Card className="border-0 shadow-lg rounded-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Typography.Title level={3} className="!mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6272B6] to-purple-600">
                🐾 Danh mục Thú cưng
              </span>
            </Typography.Title>
            <p className="text-gray-500">Quản lý các loại thú cưng (Chó, Mèo, Chim...)</p>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleOpenAddModal}
            className="bg-gradient-to-r from-[#6272B6] to-purple-600 border-0 h-10 px-6 rounded-full"
          >
            Thêm danh mục
          </Button>
        </div>
        <Table 
          rowKey="_id" 
          loading={isLoading} 
          columns={columns} 
          dataSource={data} 
          pagination={{ pageSize: 10 }}
          className="rounded-lg overflow-hidden"
        />
      </Card>

      <Modal 
        title={
          <span className="text-xl font-bold text-[#6272B6]">
            {editingCategory ? "✏️ Chỉnh sửa danh mục" : "➕ Thêm danh mục mới"}
          </span>
        }
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)} 
        onOk={() => form.submit()}
        okText={editingCategory ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={onFinish} className="mt-4">
          <Form.Item 
            name="name" 
            label="Tên danh mục" 
            rules={[{ required: true, message: "Vui lòng nhập tên danh mục" }]}
          >
            <Input placeholder="Ví dụ: Chó, Mèo, Chim..." size="large" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea 
              rows={3} 
              placeholder="Mô tả về loại thú cưng này..."
              size="large"
            />
          </Form.Item>

          <Form.Item name="image" label="URL hình ảnh">
            <Input 
              placeholder="https://example.com/image.jpg hoặc /uploads/image.jpg" 
              size="large"
            />
          </Form.Item>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              💡 <strong>Gợi ý:</strong> Sử dụng hình ảnh từ Unsplash hoặc upload vào thư mục uploads
            </p>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default PetCategories;
