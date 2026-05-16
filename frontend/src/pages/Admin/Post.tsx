import { useState, useEffect, useRef } from "react";
import {
  Table, Space, Button, Modal, Form, Input,
  message, Tag, Select, Image, Popconfirm, Badge,
} from "antd";
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  ReloadOutlined, UploadOutlined, EyeOutlined,
} from "@ant-design/icons";
import { listNews, createNews, updateNews, deleteNews } from "../../api/newsApi";
import { apiClient } from "../../api/http";

const Post = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [form] = Form.useForm();
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchData = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      // Không truyền status để lấy tất cả bài viết (backend mặc định filter published)
      // Dùng limit lớn để lấy hết, admin cần thấy tất cả
      const res = await apiClient.get("/news", { params: { limit: 100, page: 1 } });
      const items = res.data?.data || [];
      setData(items);
      setPagination(p => ({ ...p, current: page, total: items.length }));
    } catch {
      message.error("Không tải được danh sách tin tức");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditing(null);
    setImagePreview("");
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (record: any) => {
    setEditing(record);
    setImagePreview(record.image || "");
    form.setFieldsValue(record);
    setOpen(true);
  };

  // Upload ảnh lên server (dùng lại endpoint của pet)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return message.error("Chỉ chấp nhận file ảnh");
    if (file.size > 5 * 1024 * 1024) return message.error("Ảnh tối đa 5MB");
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
      const url = res.data.imageUrl.startsWith("http")
        ? res.data.imageUrl
        : `http://localhost:5000${res.data.imageUrl}`;
      form.setFieldValue("image", url);
      setImagePreview(url);
      message.success("Tải ảnh lên thành công");
    } catch {
      message.error("Tải ảnh thất bại");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        await updateNews(editing._id, values);
        message.success("Cập nhật bài viết thành công");
      } else {
        await createNews({ ...values, status: values.status || "published" });
        message.success("Thêm bài viết thành công");
      }
      setOpen(false);
      fetchData(pagination.current);
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Thao tác thất bại");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNews(id);
      message.success("Đã xóa bài viết");
      fetchData(pagination.current);
    } catch {
      message.error("Xóa thất bại");
    }
  };

  const published = data.filter(d => d.status === "published").length;
  const draft = data.filter(d => d.status === "draft").length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6272B6] to-purple-600 flex items-center gap-2">Quản lý bài viết</h2>
          <div className="flex gap-3 mt-2">
            <Badge count={published} color="green" showZero>
              <span className="text-sm text-gray-500 mr-2">Đã đăng</span>
            </Badge>
            <Badge count={draft} color="orange" showZero>
              <span className="text-sm text-gray-500">Nháp</span>
            </Badge>
          </div>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => fetchData()} loading={loading}>Làm mới</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}
            className="bg-[#6272B6] border-0 rounded-xl">
            Thêm bài viết
          </Button>
        </Space>
      </div>

      <div className="bg-white rounded-xl shadow">
        <Table
          dataSource={data}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showTotal: (t) => `${t} bài viết`,
            onChange: (page, size) => fetchData(page, size),
          }}
          scroll={{ x: 900 }}
          columns={[
            {
              title: "Ảnh",
              dataIndex: "image",
              width: 90,
              render: (img) => img
                ? <Image src={img} width={70} height={50} style={{ objectFit: "cover", borderRadius: 6 }}
                    fallback="https://placehold.co/70x50?text=No+Img" />
                : <div className="w-[70px] h-[50px] bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs">No img</div>,
            },
            {
              title: "Tiêu đề",
              dataIndex: "title",
              ellipsis: true,
              width: 280,
              render: (t) => <span className="font-medium">{t}</span>,
            },
            {
              title: "Mô tả",
              dataIndex: "description",
              ellipsis: true,
              width: 220,
              render: (d) => <span className="text-gray-500 text-sm">{d || "—"}</span>,
            },
            {
              title: "Trạng thái",
              dataIndex: "status",
              width: 110,
              render: (s) => (
                <Tag color={s === "published" ? "green" : "orange"}>
                  {s === "published" ? "Đã đăng" : "Nháp"}
                </Tag>
              ),
            },
            {
              title: "Ngày tạo",
              dataIndex: "createdAt",
              width: 110,
              render: (d) => <span className="text-xs text-gray-400">{new Date(d).toLocaleDateString("vi-VN")}</span>,
              sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
              defaultSortOrder: "descend",
            },
            {
              title: "Hành động",
              width: 140,
              fixed: "right",
              render: (_, record) => (
                <Space size="small">
                  <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)} />
                  <Popconfirm title="Xóa bài viết này?" onConfirm={() => handleDelete(record._id)}
                    okText="Xóa" cancelText="Hủy" okType="danger">
                    <Button type="link" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </div>

      <Modal
        title={<span className="text-[#6272B6] font-bold">{editing ? "✏️ Sửa bài viết" : "➕ Thêm bài viết"}</span>}
        open={open}
        onOk={handleSubmit}
        onCancel={() => setOpen(false)}
        okText={editing ? "Lưu" : "Đăng"}
        cancelText="Hủy"
        width={640}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: "Nhập tiêu đề" }]}>
            <Input placeholder="Tiêu đề bài viết..." className="rounded-lg" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả ngắn">
            <Input.TextArea rows={2} placeholder="Mô tả hiển thị trên danh sách..." className="rounded-lg" />
          </Form.Item>

          <Form.Item name="content" label="Nội dung">
            <Input.TextArea rows={6} placeholder="Nội dung chi tiết bài viết..." className="rounded-lg" />
          </Form.Item>

          {/* Upload ảnh */}
          <Form.Item name="image" label="Ảnh bìa" rules={[{ required: true, message: "Chọn ảnh bìa" }]}>
            <div className="space-y-3">
              {imagePreview && (
                <img src={imagePreview} alt="preview"
                  className="w-full h-40 object-cover rounded-lg border"
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/600x200?text=No+Image"; }} />
              )}
              <div className="flex gap-2 items-center">
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                <Button icon={<UploadOutlined />} onClick={() => fileRef.current?.click()} loading={uploading} className="rounded-lg">
                  {uploading ? "Đang tải..." : "Chọn ảnh từ máy"}
                </Button>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Hoặc nhập link ảnh:</div>
                <Input placeholder="https://..." value={imagePreview}
                  onChange={(e) => { setImagePreview(e.target.value); form.setFieldValue("image", e.target.value); }}
                  className="rounded-lg" />
              </div>
            </div>
          </Form.Item>

          <Form.Item name="status" label="Trạng thái" initialValue="published">
            <Select className="rounded-lg">
              <Select.Option value="published">✅ Đăng ngay</Select.Option>
              <Select.Option value="draft">📝 Lưu nháp</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Post;
