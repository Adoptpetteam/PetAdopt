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
  Checkbox,
  Card,
  Divider,
  Row,
  Col,
} from "antd";
import { UploadOutlined, LoadingOutlined, PictureOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { apiClient } from "../../api/http";
import type { ColumnsType } from "antd/es/table";

const { Title } = Typography;

const PRODUCT_CATEGORIES = [
  "Thức ăn",
  "Vệ sinh & Làm sạch",
  "Phụ kiện đồ chơi",
];

interface ProductVariant {
  _id?: string;
  name: string;
  sku?: string;
  price: number;
  quantity: number;
  attributes?: {
    size?: string;
    weight?: string;
    flavor?: string;
    age?: string;
    color?: string;
  };
  image?: string;
  isActive?: boolean;
}

interface ProductRow {
  _id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  description?: string;
  category?: string;
  brand?: string;
  hasVariants?: boolean;
  variants?: ProductVariant[];
}

const ProductPage = () => {
  const [data, setData] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form] = Form.useForm();

  const getAuthHeader = () => {
    const token = localStorage.getItem("admin_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/products", {
        headers: getAuthHeader(),
        params: { limit: 100, page: 1 },
      });
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
  }, [loadProducts]);

  const handleOpenModal = (product: ProductRow | null = null) => {
    setEditingProduct(product);
    if (product) {
      form.setFieldsValue(product);
      setImagePreview(product.image || "");
      setHasVariants(product.hasVariants || false);
      setVariants(product.variants || []);
    } else {
      form.resetFields();
      setImagePreview("");
      setHasVariants(false);
      setVariants([]);
    }
    setIsModalOpen(true);
  };

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

  // Thêm variant mới
  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        name: "",
        sku: "",
        price: 0,
        quantity: 0,
        attributes: {},
        isActive: true,
      },
    ]);
  };

  // Xóa variant
  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  // Cập nhật variant
  const handleVariantChange = (index: number, field: string, value: any) => {
    const newVariants = [...variants];
    if (field.startsWith("attributes.")) {
      const attrField = field.split(".")[1];
      newVariants[index].attributes = {
        ...newVariants[index].attributes,
        [attrField]: value,
      };
    } else {
      (newVariants[index] as any)[field] = value;
    }
    setVariants(newVariants);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Validate variants nếu có
      if (hasVariants) {
        if (variants.length === 0) {
          message.error("Vui lòng thêm ít nhất 1 biến thể");
          return;
        }
        
        for (let i = 0; i < variants.length; i++) {
          const v = variants[i];
          if (!v.name || !v.price || v.quantity === undefined) {
            message.error(`Biến thể ${i + 1}: Vui lòng điền đầy đủ tên, giá và số lượng`);
            return;
          }
        }
      }

      setSubmitting(true);
      
      const payload = {
        ...values,
        hasVariants,
        variants: hasVariants ? variants : [],
      };

      const config = { headers: getAuthHeader() };

      if (editingProduct) {
        await apiClient.put(`/products/${editingProduct._id}`, payload, config);
        message.success("Cập nhật sản phẩm thành công");
      } else {
        await apiClient.post("/products", payload, config);
        message.success("Thêm sản phẩm mới thành công");
      }

      setIsModalOpen(false);
      loadProducts();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.response?.data?.message || "Có lỗi xảy ra khi lưu");
    } finally {
      setSubmitting(false);
    }
  };

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
      title: "Biến thể",
      key: "variants",
      width: 100,
      align: "center",
      render: (_, record) => (
        record.hasVariants ? (
          <Tag color="green">{record.variants?.length || 0} biến thể</Tag>
        ) : (
          <Tag color="default">Không</Tag>
        )
      ),
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
        width={800}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input />
          </Form.Item>

          <Form.Item name="image" label="Ảnh sản phẩm" rules={[{ required: true, message: 'Vui lòng chọn ảnh' }]}>
            <div className="space-y-3">
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

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="category" 
                label="Danh mục" 
                rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
              >
                <Select placeholder="Chọn danh mục sản phẩm" showSearch>
                  {PRODUCT_CATEGORIES.map(cat => (
                    <Select.Option key={cat} value={cat}>{cat}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="brand" label="Thương hiệu">
                <Input placeholder="Nhập tên thương hiệu" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          {/* Checkbox có biến thể */}
          <Form.Item>
            <Checkbox
              checked={hasVariants}
              onChange={(e) => {
                setHasVariants(e.target.checked);
                if (!e.target.checked) {
                  setVariants([]);
                }
              }}
            >
              <strong>Sản phẩm có biến thể</strong> (size, trọng lượng, hương vị...)
            </Checkbox>
          </Form.Item>

          {!hasVariants ? (
            // Không có biến thể - hiển thị form thông thường
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="price" label="Giá" rules={[{ required: true }]}>
                    <InputNumber style={{ width: "100%" }} min={0} />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item name="quantity" label="Số lượng" rules={[{ required: true }]}>
                    <InputNumber style={{ width: "100%" }} min={0} />
                  </Form.Item>
                </Col>
              </Row>
            </>
          ) : (
            // Có biến thể - hiển thị form variants
            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Title level={5} style={{ margin: 0 }}>Danh sách biến thể</Title>
                <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddVariant}>
                  Thêm biến thể
                </Button>
              </div>

              {variants.map((variant, index) => (
                <Card
                  key={index}
                  size="small"
                  style={{ marginBottom: 12 }}
                  title={`Biến thể ${index + 1}`}
                  extra={
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveVariant(index)}
                    >
                      Xóa
                    </Button>
                  }
                >
                  <Row gutter={12}>
                    <Col span={12}>
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ fontSize: 12, color: "#666" }}>Tên biến thể *</label>
                        <Input
                          placeholder="VD: 1kg - Vị gà"
                          value={variant.name}
                          onChange={(e) => handleVariantChange(index, "name", e.target.value)}
                        />
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ fontSize: 12, color: "#666" }}>SKU</label>
                        <Input
                          placeholder="VD: RC-PUPPY-1KG"
                          value={variant.sku}
                          onChange={(e) => handleVariantChange(index, "sku", e.target.value)}
                        />
                      </div>
                    </Col>
                  </Row>

                  <Row gutter={12}>
                    <Col span={12}>
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ fontSize: 12, color: "#666" }}>Giá *</label>
                        <InputNumber
                          style={{ width: "100%" }}
                          min={0}
                          value={variant.price}
                          onChange={(value) => handleVariantChange(index, "price", value || 0)}
                        />
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ fontSize: 12, color: "#666" }}>Số lượng *</label>
                        <InputNumber
                          style={{ width: "100%" }}
                          min={0}
                          value={variant.quantity}
                          onChange={(value) => handleVariantChange(index, "quantity", value || 0)}
                        />
                      </div>
                    </Col>
                  </Row>

                  <Divider style={{ margin: "12px 0" }}>Thuộc tính</Divider>

                  <Row gutter={12}>
                    <Col span={8}>
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ fontSize: 12, color: "#666" }}>Trọng lượng</label>
                        <Input
                          placeholder="VD: 1kg, 500g"
                          value={variant.attributes?.weight}
                          onChange={(e) => handleVariantChange(index, "attributes.weight", e.target.value)}
                        />
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ fontSize: 12, color: "#666" }}>Hương vị</label>
                        <Input
                          placeholder="VD: Gà, Bò, Cá hồi"
                          value={variant.attributes?.flavor}
                          onChange={(e) => handleVariantChange(index, "attributes.flavor", e.target.value)}
                        />
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ fontSize: 12, color: "#666" }}>Độ tuổi</label>
                        <Input
                          placeholder="VD: Puppy, Adult"
                          value={variant.attributes?.age}
                          onChange={(e) => handleVariantChange(index, "attributes.age", e.target.value)}
                        />
                      </div>
                    </Col>
                  </Row>

                  <Row gutter={12}>
                    <Col span={12}>
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ fontSize: 12, color: "#666" }}>Kích thước</label>
                        <Input
                          placeholder="VD: Small, Medium, Large"
                          value={variant.attributes?.size}
                          onChange={(e) => handleVariantChange(index, "attributes.size", e.target.value)}
                        />
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ fontSize: 12, color: "#666" }}>Màu sắc</label>
                        <Input
                          placeholder="VD: Đỏ, Xanh"
                          value={variant.attributes?.color}
                          onChange={(e) => handleVariantChange(index, "attributes.color", e.target.value)}
                        />
                      </div>
                    </Col>
                  </Row>
                </Card>
              ))}

              {variants.length === 0 && (
                <div style={{ textAlign: "center", padding: "24px", color: "#999" }}>
                  Chưa có biến thể nào. Nhấn "Thêm biến thể" để bắt đầu.
                </div>
              )}
            </div>
          )}

          <Divider />

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả chi tiết về sản phẩm" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductPage;
