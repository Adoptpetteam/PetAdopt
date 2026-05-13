import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Result, Button, Card, Descriptions, Tag, Spin, message } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, ShoppingOutlined, HomeOutlined } from "@ant-design/icons";
import { apiClient } from "../api/http";

interface Order {
  _id: string;
  status: string;
  paymentMethod: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  totals: {
    subtotal: number;
    discount: number;
    total: number;
  };
  voucher?: {
    code: string;
    discount: number;
  };
  createdAt: string;
  statusHistory?: Array<{
    status: string;
    note: string;
    timestamp: string;
  }>;
}

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);

  const status = searchParams.get("status");
  const orderId = searchParams.get("orderId");
  const errorCode = searchParams.get("code");

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.get(`/orders/me/${orderId}`);
        if (response.data.success) {
          setOrder(response.data.data);
        } else {
          message.error("Không thể lấy thông tin đơn hàng");
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        message.error("Có lỗi xảy ra khi lấy thông tin đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const getVNPayErrorMessage = (code: string) => {
    const errorMessages: Record<string, string> = {
      "24": "Giao dịch bị hủy bởi người dùng",
      "09": "Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking",
      "10": "Thông tin thẻ/tài khoản không đúng",
      "11": "Thẻ/Tài khoản đã hết hạn",
      "12": "Thẻ/Tài khoản bị khóa",
      "13": "Sai mật khẩu xác thực giao dịch",
      "51": "Tài khoản không đủ số dư",
      "65": "Tài khoản đã vượt quá hạn mức giao dịch trong ngày",
      "75": "Ngân hàng thanh toán đang bảo trì",
      "79": "Giao dịch vượt quá số tiền cho phép",
    };
    return errorMessages[code] || `Lỗi thanh toán (Mã: ${code})`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  const isSuccess = status === "success";
  const isFailed = status === "failed";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Result Header */}
        <Result
          icon={isSuccess ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          status={isSuccess ? "success" : "error"}
          title={
            isSuccess 
              ? "Thanh toán thành công!" 
              : "Thanh toán thất bại"
          }
          subTitle={
            isSuccess
              ? "Đơn hàng của bạn đã được xác nhận và đang được xử lý."
              : isFailed && errorCode
              ? getVNPayErrorMessage(errorCode)
              : "Có lỗi xảy ra trong quá trình thanh toán. Đơn hàng đã được hủy."
          }
          extra={[
            <Button 
              key="orders" 
              type="primary" 
              icon={<ShoppingOutlined />}
              onClick={() => navigate("/orders")}
              className="bg-[#6272B6] hover:bg-[#4a569d]"
            >
              Xem đơn hàng của tôi
            </Button>,
            <Button 
              key="home" 
              icon={<HomeOutlined />}
              onClick={() => navigate("/")}
            >
              Về trang chủ
            </Button>,
          ]}
        />

        {/* Order Details */}
        {order && (
          <Card 
            title={
              <div className="flex items-center justify-between">
                <span>Chi tiết đơn hàng #{order._id.slice(-8)}</span>
                <Tag 
                  color={
                    order.status === 'paid' ? 'green' :
                    order.status === 'cancelled' ? 'red' :
                    order.status === 'pending' ? 'orange' : 'blue'
                  }
                  className="text-sm"
                >
                  {order.status === 'paid' ? 'Đã thanh toán' :
                   order.status === 'cancelled' ? 'Đã hủy' :
                   order.status === 'pending' ? 'Chờ thanh toán' : order.status}
                </Tag>
              </div>
            }
            className="mt-8"
          >
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Khách hàng" span={2}>
                {order.customer.name} - {order.customer.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ giao hàng" span={2}>
                {order.customer.address}
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">
                {order.paymentMethod === 'vnpay' ? 'VNPay' : 'Thanh toán khi nhận hàng'}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian đặt">
                {new Date(order.createdAt).toLocaleString('vi-VN')}
              </Descriptions.Item>
            </Descriptions>

            {/* Order Items */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Sản phẩm đã đặt</h3>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/64x64?text=Product";
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-gray-500">
                        {item.price.toLocaleString()}đ × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#6272B6]">
                        {(item.price * item.quantity).toLocaleString()}đ
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="mt-6 border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span>Tạm tính:</span>
                <span>{order.totals.subtotal.toLocaleString()}đ</span>
              </div>
              {order.totals.discount > 0 && (
                <div className="flex justify-between items-center mb-2 text-green-600">
                  <span>Giảm giá {order.voucher?.code ? `(${order.voucher.code})` : ''}:</span>
                  <span>-{order.totals.discount.toLocaleString()}đ</span>
                </div>
              )}
              <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                <span>Tổng cộng:</span>
                <span className="text-[#6272B6]">{order.totals.total.toLocaleString()}đ</span>
              </div>
            </div>

            {/* Status History */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Lịch sử đơn hàng</h3>
                <div className="space-y-2">
                  {order.statusHistory.map((history, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="font-medium">
                        {history.status === 'paid' ? 'Đã thanh toán' :
                         history.status === 'cancelled' ? 'Đã hủy' :
                         history.status === 'pending' ? 'Chờ xử lý' : history.status}
                      </span>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{history.note}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(history.timestamp).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* No Order Found */}
        {!loading && !order && orderId && (
          <Card className="mt-8">
            <Result
              status="404"
              title="Không tìm thấy đơn hàng"
              subTitle="Đơn hàng có thể đã bị xóa hoặc không tồn tại."
              extra={
                <Button type="primary" onClick={() => navigate("/")}>
                  Về trang chủ
                </Button>
              }
            />
          </Card>
        )}
      </div>
    </div>
  );
};

export default PaymentResult;