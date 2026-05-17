import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Card, Button, Input, InputNumber, message, Space, Divider, Typography, Row, Col, Statistic } from "antd"
import { HeartOutlined, GiftOutlined, TrophyOutlined, DollarOutlined, MailOutlined, UserOutlined, MessageOutlined } from "@ant-design/icons"
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

  // Fetch danh sách người ủng hộ
  useEffect(() => {
    apiClient.get("/donate/supporters", { params: { limit: 50 } })
      .then(res => setSupporters(res.data.data || []))
      .catch(() => {})
    
    // Fetch statistics
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

  return (
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen py-12 px-4">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#6272B6] to-[#8B9FE8] rounded-full mb-4 shadow-lg">
            <HeartOutlined className="text-4xl text-white" />
          </div>
          <Title level={1} className="!text-[#6272B6] !mb-2">
            Ủng hộ PetAdopt
          </Title>
          <Paragraph className="text-gray-600 text-lg max-w-[600px] mx-auto">
            Mỗi đóng góp của bạn giúp chúng tôi chăm sóc và tìm mái ấm cho những bé thú cưng đáng yêu 🐾
          </Paragraph>
        </div>

        {/* Statistics */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={8}>
            <Card className="text-center shadow-md hover:shadow-lg transition-shadow border-0 bg-white/80 backdrop-blur">
              <Statistic
                title={<span className="text-gray-600 font-medium">Tổng người ủng hộ</span>}
                value={stats.total}
                prefix={<TrophyOutlined className="text-yellow-500" />}
                valueStyle={{ color: '#6272B6', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="text-center shadow-md hover:shadow-lg transition-shadow border-0 bg-white/80 backdrop-blur">
              <Statistic
                title={<span className="text-gray-600 font-medium">Tổng số tiền</span>}
                value={stats.totalAmount}
                suffix="đ"
                prefix={<DollarOutlined className="text-green-500" />}
                valueStyle={{ color: '#10b981', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="text-center shadow-md hover:shadow-lg transition-shadow border-0 bg-white/80 backdrop-blur">
              <Statistic
                title={<span className="text-gray-600 font-medium">Đang chờ xử lý</span>}
                value={stats.pending}
                prefix={<GiftOutlined className="text-blue-500" />}
                valueStyle={{ color: '#6272B6', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Marquee */}
        {supporters.length > 0 && (
          <div className="mb-8">
            <TopSupportersMarquee />
          </div>
        )}

        <Row gutter={[24, 24]}>
          {/* Form ủng hộ */}
          <Col xs={24} lg={14}>
            <Card 
              className="shadow-xl border-0 bg-white/90 backdrop-blur"
              title={
                <Space>
                  <HeartOutlined className="text-[#6272B6]" />
                  <span className="text-[#6272B6] font-bold">Thông tin ủng hộ</span>
                </Space>
              }
            >
              <Space direction="vertical" size="large" className="w-full">
                {/* Tên */}
                <div>
                  <Text strong className="block mb-2">
                    <UserOutlined className="mr-2" />
                    Tên của bạn <Text type="secondary">(tuỳ chọn)</Text>
                  </Text>
                  <Input
                    size="large"
                    placeholder="Nguyễn Văn A"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    prefix={<UserOutlined className="text-gray-400" />}
                    className="rounded-lg"
                  />
                </div>

                {/* Email */}
                <div>
                  <Text strong className="block mb-2">
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
                    className="rounded-lg"
                  />
                  <Text type="secondary" className="text-xs block mt-1">
                    💡 Nhập email để nhận voucher giảm giá khi mua sắm!
                  </Text>
                </div>

                {/* Số tiền */}
                <div>
                  <Text strong className="block mb-2">
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
                    className="w-full rounded-lg"
                    addonBefore={<DollarOutlined className="text-gray-400" />}
                    addonAfter="VND"
                    style={{ width: '100%' }}
                  />
                  
                  {/* Quick amounts */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {quickAmounts.map((amt) => (
                      <Button
                        key={amt}
                        size="small"
                        onClick={() => setAmount(amt)}
                        className={`rounded-full ${amount === amt ? 'bg-[#6272B6] text-white border-[#6272B6]' : ''}`}
                      >
                        {(amt / 1000).toLocaleString()}k
                      </Button>
                    ))}
                  </div>

                  {/* Voucher info */}
                  {amount && amount >= 50000 && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                      <Text className="text-green-700 font-medium">
                        🎁 Bạn sẽ nhận voucher giảm{' '}
                        {amount >= 500000 ? '15%' : amount >= 100000 ? '10%' : '5%'} khi ủng hộ!
                      </Text>
                    </div>
                  )}
                </div>

                {/* Lời nhắn */}
                <div>
                  <Text strong className="block mb-2">
                    <MessageOutlined className="mr-2" />
                    Lời nhắn <Text type="secondary">(tuỳ chọn)</Text>
                  </Text>
                  <TextArea
                    rows={4}
                    placeholder="Gửi lời động viên đến PetAdopt..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="rounded-lg"
                  />
                </div>

                <Divider />

                {/* Button */}
                <Button
                  type="primary"
                  size="large"
                  block
                  loading={loading}
                  onClick={handleDonate}
                  icon={<HeartOutlined />}
                  className="!bg-gradient-to-r from-[#6272B6] to-[#8B9FE8] border-0 !h-14 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  {loading ? "Đang chuyển..." : "Ủng hộ qua VNPay"}
                </Button>

                <Text type="secondary" className="text-center block text-xs">
                  🔒 Thanh toán an toàn qua cổng VNPay
                </Text>
              </Space>
            </Card>
          </Col>

          {/* QR Code & Info */}
          <Col xs={24} lg={10}>
            <Space direction="vertical" size="large" className="w-full">
              {/* QR Card */}
              <Card 
                className="shadow-xl border-0 bg-white/90 backdrop-blur text-center"
                title={
                  <span className="text-[#6272B6] font-bold">
                    Hoặc chuyển khoản thủ công
                  </span>
                }
              >
                <img
                  src="https://img.vietqr.io/image/970422-123456789-compact.png"
                  alt="QR Code"
                  className="w-64 mx-auto rounded-lg shadow-md mb-4"
                />
                <Divider />
                <Space direction="vertical" size="small" className="w-full">
                  <Text strong className="text-base">Thông tin chuyển khoản</Text>
                  <Text>🏦 Ngân hàng: <Text strong>MB Bank</Text></Text>
                  <Text>💳 STK: <Text strong code>123456789</Text></Text>
                  <Text>👤 Chủ TK: <Text strong>PET ADOPTION</Text></Text>
                </Space>
              </Card>

              {/* Info Card */}
              <Card 
                className="shadow-xl border-0 bg-gradient-to-br from-[#6272B6] to-[#8B9FE8] text-white"
              >
                <Space direction="vertical" size="middle" className="w-full">
                  <Title level={4} className="!text-white !mb-0">
                    🎁 Ưu đãi khi ủng hộ
                  </Title>
                  <Divider className="!bg-white/30 !my-2" />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <Text className="text-white">Ủng hộ <strong>50k-99k</strong>: Voucher giảm <strong>5%</strong></Text>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <Text className="text-white">Ủng hộ <strong>100k-499k</strong>: Voucher giảm <strong>10%</strong></Text>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <Text className="text-white">Ủng hộ <strong>≥500k</strong>: Voucher giảm <strong>15%</strong></Text>
                    </div>
                  </div>
                  <Divider className="!bg-white/30 !my-2" />
                  <Text className="text-white/90 text-sm">
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