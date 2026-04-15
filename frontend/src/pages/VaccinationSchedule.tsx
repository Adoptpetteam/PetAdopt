import { useEffect, useState } from "react";
import { Table, Tag, Alert, Spin } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  listMyVaccinations,
  type VaccinationSchedule,
  type VaccinationStatus,
} from "../api/vaccinationApi";

const STATUS_LABEL: Record<VaccinationStatus, string> = {
  scheduled: "Đã lên lịch",
  completed: "Đã tiêm",
  missed: "Bỏ lỡ",
  cancelled: "Đã hủy",
};

export default function VaccinationSchedule() {
  const [data, setData] = useState<VaccinationSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listMyVaccinations()
      .then((res) => {
        if (!cancelled) setData(res.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setData([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const columns: ColumnsType<VaccinationSchedule> = [
    {
      title: "Thú cưng",
      render: (_, row) =>
        row.petNameSnapshot ||
        (typeof row.pet === "object" && row.pet && "name" in row.pet
          ? (row.pet as { name?: string }).name
          : "—"),
    },
    { title: "Vaccine", dataIndex: "vaccineName" },
    { title: "Mũi", dataIndex: "doseNumber", width: 72 },
    {
      title: "Ngày giờ tiêm",
      render: (_, row) => new Date(row.scheduledAt).toLocaleString("vi-VN"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (s: VaccinationStatus) => {
        const color =
          s === "completed" ? "green" : s === "scheduled" ? "blue" : s === "cancelled" ? "default" : "orange";
        return <Tag color={color}>{STATUS_LABEL[s] ?? s}</Tag>;
      },
    },
    {
      title: "Nhắc email",
      render: (_, row) => (
        <Tag color={row.isReminderSent ? "green" : "gold"}>
          {row.isReminderSent ? "Đã gửi nhắc" : "Chưa gửi nhắc"}
        </Tag>
      ),
    },
    { title: "Ghi chú", dataIndex: "notes", ellipsis: true },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-[#6272B6] mb-2">Lịch tiêm phòng của bạn</h1>
      <p className="text-gray-600 mb-6">
        Các lịch liên kết với email tài khoản của bạn. Hệ thống gửi email nhắc 1 lần khi còn từ 0 đến 3 ngày trước
        lịch tiêm và chưa từng gửi trước đó.
      </p>
      <Alert
        type="info"
        showIcon
        className="mb-6"
        message="Nếu cần đổi lịch hoặc cập nhật thông tin, vui lòng liên hệ cửa hàng / trung tâm."
      />
      <Table<VaccinationSchedule>
        rowKey="_id"
        columns={columns}
        dataSource={data}
        locale={{ emptyText: "Chưa có lịch tiêm nào được ghi nhận cho email của bạn." }}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
