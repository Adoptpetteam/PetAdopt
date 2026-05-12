import { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Spin } from "antd";
import {
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { getOrderOverview } from "../api/statisticsApi";
import dayjs from "dayjs";

/**
 * Widget thống kê nhanh cho Dashboard
 * Hiển thị tổng quan 30 ngày gần nhất
 */
const StatisticsWidget = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const startDate = dayjs().subtract(30, "days").format("YYYY-MM-DD");
        const endDate = dayjs().format("YYYY-MM-DD");
        const res = await getOrderOverview({ startDate, endDate });
        setData(res.data);
      } catch (err) {
        console.error("Fetch statistics widget error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  if (loading) {
    return (
      <Card title="Thống kê 30 ngày gần nhất">
        <div style={{ textAlign: "center", padding: 20 }}>
          <Spin />
        </div>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card
      title="Thống kê 30 ngày gần nhất"
      extra={
        <Link to="/admin/statistics" style={{ color: "#1890ff" }}>
          Xem chi tiết →
        </Link>
      }
    >
      <Row gutter={16}>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic
              title="Tổng đơn hàng"
              value={data.totalOrders || 0}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic
              title="Tổng doanh thu"
              value={data.totalRevenue || 0}
              prefix={<DollarOutlined />}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic
              title="Giá trị TB/đơn"
              value={data.avgOrderValue || 0}
              prefix={<RiseOutlined />}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <div style={{ padding: "12px", background: "#f0f2f5", borderRadius: 8 }}>
            <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>
              Đơn hàng theo trạng thái
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>
                ✅ Đã thanh toán:{" "}
                <strong>{data.ordersByStatus?.paid?.count || 0}</strong>
              </span>
              <span>
                ⏳ Chờ xử lý:{" "}
                <strong>{data.ordersByStatus?.pending?.count || 0}</strong>
              </span>
              <span>
                ❌ Đã hủy:{" "}
                <strong>{data.ordersByStatus?.cancelled?.count || 0}</strong>
              </span>
            </div>
          </div>
        </Col>
        <Col span={12}>
          <div style={{ padding: "12px", background: "#f0f2f5", borderRadius: 8 }}>
            <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>
              Phương thức thanh toán
            </div>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              <span>
                💵 COD:{" "}
                <strong>{data.paymentMethods?.cod?.count || 0}</strong>
              </span>
              <span>
                💳 VNPay:{" "}
                <strong>{data.paymentMethods?.vnpay?.count || 0}</strong>
              </span>
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default StatisticsWidget;
