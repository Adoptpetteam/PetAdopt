import { useEffect, useState } from "react";
import { Link, useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { Button, Result, Spin } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ShoppingOutlined,
  UnorderedListOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(10);

  const statusParam = searchParams.get("status");
  const orderId = searchParams.get("orderId") || "";
  const code = searchParams.get("code") || "";

  const stateOrder = location.state?.order;
  const stateStatus = location.state?.status;

  const isSuccess =
    statusParam === "success" || stateStatus === "success";

  const isFail = statusParam === "fail";

  const displayOrderId =
    orderId || stateOrder?._id || "";

  useEffect(() => {
    const t = setTimeout(
      () => setLoading(false),
      600
    );

    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (isSuccess) {
      document.title =
        "Đặt hàng thành công";

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate("/orders");
            return 0;
          }

          return prev - 1;
        });
      }, 1000);

      return () =>
        clearInterval(timer);
    }

    if (isFail) {
      document.title =
        "Thanh toán thất bại";
    }

    return () => {
      document.title = "Pet Adopt";
    };
  }, [isSuccess, isFail, navigate]);

  const getFailMessage = () => {
    const codeMessages: Record<
      string,
      string
    > = {
      "24":
        "Giao dịch bị hủy bởi người dùng",
      "09":
        "Thẻ/Tài khoản chưa đăng ký dịch vụ",
      "10":
        "Xác thực thông tin thẻ quá 3 lần",
      "11":
        "Phiên thanh toán hết hạn",
      "12":
        "Thẻ/Tài khoản bị khóa",
      "51":
        "Tài khoản không đủ số dư",
      "65":
        "Vượt hạn mức giao dịch trong ngày",
      "75":
        "Ngân hàng đang bảo trì",
    };

    if (
      code &&
      codeMessages[code]
    ) {
      return codeMessages[code];
    }

    if (
      searchParams.get("message") ===
      "invalid_signature"
    ) {
      return "Chữ ký không hợp lệ, vui lòng liên hệ hỗ trợ";
    }

    return "Thanh toán không thành công, vui lòng thử lại";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-500">
            Đang xử lý kết quả thanh toán...
          </p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 py-16 px-4">
        <div className="bg-white rounded-3xl shadow-xl p-12 max-w-lg w-full text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleOutlined className="text-5xl text-green-500" />
          </div>

          <h1 className="text-3xl font-black text-gray-800 mb-2">
            Đặt hàng thành công!
          </h1>

          <p className="text-gray-500 mb-6">
            Cảm ơn bạn đã mua hàng.
            Đơn hàng đang được xử lý.
          </p>

          {displayOrderId && (
            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
              <p className="text-sm text-gray-400 mb-1">
                Mã đơn hàng
              </p>

              <p className="font-mono font-bold text-gray-700 text-sm break-all">
                #{displayOrderId}
              </p>
            </div>
          )}

          {stateOrder?.paymentMethod && (
            <div className="mb-6 text-sm text-gray-500">
              Phương thức thanh toán:{" "}
              <span className="font-semibold text-[#6272B6]">
                {stateOrder.paymentMethod}
              </span>
            </div>
          )}

          {stateOrder && (
            <div className="text-left bg-blue-50 rounded-2xl p-4 mb-8">
              <p className="font-semibold text-gray-700 mb-2">
                Chi tiết đơn:
              </p>

              <div className="space-y-1">
                {stateOrder.items?.map(
                  (
                    item: any,
                    i: number
                  ) => (
                    <div
                      key={i}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-gray-600">
                        {item.name} ×{" "}
                        {item.quantity}
                      </span>

                      <span className="font-semibold text-[#6272B6]">
                        {(
                          item.price *
                          item.quantity
                        ).toLocaleString()}
                        đ
                      </span>
                    </div>
                  )
                )}

                <div className="border-t border-blue-100 pt-2 mt-2 flex justify-between font-bold">
                  <span>
                    Tổng cộng
                  </span>

                  <span className="text-[#6272B6]">
                    {stateOrder.totals?.total?.toLocaleString()}
                    đ
                  </span>
                </div>
              </div>
            </div>
          )}

          <p className="text-xs text-gray-400 mb-6">
            Tự động chuyển tới
            đơn hàng sau{" "}
            <b>{countdown}s</b>
          </p>

          <div className="flex gap-4 justify-center">
            <Link to="/products">
              <Button
                size="large"
                icon={
                  <ShoppingOutlined />
                }
                className="rounded-full h-12 px-6"
              >
                Tiếp tục mua
              </Button>
            </Link>

            <Link to="/orders">
              <Button
                type="primary"
                size="large"
                icon={
                  <UnorderedListOutlined />
                }
                className="rounded-full h-12 px-6 bg-[#6272B6] border-0"
              >
                Xem đơn hàng
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
              <Button className="rounded-full h-12 px-6">
                Quay lại giỏ hàng
              </Button>
            </Link>

            <Button
              icon={<ReloadOutlined />}
              onClick={() =>
                navigate(-1)
              }
              className="rounded-full h-12 px-6"
            >
              Thử lại
            </Button>
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
          <Link
            to="/products"
            key="shop"
          >
            <Button
              type="primary"
              className="bg-[#6272B6] border-0 rounded-full"
            >
              Mua sắm ngay
            </Button>
          </Link>,

          <Link
            to="/orders"
            key="orders"
          >
            <Button className="rounded-full">
              Xem đơn hàng
            </Button>
          </Link>,
        ]}
      />
    </div>
  );
}