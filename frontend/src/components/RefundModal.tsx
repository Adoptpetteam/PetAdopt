import React, { useState } from 'react';
import { Modal, Form, Input, Upload, Button, message, Space, Alert } from 'antd';
import { 
  DollarOutlined, 
  BankOutlined, 
  UserOutlined, 
  CreditCardOutlined,
  QrcodeOutlined,
  UploadOutlined 
} from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { apiClient } from '../api/http';

const { TextArea } = Input;

interface RefundModalProps {
  visible: boolean;
  orderId: string;
  orderTotal: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const RefundModal: React.FC<RefundModalProps> = ({
  visible,
  orderId,
  orderTotal,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [qrFile, setQrFile] = useState<UploadFile[]>([]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      // Upload QR code nếu có
      let qrCodeUrl = '';
      if (qrFile.length > 0 && qrFile[0].originFileObj) {
        const formData = new FormData();
        formData.append('file', qrFile[0].originFileObj);
        
        // Giả sử bạn có API upload file
        // const uploadRes = await apiClient.post('/upload', formData);
        // qrCodeUrl = uploadRes.data.url;
        
        // Tạm thời dùng placeholder
        qrCodeUrl = 'https://example.com/qr-code.jpg';
      }

      await apiClient.post(`/orders/${orderId}/request-refund`, {
        reason: values.reason,
        bankAccount: values.bankAccount,
        bankName: values.bankName,
        accountHolder: values.accountHolder,
        qrCodeImage: qrCodeUrl || undefined,
      });

      message.success('Yêu cầu hoàn tiền đã được gửi! Admin sẽ xử lý trong thời gian sớm nhất.');
      form.resetFields();
      setQrFile([]);
      onSuccess();
      onClose();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Không thể gửi yêu cầu hoàn tiền');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setQrFile([]);
    onClose();
  };

  return (
    <Modal
      title={
        <Space>
          <DollarOutlined className="text-blue-500" />
          <span>Yêu cầu hoàn tiền</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Alert
        message="Thông tin hoàn tiền"
        description={
          <div>
            <p>• Số tiền hoàn: <strong className="text-blue-600">{orderTotal.toLocaleString()}đ</strong></p>
            <p>• Thời gian xử lý: 3-5 ngày làm việc</p>
            <p>• Vui lòng cung cấp đầy đủ thông tin tài khoản ngân hàng</p>
          </div>
        }
        type="info"
        showIcon
        className="mb-4"
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          name="reason"
          label="Lý do hoàn tiền"
          rules={[{ required: true, message: 'Vui lòng nhập lý do hoàn tiền' }]}
        >
          <TextArea
            rows={3}
            placeholder="Ví dụ: Không còn nhu cầu sử dụng, đặt nhầm sản phẩm..."
            maxLength={500}
            showCount
          />
        </Form.Item>

        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <BankOutlined className="text-blue-500" />
            Thông tin tài khoản ngân hàng
          </h4>

          <Form.Item
            name="bankName"
            label="Tên ngân hàng"
            rules={[{ required: true, message: 'Vui lòng nhập tên ngân hàng' }]}
          >
            <Input
              prefix={<BankOutlined />}
              placeholder="Ví dụ: Vietcombank, Techcombank, VPBank..."
            />
          </Form.Item>

          <Form.Item
            name="bankAccount"
            label="Số tài khoản"
            rules={[
              { required: true, message: 'Vui lòng nhập số tài khoản' },
              { pattern: /^[0-9]{9,20}$/, message: 'Số tài khoản không hợp lệ (9-20 chữ số)' }
            ]}
          >
            <Input
              prefix={<CreditCardOutlined />}
              placeholder="Nhập số tài khoản ngân hàng"
              maxLength={20}
            />
          </Form.Item>

          <Form.Item
            name="accountHolder"
            label="Tên chủ tài khoản"
            rules={[
              { required: true, message: 'Vui lòng nhập tên chủ tài khoản' },
              { pattern: /^[A-Z\s]+$/, message: 'Tên phải viết HOA KHÔNG DẤU' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="VD: NGUYEN VAN A (viết HOA KHÔNG DẤU)"
              style={{ textTransform: 'uppercase' }}
            />
          </Form.Item>

          <Form.Item
            label={
              <span>
                <QrcodeOutlined className="mr-1" />
                Mã QR ngân hàng (không bắt buộc)
              </span>
            }
          >
            <Upload
              listType="picture-card"
              fileList={qrFile}
              onChange={({ fileList }) => setQrFile(fileList)}
              beforeUpload={() => false}
              maxCount={1}
              accept="image/*"
            >
              {qrFile.length === 0 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload QR</div>
                </div>
              )}
            </Upload>
            <div className="text-xs text-gray-500 mt-1">
              Tải lên ảnh mã QR ngân hàng để admin chuyển khoản nhanh hơn
            </div>
          </Form.Item>
        </div>

        <Alert
          message="Lưu ý"
          description="Sau khi gửi yêu cầu, admin sẽ xem xét và xử lý hoàn tiền. Bạn sẽ nhận được email thông báo khi có cập nhật."
          type="warning"
          showIcon
          className="mb-4"
        />

        <Form.Item className="mb-0">
          <Space className="w-full justify-end">
            <Button onClick={handleCancel}>
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<DollarOutlined />}
              className="bg-blue-500"
            >
              Gửi yêu cầu hoàn tiền
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};
