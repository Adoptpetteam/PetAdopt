import React, { useState } from "react";
import {
  Table,
  Button,
  Space,
  Popconfirm,
  Typography,
  Tag,
  Modal,
  Form,
  Input,
  message,
  Select,
  Card,
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
      updateCategory(
        { id: editingCategory.id, values },
        {
          onSuccess: () => {
            message.success("Cập nhật thành công!");
            handleCloseModal();
            queryClient.invalidateQueries({ queryKey: ["category"] });
          },
        }
      );
    } else {
      const newData = {
        ...values,
        id: Date.now().toString(),
      };

      addCategory(newData, {
        onSuccess: () => {
          message.success("Thêm mới thành công!");
          handleCloseModal();
          queryClient.invalidateQueries({ queryKey: ["category"] });
        },
      });
    }
  };

  const columns: ColumnsType<ICategory> = [
    {
      title: "ID",
      dataIndex: "id",
      width: 80,
      align: "center",
      render: (id) => <Tag color="blue">#{id}</Tag>,
    },
    {
      title: "Tên danh mục",
      dataIndex: "name",
      render: (text) => <b style={{ color: "#1890ff" }}>{text}</b>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => (
        <Tag color={status === "on" ? "green" : "volcano"}>
          {status === "on" ? "Hoạt động" : "Tạm dừng"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleOpenEditModal(record)}
          />
          <Popconfirm
            title="Xóa?"
            onConfirm={() => {
              if (record.status !== "off") {
                return message.error("Phải OFF mới xóa!");
              }
              deleteCategory(record.id, {
                onSuccess: () =>
                  queryClient.invalidateQueries({ queryKey: ["category"] }),
              });
            }}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              disabled={record.status !== "off"}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Typography.Title level={3}>Quản lý danh mục</Typography.Title>
          <Button icon={<PlusOutlined />} onClick={handleOpenAddModal}>
            Thêm
          </Button>
        </div>

        <Table rowKey="id" columns={columns} dataSource={data || []} />
      </Card>

      <Modal
        open={isModalOpen}
        onCancel={handleCloseModal}
        onOk={() => form.submit()}
        title={editingCategory ? "Sửa" : "Thêm"}
      >
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            name="name"
            label="Tên"
            rules={[
              { required: true, message: "Nhập tên!" },
              { min: 2, message: "Ít nhất 2 ký tự" },
            ]}
          >
            <Input disabled={!!editingCategory} />
          </Form.Item>

          <Form.Item name="status" label="Trạng thái">
            <Select
              options={[
                { value: "on", label: "Hoạt động" },
                { value: "off", label: "Tạm dừng" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ListCategory;