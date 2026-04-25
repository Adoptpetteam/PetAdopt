import { useState } from "react";
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
} from "antd";
import type { ColumnsType } from "antd/es/table";

interface Product {
  key: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  description: string;
}

const ProductPage = () => {
  const [data, setData] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [form] = Form.useForm();

  // 👉 mở modal thêm
  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  // 👉 mở modal sửa
  const handleEdit = (record: Product) => {
    setEditingProduct(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  // 👉 submit form
  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (editingProduct) {
        // sửa
        const newData = data.map((item) =>
          item.key === editingProduct.key ? { ...item, ...values } : item
        );
        setData(newData);
        message.success("Cập nhật sản phẩm thành công");
      } else {
        // thêm
        const newProduct: Product = {
          key: Date.now().toString(),
          ...values,
        };
        setData([...data, newProduct]);
        message.success("Thêm sản phẩm thành công");
      }

      setIsModalOpen(false);
    });
  };

  // 👉 xóa
  const handleDelete = (key: string) => {
    setData(data.filter((item) => item.key !== key));
    message.success("Đã xóa sản phẩm");
  };

  const columns: ColumnsType<Product> = [
    {
      title: "Ảnh",
      dataIndex: "image",
      render: (img) => (
        <img src={img} alt="" style={{ width: 60, height: 60, objectFit: "cover" }} />
      ),
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
    },
    {
      title: "Giá",
      dataIndex: "price",
      render: (price) => price.toLocaleString() + " đ",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => handleEdit(record)}>
            Sửa
          </Button>

          {/* 👉 chỉ cho xóa khi hết hàng */}
          {record.quantity === 0 && (
            <Popconfirm
              title="Xóa sản phẩm?"
              onConfirm={() => handleDelete(record.key)}
            >
              <Button danger>Xóa</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Quản lý sản phẩm</h2>

      <Button type="primary" onClick={handleAdd} style={{ marginBottom: 16 }}>
        Thêm sản phẩm
      </Button>

      <Table columns={columns} dataSource={data} rowKey="key" />

      {/* MODAL */}
      <Modal
        title={editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm"}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="image" label="Link ảnh" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="price" label="Giá" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="quantity" label="Số lượng" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductPage;