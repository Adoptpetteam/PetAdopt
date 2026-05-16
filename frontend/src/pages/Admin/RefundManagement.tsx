import React, { useEffect, useState } from 'react';
import {
  Card, Table, Tag, Button, Space, Modal, Form, Input, message,
  Tabs, Badge, Descriptions, Image, Timeline, Alert, Select, Upload,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  DollarOutlined, CheckCircleOutlined, CloseCircleOutlined,
  EyeOutlined, BankOutlined, UserOutlined, PhoneOutlined,
  HomeOutlined, SwapOutlined, RollbackOutlined, TruckOutlined,
  QrcodeOutlined, UploadOutlined,
} from '@ant-design/icons';
import { apiClient } from '../../api/http';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface Order {
  _id: string;
  user: { _id: string; name: string; email: string };
  status: string;
  createdAt: string;
  updatedAt: string;
  customer: { name: string; phone: string; address: string };
  items: any[];
  totals: { total: number };
  paymentMethod: string;
  refund?: {
    reason: string;
    requestedAt: string;
    requestedBy: string;
    bankAccount: string;
    bankName: string;
    accountHolder: string;
    qrCodeImage?: string;
    amount: number;
    note?: string;
  };
  returnExchange?: {
    type: 'return' | 'exchange';
    reason: string;
    requestedAt: string;
    images: string[];
    trackingNumber?: string;
    inspectionNote?: string;
    newOrderId?: string;
  };
}

const statusConfig: Record<string, { color: string; label: string }> = {
  refund_pending: { color: 'orange', label: 'Chờ hoàn tiền' },
  refund_processing: { color: 'blue', label: 'Đang hoàn tiền' },
  refund_completed: { color: 'green', label: 'Đã hoàn tiền' },
  return_requested: { color: 'orange', label: 'Yêu cầu trả hàng' },
  return_shipping: { color: 'purple', label: 'Đang trả hàng' },
  return_received: { color: 'blue', label: 'Đã nhận hàng trả' },
  exchange_requested: { color: 'orange', label: 'Yêu cầu đổi hàng' },
  exchange_completed: { color: 'green', label: 'Đã đổi hàng' },
};

export default function RefundManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState<'refund' | 'return' | 'exchange'>('refund');
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('refund');

  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/orders', {
        params: { limit: 100 }
      });
      
      const allOrders = res.data.data || [];
      
      // Filter based on active tab
      let filtered = allOrders;
      if (activeTab === 'refund') {
        filtered = allOrders.filter((o: Order) => 
          ['refund_pending', 'refund_processing', 'refund_completed'].includes(o.status)
        );
      } else if (activeTab === 'return') {
        filtered = allOrders.filter((o: Order) => 
          ['return_requested', 'return_shipping', 'return_received'].includes(o.status)
        );
      } else if (activeTab === 'exchange') {
        filtered = allOrders.filter((o: Order) => 
          ['exchange_requested', 'exchange_completed'].includes(o.status)
        );
      }
      
      setOrders(filtered);
    } catch (error: any) {
      message.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
  };

  const handleOpenActionModal = (order: Order, type: 'refund' | 'return' | 'exchange') => {
    setSelectedOrder(order);
    setActionType(type);
    setActionModalVisible(true);
    form.resetFields();
  };

  const handleProcessRefund = async (values: any) => {
    if (!selectedOrder) return;

    try {
      await apiClient.post(`/orders/${selectedOrder._id}/process-refund`, {
        status: values.status,
        note: values.note,
        bankAccount: values.bankAccount,
        bankName: values.bankName,
        accountHolder: values.accountHolder,
      });

      message.success('Đã xử lý hoàn tiền thành công');
      setActionModalVisible(false);
      form.resetFields();
      loadOrders();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Không thể xử lý hoàn tiền');
    }
  };

  const handleProcessReturn = async (values: any) => {
    if (!selectedOrder) return;

    try {
      await apiClient.post(`/orders/${selectedOrder._id}/process-return`, {
        action: values.action,
        note: values.note,
        inspectionNote: values.inspectionNote,
        bankAccount: values.bankAccount,
        bankName: values.bankName,
        accountHolder: values.accountHolder,
      });

      message.success(
        values.action === 'approve_refund' 
          ? 'Đã chấp nhận trả hàng và chuyển sang xử lý hoàn tiền' 
          : 'Đã từ chối yêu cầu trả hàng'
      );
      setActionModalVisible(false);
      form.resetFields();
      loadOrders();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Không thể xử lý trả hàng');
    }
  };

  const handleProcessExchange = async (values: any) => {
    if (!selectedOrder) return;

    try {
      await apiClient.post(`/orders/${selectedOrder._id}/process-exchange`, {
        action: values.action,
        note: values.note,
        inspectionNote: values.inspectionNote,
      });

      message.success(
        values.action === 'approve' 
          ? 'Đã chấp nhận đổi hàng và tạo đơn mới' 
          : 'Đã từ chối yêu cầu đổi hàng'
      );
      setActionModalVisible(false);
      form.resetFields();
      loadOrders();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Không thể xử lý đổi hàng');
    }
  };

  const handleUpdateReturnStatus = async (orderId: string, status: string) => {
    try {
      await apiClient.post(`/orders/${orderId}/update-return-status`, {
        status,
        note: `Admin cập nhật: ${status}`,
      });

      message.success('Đã cập nhật trạng thái vận chuyển');
      loadOrders();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  const columns: ColumnsType<Order> = [
    {
      title: 'Mã đơn',
      dataIndex: '_id',
      render: (id: string) => (
        <span className="font-mono text-xs font-bold">
          #{id.slice(-8).toUpperCase()}
        </span>
      ),
      width: 100,
    },
    {
      title: 'Khách hàng',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.customer.name}</div>
          <div className="text-xs text-gray-500">{record.user.email}</div>
        </div>
      ),
      width: 180,
    },
    {
      title: 'Loại yêu cầu',
      render: (_, record) => {
        if (record.status.startsWith('refund')) {
          return <Tag icon={<DollarOutlined />} color="blue">Hoàn tiền</Tag>;
        } else if (record.status.startsWith('return')) {
          return <Tag icon={<RollbackOutlined />} color="orange">Trả hàng</Tag>;
        } else if (record.status.startsWith('exchange')) {
          return <Tag icon={<SwapOutlined />} color="green">Đổi hàng</Tag>;
        }
        return null;
      },
      width: 120,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (status: string) => {
        const config = statusConfig[status];
        return config ? (
          <Tag color={config.color}>{config.label}</Tag>
        ) : (
          <Tag>{status}</Tag>
        );
      },
      width: 150,
    },
    {
      title: 'Số tiền',
      dataIndex: ['totals', 'total'],
      render: (total: number) => (
        <span className="font-semibold text-blue-600">
          {total.toLocaleString()}đ
        </span>
      ),
      width: 120,
    },
    {
      title: 'Ngày yêu cầu',
      render: (_, record) => {
        const date = record.refund?.requestedAt || record.returnExchange?.requestedAt || record.updatedAt;
        return (
          <div className="text-xs">
            {dayjs(date).format('DD/MM/YYYY HH:mm')}
          </div>
        );
      },
      width: 130,
    },
    {
      title: 'Thao tác',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            className="w-full"
          >
            Chi tiết
          </Button>
          {record.status === 'refund_pending' && (
            <Button
              size="small"
              type="primary"
              onClick={() => handleOpenActionModal(record, 'refund')}
              className="w-full"
            >
              Xử lý
            </Button>
          )}
          {record.status === 'return_requested' && (
            <Button
              size="small"
              type="primary"
              onClick={() => handleOpenActionModal(record, 'return')}
              className="w-full"
            >
              Xử lý
            </Button>
          )}
          {record.status === 'exchange_requested' && (
            <Button
              size="small"
              type="primary"
              onClick={() => handleOpenActionModal(record, 'exchange')}
              className="w-full"
            >
              Xử lý
            </Button>
          )}
          {record.status === 'return_requested' && (
            <Button
              size="small"
              onClick={() => handleUpdateReturnStatus(record._id, 'return_shipping')}
              className="w-full"
            >
              Đang ship về
            </Button>
          )}
          {record.status === 'return_shipping' && (
            <Button
              size="small"
              onClick={() => handleUpdateReturnStatus(record._id, 'return_received')}
              className="w-full"
            >
              Đã nhận hàng
            </Button>
          )}
        </Space>
      ),
      width: 120,
      fixed: 'right' as const,
    },
  ];

  const tabItems = [
    {
      key: 'refund',
      label: (
        <span>
          <DollarOutlined /> Hoàn tiền
          <Badge
            count={orders.filter(o => o.status.startsWith('refund')).length}
            className="ml-2"
          />
        </span>
      ),
    },
    {
      key: 'return',
      label: (
        <span>
          <RollbackOutlined /> Trả hàng
          <Badge
            count={orders.filter(o => o.status.startsWith('return')).length}
            className="ml-2"
          />
        </span>
      ),
    },
    {
      key: 'exchange',
      label: (
        <span>
          <SwapOutlined /> Đổi hàng
          <Badge
            count={orders.filter(o => o.status.startsWith('exchange')).length}
            className="ml-2"
          />
        </span>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card
        title={
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold">
              <DollarOutlined className="mr-2" />
              Quản lý Hoàn hủy đơn hàng
            </span>
            <Button onClick={loadOrders} loading={loading}>
              Làm mới
            </Button>
          </div>
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="mb-4"
        />

        <Table
          columns={columns}
          dataSource={orders}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showTotal: (total) => `Tổng ${total} đơn`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết đơn hàng"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedOrder && (
          <div className="space-y-4">
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Mã đơn" span={2}>
                <span className="font-mono font-bold">
                  #{selectedOrder._id.slice(-8).toUpperCase()}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">
                {selectedOrder.customer.name}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedOrder.user.email}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {selectedOrder.customer.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                {selectedOrder.customer.address}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={2}>
                <Tag color={statusConfig[selectedOrder.status]?.color}>
                  {statusConfig[selectedOrder.status]?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền" span={2}>
                <span className="text-lg font-bold text-blue-600">
                  {selectedOrder.totals.total.toLocaleString()}đ
                </span>
              </Descriptions.Item>
            </Descriptions>

            {selectedOrder.refund && (
              <Card title="Thông tin hoàn tiền" size="small">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Lý do">
                    {selectedOrder.refund.reason}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngân hàng">
                    {selectedOrder.refund.bankName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số tài khoản">
                    {selectedOrder.refund.bankAccount}
                  </Descriptions.Item>
                  <Descriptions.Item label="Chủ tài khoản">
                    {selectedOrder.refund.accountHolder}
                  </Descriptions.Item>
                  {selectedOrder.refund.qrCodeImage && (
                    <Descriptions.Item label="QR Code">
                      <Image
                        src={selectedOrder.refund.qrCodeImage}
                        width={150}
                        alt="QR Code"
                      />
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            )}

            {selectedOrder.returnExchange && (
              <Card title="Thông tin trả/đổi hàng" size="small">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Loại">
                    {selectedOrder.returnExchange.type === 'return' ? 'Trả hàng' : 'Đổi hàng'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Lý do">
                    {selectedOrder.returnExchange.reason}
                  </Descriptions.Item>
                  {selectedOrder.returnExchange.images.length > 0 && (
                    <Descriptions.Item label="Ảnh chứng minh">
                      <Image.PreviewGroup>
                        {selectedOrder.returnExchange.images.map((img, idx) => (
                          <Image key={idx} src={img} width={100} className="mr-2" />
                        ))}
                      </Image.PreviewGroup>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            )}

            <Card title="Sản phẩm" size="small">
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 mb-2 p-2 bg-gray-50 rounded">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500">
                      {item.quantity} × {item.price.toLocaleString()}đ
                    </div>
                  </div>
                  <div className="font-semibold">
                    {(item.quantity * item.price).toLocaleString()}đ
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}
      </Modal>

      {/* Action Modal */}
      <Modal
        title={`Xử lý ${actionType === 'refund' ? 'hoàn tiền' : actionType === 'return' ? 'trả hàng' : 'đổi hàng'}`}
        open={actionModalVisible}
        onCancel={() => setActionModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedOrder && (
          <Form
            form={form}
            layout="vertical"
            onFinish={
              actionType === 'refund'
                ? handleProcessRefund
                : actionType === 'return'
                ? handleProcessReturn
                : handleProcessExchange
            }
          >
            {actionType === 'refund' && (
              <>
                <Form.Item
                  name="status"
                  label="Trạng thái"
                  rules={[{ required: true }]}
                >
                  <Select>
                    <Select.Option value="refund_processing">Đang xử lý</Select.Option>
                    <Select.Option value="refund_completed">Hoàn tiền thành công</Select.Option>
                    <Select.Option value="cancelled">Từ chối</Select.Option>
                  </Select>
                </Form.Item>

                <Alert
                  message="Thông tin tài khoản khách hàng"
                  description={
                    <div>
                      <p>Ngân hàng: {selectedOrder.refund?.bankName}</p>
                      <p>Số TK: {selectedOrder.refund?.bankAccount}</p>
                      <p>Chủ TK: {selectedOrder.refund?.accountHolder}</p>
                    </div>
                  }
                  type="info"
                  className="mb-4"
                />
              </>
            )}

            {(actionType === 'return' || actionType === 'exchange') && (
              <>
                <Form.Item
                  name="action"
                  label="Quyết định"
                  rules={[{ required: true }]}
                >
                  <Select>
                    <Select.Option value={actionType === 'return' ? 'approve_refund' : 'approve'}>
                      Chấp nhận
                    </Select.Option>
                    <Select.Option value="reject">Từ chối</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item name="inspectionNote" label="Ghi chú kiểm tra">
                  <TextArea rows={3} placeholder="Kết quả kiểm tra sản phẩm..." />
                </Form.Item>

                {actionType === 'return' && (
                  <>
                    <Form.Item name="bankAccount" label="Số tài khoản">
                      <Input placeholder="Số tài khoản ngân hàng" />
                    </Form.Item>
                    <Form.Item name="bankName" label="Tên ngân hàng">
                      <Input placeholder="Tên ngân hàng" />
                    </Form.Item>
                    <Form.Item name="accountHolder" label="Chủ tài khoản">
                      <Input placeholder="Tên chủ tài khoản" />
                    </Form.Item>
                  </>
                )}
              </>
            )}

            <Form.Item name="note" label="Ghi chú">
              <TextArea rows={3} placeholder="Ghi chú thêm..." />
            </Form.Item>

            <Form.Item>
              <Space className="w-full justify-end">
                <Button onClick={() => setActionModalVisible(false)}>
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit">
                  Xác nhận
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}
