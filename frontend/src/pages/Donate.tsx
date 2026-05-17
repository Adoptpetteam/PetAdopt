import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Card, Button, Input, InputNumber, message, Space, Divider, Typography, Row, Col, Statistic } from "antd"
import { HeartOutlined, GiftOutlined, TrophyOutlined, DollarOutlined, MailOutlined, UserOutlined, MessageOutlined, ThunderboltOutlined, StarFilled } from "@ant-design/icons"
import { createVNPayPayment } from "../api/donateApi"
import { apiClient } from "../api/http"
import TopSupportersMarquee from "../components/TopSupportersMarquee"

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

interface Supporter {
  _id: string;
  name: string;
  amount: number;
  paidAt: string;
}

interface DonationStats {
  total: number;
  totalAmount: number;
  pending: number;
}

export default function Donate() {
  const [searchParams] = useSearchParams()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [messageText, setMessageText] = useState("")
  const [amount, setAmount] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [supporters, setSupporters] = useState<Supporter[]>([])
  const [stats, setStats] = useState<DonationStats>({ total: 0, totalAmount: 0, pending: 0 })

  const status = searchParams.get("status")
  const code = searchParams.get("code")

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        const user = JSON.parse(storedUser)
        if (user?.email) setEmail(user.email)
        if (user?.name) setName(user.name)
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    apiClient.get("/donate/supporters", { params: { limit: 50 } })
      .then(res => setSupporters(res.data.data || []))
      .catch(() => {})
    
    apiClient.get("/donate/statistics")
      .then(res => setStats(res.data.data || { total: 0, totalAmount: 0, pending: 0 }))
      .catch(() => {})
  }, [status])

  useEffect(() => {
    if (status === "success") {
      message.success({
        content: "🎉 Thanh toán thành công! Cảm ơn bạn đã ủng hộ ❤️",
        duration: 5,
      })
    } else if (status === "failed") {
      message.error("Thanh toán thất bại. Vui lòng thử lại.")
    }
  }, [status, code])

  const handleDonate = async () => {
    if (!amount || amount < 1000) {
      message.warning("Vui lòng nhập số tiền hợp lệ (tối thiểu 1,000 VND)")
      return
    }

    setLoading(true)
    try {
      const res = await createVNPayPayment({
        amount,
        name: name || undefined,
        email: email || undefined,
      })
      window.location.href = res.paymentUrl
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Tạo thanh toán thất bại")
    } finally {
      setLoading(false)
    }
  }

  const quickAmounts = [50000, 100000, 200000, 500000]
  
  const getVoucherTier = (amt: number | null) => {
    if (!amt) return null
    if (amt >= 500000) return { percent: 15, color: '#f59e0b', label: 'VIP' }
    if (amt >= 100000) return { percent: 10, color: '#10b981', label: 'Gold' }
    if (amt >= 50000) return { percent: 5, color: '#3b82f6', label: 'Silver' }
    return null
  }
  
  const voucherTier = getVoucherTier(amount)

  return (
    <div className="relative min-h-screen overflow-hidden" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    }}>
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative max-w-[1400px] mx-auto py-12 px-4">
        
        {/* Hero Header */}
        <div className="text-center mb-12 relative">
          <div className="inline-flex items-center justify-center w-24 h-24 mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full animate-ping opacity-20"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
              <HeartOutlined className="text-5xl text-white" />
            </div>
          </div>
          <Title level={1} className="!text-white !mb-3 !text-5xl font-black" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
            Ủng Hộ PetAdopt
          </Title>
          <Paragraph className="text-white/90 text-xl max-w-[700px] mx-auto font-medium" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
            Mỗi đóng góp của bạn là một tấm lòng vàng giúp chúng tôi chăm sóc và tìm mái ấm cho những bé thú cưng đáng yêu 🐾
          </Paragraph>
        </div>

        {/* Statistics */}
        <Row gutter={[24, 24]} className="mb-12">
          <Col xs={24} sm={8}>
            <Card className="text-center shadow-2xl border-0 overflow-hidden relative group hover:scale-105 transition-transform duration-300" 
              style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)' }}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-500"></div>
              <TrophyOutlined className="text-5xl text-yellow-500 mb-3" />
              <Statistic
                title={<span className="text-gray-700 font-bold text-base">Tổng Người Ủng Hộ</span>}
                value={stats.total}
                valueStyle={{ color: '#f59e0b', fontWeight: 'black', fontSize: '2.5rem' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="text-center shadow-2xl border-0 overflow-hidden relative group hover:scale-105 transition-transform duration-300"
              style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)' }}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-500"></div>
              <DollarOutlined className="text-5xl text-green-500 mb-3" />
              <Statistic
                title={<span className="text-gray-700 font-bold text-base">Tổng Số Tiền</span>}
                value={stats.totalAmount}
                suffix="đ"
                valueStyle={{ color: '#10b981', fontWeight: 'black', fontSize: '2.5rem' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="text-center shadow-2xl border-0 overflow-hidden relative group hover:scale-105 transition-transform duration-300"
              style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)' }}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500"></div>
              <GiftOutlined className="text-5xl text-blue-500 mb-3" />
              <Statistic
                title={<span className="text-gray-700 font-bold text-base">Đang Chờ Xử Lý</span>}
                value={stats.pending}
                valueStyle={{ color: '#6366f1', fontWeight: 'black', fontSize: '2.5rem' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Marquee */}
        {supporters.length > 0 && (
          <div className="mb-12">
            <TopSupportersMarquee />
          </div>
        )}

        <Row gutter={[32, 32]}>
          {/* Form */}
          <Col xs={24} lg={14}>
            <Card 
              className="shadow-2xl border-0 overflow-hidden"
              style={{ background: 'rgba(255, 255, 255, 0.98)', backdropFilter: 'blur(20px)' }}
              title={
                <div className="flex items-center gap-3 py-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                    <HeartOutlined className="text-white text-xl" />
                  </div>
                  <span className="text-2xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Thông Tin Ủng Hộ
                  </span>
                </div>
              }
            >
              <Space direction="vertical" size="large" className="w-full">
                <div>
                  <Text strong className="block mb-2 text-base">
                    <UserOutlined className="mr-2" />
                    Tên của bạn <Text type="secondary">(tuỳ chọn)</Text>
                  </Text>
                  <Input
                    size="large"
                    placeholder="Nguyễn Văn A"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    prefix={<UserOutlined className="text-gray-400" />}
                    className="rounded-xl hover:border-purple-400 focus:border-purple-500"
                    style={{ borderWidth: '2px' }}
                  />
                </div>

                <div>
                  <Text strong className="block mb-2 text-base">
                    <MailOutlined className="mr-2" />
                    Email <Text type="secondary">(để nhận voucher & lời cảm ơn)</Text>
                  </Text>
                  <Input
                    size="large"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    prefix={<MailOutlined className="text-gray-400" />}
                    className="rounded-xl hover:border-purple-400 focus:border-purple-500"
                    style={{ borderWidth: '2px' }}
                  />
                  <div className="mt-2 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200">
                    <Text className="text-yellow-800 font-medium text-sm">
                      <ThunderboltOutlined className="mr-1" />
                      Nhập email để nhận voucher giảm giá khi mua sắm!
                    </Text>
                  </div>
                </div>

                <div>
                  <Text strong className="block mb-2 text-base">
                    <DollarOutlined className="mr-2" />
                    Số tiền ủng hộ <Text type="danger">*</Text>
                  </Text>
                  <InputNumber
                    size="large"
                    placeholder="Nhập số tiền (VND)"
                    value={amount}
                    onChange={(val) => setAmount(val)}
                    min={1000}
                    step={10000}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                    className="w-full rounded-xl"
                    addonBefore={<DollarOutlined />}
                    addonAfter="VND"
                    style={{ width: '100%', borderWidth: '2px' }}
                  />
                  
                  <div className="mt-4 flex flex-wrap gap-3">
                    {quickAmounts.map((amt) => (
                      <Button
                        key={amt}
                        size="large"
                        onClick={() => setAmount(amt)}
                        className={`rounded-full font-bold transition-all ${
                          amount === amt 
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0 shadow-lg scale-110' 
                            : 'bg-white hover:bg-gray-50'
                        }`}
                        style={{ borderWidth: '2px', borderColor: amount === amt ? 'transparent' : '#e5e7eb' }}
                      >
                        {(amt / 1000).toLocaleString()}k
                      </Button>
                    ))}
                  </div>

                  {voucherTier && (
                    <div className="mt-4 p-5 rounded-2xl relative overflow-hidden shadow-xl"
                      style={{ 
                        background: `linear-gradient(135deg, ${voucherTier.color}15 0%, ${voucherTier.color}30 100%)`,
                        border: `3px solid ${voucherTier.color}40`
                      }}>
                      <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-30"
                        style={{ background: voucherTier.color }}></div>
                      <div className="relative flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                          style={{ background: voucherTier.color }}>
                          <StarFilled className="text-white text-2xl" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Text className="font-black text-lg" style={{ color: voucherTier.color }}>
                              {voucherTier.label} Tier
                            </Text>
                            <div className="px-3 py-1 rounded-full text-white font-bold text-sm"
                              style={{ background: voucherTier.color }}>
                              -{voucherTier.percent}%
                            </div>
                          </div>
                          <Text className="text-gray-700 font-medium">
                            🎁 Bạn sẽ nhận voucher giảm {voucherTier.percent}% khi ủng hộ!
                          </Text>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Text strong className="block mb-2 text-base">
                    <MessageOutlined className="mr-2" />
                    Lời nhắn <Text type="secondary">(tuỳ chọn)</Text>
                  </Text>
                  <TextArea
                    rows={4}
                    placeholder="Gửi lời động viên đến PetAdopt..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="rounded-xl hover:border-purple-400 focus:border-purple-500"
                    style={{ borderWidth: '2px' }}
                  />
                </div>

                <Divider className="my-2" />

                <Button
                  type="primary"
                  size="large"
                  block
                  loading={loading}
                  onClick={handleDonate}
                  icon={<HeartOutlined />}
                  className="border-0 rounded-2xl font-black text-xl shadow-2xl hover:shadow-3xl transition-all hover:scale-105"
                  style={{ 
                    height: '70px',
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  }}
                >
                  {loading ? "Đang chuyển..." : "💖 Ủng Hộ Ngay"}
                </Button>

                <Text type="secondary" className="text-center block text-sm">
                  🔒 Thanh toán an toàn qua cổng VNPay
                </Text>
              </Space>
            </Card>
          </Col>

          {/* QR & Info */}
          <Col xs={24} lg={10}>
            <Space direction="vertical" size="large" className="w-full">
              <Card 
                className="shadow-2xl border-0 text-center overflow-hidden"
                style={{ background: 'rgba(255, 255, 255, 0.98)', backdropFilter: 'blur(20px)' }}
                title={
                  <span className="text-xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Hoặc Chuyển Khoản Thủ Công
                  </span>
                }
              >
                <img
                  src="https://img.vietqr.io/image/970422-123456789-compact.png"
                  alt="QR Code"
                  className="w-72 mx-auto rounded-2xl shadow-xl mb-6"
                />
                <Divider />
                <Space direction="vertical" size="middle" className="w-full">
                  <Text strong className="text-lg block">Thông Tin Chuyển Khoản</Text>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <Text className="text-gray-600">🏦 Ngân hàng:</Text>
                      <Text strong className="text-lg">MB Bank</Text>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <Text className="text-gray-600">💳 Số tài khoản:</Text>
                      <Text strong code className="text-lg">123456789</Text>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <Text className="text-gray-600">👤 Chủ tài khoản:</Text>
                      <Text strong className="text-lg">PET ADOPTION</Text>
                    </div>
                  </div>
                </Space>
              </Card>

              <Card 
                className="shadow-2xl border-0 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
              >
                <Space direction="vertical" size="middle" className="w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
                      <GiftOutlined className="text-white text-2xl" />
                    </div>
                    <Title level={4} className="!text-white !mb-0 !text-2xl font-black">
                      🎁 Ưu Đãi Khi Ủng Hộ
                    </Title>
                  </div>
                  <Divider className="!bg-white/30 !my-3" />
                  <div className="space-y-3">
                    {[
                      { min: '50k-99k', percent: 5, color: '#3b82f6', tier: 'Silver' },
                      { min: '100k-499k', percent: 10, color: '#10b981', tier: 'Gold' },
                      { min: '≥500k', percent: 15, color: '#f59e0b', tier: 'VIP' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur rounded-xl hover:bg-white/20 transition-all">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white"
                          style={{ background: item.color }}>
                          {item.percent}%
                        </div>
                        <div className="flex-1">
                          <Text className="text-white font-bold block">Ủng hộ {item.min}</Text>
                          <Text className="text-white/80 text-sm">{item.tier} • Voucher giảm {item.percent}%</Text>
                        </div>
                        <StarFilled className="text-yellow-300 text-xl" />
                      </div>
                    ))}
                  </div>
                  <Divider className="!bg-white/30 !my-3" />
                  <Text className="text-white/90 text-sm block text-center">
                    ✨ Voucher có hạn sử dụng 3 tháng và được gửi qua email ngay sau khi ủng hộ thành công!
                  </Text>
                </Space>
              </Card>
            </Space>
          </Col>
        </Row>
      </div>
    </div>
  )
}
