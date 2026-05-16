import React, { useState } from 'react';
import { Modal, Form, Input, Upload, Button, message, Space, Alert, Radio, Image } from 'antd';
import { 
  SwapOutlined, 
  RollbackOutlined,
  CameraOutlined,
  UploadOutlined,
  PictureOutlined,
  BankOutlined,
  CreditCardOutlined,
  UserOutlined,
  QrcodeOutlined
} from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { apiClient } from '../api/http';

const { TextArea } = Input;

interface ReturnExchangeModalProps {
  visible: boolean;
  orderId: string;
  orderItems: any[];
  onClose: () => void;
  onSuccess: () => void;
}

export const ReturnExchangeModal: React.FC<ReturnExchangeModalProps> = ({
  visible,
  orderId,
  orderItems,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<'return' | 'exchange'>('return');
  const [imageFiles, setImageFiles] = useState<UploadFile[]>([]);
  const [qrFile, setQrFile] = useState<UploadFile[]>([]);

  const handleSubmit = async (values: any) => {
    if (imageFiles.length === 0) {
      message.warning('Vui lòng tải lên ít nhất 1 ảnh chứng minh sản phẩm lỗi');
      return;
    }

    // Nếu là trả hàng, kiểm tra thông tin tài khoản
    if (values.type === 'return') {
      if (!values.bankAccount || !values.bankName || !values.accountHolder) {
        message.warning('Vui lòng nhập đầy đủ thông tin tài khoản để nhận hoàn tiền');
        return;
      }
    }

    try {
      setLoading(true);

      // Upload images
      const imageUrls: string[] = [];
      for (const file of imageFiles) {
        if (file.originFileObj) {
          const formData = new FormData();
          formData.append('file', file.originFileObj);
          
          // Giả sử bạn có API upload file
          // const uploadRes = await apiClient.post('/upload', formData);
          // imageUrls.push(uploadRes.data.url);
          
          // Tạm thời dùng placeholder
          imageUrls.push('https://example.com/defect-image.jpg');
        }
      }

      const requestData: any = {
        type: values.type,
        reason: values.reason,
        images: imageUrls,
      };

      // Nếu là trả hàng, thêm thông tin tài khoản
      if (values.type === 'return') {
        requestData.bankAccount = values.bankAccount;
        requestData.bankName = values.bankName;
        requestData.accountHolder = values.accountHolder;
        if (qrFile.length > 0) {
          // Upload QR code
          requestData.qrCodeImage = 'https://example.com/qr-code.jpg';
        }
      }

      await apiClient.post(`/orders/${orderId}/request-return-exchange`, requestData);

      const actionText = values.type === 'return' ? 'trả hàng' : 'đổi hàng';
      message.success(`Yêu cầu ${actionText} đã được gửi! Admin sẽ xử lý trong thời gian sớm nhất.`);
      
      form.resetFields();
      setImageFiles([]);
      setQrFile([]);
      setType('return');
      onSuccess();
      onClose();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Không thể gửi yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setImageFiles([]);
    setQrFile([]);
    setType('return');
    onClose();
  };

  return (
    <Modal
      title={
        <Space>
          {type === 'return' ? (
            <RollbackOutlined className="text-orange-500" />
          ) : (
            <SwapOutlined className="text-green-500" />
          )}
          <span>Yêu cầu {type === 'return' ? 'trả hàng' : 'đổi hàng'}</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={650}
      destroyOnClose
    >
      <Alert
        message="Điều kiện trả/đổi hàng"
        description={
          <div>
            <p>• Thời hạn: Trong vòng <strong>3 ngày</strong> sau khi nhận hàng</p>
            <p>• Sản phẩm phải còn nguyên vẹn, chưa qua sử dụng</p>
            <p>• Cần có ảnh chứng minh sản phẩm lỗi/không đúng mô tả</p>
            <p>• Chi phí vận chuyển: <strong>Miễn phí</strong> (ship COD về kho)</p>
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
        initialValues={{ type: 'return' }}
      >
        <Form.Item
          name="type"
          label="Loại yêu cầu"
          rules={[{ required: true }]}
        >
          <Radio.Group
            onChange={(e) => setType(e.target.value)}
            className="w-full"
          >
            <Space direction="vertical" className="w-full">
              <Radio value="return" className="w-full">
                <div className="flex items-center gap-2">
                  <RollbackOutlined className="text-orange-500" />
                  <div>
                    <div className="font-semibold">Trả hàng hoàn tiền</div>
                    <div className="text-xs text-gray-500">
                      Trả sản phẩm về và nhận lại tiền (3-5 ngày làm việc)
                    </div>
                  </div>
                </div>
              </Radio>
              <Radio value="exchange" className="w-full">
                <div className="flex items-center gap-2">
                  <SwapOutlined className="text-green-500" />
                  <div>
                    <div className="font-semibold">Đổi hàng mới</div>
                    <div className="text-xs text-gray-500">
                      Đổi sản phẩm lỗi lấy sản phẩm mới (miễn phí ship)
                    </div>
                  </div>
                </div>
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="reason"
          label="Lý do trả/đổi hàng"
          rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
        >
          <TextArea
            rows={4}
            placeholder="Mô tả chi tiết vấn đề của sản phẩm: lỗi sản xuất, bị rách, không đúng mô tả, sai màu sắc..."
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="font-semibold">
              <CameraOutlined className="mr-2 text-blue-500" />
              Ảnh chứng minh sản phẩm lỗi (bắt buộc)
            </span>
          }
          required
        >
          <Upload
            listType="picture-card"
            fileList={imageFiles}
            onChange={({ fileList }) => setImageFiles(fileList)}
            beforeUpload={() => false}
            maxCount={5}
            accept="image/*"
            multiple
          >
            {imageFiles.length < 5 && (
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Tải ảnh</div>
              </div>
            )}
          </Upload>
          <div className="text-xs text-gray-500 mt-2">
            <PictureOutlined className="mr-1" />
            Tải lên 1-5 ảnh chụp rõ phần lỗi của sản phẩm. Ảnh càng rõ ràng, yêu cầu càng được xử lý nhanh.
          </div>
        </Form.Item>

        {/* Form thông tin tài khoản - CHỈ hiển thị khi chọn TRẢ HÀNG */}
        {type === 'return' && (
          <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-700">
              <BankOutlined className="text-blue-600" />
              Thông tin tài khoản nhận hoàn tiền
            </h4>
            <Alert
              message="Bắt buộc"
              description="Vui lòng cung cấp thông tin tài khoản để nhận hoàn tiền sau khi admin xác nhận trả hàng."
              type="info"
              showIcon
              className="mb-3"
            />

            <Form.Item
              name="bankName"
              label="Tên ngân hàng"
              rules={[
                { required: type === 'return', message: 'Vui lòng nhập tên ngân hàng' }
              ]}
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
                { required: type === 'return', message: 'Vui lòng nhập số tài khoản' },
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
                { required: type === 'return', message: 'Vui lòng nhập tên chủ tài khoản' },
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
        )}

        {/* Hiển thị sản phẩm trong đơn */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h4 className="font-semibold mb-3">Sản phẩm trong đơn hàng:</h4>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {orderItems.map((item, index) => (
              <div key={index} className="flex items-center gap-3 bg-white p-2 rounded">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={50}
                  height={50}
                  className="rounded object-cover"
                  fallback="https://placehold.co/50x50?text=?"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{item.name}</div>
                  <div className="text-xs text-gray-500">
                    SL: {item.quantity} × {item.price.toLocaleString()}đ
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {type === 'return' && (
          <Alert
            message="Quy trình trả hàng"
            description={
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Gửi yêu cầu và chờ admin xác nhận</li>
                <li>Đóng gói sản phẩm cẩn thận</li>
                <li>Gửi hàng về kho (ship COD - miễn phí)</li>
                <li>Admin kiểm tra và hoàn tiền (3-5 ngày)</li>
              </ol>
            }
            type="success"
            showIcon
            className="mb-4"
          />
        )}

        {type === 'exchange' && (
          <Alert
            message="Quy trình đổi hàng"
            description={
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Gửi yêu cầu và chờ admin xác nhận</li>
                <li>Admin tạo đơn hàng mới (giá 0đ)</li>
                <li>Gửi hàng lỗi về kho (ship COD - miễn phí)</li>
                <li>Nhận hàng mới (miễn phí ship)</li>
              </ol>
            }
            type="success"
            showIcon
            className="mb-4"
          />
        )}

        <Form.Item className="mb-0">
          <Space className="w-full justify-end">
            <Button onClick={handleCancel}>
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={type === 'return' ? <RollbackOutlined /> : <SwapOutlined />}
              className={type === 'return' ? 'bg-orange-500' : 'bg-green-500'}
            >
              Gửi yêu cầu {type === 'return' ? 'trả hàng' : 'đổi hàng'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};
