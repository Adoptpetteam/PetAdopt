import { useEffect, useState } from "react"
import { Table, Tag, Button, message, Modal, Input, Space, Card, Statistic, Row, Col } from "antd"
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  ClockCircleOutlined,
  TeamOutlined
} from "@ant-design/icons"
import { apiClient } from "../../api/http"

const { TextArea } = Input

export default function Volunteers() {
  const [volunteers, setVolunteers] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedVolunteer, setSelectedVolunteer] = useState<any>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [actionModalVisible, setActionModalVisible] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve')
  const [adminNote, setAdminNote] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  })

  const fetchVolunteers = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get('/volunteer')
      const data = res.data.data || []
      setVolunteers(data)
      
      // Calculate stats
      setStats({
        total: data.length,
        pending: data.filter((v: any) => v.status === 'pending').length,
        approved: data.filter((v: any) => v.status === 'approved').length,
        rejected: data.filter((v: any) => v.status === 'rejected').length
      })
    } catch (error: any) {
      message.error('Không thể tải danh sách tình nguyện viên')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVolunteers()
  }, [])

  const handleApprove = async () => {
    if (!selectedVolunteer) return
    
    try {
      await apiClient.put(`/volunteer/${selectedVolunteer._id}/approve`, { adminNote })
      message.success('Đã duyệt tình nguyện viên!')
      setActionModalVisible(false)
      setAdminNote('')
      fetchVolunteers()
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Duyệt thất bại')
    }
  }

  const handleReject = async () => {
    if (!selectedVolunteer) return
    
    try {
      await apiClient.put(`/volunteer/${selectedVolunteer._id}/reject`, { adminNote })
      message.success('Đã từ chối tình nguyện viên')
      setActionModalVisible(false)
      setAdminNote('')
      fetchVolunteers()
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Từ chối thất bại')
    }
  }

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa đơn tình nguyện viên này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await apiClient.delete(`/volunteer/${id}`)
          message.success('Đã xóa đơn tình nguyện viên')
          fetchVolunteers()
        } catch (error: any) {
          message.error('Xóa thất bại')
        }
      }
    })
  }

  const openActionModal = (volunteer: any, type: 'approve' | 'reject') => {
    setSelectedVolunteer(volunteer)
    setActionType(type)
    setActionModalVisible(true)
    setAdminNote('')
  }

  const columns = [
    {
      title: 'Họ tên',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span className="font-semibold">{text}</span>
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: 'Tuổi',
      dataIndex: 'age',
      key: 'age',
      width: 80,
      render: (age: number) => age || 'N/A'
    },
    {
      title: 'Kinh nghiệm',
      dataIndex: 'experience',
      key: 'experience',
      render: (text: string) => text || 'Chưa có'
    },
    {
      title: 'Thời gian',
      dataIndex: 'availability',
      key: 'availability',
      render: (text: string) => text || 'N/A'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config = {
          pending: { color: 'orange', text: 'Chờ duyệt' },
          approved: { color: 'green', text: 'Đã duyệt' },
          rejected: { color: 'red', text: 'Từ chối' }
        }
        const { color, text } = config[status as keyof typeof config] || { color: 'default', text: status }
        return <Tag color={color}>{text}</Tag>
      }
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Thao tác',
      key: 'actions',
      fixed: 'right' as const,
      width: 200,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedVolunteer(record)
              setDetailModalVisible(true)
            }}
          >
            Chi tiết
          </Button>
          
          {record.status === 'pending' && (
            <>
              <Button
                type="link"
                icon={<CheckCircleOutlined />}
                onClick={() => openActionModal(record, 'approve')}
                className="text-green-600"
              >
                Duyệt
              </Button>
              <Button
                type="link"
                icon={<CloseCircleOutlined />}
                onClick={() => openActionModal(record, 'reject')}
                danger
              >
                Từ chối
              </Button>
            </>
          )}
          
          <Button
            type="link"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
            danger
          >
            Xóa
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#6272B6] to-purple-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">🤝 Quản Lý Tình Nguyện Viên</h1>
        <p className="opacity-90">Duyệt và quản lý các đơn đăng ký tình nguyện viên</p>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-lg">
            <Statistic
              title="Tổng đơn"
              value={stats.total}
              prefix={<TeamOutlined style={{ color: '#6272B6' }} />}
              valueStyle={{ color: '#6272B6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-lg">
            <Statistic
              title="Chờ duyệt"
              value={stats.pending}
              prefix={<ClockCircleOutlined style={{ color: '#f59e0b' }} />}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-lg">
            <Statistic
              title="Đã duyệt"
              value={stats.approved}
              prefix={<CheckCircleOutlined style={{ color: '#10b981' }} />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-lg">
            <Statistic
              title="Từ chối"
              value={stats.rejected}
              prefix={<CloseCircleOutlined style={{ color: '#ef4444' }} />}
              valueStyle={{ color: '#ef4444' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card className="shadow-lg border-0">
        <Table
          columns={columns}
          dataSource={volunteers}
          rowKey="_id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} đơn`
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <UserOutlined className="text-[#6272B6]" />
            <span>Chi Tiết Tình Nguyện Viên</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedVolunteer && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 text-sm">Họ tên</p>
                <p className="font-semibold">{selectedVolunteer.name}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Email</p>
                <p className="font-semibold">{selectedVolunteer.email}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Số điện thoại</p>
                <p className="font-semibold">{selectedVolunteer.phone}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Tuổi</p>
                <p className="font-semibold">{selectedVolunteer.age || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Kinh nghiệm</p>
                <p className="font-semibold">{selectedVolunteer.experience || 'Chưa có'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Thời gian có thể tham gia</p>
                <p className="font-semibold">{selectedVolunteer.availability || 'N/A'}</p>
              </div>
            </div>

            <div>
              <p className="text-gray-500 text-sm mb-2">Lý do muốn trở thành tình nguyện viên</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p>{selectedVolunteer.reason}</p>
              </div>
            </div>

            {selectedVolunteer.adminNote && (
              <div>
                <p className="text-gray-500 text-sm mb-2">Ghi chú admin</p>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p>{selectedVolunteer.adminNote}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="text-gray-500 text-sm">Trạng thái</p>
                <Tag color={
                  selectedVolunteer.status === 'approved' ? 'green' :
                  selectedVolunteer.status === 'rejected' ? 'red' : 'orange'
                }>
                  {selectedVolunteer.status === 'approved' ? 'Đã duyệt' :
                   selectedVolunteer.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                </Tag>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Ngày đăng ký</p>
                <p className="font-semibold">
                  {new Date(selectedVolunteer.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Action Modal (Approve/Reject) */}
      <Modal
        title={actionType === 'approve' ? '✅ Duyệt Tình Nguyện Viên' : '❌ Từ Chối Tình Nguyện Viên'}
        open={actionModalVisible}
        onCancel={() => {
          setActionModalVisible(false)
          setAdminNote('')
        }}
        onOk={actionType === 'approve' ? handleApprove : handleReject}
        okText={actionType === 'approve' ? 'Duyệt' : 'Từ chối'}
        cancelText="Hủy"
        okButtonProps={{ 
          className: actionType === 'approve' ? 'bg-green-600' : 'bg-red-600'
        }}
      >
        {selectedVolunteer && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>Họ tên:</strong> {selectedVolunteer.name}</p>
              <p><strong>Email:</strong> {selectedVolunteer.email}</p>
              <p><strong>Số điện thoại:</strong> {selectedVolunteer.phone}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Ghi chú cho tình nguyện viên {actionType === 'reject' && <span className="text-red-500">*</span>}
              </label>
              <TextArea
                rows={4}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder={
                  actionType === 'approve' 
                    ? 'Ví dụ: Chúc mừng bạn đã trúng tuyển! Chúng tôi sẽ liên hệ sớm...'
                    : 'Ví dụ: Rất tiếc, hiện tại chúng tôi chưa có nhu cầu tuyển thêm...'
                }
              />
            </div>

            <div className={`p-3 rounded-lg ${actionType === 'approve' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className="text-sm">
                {actionType === 'approve' 
                  ? '📧 Email thông báo duyệt sẽ được gửi tự động đến tình nguyện viên.'
                  : '📧 Email thông báo từ chối sẽ được gửi tự động đến tình nguyện viên.'}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
