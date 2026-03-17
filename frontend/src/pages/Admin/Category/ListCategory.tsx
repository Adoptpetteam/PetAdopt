import React, { useState } from "react";
import {
  Table,
  Button,
  Space,
  Popconfirm,
  Typography,
  Tag,
  Tooltip,
  Modal,
  Form,
  Input,
  message,
  Select,
} from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import { useQueryClient } from "@tanstack/react-query";
import {
  useListCategory,
  useDeleteCategory,
  useUpdateCategory,
  useCreateCategory,
} from "../../../hook/huyHook";
import type { ICategory } from "../../../data/huy";
import Card from "antd/es/card/Card";

const ListCategory: React.FC = () => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  // --- 1. Hooks API ---
  const { data, isLoading } = useListCategory({ resource: "category" });
  const { mutate: deleteCategory } = useDeleteCategory({
    resource: "category",
  });
  const { mutate: updateCategory } = useUpdateCategory({
    resource: "category",
  });
  const { mutate: addCategory } = useCreateCategory({ resource: "category" });

  // --- 2. State Management ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(
    null,
  );

  // --- 3. Logic Handlers ---

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
    form.resetFields();
    form.setFieldsValue({ status: "on" });
  };

  const handleOpenEditModal = (record: ICategory) => {
    setEditingCategory(record);
    setIsModalOpen(true);
    // Sử dụng timeout nhỏ để đảm bảo form đã mount nếu không dùng forceRender
    form.setFieldsValue({
      name: record.name,
      status: record.status,
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    form.resetFields();
  };

  const onFinish = (values: any) => {
    if (editingCategory) {
      // CẬP NHẬT: Gửi object { id, values } đúng cấu trúc hook yêu cầu
      updateCategory(
        {
          id: editingCategory.id,
          values: values,
        },
        {
          onSuccess: () => {
            // Hook đã tự invalidateQueries, ở đây chỉ cần đóng modal
            handleCloseModal();
          },
        },
      );
    } else {
      // THÊM MỚI
      addCategory(values, {
        onSuccess: () => {
          message.success("Thêm mới thành công!");
          handleCloseModal();
        },
      });
    }
  };

  // --- 4. Table Columns ---
  const columns: ColumnsType<ICategory> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      align: "center",
      render: (id) => <Tag color="blue">#{id}</Tag>,
    },
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
      render: (text) => <b style={{ color: "#1890ff" }}>{text}</b>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "on" ? "green" : "volcano"}>
          {status === "on" ? "Hoạt động" : "Tạm dừng"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 150,
      align: "center",
      render: (_, record) => {
        const isOff = record.status === "off";
        return (
          <Space size="middle">
            <Tooltip
              title={isOff ? "Chỉnh sửa" : "Chỉ sửa được khi trạng thái 'off'"}
            >
              <Button
                type="primary"
                ghost
                size="small"
                icon={<EditOutlined />}
                disabled={!isOff}
                onClick={() => handleOpenEditModal(record)}
              />
            </Tooltip>

            <Popconfirm
              title="Xóa danh mục?"
              okText="Xóa"
              cancelText="Hủy"
              onConfirm={() =>
                deleteCategory(record.id, {
                  onSuccess: () =>
                    queryClient.invalidateQueries({ queryKey: ["category"] }),
                })
              }
            >
              <Button danger icon={<DeleteOutlined />} size="small" />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <Card
        bordered={false}
        style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <Typography.Title level={3} style={{ margin: 0 }}>
            📦 Quản lý Danh mục
          </Typography.Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={handleOpenAddModal}
          >
            Thêm mới
          </Button>
        </div>

        <Table<ICategory>
          rowKey="id"
          loading={isLoading}
          columns={columns}
          dataSource={data || []}
          pagination={{ pageSize: 6 }}
        />
      </Card>

      <Modal
        title={
          editingCategory
            ? `Chỉnh sửa: ${editingCategory.name}`
            : "Thêm danh mục mới"
        }
        open={isModalOpen}
        onCancel={handleCloseModal}
        onOk={() => form.submit()}
        okText={editingCategory ? "Cập nhật" : "Tạo mới"}
        forceRender // Giải quyết lỗi Warning: Instance created by useForm is not connected
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ marginTop: 20 }}
          preserve={false}
        >
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[{ required: true, message: "Vui lòng nhập tên danh mục!" }]}
          >
            <Input placeholder="Nhập tên danh mục (ví dụ: Phụ kiện)" />
          </Form.Item>

          <Form.Item name="status" label="Trạng thái">
            <Select
              options={[
                { value: "on", label: "Hoạt động (on)" },
                { value: "off", label: "Tạm dừng (off)" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ListCategory;
