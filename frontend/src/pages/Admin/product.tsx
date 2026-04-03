import { useEffect, useState, type Key } from "react";
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
  Alert,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Product } from "../../data/products";
import {
  listProducts as listProductsApi,
  createProduct as createProductApi,
  updateProduct as updateProductApi,
  deleteProduct as deleteProductApi,
} from "../../api/productApi";

const ProductPage = () => {
  const [data, setData] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  const [form] = Form.useForm();

  async function refresh() {
    const res = await listProductsApi();
    setData(res.data);
  }

  useEffect(() => {
    refresh().catch(() => message.error("Không tải được danh sách sản phẩm."));
  }, []);

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
      const payload = {
        name: String(values.name ?? ""),
        image: String(values.image ?? ""),
        price: Number(values.price ?? 0),
        quantity: Number(values.quantity ?? 0),
        description: String(values.description ?? ""),
      };

      if (editingProduct) {
        updateProductApi(editingProduct.id, payload)
          .then(() => {
            message.success("Cập nhật sản phẩm thành công");
          })
          .catch((e: any) => {
            message.error(e?.response?.data?.message || "Cập nhật thất bại");
          })
          .finally(() => {
            setIsModalOpen(false);
            refresh().catch(() => {});
          });
      } else {
        createProductApi(payload)
          .then(() => {
            message.success("Thêm sản phẩm thành công");
          })
          .catch((e: any) => {
            message.error(e?.response?.data?.message || "Thêm thất bại");
          })
          .finally(() => {
            setIsModalOpen(false);
            refresh().catch(() => {});
          });
      }
    });
  };

  // 👉 xóa một dòng
  const handleDelete = (id: number) => {
    deleteProductApi(id)
      .then(() => {
        message.success("Đã xóa sản phẩm");
        setSelectedRowKeys((keys) => keys.filter((k) => k !== id));
        refresh().catch(() => {});
      })
      .catch((e: any) => {
        message.error(e?.response?.data?.message || "Xóa thất bại");
      });
  };

  // 👉 xóa nhiều dòng đã chọn
  const handleDeleteSelected = () => {
    const ids = selectedRowKeys.map((k) => Number(k)).filter((n) => Number.isFinite(n));
    if (ids.length === 0) return;
    Modal.confirm({
      title: `Xóa ${ids.length} sản phẩm?`,
      content: "Thao tác không thể hoàn tác. Đảm bảo không còn đơn hàng / giỏ hàng phụ thuộc nếu cần.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        let ok = 0;
        let fail = 0;
        for (const id of ids) {
          try {
            await deleteProductApi(id);
            ok += 1;
          } catch {
            fail += 1;
          }
        }
        if (ok) message.success(`Đã xóa ${ok} sản phẩm.`);
        if (fail) message.warning(`${fail} sản phẩm không xóa được.`);
        setSelectedRowKeys([]);
        await refresh().catch(() => {});
      },
    });
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
      width: 220,
      render: (_, record) => (
        <Space wrap>
          <Button type="primary" onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xóa sản phẩm này?"
            description={
              record.quantity > 0
                ? `Còn ${record.quantity} sản phẩm trong kho. Vẫn xóa khỏi hệ thống?`
                : "Sản phẩm sẽ bị xóa vĩnh viễn."
            }
            okText="Xóa"
            okType="danger"
            cancelText="Hủy"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Quản lý sản phẩm</h2>

      <Space style={{ marginBottom: 16 }} wrap>
        <Button type="primary" onClick={handleAdd}>
          Thêm sản phẩm
        </Button>
      </Space>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Xóa sản phẩm"
        description={
          <>
            Chọn một hoặc nhiều dòng bằng ô checkbox, rồi dùng nút <strong>Xóa đã chọn</strong>. Hoặc dùng nút{" "}
            <strong>Xóa</strong> trên từng dòng. Xóa trên server là vĩnh viễn.
          </>
        }
      />

      <Space style={{ marginBottom: 12 }} wrap>
        <span style={{ color: "#666" }}>
          Đã chọn: <strong>{selectedRowKeys.length}</strong> sản phẩm
        </span>
        <Button
          danger
          disabled={selectedRowKeys.length === 0}
          onClick={handleDeleteSelected}
        >
          Xóa đã chọn
        </Button>
      </Space>

      <Table
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        columns={columns}
        dataSource={data}
        rowKey="id"
      />

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