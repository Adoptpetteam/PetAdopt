import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  DatePicker,
  Select,
  Table,
  Tag,
  Space,
  Spin,
  Alert,
} from "antd";
import {
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  RiseOutlined,
  FallOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import dayjs, { Dayjs } from "dayjs";
import {
  getOrderOverview,
  getRevenueByTime,
  getTopProducts,
  getCustomerStats,
  getRecentOrders,
  getComparison,
  type OverviewResponse,
  type RevenueByTimeResponse,
  type TopProductsResponse,
  type CustomerStatsResponse,
  type RecentOrdersResponse,
  type ComparisonResponse,
} from "../../api/statisticsApi";

const { RangePicker } = DatePicker;
const { Option } = Select;

// Colors for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const Statistics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Date range state
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(30, "days"),
    dayjs(),
  ]);

  // Period for revenue chart
  const [period, setPeriod] = useState<"day" | "week" | "month">("day");

  // Data states
  const [overview, setOverview] = useState<OverviewResponse["data"] | null>(
    null
  );
  const [revenueByTime, setRevenueByTime] = useState<
    RevenueByTimeResponse["data"]
  >([]);
  const [topProducts, setTopProducts] = useState<TopProductsResponse["data"]>(
    []
  );
  const [customerStats, setCustomerStats] = useState<
    CustomerStatsResponse["data"] | null
  >(null);
  const [recentOrders, setRecentOrders] = useState<
    RecentOrdersResponse["data"]
  >([]);
  const [comparison, setComparison] = useState<
    ComparisonResponse["data"] | null
  >(null);

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const startDate = dateRange[0].format("YYYY-MM-DD");
      const endDate = dateRange[1].format("YYYY-MM-DD");

      // Calculate previous period for comparison
      const daysDiff = dateRange[1].diff(dateRange[0], "days");
      const previousStart = dateRange[0]
        .subtract(daysDiff + 1, "days")
        .format("YYYY-MM-DD");
      const previousEnd = dateRange[0]
        .subtract(1, "days")
        .format("YYYY-MM-DD");

      const [
        overviewRes,
        revenueRes,
        productsRes,
        customersRes,
        ordersRes,
        comparisonRes,
      ] = await Promise.all([
        getOrderOverview({ startDate, endDate }),
        getRevenueByTime({ period, startDate, endDate }),
        getTopProducts({ limit: 10, startDate, endDate }),
        getCustomerStats({ startDate, endDate }),
        getRecentOrders({ limit: 10 }),
        getComparison({
          currentStart: startDate,
          currentEnd: endDate,
          previousStart,
          previousEnd,
        }),
      ]);

      setOverview(overviewRes.data);
      setRevenueByTime(revenueRes.data);
      setTopProducts(productsRes.data);
      setCustomerStats(customersRes.data);
      setRecentOrders(ordersRes.data);
      setComparison(comparisonRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi khi tải dữ liệu");
      console.error("Fetch statistics error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange, period]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Format date for chart
  const formatChartDate = (item: any) => {
    const { year, month, day, week } = item._id;
    if (day) return `${day}/${month}`;
    if (week) return `Tuần ${week}`;
    if (month) return `Tháng ${month}`;
    return `${year}`;
  };

  // Prepare data for charts
  const revenueChartData = revenueByTime.map((item) => ({
    name: formatChartDate(item),
    revenue: item.totalRevenue,
    orders: item.orderCount,
  }));

  const statusChartData = overview
    ? Object.entries(overview.ordersByStatus).map(([status, data]) => ({
        name:
          status === "paid"
            ? "Đã thanh toán"
            : status === "pending"
            ? "Chờ xử lý"
            : "Đã hủy",
        value: data.count,
        revenue: data.revenue,
      }))
    : [];

  const paymentChartData = overview
    ? Object.entries(overview.paymentMethods).map(([method, data]) => ({
        name: method === "cod" ? "COD" : "VNPay",
        value: data.count,
        revenue: data.revenue,
      }))
    : [];

  // Table columns
  const productColumns = [
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
      render: (text: string, record: any) => (
        <Space>
          <img
            src={`http://localhost:5000${record.productImage}`}
            alt={text}
            style={{ width: 50, height: 50, objectFit: "cover" }}
          />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: "Số lượng bán",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      sorter: (a: any, b: any) => a.totalQuantity - b.totalQuantity,
    },
    {
      title: "Doanh thu",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      render: (value: number) => formatCurrency(value),
      sorter: (a: any, b: any) => a.totalRevenue - b.totalRevenue,
    },
    {
      title: "Số đơn",
      dataIndex: "orderCount",
      key: "orderCount",
    },
  ];

  const customerColumns = [
    {
      title: "Khách hàng",
      dataIndex: "userName",
      key: "userName",
      render: (text: string, record: any) => (
        <div>
          <div>{text}</div>
          <div style={{ fontSize: 12, color: "#999" }}>{record.userEmail}</div>
        </div>
      ),
    },
    {
      title: "Số đơn",
      dataIndex: "orderCount",
      key: "orderCount",
    },
    {
      title: "Tổng chi tiêu",
      dataIndex: "totalSpent",
      key: "totalSpent",
      render: (value: number) => formatCurrency(value),
    },
    {
      title: "Giá trị TB",
      dataIndex: "avgOrderValue",
      key: "avgOrderValue",
      render: (value: number) => formatCurrency(value),
    },
  ];

  const orderColumns = [
    {
      title: "Mã đơn",
      dataIndex: "_id",
      key: "_id",
      render: (id: string) => `#${id.slice(-8)}`,
    },
    {
      title: "Khách hàng",
      dataIndex: "customer",
      key: "customer",
      render: (customer: any) => customer.name,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          color={
            status === "paid" ? "green" : status === "pending" ? "orange" : "red"
          }
        >
          {status === "paid"
            ? "Đã thanh toán"
            : status === "pending"
            ? "Chờ xử lý"
            : "Đã hủy"}
        </Tag>
      ),
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (method: string) => (method === "cod" ? "COD" : "VNPay"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totals",
      key: "totals",
      render: (totals: any) => formatCurrency(totals.total),
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
  ];

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <Alert message="Lỗi" description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 24 }}>Thống kê đơn hàng</h1>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Space size="large">
          <div>
            <label style={{ marginRight: 8 }}>Khoảng thời gian:</label>
            <RangePicker
              value={dateRange}
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  setDateRange([dates[0], dates[1]]);
                }
              }}
              format="DD/MM/YYYY"
            />
          </div>
          <div>
            <label style={{ marginRight: 8 }}>Chu kỳ:</label>
            <Select
              value={period}
              onChange={setPeriod}
              style={{ width: 120 }}
            >
              <Option value="day">Theo ngày</Option>
              <Option value="week">Theo tuần</Option>
              <Option value="month">Theo tháng</Option>
            </Select>
          </div>
        </Space>
      </Card>

      {loading ? (
        <div style={{ textAlign: "center", padding: 50 }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Tổng đơn hàng"
                  value={overview?.totalOrders || 0}
                  prefix={<ShoppingCartOutlined />}
                  suffix={
                    comparison && (
                      <span
                        style={{
                          fontSize: 14,
                          color:
                            comparison.changes.ordersChange >= 0
                              ? "#3f8600"
                              : "#cf1322",
                        }}
                      >
                        {comparison.changes.ordersChange >= 0 ? (
                          <RiseOutlined />
                        ) : (
                          <FallOutlined />
                        )}
                        {Math.abs(comparison.changes.ordersChange).toFixed(1)}%
                      </span>
                    )
                  }
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Tổng doanh thu"
                  value={overview?.totalRevenue || 0}
                  prefix={<DollarOutlined />}
                  formatter={(value) => formatCurrency(Number(value))}
                  suffix={
                    comparison && (
                      <span
                        style={{
                          fontSize: 14,
                          color:
                            comparison.changes.revenueChange >= 0
                              ? "#3f8600"
                              : "#cf1322",
                        }}
                      >
                        {comparison.changes.revenueChange >= 0 ? (
                          <RiseOutlined />
                        ) : (
                          <FallOutlined />
                        )}
                        {Math.abs(comparison.changes.revenueChange).toFixed(1)}%
                      </span>
                    )
                  }
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Giá trị TB/đơn"
                  value={overview?.avgOrderValue || 0}
                  prefix={<DollarOutlined />}
                  formatter={(value) => formatCurrency(Number(value))}
                  suffix={
                    comparison && (
                      <span
                        style={{
                          fontSize: 14,
                          color:
                            comparison.changes.avgOrderValueChange >= 0
                              ? "#3f8600"
                              : "#cf1322",
                        }}
                      >
                        {comparison.changes.avgOrderValueChange >= 0 ? (
                          <RiseOutlined />
                        ) : (
                          <FallOutlined />
                        )}
                        {Math.abs(
                          comparison.changes.avgOrderValueChange
                        ).toFixed(1)}
                        %
                      </span>
                    )
                  }
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Tổng khách hàng"
                  value={customerStats?.totalCustomers || 0}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
          </Row>

          {/* Revenue Chart */}
          <Card title="Biểu đồ doanh thu" style={{ marginBottom: 24 }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis
                  yAxisId="left"
                  tickFormatter={(value) =>
                    `${(value / 1000000).toFixed(1)}M`
                  }
                />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value: any, name: string) => {
                    if (name === "revenue") return formatCurrency(value);
                    return value;
                  }}
                  labelFormatter={(label) => `Thời gian: ${label}`}
                />
                <Legend
                  formatter={(value) =>
                    value === "revenue" ? "Doanh thu" : "Số đơn"
                  }
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  stroke="#82ca9d"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Status and Payment Charts */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={12}>
              <Card title="Đơn hàng theo trạng thái">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Phương thức thanh toán">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={paymentChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) => formatCurrency(value)}
                    />
                    <Legend formatter={() => "Doanh thu"} />
                    <Bar dataKey="revenue" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          {/* Top Products */}
          <Card title="Top sản phẩm bán chạy" style={{ marginBottom: 24 }}>
            <Table
              dataSource={topProducts}
              columns={productColumns}
              rowKey="_id"
              pagination={false}
            />
          </Card>

          {/* Top Customers */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={12}>
              <Card title="Top khách hàng (theo số đơn)">
                <Table
                  dataSource={customerStats?.topCustomersByOrders || []}
                  columns={customerColumns}
                  rowKey="_id"
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Top khách hàng (theo doanh thu)">
                <Table
                  dataSource={customerStats?.topCustomersByRevenue || []}
                  columns={customerColumns}
                  rowKey="_id"
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
          </Row>

          {/* Recent Orders */}
          <Card title="Đơn hàng gần đây">
            <Table
              dataSource={recentOrders}
              columns={orderColumns}
              rowKey="_id"
              pagination={false}
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default Statistics;
