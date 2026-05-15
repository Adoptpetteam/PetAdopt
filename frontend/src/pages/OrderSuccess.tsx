import { useEffect, useState } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import { Button, Result, Spin } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ShoppingOutlined,
  UnorderedListOutlined,
  RocketOutlined,
} from "@ant-design/icons";

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [seconds, setSeconds] = useState(5);

  const statusParam = searchParams.get("status");
  const orderId = searchParams.get("orderId") || "";
  const code = searchParams.get("code") || "";

  const stateOrder = location.state?.order;
  const stateStatus = location.state?.status;

  const isSuccess =
    statusParam === "success" || stateStatus === "success";

  const isFail = statusParam === "fail";

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!isSuccess) return;

    const countdown = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [isSuccess]);

  const displayOrderId = orderId || stateOrder?._id || "";

  const getFailMessage = () => {
    const codeMessages: Record<string, string> = {
      "24": "Giao dịch đã bị hủy bởi người dùng",
      "09": "Tài khoản chưa đăng ký thanh toán online",
      "10": "Nhập sai thông tin thẻ quá số lần cho phép",
      "11": "Phiên thanh toán đã hết hạn",
      "12": "Tài khoản hiện đang bị khóa",
      "51": "Số dư tài khoản không đủ",
      "65": "Vượt hạn mức giao dịch hôm nay",
      "75": "Ngân hàng đang bảo trì hệ thống",
    };

    if (code && codeMessages[code]) return codeMessages[code];

    if (searchParams.get("message") === "invalid_signature") {
      return "Chữ ký giao dịch không hợp lệ, vui lòng liên hệ hỗ trợ";
    }

    return "Thanh toán không thành công, vui lòng thử lại.";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spin size="large" description="Đang xử lý kết quả thanh toán..." />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 py-16 px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-xl w-full text-center relative overflow-hidden">

          {/* hiệu ứng nền */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-blue-500"></div>

          {/* icon */}
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircleOutlined className="text-5xl text-green-500" />
          </div>

          <h1 className="text-3xl font-black text-gray-800 mb-3">
            🎉 Đặt hàng thành công!
          </h1>

          <p className="text-gray-500 mb-6">
            Cảm ơn bạn đã tin tưởng mua hàng tại PetAdopt.
            Đơn hàng của bạn đang được xử lý.
          </p>

          {displayOrderId && (
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 border">
              <p className="text-sm text-gray-400 mb-1">
                Mã đơn hàng của bạn
              </p>
              <p className="font-mono font-bold text-[#6272B6] break-all">
                #{displayOrderId}
              </p>
            </div>
          )}

          {stateOrder && (
            <div className="text-left bg-blue-50 rounded-2xl p-5 mb-6">
              <p className="font-semibold text-gray-700 mb-3">
                Chi tiết đơn hàng
              </p>

              <div className="space-y-2">
                {stateOrder.items?.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between text-sm"
                  >
                    <span>
                      {item.name} × {item.quantity}
                    </span>

                    <span className="font-semibold text-[#6272B6]">
                      {(item.price * item.quantity).toLocaleString()}đ
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t mt-3 pt-3 flex justify-between font-bold">
                <span>Tổng cộng</span>
                <span className="text-[#6272B6]">
                  {stateOrder.totals?.total?.toLocaleString()}đ
                </span>
              </div>
            </div>
          )}

          <p className="text-sm text-gray-400 mb-6">
            Tự động làm mới sau {seconds}s
          </p>

          <div className="flex gap-4 justify-center">
            <Link to="/products">
              <Button
                size="large"
                icon={<ShoppingOutlined />}
                className="rounded-full h-12 px-6"
              >
                Tiếp tục mua
              </Button>
            </Link>

            <Link to="/orders">
              <Button
                type="primary"
                size="large"
                icon={<RocketOutlined />}
                className="rounded-full h-12 px-6 bg-[#6272B6] border-0"
              >
                Theo dõi đơn
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isFail) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 py-16 px-4">
        <div className="bg-white rounded-3xl shadow-xl p-12 max-w-lg w-full text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CloseCircleOutlined className="text-5xl text-red-500" />
          </div>

          <h1 className="text-3xl font-black text-gray-800 mb-2">
            Thanh toán thất bại
          </h1>

          <p className="text-gray-500 mb-8">
            {getFailMessage()}
          </p>

          <div className="flex gap-4 justify-center">
            <Link to="/cart">
              <Button size="large" className="rounded-full h-12 px-6">
                Quay lại giỏ hàng
              </Button>
            </Link>

            <Link to="/products">
              <Button
                type="primary"
                size="large"
                icon={<ShoppingOutlined />}
                className="rounded-full h-12 px-6 bg-[#6272B6] border-0"
              >
                Tiếp tục mua
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <Result
        status="info"
        title="Không có thông tin đơn hàng"
        subTitle="Vui lòng đặt hàng để xem kết quả thanh toán"
        extra={[
          <Link to="/products" key="shop">
            <Button
              type="primary"
              className="bg-[#6272B6] border-0 rounded-full"
            >
              Mua sắm ngay
            </Button>
          </Link>,
          <Link to="/orders" key="orders">
            <Button className="rounded-full">
              Xem đơn hàng
            </Button>
          </Link>,
        ]}
      />
    </div>
  );
}