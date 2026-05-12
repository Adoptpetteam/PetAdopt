import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiClient } from "../api/http";
import {
  message,
  Button,
  Input,
  Radio,
  Card,
  Divider,
  Spin,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  HomeOutlined,
  CreditCardOutlined,
  CarOutlined,
  BankOutlined,
} from "@ant-design/icons";

interface CartItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  cartQuantity: number;
}

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedItems: CartItem[] = location.state?.selectedItems || [];

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    paymentMethod: "cod" as "cod" | "vnpay",
  });

  useEffect(() => {
    if (selectedItems.length === 0) {
      message.warning("Vui lòng chọn sản phẩm trước");
      navigate("/cart");
    }
    // Tự điền thông tin user nếu đã đăng nhập
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user?.name) setForm((f) => ({ ...f, name: user.name }));
      if (user?.phone) setForm((f) => ({ ...f, phone: user.phone }));
    } catch {}
  }, []);

  const total = selectedItems.reduce(
    (sum, item) => sum + item.price * item.cartQuantity,
    0
  );

  const handlePlaceOrder = async () => {
    if (!form.name.trim()) return message.error("Vui lòng nhập họ tên");
    if (!form.phone.trim()) return message.error("Vui lòng nhập số điện thoại");
    if (!form.address.trim()) return message.error("Vui lòng nhập địa chỉ giao hàng");

    const phoneRegex = /^(0|\+84)[0-9]{9}$/;
    if (!phoneRegex.test(form.phone.trim())) {
      return message.error("Số điện thoại không hợp lệ");
    }

    try {
      setLoading(true);

      const payload = {
        paymentMethod: form.paymentMethod,
        customer: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          reason: "Mua hàng online",
        },
        items: selectedItems.map((item) => ({
          productId: item._id,
          quantity: item.cartQuantity,
        })),
      };

      const res = await apiClient.post("/orders/checkout", payload);

      if (!res.data.success) {
        return message.error(res.data.message || "Đặt hàng thất bại");
      }

      // Xóa các sản phẩm đã mua khỏi cart
      const fullCart = JSON.parse(localStorage.getItem("cart") || "[]");
      const remainingCart = fullCart.filter(
        (item: any) => !selectedItems.some((s) => s._id === item._id)
      );
      localStorage.setItem("cart", JSON.stringify(remainingCart));
      window.dispatchEvent(new Event("cart-change"));

      // ===== VNPAY FLOW =====
      if (res.data.paymentMethod === "vnpay") {
        message.loading("Đang chuyển sang VNPay...", 1.5);
        setTimeout(() => {
          window.location.href = res.data.payUrl;
        }, 500);
        return;
      }

      // ===== COD FLOW =====
      message.success("Đặt hàng thành công!");
      navigate("/orders/success", {
        state: { order: res.data.data, status: "success" },
      });
    } catch (error: any) {
      console.error(error);
      message.error(
        error.response?.data?.message || "Đặt hàng thất bại, vui lòng thử lại"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <span
            className="cursor-pointer hover:text-[#6272B6]"
            onClick={() => navigate("/products")}
          >
            Sản phẩm
          </span>
          <span>/</span>
          <span
            className="cursor-pointer hover:text-[#6272B6]"
            onClick={() => navigate("/cart")}
          >
            Giỏ hàng
          </span>
          <span>/</span>
          <span className="text-[#6272B6] font-semibold">Thanh toán</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT - Thông tin */}
          <Card className="rounded-3xl shadow-md border-0 p-2">
            <h1 className="text-2xl font-bold text-[#6272B6] mb-6">
              Thông tin nhận hàng
            </h1>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <Input
                  size="large"
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="Nguyễn Văn A"
                  className="h-12 rounded-xl"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <Input
                  size="large"
                  prefix={<PhoneOutlined className="text-gray-400" />}
                  placeholder="0912345678"
                  className="h-12 rounded-xl"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Địa chỉ giao hàng <span className="text-red-500">*</span>
                </label>
                <Input.TextArea
                  rows={3}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  className="rounded-xl"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </div>

              <Divider />

              {/* Payment method */}
              <div>
                <p className="font-bold text-gray-700 mb-4">
                  Phương thức thanh toán
                </p>
                <Radio.Group
                  value={form.paymentMethod}
                  onChange={(e) =>
                    setForm({ ...form, paymentMethod: e.target.value })
                  }
                  className="w-full"
                >
                  <div className="space-y-3">
                    {/* COD */}
                    <label
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        form.paymentMethod === "cod"
                          ? "border-[#6272B6] bg-blue-50"
                          : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <Radio value="cod" />
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                          <CarOutlined className="text-orange-500 text-lg" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            Thanh toán khi nhận hàng (COD)
                          </p>
                          <p className="text-xs text-gray-400">
                            Trả tiền mặt khi nhận hàng
                          </p>
                        </div>
                      </div>
                    </label>

                    {/* VNPay */}
                    <label
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        form.paymentMethod === "vnpay"
                          ? "border-[#6272B6] bg-blue-50"
                          : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <Radio value="vnpay" />
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <BankOutlined className="text-blue-600 text-lg" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            Thanh toán qua VNPay
                          </p>
                          <p className="text-xs text-gray-400">
                            ATM, Visa, MasterCard, QR Code
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                </Radio.Group>
              </div>
            </div>
          </Card>

          {/* RIGHT - Đơn hàng */}
          <Card className="rounded-3xl shadow-xl border-0 p-2">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Đơn hàng ({selectedItems.length} sản phẩm)
            </h2>

            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 mb-4">
              {selectedItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-4 pb-4 border-b border-gray-50 last:border-0"
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-xl border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://placehold.co/64x64?text=No+Image";
                      }}
                    />
                    <span className="absolute -top-2 -right-2 bg-[#6272B6] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {item.cartQuantity}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate text-sm">
                      {item.name}
                    </h3>
                    <p className="text-gray-400 text-xs">
                      {item.cartQuantity} × {item.price.toLocaleString()}đ
                    </p>
                  </div>

                  <div className="font-bold text-[#6272B6] text-sm flex-shrink-0">
                    {(item.price * item.cartQuantity).toLocaleString()}đ
                  </div>
                </div>
              ))}
            </div>

            <Divider className="my-4" />

            {/* Totals */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-gray-500 text-sm">
                <span>Tạm tính</span>
                <span>{total.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between text-gray-500 text-sm">
                <span>Phí vận chuyển</span>
                <span className="text-green-500 font-semibold">Miễn phí</span>
              </div>
              <Divider className="my-2" />
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-700">
                  Tổng thanh toán
                </span>
                <span className="text-3xl font-black text-[#6272B6]">
                  {total.toLocaleString()}đ
                </span>
              </div>
            </div>

            <Button
              type="primary"
              size="large"
              loading={loading}
              icon={<CreditCardOutlined />}
              onClick={handlePlaceOrder}
              className="w-full h-14 rounded-2xl bg-[#6272B6] text-lg font-bold border-0 hover:bg-[#4a569d]"
            >
              {loading
                ? "Đang xử lý..."
                : form.paymentMethod === "vnpay"
                ? "Thanh toán qua VNPay"
                : "Đặt hàng (COD)"}
            </Button>

            {form.paymentMethod === "vnpay" && (
              <p className="text-center text-xs text-gray-400 mt-3">
                Bạn sẽ được chuyển đến trang thanh toán VNPay an toàn
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
