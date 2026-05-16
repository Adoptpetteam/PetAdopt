import { Modal, Form, Input, Upload, Button, message } from "antd";
import { UploadOutlined, BankOutlined, UserOutlined, IdcardOutlined } from "@ant-design/icons";
import { useState } from "react";
import type { UploadFile } from "antd";
import { apiClient } from "../api/http";

interface RefundInfoModalProps {
  visible: boolean;
  notificationId: string;
  orderId: string;
  amount: number;
  reason: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function RefundInfoModal({
  visible,
  notificationId,
  orderId,
  amount,
  reason,
  onClose,
  onSuccess,
}: RefundInfoModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      // Upload QR image nếu có
      let qrImageUrl = "";
      if (fileList.length > 0 && fileList[0].originFileObj) {
        const formData = new FormData();
        formData.append("file", fileList[0].originFileObj);

        const uploadRes = await apiClient.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        qrImageUrl = uploadRes.data.url;
      }

      // Gửi thông tin hoàn tiền
      await apiClient.post(`/notifications/${notificationId}/refund-info`, {
        bankName: values.bankName,
        accountNumber: values.accountNumber,
        accountHolder: values.accountHolder,
        qrImage: qrImageUrl,
      });

      message.success("Đã gửi thông tin hoàn tiền thành công!");
      form.resetFields();
      setFileList([]);
      onSuccess();
      onClose();
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      title={
        <div className="flex items-center gap-2">
          <BankOutlined className="text-[#6272B6]" />
          <span>Cập nhật thông tin hoàn tiền</span>
        </div>
      }
      footer={null}
      width={600}
    >
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">
          <strong>Lý do hủy:</strong> {reason}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Số tiền hoàn:</strong>{" "}
          <span className="text-lg font-bold text-[#6272B6]">
            {amount.toLocaleString()}đ
          </span>
        </p>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Tên ngân hàng"
          name="bankName"
          rules={[{ required: true, message: "Vui lòng nhập tên ngân hàng" }]}
        >
          <Input
            prefix={<BankOutlined />}
            placeholder="VD: Vietcombank, Techcombank, MB Bank..."
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="Số tài khoản"
          name="accountNumber"
          rules={[
            { required: true, message: "Vui lòng nhập số tài khoản" },
            {
              pattern: /^[0-9]+$/,
              message: "Số tài khoản chỉ được chứa số",
            },
          ]}
        >
          <Input
            prefix={<IdcardOutlined />}
            placeholder="Nhập số tài khoản ngân hàng"
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="Chủ tài khoản"
          name="accountHolder"
          rules={[
            { required: true, message: "Vui lòng nhập tên chủ tài khoản" },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Nhập tên chủ tài khoản (viết hoa không dấu)"
            size="large"
          />
        </Form.Item>

        <Form.Item label="Ảnh QR Code ngân hàng (tùy chọn)">
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            beforeUpload={() => false}
            maxCount={1}
            accept="image/*"
          >
            {fileList.length === 0 && (
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Tải ảnh QR</div>
              </div>
            )}
          </Upload>
          <p className="text-xs text-gray-500 mt-2">
            Tải lên ảnh QR Code ngân hàng để chúng tôi chuyển tiền nhanh hơn
          </p>
        </Form.Item>

        <div className="flex gap-3 justify-end">
          <Button onClick={onClose}>Hủy</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="bg-[#6272B6] border-0"
          >
            Gửi thông tin
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
