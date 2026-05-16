import { useState } from "react"
import { Form, Input, InputNumber, Select, Button, message, Card } from "antd"
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  HeartOutlined,
  ClockCircleOutlined,
  TrophyOutlined
} from "@ant-design/icons"
import { apiClient } from "../api/http"

const { TextArea } = Input
const { Option } = Select

export default function Volunteer() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      await apiClient.post('/volunteer', values)
      message.success('Đăng ký tình nguyện viên thành công! Chúng tôi sẽ liên hệ với bạn sớm.')
      form.resetFields()
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative bg-[#6272B6] text-white py-20">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Trở Thành Tình Nguyện Viên</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Hãy cùng chúng tôi mang lại cuộc sống tốt đẹp hơn cho những bé thú cưng đáng yêu
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Benefit Cards */}
          <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-[#6272B6] to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <HeartOutlined className="text-3xl text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Làm Điều Ý Nghĩa</h3>
            <p className="text-gray-600">
              Giúp đỡ những bé thú cưng tìm được mái ấm mới và cuộc sống hạnh phúc
            </p>
          </Card>

          <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrophyOutlined className="text-3xl text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Học Hỏi Kinh Nghiệm</h3>
            <p className="text-gray-600">
              Tích lũy kiến thức và kỹ năng chăm sóc thú cưng từ các chuyên gia
            </p>
          </Card>

          <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClockCircleOutlined className="text-3xl text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Thời Gian Linh Hoạt</h3>
            <p className="text-gray-600">
              Lựa chọn thời gian phù hợp với lịch trình của bạn
            </p>
          </Card>
        </div>

        {/* Registration Form */}
        <Card 
          className="shadow-2xl border-0"
          title={
            <div className="text-center py-4">
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-[#6272B6]">
                Đăng Ký Tình Nguyện Viên
              </h2>
              <p className="text-gray-500 mt-2">Điền thông tin của bạn để tham gia cùng chúng tôi</p>
            </div>
          }
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="max-w-3xl mx-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                label={<span className="font-semibold">Họ và tên</span>}
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
              >
                <Input 
                  size="large" 
                  prefix={<UserOutlined className="text-gray-400" />} 
                  placeholder="Nguyễn Văn A"
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-semibold">Email</span>}
                name="email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' }
                ]}
              >
                <Input 
                  size="large" 
                  prefix={<MailOutlined className="text-gray-400" />} 
                  placeholder="example@gmail.com"
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-semibold">Số điện thoại</span>}
                name="phone"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
              >
                <Input 
                  size="large" 
                  prefix={<PhoneOutlined className="text-gray-400" />} 
                  placeholder="0901234567"
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-semibold">Tuổi</span>}
                name="age"
              >
                <InputNumber 
                  size="large" 
                  min={16} 
                  max={100} 
                  placeholder="25"
                  className="w-full rounded-lg"
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-semibold">Kinh nghiệm chăm sóc thú cưng</span>}
                name="experience"
              >
                <Select size="large" placeholder="Chọn mức độ kinh nghiệm" className="rounded-lg">
                  <Option value="Chưa có kinh nghiệm">Chưa có kinh nghiệm</Option>
                  <Option value="Đã nuôi thú cưng tại nhà">Đã nuôi thú cưng tại nhà</Option>
                  <Option value="Đã làm tình nguyện viên">Đã làm tình nguyện viên</Option>
                  <Option value="Làm việc trong lĩnh vực thú y">Làm việc trong lĩnh vực thú y</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label={<span className="font-semibold">Thời gian có thể tham gia</span>}
                name="availability"
              >
                <Select size="large" placeholder="Chọn thời gian" className="rounded-lg">
                  <Option value="Cuối tuần">Cuối tuần</Option>
                  <Option value="Thứ 7">Thứ 7</Option>
                  <Option value="Chủ nhật">Chủ nhật</Option>
                  <Option value="Buổi tối các ngày trong tuần">Buổi tối các ngày trong tuần</Option>
                  <Option value="Linh hoạt">Linh hoạt</Option>
                </Select>
              </Form.Item>
            </div>

            <Form.Item
              label={<span className="font-semibold">Lý do muốn trở thành tình nguyện viên</span>}
              name="reason"
              rules={[{ required: true, message: 'Vui lòng cho chúng tôi biết lý do của bạn' }]}
            >
              <TextArea 
                rows={4} 
                placeholder="Chia sẻ lý do bạn muốn tham gia làm tình nguyện viên..."
                className="rounded-lg"
              />
            </Form.Item>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                <strong>📌 Lưu ý:</strong> Sau khi gửi đơn đăng ký, chúng tôi sẽ xem xét và liên hệ với bạn trong vòng 2-3 ngày làm việc. 
                Bạn có thể được mời tham gia buổi phỏng vấn và định hướng trước khi chính thức trở thành tình nguyện viên.
              </p>
            </div>

            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                className="w-full h-12 text-lg font-semibold rounded-lg bg-gradient-to-r from-[#6272B6] to-purple-600 border-0 hover:opacity-90"
              >
                Gửi Đơn Đăng Ký
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">❓ Câu Hỏi Thường Gặp</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <h3 className="font-bold text-lg mb-2 text-[#6272B6]">Tôi cần có kinh nghiệm không?</h3>
              <p className="text-gray-600">
                Không cần! Chúng tôi sẽ đào tạo và hướng dẫn bạn mọi kỹ năng cần thiết.
              </p>
            </Card>

            <Card className="border-0 shadow-lg">
              <h3 className="font-bold text-lg mb-2 text-[#6272B6]">Tôi cần cam kết bao lâu?</h3>
              <p className="text-gray-600">
                Không có cam kết cứng nhắc. Bạn có thể tham gia theo thời gian rảnh của mình.
              </p>
            </Card>

            <Card className="border-0 shadow-lg">
              <h3 className="font-bold text-lg mb-2 text-[#6272B6]">Công việc của tình nguyện viên là gì?</h3>
              <p className="text-gray-600">
                Chăm sóc thú cưng, dọn dẹp, hỗ trợ sự kiện, và giúp đỡ trong quá trình nhận nuôi.
              </p>
            </Card>

            <Card className="border-0 shadow-lg">
              <h3 className="font-bold text-lg mb-2 text-[#6272B6]">Có được đào tạo không?</h3>
              <p className="text-gray-600">
                Có! Chúng tôi có chương trình đào tạo và định hướng cho tất cả tình nguyện viên mới.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
