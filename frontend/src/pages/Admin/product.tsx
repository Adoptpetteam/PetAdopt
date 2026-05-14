import { useEffect, useState, useCallback, useRef } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Typography,
  Image,
  Select,
  Tag,
  Upload,
} from "antd";
import { UploadOutlined, LoadingOutlined, PictureOutlined } from "@ant-design/icons";
import { apiClient } from "../../api/http";
import type { ColumnsType } from "antd/es/table";

const { Title } = Typography;

interface ProductRow {
  _id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  description?: string;
  category?: string;
  brand?: string;
}

interface Category {
  _id: string;
  name: string;
  description?: string;
}

const ProductPage = () => {
  const [data, setData] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form] = Form.useForm();

  // Hàm lấy token và header dùng chung
  const getAuthHeader = () => {
    const token = localStorage.getItem("admin_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // 👉 Tải danh sách categories từ API
  const loadCategories = useCallback(async () => {
    try {
      const res = await apiClient.get("/category");
      const result = res.data.data || res.data;
      setCategories(Array.isArray(result) ? result : []);
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Không thể tải danh sách danh mục");
    }
  }, []);

  // 👉 Tải danh sách sản phẩm từ API
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/products", {
        headers: getAuthHeader(),
        params: { limit: 100, page: 1 },
      });
      // Kiểm tra cấu trúc data trả về từ backend của bạn
      const result = res.data.data || res.data;
      setData(Array.isArray(result) ? result : []);
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [loadProducts, loadCategories]);

  // 👉 Mở modal (Thêm mới hoặc Chỉnh sửa)
  const handleOpenModal = (product: ProductRow | null = null) => {
    setEditingProduct(product);
    if (product) {
      form.setFieldsValue(product);
      setImagePreview(product.image || "");
    } else {
      form.resetFields();
      setImagePreview("");
    }
    setIsModalOpen(true);
  };

  // Upload ảnh lên server
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      message.error("Chỉ chấp nhận file ảnh");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      message.error("Ảnh không được vượt quá 5MB");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const token = localStorage.getItem("admin_token");
      const res = await apiClient.post("/products/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const imageUrl = res.data.imageUrl;
      const fullUrl = imageUrl.startsWith("http")
        ? imageUrl
        : `http://localhost:5000${imageUrl}`;
      form.setFieldValue("image", fullUrl);
      setImagePreview(fullUrl);
      message.success("Tải ảnh lên thành công");
    } catch {
      message.error("Tải ảnh thất bại");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // 👉 Xử lý Lưu dữ liệu (Submit Form)
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      
      const config = { headers: getAuthHeader() };

      if (editingProduct) {
        await apiClient.put(`/products/${editingProduct._id}`, values, config);
        message.success("Cập nhật sản phẩm thành công");
      } else {
        await apiClient.post("/products", values, config);
        message.success("Thêm sản phẩm mới thành công");
      }

      setIsModalOpen(false);
      loadProducts();
    } catch (e: any) {
      if (e?.errorFields) return; // Lỗi validation tại giao diện
      message.error(e?.response?.data?.message || "Có lỗi xảy ra khi lưu");
    } finally {
      setSubmitting(false);
    }
  };

  // 👉 Xử lý Xóa sản phẩm
  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/products/${id}`, {
        headers: getAuthHeader(),
      });
      message.success("Đã xóa sản phẩm");
      loadProducts();
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Xóa thất bại");
    }
  };

  const columns: ColumnsType<ProductRow> = [
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      width: 90,
      render: (img) => (
        <Image
          src={img}
          alt="product"
          width={60}
          height={60}
          style={{ objectFit: "cover", borderRadius: 4 }}
          fallback="https://placehold.co/60x60?text=No+Img"
        />
      ),
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      width: 250,
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      width: 120,
      render: (price) => (
        <span style={{ fontWeight: 500 }}>
          {new Intl.NumberFormat("vi-VN").format(price || 0)} đ
        </span>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      width: 150,
      render: (categoryName) => {
        return categoryName ? (
          <Tag color="blue">{categoryName}</Tag>
        ) : (
          <Tag color="default">Chưa phân loại</Tag>
        );
      },
    },
    {
      title: "Thương hiệu",
      dataIndex: "brand",
      key: "brand",
      width: 120,
      render: (brand) => brand || <span style={{ color: '#999' }}>Chưa có</span>,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      align: "center",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true, // Nếu mô tả dài quá sẽ hiện dấu ...
    },
    {
      title: "Hành động",
      key: "action",
      width: 160,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="primary" 
            size="small" 
            onClick={() => handleOpenModal(record)}
          >
            Sửa
          </Button>

          <Popconfirm
            title="Xác nhận xóa?"
            description={`Bạn có chắc muốn xóa ${record.name}?`}
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true, size: "small" }}
            cancelButtonProps={{ size: "small" }}
          >
            <Button danger size="small">Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: 16 }}>
        <Title level={4}>Quản lý sản phẩm</Title>
        <Button type="primary" onClick={() => handleOpenModal()}>
          Thêm sản phẩm
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="_id"
        loading={loading}
        bordered
        pagination={{ pageSize: 8 }}
      />

      <Modal
        title={editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={submitting}
        destroyOnClose
        okText="Xác nhận"
        cancelText="Hủy bỏ"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input />
          </Form.Item>

          <Form.Item name="image" label="Ảnh sản phẩm" rules={[{ required: true, message: 'Vui lòng chọn ảnh' }]}>
            <div className="space-y-3">
              {/* Preview ảnh */}
              {imagePreview && (
                <div className="flex justify-center">
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="w-32 h-32 object-cover rounded-lg border shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/128x128?text=No+Image";
                    }}
                  />
                </div>
              )}

              {/* Nút chọn file */}
              <div className="flex gap-2 items-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  icon={uploading ? <LoadingOutlined /> : <UploadOutlined />}
                  onClick={() => fileInputRef.current?.click()}
                  loading={uploading}
                  className="rounded-lg"
                >
                  {uploading ? "Đang tải..." : "Chọn ảnh từ máy"}
                </Button>
                {imagePreview && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <PictureOutlined /> Đã chọn ảnh
                  </span>
                )}
              </div>

              {/* Hoặc nhập link thủ công */}
              <div>
                <div className="text-xs text-gray-400 mb-1">Hoặc nhập link ảnh:</div>
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={imagePreview}
                  onChange={(e) => {
                    setImagePreview(e.target.value);
                    form.setFieldValue("image", e.target.value);
                  }}
                  className="rounded-lg"
                />
              </div>
            </div>
          </Form.Item>

          <div style={{ display: "flex", gap: "16px" }}>
            <Form.Item name="price" label="Giá" rules={[{ required: true }]} style={{ flex: 1 }}>
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>

            <Form.Item name="quantity" label="Số lượng" rules={[{ required: true }]} style={{ flex: 1 }}>
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            <Form.Item 
              name="category" 
              label="Danh mục" 
              rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]} 
              style={{ flex: 1 }}
            >
              <Select 
                placeholder="Chọn danh mục sản phẩm"
                loading={categories.length === 0}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              >
                {categories.map(cat => (
                  <Select.Option key={cat._id} value={cat.name} label={cat.name}>
                    {cat.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="brand" label="Thương hiệu" style={{ flex: 1 }}>
              <Input placeholder="Nhập tên thương hiệu" />
            </Form.Item>
          </div>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả chi tiết về sản phẩm" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductPage;