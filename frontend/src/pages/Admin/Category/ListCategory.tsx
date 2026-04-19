import React, { useState } from "react";
import { Table, Button, Space, Popconfirm, Typography, Tag, Tooltip, Modal, Form, Input, message, Select, Card } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useQueryClient } from "@tanstack/react-query";
import { useListCategory, useDeleteCategory, useUpdateCategory, useCreateCategory } from "../../../hook/huyHook";
import type { ICategory } from "../../../data/huy";

const ListCategory: React.FC = () => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const { data, isLoading } = useListCategory({ resource: "category" });
  const { mutate: deleteCategory } = useDeleteCategory({ resource: "category" });
  const { mutate: updateCategory } = useUpdateCategory({ resource: "category" });
  const { mutate: addCategory } = useCreateCategory({ resource: "category" });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
    form.resetFields();
    form.setFieldsValue({ status: "on" });
  };

  const handleOpenEditModal = (record: ICategory) => {
    setEditingCategory(record);
    setIsModalOpen(true);
    form.setFieldsValue({ name: record.name, status: record.status });
  };

  const onFinish = (values: any) => {
    if (editingCategory) {
      updateCategory({ id: editingCategory.id, values }, {
        onSuccess: () => {
          message.success("Cập nhật thành công!");
          setIsModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ["category"] });
        }
      });
    } else {
      addCategory(values, {
        onSuccess: () => {
          message.success("Thêm mới thành công!");
          setIsModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ["category"] });
        }
      });
    }
  };

  const columns: ColumnsType<ICategory> = [
    { title: "ID", dataIndex: "id", width: 80, align: "center", render: (id) => <Tag color="blue">#{id}</Tag> },
    { title: "Tên danh mục", dataIndex: "name", render: (text) => <b style={{ color: "#1890ff" }}>{text}</b> },
    { 
      title: "Trạng thái", 
      dataIndex: "status", 
      render: (status) => (
        <Tag color={status === "on" ? "green" : "volcano"}>{status === "on" ? "Hoạt động" : "Tạm dừng"}</Tag>
      ) 
    },
    {
      title: "Hành động",
      width: 150,
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" ghost size="small" icon={<EditOutlined />} onClick={() => handleOpenEditModal(record)} />
          <Popconfirm
            title="Xóa danh mục?"
            onConfirm={() => {
              if (record.status !== "off") return message.error("Chỉ được xóa khi trạng thái là 'off'!");
              deleteCategory(record.id, { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["category"] }) });
            }}
          >
            <Button danger icon={<DeleteOutlined />} size="small" disabled={record.status !== "off"} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <Card style={{ borderRadius: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <Typography.Title level={3}>📦 Quản lý Danh mục</Typography.Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAddModal}>Thêm mới</Button>
        </div>
        <Table rowKey="id" loading={isLoading} columns={columns} dataSource={data || []} pagination={{ pageSize: 6 }} />
      </Card>
      <Modal 
        title={editingCategory ? `Chỉnh sửa: ${editingCategory.name}` : "Thêm danh mục mới"} 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)} 
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="Tên danh mục" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái">
            <Select options={[{ value: "on", label: "Hoạt động" }, { value: "off", label: "Tạm dừng" }]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ListCategory;