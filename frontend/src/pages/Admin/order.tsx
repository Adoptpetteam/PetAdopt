import { useState } from "react";
import { Table, Tag, Space, Select, message, Popconfirm } from "antd";
import type { ColumnsType } from "antd/es/table";

const { Option } = Select;

interface Order {
  key: string;
  name: string;
  phone: string;
  address: string;
  product: string;
  total: number;
  status: string;
}

const OrderPage = () => {
  const [data, setData] = useState<Order[]>([
    {
      key: "1",
      name: "Nguyễn Văn A",
      phone: "0123456789",
      address: "Hà Nội",
      product: "đồ ăn cho mèo",
      total: 2000000,
      status: "Chờ xác nhận",
    },
        {
      key: "3",
      name: "Nguyễn Văn A",
      phone: "0123456789",
      address: "Hà Nội",
      product: "đồ ăn cho mèo",
      total: 2000000,
      status: "Chờ xác nhận",
    },
    {
      key: "2",
      name: "Trần Văn B",
      phone: "0987654321",
      address: "Hồ Chí Minh",
      product: "sữa tắm cho chó",
      total: 3500000,
      status: "Đã xác nhận",
    },
  ]);

  // 👉 đổi trạng thái
  const handleChangeStatus = (value: string, record: Order) => {
    const newData = data.map((item) =>
      item.key === record.key ? { ...item, status: value } : item
    );

    setData(newData);
    message.success("Cập nhật trạng thái thành công");
  };

  // 👉 xóa đơn
  const handleDelete = (key: string) => {
    const newData = data.filter((item) => item.key !== key);
    setData(newData);
    message.success("Đã xóa đơn hàng");
  };

  const columns: ColumnsType<Order> = [
    {
      title: "Tên khách",
      dataIndex: "name",
    },
    {
      title: "SĐT",
      dataIndex: "phone",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
    },
    {
      title: "Sản phẩm",
      dataIndex: "product",
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      render: (total: number) => total.toLocaleString() + " đ",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status: string, record: Order) => {
        let color = "default";
        if (status === "Chờ xác nhận") color = "orange";
        if (status === "Đã xác nhận") color = "blue";
        if (status === "Đã giao thành công") color = "green";
        if (status === "Đã hủy") color = "red";

        return (
          <Space>
            <Tag color={color}>{status}</Tag>

            <Select
              value={status}
              style={{ width: 180 }}
              onChange={(value) => handleChangeStatus(value, record)}
            >
              <Option value="Chờ xác nhận">Chờ xác nhận</Option>
              <Option value="Đã xác nhận">Đã xác nhận</Option>
              <Option value="Đã giao thành công">Đã giao thành công</Option>
              <Option value="Đã hủy">Đã hủy</Option>
            </Select>

            {/* 👉 nếu đã hủy thì cho xóa */}
            {status === "Đã hủy" && (
              <Popconfirm
                title="Bạn có chắc muốn xóa đơn này?"
                onConfirm={() => handleDelete(record.key)}
                okText="Xóa"
                cancelText="Hủy"
              >
                <a style={{ color: "red" }}>Xóa</a>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Quản lý đơn hàng</h2>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="key"
        bordered
      />
    </div>
  );
};

export default OrderPage;