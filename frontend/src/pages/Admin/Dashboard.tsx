import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { message, Card, Row, Col, Statistic, Progress, Avatar, Badge } from "antd"
import { 
  HeartOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  TrophyOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  BugOutlined,
  RiseOutlined,
  FallOutlined
} from "@ant-design/icons"
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts'
import { getAdoptionRequests } from "../../api/adoptionApi"
import { apiClient } from "../../api/http"
import StatisticsWidget from "../../components/StatisticsWidget"
import TopSupporters from "../../components/TopSupporters"

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  })
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0,
  })
  const [productStats, setProductStats] = useState({
    total: 0,
    inStock: 0,
    outOfStock: 0,
    lowStockCount: 0,
  })
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalPets: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalDonations: 0,
    totalVolunteers: 0,
    totalAdoptions: 0,
  })
  const [recentActivities, setRecentActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState({
    revenueData: [],
    topProducts: [],
    userGrowth: []
  })

  // Data cho biểu đồ
  const COLORS = ['#6272B6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard stats from new API
      const dashboardRes = await apiClient.get('/admin/dashboard')
      const data = dashboardRes.data.data
      
      setDashboardData({
        totalUsers: data.totalUsers || 0,
        totalPets: data.totalPets || 0,
        totalOrders: orderStats.total,
        totalRevenue: orderStats.totalRevenue,
        totalDonations: data.totalSupporters || 0,
        totalVolunteers: data.approvedVolunteers || 0,
        totalAdoptions: data.approvedAdoptions || 0,
      })

      // Fetch analytics data
      try {
        const analyticsRes = await apiClient.get('/admin/analytics')
        const analyticsData = analyticsRes.data.data
        setAnalyticsData({
          revenueData: analyticsData.revenueData || [],
          topProducts: analyticsData.topProducts || [],
          userGrowth: analyticsData.userGrowth || []
        })
      } catch (error) {
        console.log('Analytics data not available')
      }

      // Get mixed recent activities
      const activities = []

      // Recent orders
      try {
        const ordersRes = await apiClient.get('/admin/orders')
        const orders = ordersRes.data?.data || []
        const recentOrders = orders
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 2)
          .map((order: any) => ({
            user: order.user?.name || 'Khách hàng',
            action: 'đã đặt hàng',
            pet: `${order.items?.length || 0} sản phẩm`,
            time: new Date(order.createdAt).toLocaleString('vi-VN'),
            avatar: '🛒'
          }))
        activities.push(...recentOrders)
      } catch (error) {
        console.log('Recent orders not available')
      }

      // Recent adoptions (if available)
      try {
        const adoptionsRes = await apiClient.get('/admin/adoptions')
        const adoptions = adoptionsRes.data?.data || []
        const recentAdoptions = adoptions
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 1)
          .map((adoption: any) => ({
            user: adoption.user?.name || 'Người dùng',
            action: 'đã nhận nuôi',
            pet: adoption.pet?.name || 'thú cưng',
            time: new Date(adoption.createdAt).toLocaleString('vi-VN'),
            avatar: '🐾'
          }))
        activities.push(...recentAdoptions)
      } catch (error) {
        console.log('Recent adoptions not available')
      }

      // Recent volunteers (if available)
      try {
        const volunteersRes = await apiClient.get('/volunteer')
        const volunteers = volunteersRes.data?.data || []
        const recentVolunteers = volunteers
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 1)
          .map((volunteer: any) => ({
            user: volunteer.name || 'Tình nguyện viên',
            action: 'đã đăng ký',
            pet: 'tình nguyện viên',
            time: new Date(volunteer.createdAt).toLocaleString('vi-VN'),
            avatar: '🤝'
          }))
        activities.push(...recentVolunteers)
      } catch (error) {
        console.log('Recent volunteers not available')
      }

      // Sort all activities by time and take top 4
      const sortedActivities = activities
        .sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 4)

      setRecentActivities(sortedActivities)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // Fetch adoption requests
        const adoptionRes = await getAdoptionRequests({ limit: 100 })
        const adoptionData = adoptionRes.data || []
        setStats({
          total: adoptionData.length,
          pending: adoptionData.filter((o: any) => o.status === "pending").length,
          approved: adoptionData.filter((o: any) => o.status === "approved").length,
          rejected: adoptionData.filter((o: any) => o.status === "rejected").length,
        })

        // Fetch order statistics
        try {
          const orderStatsRes = await apiClient.get('/orders/statistics')
          const orderData = orderStatsRes.data.data.overview
          setOrderStats({
            total: orderData.total,
            pending: orderData.pending,
            completed: orderData.completed,
            cancelled: orderData.cancelled,
            totalRevenue: orderData.totalRevenue,
          })
        } catch (error) {
          console.log('Order statistics not available')
        }

        // Fetch product statistics
        try {
          const productStatsRes = await apiClient.get('/products/statistics')
          const productData = productStatsRes.data.data.overview
          setProductStats({
            total: productData.total,
            inStock: productData.inStock,
            outOfStock: productData.outOfStock,
            lowStockCount: productData.lowStockCount,
          })
        } catch (error) {
          console.log('Product statistics not available')
        }

        // Fetch dashboard data
        await fetchDashboardData()
      } catch (error) {
        message.error("Không tải được dữ liệu")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Create quick stats with real data
  const quickStats = [
    { 
      title: "Tổng người dùng", 
      value: dashboardData.totalUsers, 
      icon: <UserOutlined />, 
      color: "#6366f1", 
      trend: "+12%",
      link: "/admin/users"
    },
    { 
      title: "Thú cưng", 
      value: dashboardData.totalPets, 
      icon: <BugOutlined />, 
      color: "#ec4899", 
      trend: "+5%",
      link: "/admin/pets"
    },
    { 
      title: "Đơn hàng", 
      value: orderStats.total, 
      icon: <ShoppingCartOutlined />, 
      color: "#10b981", 
      trend: "+18%",
      link: "/admin/orders"
    },
    { 
      title: "Doanh thu", 
      value: `${(orderStats.totalRevenue / 1000000).toFixed(1)}M`, 
      icon: <TrophyOutlined />, 
      color: "#f59e0b", 
      trend: "+25%",
      link: "/admin/orders"
    },
    { 
      title: "Nhận nuôi", 
      value: stats.approved, 
      icon: <HeartOutlined />, 
      color: "#ef4444", 
      trend: "+8%",
      link: "/admin/adoptions"
    },
    { 
      title: "Tình nguyện viên", 
      value: dashboardData.totalVolunteers, 
      icon: <UserOutlined />, 
      color: "#8b5cf6", 
      trend: "+15%",
      link: "/admin/volunteers"
    },
    { 
      title: "Sản phẩm", 
      value: productStats.total, 
      icon: <ShoppingCartOutlined />, 
      color: "#06b6d4", 
      trend: "+10%",
      link: "/admin/products"
    },
    { 
      title: "Người ủng hộ", 
      value: dashboardData.totalDonations, 
      icon: <TrophyOutlined />, 
      color: "#f97316", 
      trend: "+20%",
      link: "/admin/supporters"
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header với gradient */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#6272B6]/10 to-purple-600/10 rounded-3xl"></div>
        <div className="relative p-8 text-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6272B6] to-purple-600 mb-2">
            🎯 Dashboard Quản Trị
          </h1>
          <p className="text-gray-600 text-lg">Tổng quan hệ thống T1 Pet Adopt</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-[#6272B6] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải dữ liệu...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Quick Stats */}
          <Row gutter={[24, 24]}>
            {quickStats.map((stat, index) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={index}>
                <Card 
                  className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                  style={{
                    background: `linear-gradient(135deg, ${stat.color}15, white)`,
                    borderTop: `4px solid ${stat.color}`
                  }}
                  onClick={() => navigate(stat.link)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                      <div className="flex items-center gap-1 mt-2">
                        {stat.trend.startsWith('+') ? (
                          <RiseOutlined className="text-green-500" />
                        ) : (
                          <FallOutlined className="text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${
                          stat.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {stat.trend}
                        </span>
                      </div>
                    </div>
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl text-white"
                      style={{ backgroundColor: stat.color }}
                    >
                      {stat.icon}
                    </div>
                  </div>
                  
                  {/* Decorative element */}
                  <div 
                    className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 -translate-y-10 translate-x-10"
                    style={{ backgroundColor: stat.color }}
                  ></div>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Adoption Stats */}
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <div className="flex items-center gap-3">
                    <HeartOutlined className="text-[#6272B6]" />
                    <span className="text-lg font-bold">Thống Kê Nhận Nuôi</span>
                  </div>
                }
                className="shadow-lg border-0"
              >
                <Row gutter={[16, 16]}>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="Tổng đơn"
                      value={stats.total}
                      prefix={<HeartOutlined style={{ color: '#6272B6' }} />}
                      styles={{ content: { color: '#6272B6', fontSize: '24px', fontWeight: 'bold'  }}}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="Chờ duyệt"
                      value={stats.pending}
                      prefix={<ClockCircleOutlined style={{ color: '#f59e0b' }} />}
                      styles={{ content: { color: '#f59e0b', fontSize: '24px', fontWeight: 'bold'  }}}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="Đã duyệt"
                      value={stats.approved}
                      prefix={<CheckCircleOutlined style={{ color: '#10b981' }} />}
                      styles={{ content: { color: '#10b981', fontSize: '24px', fontWeight: 'bold'  }}}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="Từ chối"
                      value={stats.rejected}
                      prefix={<CloseCircleOutlined style={{ color: '#ef4444' }} />}
                      styles={{ content: { color: '#ef4444', fontSize: '24px', fontWeight: 'bold'  }}}
                    />
                  </Col>
                </Row>
                
                {/* Progress bars */}
                <div className="mt-6 space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Tỷ lệ duyệt</span>
                      <span className="text-sm font-medium">{stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%</span>
                    </div>
                    <Progress 
                      percent={stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0} 
                      strokeColor="#10b981"
                      railColor="#f3f4f6"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Đang chờ xử lý</span>
                      <span className="text-sm font-medium">{stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%</span>
                    </div>
                    <Progress 
                      percent={stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0} 
                      strokeColor="#f59e0b"
                      railColor="#f3f4f6"
                    />
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card 
                title={
                  <div className="flex items-center gap-3">
                    <ShoppingCartOutlined className="text-[#10b981]" />
                    <span className="text-lg font-bold">Thống Kê Đơn Hàng</span>
                  </div>
                }
                className="shadow-lg border-0"
              >
                <Row gutter={[16, 16]}>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="Tổng đơn"
                      value={orderStats.total}
                      prefix={<ShoppingCartOutlined style={{ color: '#6272B6' }} />}
                      styles={{ content: { color: '#6272B6', fontSize: '24px', fontWeight: 'bold'  }}}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="Chờ xử lý"
                      value={orderStats.pending}
                      prefix={<ClockCircleOutlined style={{ color: '#f59e0b' }} />}
                      styles={{ content: { color: '#f59e0b', fontSize: '24px', fontWeight: 'bold'  }}}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="Hoàn thành"
                      value={orderStats.completed}
                      prefix={<CheckCircleOutlined style={{ color: '#10b981' }} />}
                      styles={{ content: { color: '#10b981', fontSize: '24px', fontWeight: 'bold'  }}}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="Đã hủy"
                      value={orderStats.cancelled}
                      prefix={<CloseCircleOutlined style={{ color: '#ef4444' }} />}
                      styles={{ content: { color: '#ef4444', fontSize: '24px', fontWeight: 'bold'  }}}
                    />
                  </Col>
                </Row>
                
                {/* Progress bars */}
                <div className="mt-6 space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Tỷ lệ hoàn thành</span>
                      <span className="text-sm font-medium">{orderStats.total > 0 ? Math.round((orderStats.completed / orderStats.total) * 100) : 0}%</span>
                    </div>
                    <Progress 
                      percent={orderStats.total > 0 ? Math.round((orderStats.completed / orderStats.total) * 100) : 0} 
                      strokeColor="#10b981"
                      railColor="#f3f4f6"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Doanh thu</span>
                      <span className="text-sm font-medium">{(orderStats.totalRevenue / 1000000).toFixed(1)}M VNĐ</span>
                    </div>
                    <Progress 
                      percent={100} 
                      strokeColor="#f59e0b"
                      railColor="#f3f4f6"
                      showInfo={false}
                    />
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Product Stats */}
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <Card 
                title={
                  <div className="flex items-center gap-3">
                    <ShoppingCartOutlined className="text-[#06b6d4]" />
                    <span className="text-lg font-bold">Thống Kê Sản Phẩm</span>
                  </div>
                }
                className="shadow-lg border-0"
              >
                <Row gutter={[16, 16]}>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="Tổng sản phẩm"
                      value={productStats.total}
                      prefix={<ShoppingCartOutlined style={{ color: '#6272B6' }} />}
                      styles={{ content: { color: '#6272B6', fontSize: '24px', fontWeight: 'bold'  }}}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="Còn hàng"
                      value={productStats.inStock}
                      prefix={<CheckCircleOutlined style={{ color: '#10b981' }} />}
                      styles={{ content: { color: '#10b981', fontSize: '24px', fontWeight: 'bold'  }}}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="Hết hàng"
                      value={productStats.outOfStock}
                      prefix={<CloseCircleOutlined style={{ color: '#ef4444' }} />}
                      styles={{ content: { color: '#ef4444', fontSize: '24px', fontWeight: 'bold'  }}}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="Sắp hết"
                      value={productStats.lowStockCount}
                      prefix={<ClockCircleOutlined style={{ color: '#f59e0b' }} />}
                      styles={{ content: { color: '#f59e0b', fontSize: '24px', fontWeight: 'bold'  }}}
                    />
                  </Col>
                </Row>
                
                {/* Progress bars */}
                <div className="mt-6 space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Tỷ lệ còn hàng</span>
                      <span className="text-sm font-medium">{productStats.total > 0 ? Math.round((productStats.inStock / productStats.total) * 100) : 0}%</span>
                    </div>
                    <Progress 
                      percent={productStats.total > 0 ? Math.round((productStats.inStock / productStats.total) * 100) : 0} 
                      strokeColor="#10b981"
                      railColor="#f3f4f6"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Sản phẩm cần nhập thêm</span>
                      <span className="text-sm font-medium">{productStats.lowStockCount} sản phẩm</span>
                    </div>
                    <Progress 
                      percent={productStats.total > 0 ? Math.round((productStats.lowStockCount / productStats.total) * 100) : 0} 
                      strokeColor="#f59e0b"
                      railColor="#f3f4f6"
                    />
                  </div>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} lg={8}>
              <Card 
                title={
                  <div className="flex items-center gap-3">
                    <Badge dot color="#10b981">
                      <span className="text-lg font-bold">Hoạt Động Gần Đây</span>
                    </Badge>
                  </div>
                }
                className="shadow-lg border-0 h-full"
              >
                <div className="space-y-4">
                  {recentActivities.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                      <Avatar 
                        size={40} 
                        style={{ 
                          backgroundColor: '#6272B6',
                          fontSize: '18px',
                          flexShrink: 0
                        }}
                      >
                        {item.avatar}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm mb-1">
                          <span className="font-medium text-gray-800">{item.user}</span>
                          <span className="text-gray-500 mx-1">{item.action}</span>
                          <span className="font-medium text-[#6272B6]">{item.pet}</span>
                        </div>
                        <span className="text-xs text-gray-400">{item.time}</span>
                      </div>
                    </div>
                  ))}
                  {recentActivities.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      Chưa có hoạt động nào
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          </Row>

          {/* Statistics Widget */}
          <Card 
            title={
              <div className="flex items-center gap-3">
                <RiseOutlined className="text-[#6272B6]" />
                <span className="text-lg font-bold">Thống Kê Doanh Thu 30 Ngày</span>
              </div>
            }
            className="shadow-lg border-0"
          >
            <StatisticsWidget />
          </Card>

          {/* Biểu đồ Analytics */}
          <Row gutter={[24, 24]}>
            {/* Line Chart - Doanh thu 7 ngày */}
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <div className="flex items-center gap-3">
                    <RiseOutlined className="text-[#6272B6]" />
                    <span className="text-lg font-bold">📈 Doanh Thu 7 Ngày Qua</span>
                  </div>
                }
                className="shadow-lg border-0"
              >
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value: any) => {
                        if (typeof value === 'number' && value > 1000) {
                          return `${(value / 1000000).toFixed(1)}M đ`
                        }
                        return value
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="doanhthu" 
                      stroke="#6272B6" 
                      strokeWidth={3}
                      dot={{ fill: '#6272B6', r: 5 }}
                      activeDot={{ r: 8 }}
                      name="Doanh thu"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            {/* Bar Chart - Đơn hàng 7 ngày */}
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <div className="flex items-center gap-3">
                    <ShoppingCartOutlined className="text-[#10b981]" />
                    <span className="text-lg font-bold">📊 Đơn Hàng 7 Ngày Qua</span>
                  </div>
                }
                className="shadow-lg border-0"
              >
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="donhang" 
                      fill="#10b981" 
                      radius={[8, 8, 0, 0]}
                      name="Đơn hàng"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            {/* Pie Chart - Sản phẩm bán chạy */}
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <div className="flex items-center gap-3">
                    <TrophyOutlined className="text-[#f59e0b]" />
                    <span className="text-lg font-bold">🏆 Top Sản Phẩm Bán Chạy</span>
                  </div>
                }
                className="shadow-lg border-0"
              >
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.topProducts}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.topProducts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            {/* Area Chart - Tăng trưởng người dùng */}
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <div className="flex items-center gap-3">
                    <UserOutlined className="text-[#8b5cf6]" />
                    <span className="text-lg font-bold">👥 Tăng Trưởng Người Dùng</span>
                  </div>
                }
                className="shadow-lg border-0"
              >
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.userGrowth}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6272B6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#6272B6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPets" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="thang" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="nguoidung" 
                      stroke="#6272B6" 
                      fillOpacity={1} 
                      fill="url(#colorUsers)"
                      name="Người dùng"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="thucung" 
                      stroke="#10b981" 
                      fillOpacity={1} 
                      fill="url(#colorPets)"
                      name="Thú cưng"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          {/* Top Supporters */}
          <TopSupporters />
        </>
      )}
    </div>
  )
}
