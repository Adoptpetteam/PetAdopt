import { Modal, Form, Input, Upload, Button, message } from "antd";
import { UploadOutlined, BankOutlined, UserOutlined, IdcardOutlined } from "@ant-design/icons";
import { useState } from "react";
import type { UploadFile } from "antd";
import { apiClient } from "../api/http";

interface RefundInfoModalProps {
  visible: boolean;
  notificationId: string;
  refundRequestId: string;   // RefundRequest._id (không phải orderId)
  orderId: string;
  amount: number;
  reason: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function RefundInfoModal({
  visible,
  notificationId,
  refundRequestId,
  orderId,
  amount,
  reason,
  onClose,
  onSuccess,
}: RefundInfoModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [qrUrl, setQrUrl] = useState("");
  const [uploadingQr, setUploadingQr] = useState(false);

  // Upload QR trước rồi lấy URL
  const handleUploadQR = async (file: File): Promise<boolean> => {
    setUploadingQr(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
      const res = await apiClient.post("/refunds/upload-qr", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const url = res.data.imageUrl.startsWith("http")
        ? res.data.imageUrl
        : `http://localhost:5000${res.data.imageUrl}`;
      setQrUrl(url);
      message.success("Tải ảnh QR thành công");
    } catch {
      message.error("Tải ảnh thất bại");
    } finally {
      setUploadingQr(false);
    }
    return false; // không cho antd tự upload
  };

  const handleSubmit = async (values: any) => {
    if (!refundRequestId) {
      message.error("Không tìm thấy yêu cầu hoàn tiền");
      return;
    }
    try {
      setLoading(true);

      // Gọi đúng endpoint submit-bank-info
      await apiClient.put(`/refunds/me/${refundRequestId}/submit-bank-info`, {
        bankName: values.bankName,
        accountNumber: values.accountNumber,
        accountHolder: values.accountHolder,
        qrCodeImage: qrUrl || "",
      });

      message.success("Đã gửi thông tin hoàn tiền! Admin sẽ xử lý sớm.");
      form.resetFields();
      setFileList([]);
      setQrUrl("");
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
      destroyOnHidden
    >
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-600 mb-1">
          <strong>Lý do hủy:</strong> {reason}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Số tiền hoàn:</strong>{" "}
          <span className="text-lg font-bold text-[#6272B6]">
            {amount.toLocaleString("vi-VN")}đ
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
            { pattern: /^[0-9]+$/, message: "Số tài khoản chỉ được chứa số" },
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
          rules={[{ required: true, message: "Vui lòng nhập tên chủ tài khoản" }]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Nhập tên chủ tài khoản (VIẾT HOA KHÔNG DẤU)"
            size="large"
          />
        </Form.Item>

        <Form.Item label="Ảnh QR Code ngân hàng (tùy chọn)">
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={({ fileList: fl }) => setFileList(fl)}
            beforeUpload={handleUploadQR}
            maxCount={1}
            accept="image/*"
          >
            {fileList.length === 0 && (
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>{uploadingQr ? "Đang tải..." : "Tải ảnh QR"}</div>
              </div>
            )}
          </Upload>
          <p className="text-xs text-gray-500 mt-1">
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
