import { useState, useEffect } from "react";
import { Table, Button, Space, Popconfirm, Typography, Tag, Modal, Form, Input, message, Select, Card, Tabs } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { apiClient } from "../../../api/http";

interface ICategory {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  icon?: string;
  color?: string;
  type: 'pet' | 'product';
  isActive: boolean;
}

const ListCategory: React.FC = () => {
  const [form] = Form.useForm();
  const [petData, setPetData] = useState<ICategory[]>([]);
  const [productData, setProductData] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);
  const [currentType, setCurrentType] = useState<'pet' | 'product'>('pet');

  // Fetch categories by type
  const fetchCategories = async (type: 'pet' | 'product') => {
    setIsLoading(true);
    try {
      const res = await apiClient.get("/category", { params: { type } });
      if (type === 'pet') {
        setPetData(res.data.data || []);
      } else {
        setProductData(res.data.data || []);
      }
    } catch (error) {
      message.error("Không thể tải danh mục");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories('pet');
    fetchCategories('product');
  }, []);

  const handleOpenAddModal = (type: 'pet' | 'product') => {
    setEditingCategory(null);
    setCurrentType(type);
    setIsModalOpen(true);
    form.resetFields();
    form.setFieldsValue({ isActive: true, type });
  };

  const handleOpenEditModal = (record: ICategory) => {
    setEditingCategory(record);
    setCurrentType(record.type);
    setIsModalOpen(true);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      image: record.image,
      icon: record.icon,
      color: record.color,
      isActive: record.isActive,
      type: record.type
    });
  };

  const onFinish = async (values: any) => {
    try {
      console.log('[ListCategory] Form values:', values);
      console.log('[ListCategory] Current type:', currentType);
      
      // Đảm bảo type được gửi đi
      const payload = {
        ...values,
        type: values.type || currentType // Ưu tiên type từ form, fallback về currentType
      };
      
      console.log('[ListCategory] Payload to send:', payload);
      
      if (editingCategory) {
        console.log('[ListCategory] Updating category:', editingCategory._id);
        await apiClient.put(`/category/${editingCategory._id}`, payload);
        message.success("Cập nhật thành công!");
      } else {
        console.log('[ListCategory] Creating new category');
        const response = await apiClient.post("/category", payload);
        console.log('[ListCategory] Response:', response.data);
        message.success("Thêm mới thành công!");
      }
      
      setIsModalOpen(false);
      fetchCategories('pet');
      fetchCategories('product');
    } catch (error: any) {
      console.error('[ListCategory] Error:', error);
      console.error('[ListCategory] Error response:', error.response?.data);
      message.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id: string, type: 'pet' | 'product') => {
    try {
      await apiClient.delete(`/category/${id}`);
      message.success("Xóa thành công!");
      fetchCategories(type);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể xóa danh mục");
    }
  };

  const createColumns = (type: 'pet' | 'product'): ColumnsType<ICategory> => [
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
            <span className="text-2xl">{type === 'pet' ? '🐾' : '📦'}</span>
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
      title: "Icon",
      dataIndex: "icon",
      width: 80,
      render: (icon) => <span className="text-2xl">{icon || (type === 'pet' ? '🐾' : '📦')}</span>
    },
    {
      title: "Màu",
      dataIndex: "color",
      width: 100,
      render: (color) => (
        <Tag color={color || 'default'}>
          {color ? color : 'Mặc định'}
        </Tag>
      )
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      width: 120,
      render: (isActive) => (
        <Tag color={isActive ? "green" : "volcano"}>
          {isActive ? "Hoạt động" : "Tạm dừng"}
        </Tag>
      )
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
            onConfirm={() => handleDelete(record._id, type)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'pet',
      label: (
        <span className="text-base font-medium">
          🐾 Danh mục Thú cưng
        </span>
      ),
      children: (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-500">Quản lý các loại thú cưng (Chó, Mèo, Chim...)</p>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => handleOpenAddModal('pet')}
              className="bg-gradient-to-r from-[#6272B6] to-purple-600 border-0 h-10 px-6 rounded-full"
            >
              Thêm danh mục
            </Button>
          </div>
          <Table 
            rowKey="_id" 
            loading={isLoading} 
            columns={createColumns('pet')} 
            dataSource={petData} 
            pagination={{ pageSize: 10 }}
            className="rounded-lg overflow-hidden"
          />
        </div>
      )
    },
    {
      key: 'product',
      label: (
        <span className="text-base font-medium">
          📦 Danh mục Sản phẩm
        </span>
      ),
      children: (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-500">Quản lý các loại sản phẩm (Thức ăn, Đồ chơi, Phụ kiện...)</p>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => handleOpenAddModal('product')}
              className="bg-gradient-to-r from-[#6272B6] to-purple-600 border-0 h-10 px-6 rounded-full"
            >
              Thêm danh mục
            </Button>
          </div>
          <Table 
            rowKey="_id" 
            loading={isLoading} 
            columns={createColumns('product')} 
            dataSource={productData} 
            pagination={{ pageSize: 10 }}
            className="rounded-lg overflow-hidden"
          />
        </div>
      )
    }
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 min-h-screen">
      <Card className="border-0 shadow-lg rounded-2xl">
        <Typography.Title level={3} className="!mb-6">
          <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6272B6] to-purple-600 flex items-center gap-2">
            Quản lý Danh mục
          </span>
        </Typography.Title>
        
        <Tabs 
          defaultActiveKey="pet" 
          items={tabItems}
          size="large"
          className="category-tabs"
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
          <Form.Item name="type" hidden>
            <Input />
          </Form.Item>

          <Form.Item 
            name="name" 
            label="Tên danh mục" 
            rules={[{ required: true, message: "Vui lòng nhập tên danh mục" }]}
          >
            <Input 
              placeholder={currentType === 'pet' ? "Ví dụ: Chó, Mèo, Chim..." : "Ví dụ: Thức ăn, Đồ chơi, Phụ kiện..."} 
              size="large" 
            />
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
              placeholder={currentType === 'pet' ? "Ví dụ: 🐕, 🐈, 🐦" : "Ví dụ: 📦, 🧸, 🐾"} 
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

export default ListCategory;