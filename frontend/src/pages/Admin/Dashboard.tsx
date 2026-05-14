import { useEffect, useState } from "react"
import { message, Card, Row, Col, Statistic, Progress, Avatar, List, Badge } from "antd"
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
import { getAdoptionRequests } from "../../api/adoptionApi"
import { apiClient } from "../../api/http"
import StatisticsWidget from "../../components/StatisticsWidget"

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
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

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      // Fetch users count
      const usersRes = await apiClient.get('/admin/users')
      const totalUsers = usersRes.data?.data?.length || 0

      // Fetch pets count  
      const petsRes = await apiClient.get('/admin/pets')
      const totalPets = petsRes.data?.data?.length || 0

      // Fetch orders count and revenue
      const ordersRes = await apiClient.get('/admin/orders')
      const orders = ordersRes.data?.data || []
      const totalOrders = orders.length
      const totalRevenue = orders
        .filter((order: any) => order.status === 'completed')
        .reduce((sum: number, order: any) => sum + (order.total || 0), 0)

      // Fetch donations
      let totalDonations = 0
      try {
        const donationsRes = await apiClient.get('/admin/supporters')
        totalDonations = donationsRes.data?.data?.length || 0
      } catch (error) {
        console.log('Donations API not available')
      }

      // Fetch volunteers
      let totalVolunteers = 0
      try {
        const volunteersRes = await apiClient.get('/admin/volunteers')
        totalVolunteers = volunteersRes.data?.data?.length || 0
      } catch (error) {
        console.log('Volunteers API not available')
      }

      // Fetch adoptions
      let totalAdoptions = 0
      try {
        const adoptionsRes = await apiClient.get('/admin/adoptions')
        const adoptions = adoptionsRes.data?.data || []
        totalAdoptions = adoptions.filter((a: any) => a.status === 'approved').length
      } catch (error) {
        console.log('Adoptions API not available')
      }

      setDashboardData({
        totalUsers,
        totalPets,
        totalOrders,
        totalRevenue,
        totalDonations,
        totalVolunteers,
        totalAdoptions,
      })

      // Get mixed recent activities
      const activities = []

      // Recent orders
      const recentOrders = orders
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 2)
        .map((order: any) => ({
          user: order.customer?.name || 'Khách hàng',
          action: 'đã đặt hàng',
          pet: `${order.items?.length || 0} sản phẩm`,
          time: new Date(order.createdAt).toLocaleString('vi-VN'),
          avatar: '🛒'
        }))

      activities.push(...recentOrders)

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
        const volunteersRes = await apiClient.get('/admin/volunteers')
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
      trend: "+12%" 
    },
    { 
      title: "Thú cưng", 
      value: dashboardData.totalPets, 
      icon: <BugOutlined />, 
      color: "#ec4899", 
      trend: "+5%" 
    },
    { 
      title: "Đơn hàng", 
      value: dashboardData.totalOrders, 
      icon: <ShoppingCartOutlined />, 
      color: "#10b981", 
      trend: "+18%" 
    },
    { 
      title: "Doanh thu", 
      value: `${(dashboardData.totalRevenue / 1000000).toFixed(1)}M`, 
      icon: <TrophyOutlined />, 
      color: "#f59e0b", 
      trend: "+25%" 
    },
    { 
      title: "Nhận nuôi", 
      value: dashboardData.totalAdoptions, 
      icon: <HeartOutlined />, 
      color: "#ef4444", 
      trend: "+8%" 
    },
    { 
      title: "Tình nguyện viên", 
      value: dashboardData.totalVolunteers, 
      icon: <UserOutlined />, 
      color: "#8b5cf6", 
      trend: "+15%" 
    },
    { 
      title: "Người ủng hộ", 
      value: dashboardData.totalDonations, 
      icon: <TrophyOutlined />, 
      color: "#06b6d4", 
      trend: "+20%" 
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
                  className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  style={{
                    background: `linear-gradient(135deg, ${stat.color}15, white)`,
                    borderTop: `4px solid ${stat.color}`
                  }}
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
            <Col xs={24} lg={16}>
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
                      valueStyle={{ color: '#6272B6', fontSize: '24px', fontWeight: 'bold' }}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="Chờ duyệt"
                      value={stats.pending}
                      prefix={<ClockCircleOutlined style={{ color: '#f59e0b' }} />}
                      valueStyle={{ color: '#f59e0b', fontSize: '24px', fontWeight: 'bold' }}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="Đã duyệt"
                      value={stats.approved}
                      prefix={<CheckCircleOutlined style={{ color: '#10b981' }} />}
                      valueStyle={{ color: '#10b981', fontSize: '24px', fontWeight: 'bold' }}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="Từ chối"
                      value={stats.rejected}
                      prefix={<CloseCircleOutlined style={{ color: '#ef4444' }} />}
                      valueStyle={{ color: '#ef4444', fontSize: '24px', fontWeight: 'bold' }}
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
                      trailColor="#f3f4f6"
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
                      trailColor="#f3f4f6"
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
                <List
                  dataSource={recentActivities}
                  renderItem={(item) => (
                    <List.Item className="border-0 px-0">
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            size={40} 
                            style={{ 
                              backgroundColor: '#6272B6',
                              fontSize: '18px'
                            }}
                          >
                            {item.avatar}
                          </Avatar>
                        }
                        title={
                          <div className="text-sm">
                            <span className="font-medium text-gray-800">{item.user}</span>
                            <span className="text-gray-500 mx-1">{item.action}</span>
                            <span className="font-medium text-[#6272B6]">{item.pet}</span>
                          </div>
                        }
                        description={
                          <span className="text-xs text-gray-400">{item.time}</span>
                        }
                      />
                    </List.Item>
                  )}
                />
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
        </>
      )}
    </div>
  )
}
