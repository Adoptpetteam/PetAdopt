import { useEffect, useState } from "react";
import { Card, Table, Tag, Avatar } from "antd";
import { TrophyOutlined, HeartOutlined, CrownOutlined } from "@ant-design/icons";
import { apiClient } from "../api/http";

export default function TopSupporters() {
  const [supporters, setSupporters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/donate/top-supporters?limit=10")
      .then((res) => setSupporters(res.data.data || []))
      .catch(() => setSupporters([]))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) => (n || 0).toLocaleString("vi-VN");

  const columns = [
    {
      title: "Hang",
      key: "rank",
      width: 70,
      render: (_: any, __: any, index: number) => {
        const icons = [
          <CrownOutlined className="text-yellow-500 text-xl" />,
          <CrownOutlined className="text-gray-400 text-xl" />,
          <CrownOutlined className="text-orange-600 text-xl" />,
        ];
        return (
          <div className="flex items-center justify-center">
            {index < 3 ? icons[index] : <span className="font-bold text-gray-500">#{index + 1}</span>}
          </div>
        );
      },
    },
    {
      title: "Nguoi ung ho",
      key: "name",
      render: (record: any) => {
        const name = record.name || "An danh";
        return (
          <div className="flex items-center gap-3">
            <Avatar size={40} style={{ backgroundColor: "#6272B6" }}>
              {name.charAt(0).toUpperCase()}
            </Avatar>
            <span className="font-medium">{name}</span>
          </div>
        );
      },
    },
    {
      title: "So tien",
      key: "amount",
      align: "right" as const,
      render: (record: any) => (
        <span className="text-lg font-bold text-[#6272B6]">{fmt(record.amount)}d</span>
      ),
    },
    {
      title: "Ngay ung ho",
      key: "date",
      align: "center" as const,
      render: (record: any) => (
        <span className="text-sm text-gray-500">
          {new Date(record.paidAt || record.createdAt).toLocaleDateString("vi-VN")}
        </span>
      ),
    },
  ];

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <TrophyOutlined className="text-yellow-500 text-xl" />
          <span className="text-lg font-bold">Top Nguoi Ung Ho</span>
        </div>
      }
      extra={<Tag color="gold" icon={<HeartOutlined />}>Cam on</Tag>}
    >
      <Table
        dataSource={supporters}
        columns={columns}
        loading={loading}
        pagination={false}
        rowKey={(r: any) => r._id || r.createdAt}
        rowClassName={(_, i) =>
          i === 0 ? "bg-yellow-50" : i === 1 ? "bg-gray-50" : i === 2 ? "bg-orange-50" : ""
        }
        locale={{
          emptyText: (
            <div className="py-8 text-center text-gray-400">
              <HeartOutlined className="text-4xl mb-2" />
              <p>Chua co nguoi ung ho</p>
            </div>
          ),
        }}
      />
    </Card>
  );
}
