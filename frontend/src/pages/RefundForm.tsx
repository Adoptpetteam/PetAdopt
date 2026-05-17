import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card, Form, Input, Button, message, Spin, Tag, Divider, Alert, Empty, Steps,
} from "antd";
import { UploadOutlined, BankOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { apiClient } from "../api/http";

const { Step } = Steps;

const statusLabel: Record<string, { text: string; color: string; step: number; alertType: "info" | "warning" | "success" | "error" }> = {
  awaiting_info: { text: "Chờ bạn nhập thông tin ngân hàng", color: "orange", step: 0, alertType: "info" },
  pending:       { text: "Đã gửi — Chờ admin xử lý", color: "blue", step: 1, alertType: "info" },
  re_enter_info: { text: "⚠️ Thông tin số tài khoản không hợp lệ — Vui lòng nhập lại", color: "red", step: 0, alertType: "warning" },
  processing:    { text: "Admin đang chuyển khoản", color: "cyan", step: 2, alertType: "info" },
  completed:     { text: "Hoàn tiền thành công", color: "green", step: 3, alertType: "success" },
  rejected:      { text: "Bị từ chối", color: "red", step: 0, alertType: "error" },
};

export default function RefundForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [refund, setRefund] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [qrPreview, setQrPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/refunds/me/${id}`);
      setRefund(res.data.data);
      if (res.data.data?.bankInfo?.qrCodeImage) {
        setQrPreview(res.data.data.bankInfo.qrCodeImage);
      }
      // Khi re_enter_info: xóa preview cũ để user nhập lại
      if (res.data.data?.status === 're_enter_info') {
        setQrPreview("");
        form.resetFields();
      } else if (res.data.data?.bankInfo) {
        form.setFieldsValue(res.data.data.bankInfo);
      }
    } catch {
      message.error("Không thể tải yêu cầu hoàn tiền");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleUploadQR = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return message.error("Chỉ nhận file ảnh");
    if (file.size > 5 * 1024 * 1024) return message.error("Ảnh tối đa 5MB");
    setUploading(true);
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
      setQrPreview(url);
      form.setFieldValue("qrCodeImage", url);
      message.success("Tải QR code thành công");
    } catch {
      message.error("Tải ảnh thất bại");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    const values = await form.validateFields().catch(() => null);
    if (!values) return;

    const hasFullBank = values.bankName && values.accountNumber && values.accountHolder;
    const hasQR = qrPreview;
    if (!hasFullBank && !hasQR) {
      return message.error("Vui lòng nhập đầy đủ thông tin ngân hàng HOẶC tải lên ảnh QR code");
    }

    setSubmitting(true);
    try {
      await apiClient.put(`/refunds/me/${id}/submit-bank-info`, {
        ...values,
        qrCodeImage: qrPreview,
      });
      message.success("Đã gửi thông tin hoàn tiền thành công");
      load();
    } catch (err: any) {
      message.error(err.response?.data?.message || "Lỗi");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spin size="large" /></div>;
  if (!refund) return <Empty description="Không tìm thấy" className="py-20" />;

  const status = statusLabel[refund.status] || statusLabel.awaiting_info;
  // Hiển thị form khi cần nhập (lần đầu hoặc nhập lại)
  const canEnterInfo = refund.status === "awaiting_info" || refund.status === "re_enter_info";

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/notifications")} className="mb-4">
          Quay lại
        </Button>

        <Card>
          <h1 className="text-2xl font-bold text-[#6272B6] mb-2">💰 Hoàn tiền đơn hàng</h1>
          <p className="text-gray-500 mb-4">Mã đơn: #{String(refund.order?._id || refund.order).slice(-8).toUpperCase()}</p>

          {/* Steps */}
          <Steps
            current={status.step}
            status={["rejected", "re_enter_info"].includes(refund.status) ? "error" : "process"}
            className="mb-6"
          >
            <Step title="Nhập thông tin" />
            <Step title="Chờ xử lý" />
            <Step title="Đang chuyển khoản" />
            <Step title="Hoàn tất" />
          </Steps>

          {/* Status alert */}
          <Alert
            type={status.alertType}
            message={status.text}
            description={
              <div>
                <p><strong>Số tiền hoàn:</strong> <span className="text-green-600 font-bold text-lg">{refund.amount.toLocaleString("vi-VN")}đ</span></p>
                <p><strong>Lý do hủy:</strong> {refund.cancelReason}</p>
                {refund.adminNote && <p><strong>Ghi chú admin:</strong> {refund.adminNote}</p>}
                {refund.transactionRef && <p><strong>Mã giao dịch:</strong> {refund.transactionRef}</p>}
              </div>
            }
            showIcon
            className="mb-6"
          />

          {canEnterInfo ? (
            <>
              <Divider orientation="left">📋 {refund.status === "re_enter_info" ? "Nhập lại thông tin ngân hàng" : "Cung cấp thông tin nhận hoàn tiền"}</Divider>

              {refund.status === "re_enter_info" && (
                <Alert
                  type="warning"
                  showIcon
                  title="Thông tin trước đó không hợp lệ"
                  description="Vui lòng kiểm tra lại số tài khoản, tên ngân hàng và tên chủ tài khoản trước khi gửi lại."
                  className="mb-4"
                />
              )}

              <Alert
                type="info"
                showIcon
                className="mb-4"
                title="Vui lòng cung cấp thông tin tài khoản ngân hàng HOẶC tải lên ảnh QR code để chúng tôi chuyển khoản."
              />

              <Form form={form} layout="vertical">
                <Form.Item label="Tên ngân hàng" name="bankName">
                  <Input prefix={<BankOutlined />} placeholder="VD: Vietcombank, MB Bank, Techcombank..." size="large" />
                </Form.Item>
                <Form.Item label="Số tài khoản" name="accountNumber">
                  <Input placeholder="Nhập số tài khoản" size="large" />
                </Form.Item>
                <Form.Item label="Chủ tài khoản" name="accountHolder">
                  <Input placeholder="Tên chủ tài khoản (VIẾT HOA, KHÔNG DẤU)" size="large" />
                </Form.Item>

                <Divider plain>HOẶC</Divider>

                <Form.Item label="Tải lên ảnh QR code ngân hàng">
                  <div className="space-y-3">
                    {qrPreview && (
                      <div className="flex justify-center">
                        <img src={qrPreview} alt="QR" className="w-64 h-64 object-contain border rounded-lg shadow-sm" />
                      </div>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUploadQR} />
                    <Button
                      icon={<UploadOutlined />}
                      onClick={() => fileRef.current?.click()}
                      loading={uploading}
                      block
                      size="large"
                    >
                      {uploading ? "Đang tải..." : qrPreview ? "Đổi ảnh khác" : "Chọn ảnh QR từ máy"}
                    </Button>
                  </div>
                </Form.Item>

                <Button
                  type="primary"
                  size="large"
                  block
                  loading={submitting}
                  onClick={handleSubmit}
                  className="bg-[#6272B6] border-0 rounded-full mt-4"
                >
                  {refund.status === "re_enter_info" ? "Gửi lại thông tin hoàn tiền" : "Gửi thông tin hoàn tiền"}
                </Button>
              </Form>
            </>
          ) : (
            <>
              <Divider orientation="left">📋 Thông tin đã gửi</Divider>
              <Card type="inner" className="bg-gray-50">
                {refund.bankInfo?.bankName && <p><strong>Ngân hàng:</strong> {refund.bankInfo.bankName}</p>}
                {refund.bankInfo?.accountNumber && <p><strong>Số tài khoản:</strong> {refund.bankInfo.accountNumber}</p>}
                {refund.bankInfo?.accountHolder && <p><strong>Chủ tài khoản:</strong> {refund.bankInfo.accountHolder}</p>}
                {refund.bankInfo?.qrCodeImage && (
                  <div className="mt-3">
                    <p className="font-semibold mb-2">QR code:</p>
                    <img src={refund.bankInfo.qrCodeImage} alt="QR" className="w-48 h-48 object-contain border rounded-lg" />
                  </div>
                )}
              </Card>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
