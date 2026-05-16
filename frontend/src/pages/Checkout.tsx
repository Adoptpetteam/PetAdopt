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
  Tag,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  CreditCardOutlined,
  CarOutlined,
  BankOutlined,
  TagOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MailOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  EditOutlined,
  ShoppingCartOutlined,
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
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    description: string;
    discount: number;
    finalTotal: number;
  } | null>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    note: "",
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
      if (user?.email) setForm((f) => ({ ...f, email: user.email }));
    } catch {}
  }, []);

  const total = selectedItems.reduce(
    (sum, item) => sum + item.price * item.cartQuantity,
    0
  );
  const discount = appliedVoucher?.discount ?? 0;
  const finalTotal = total - discount;

  const totalQty = selectedItems.reduce((sum, item) => sum + item.cartQuantity, 0);

  const isFormValid =
    form.name.trim().length > 0 &&
    form.phone.trim().length > 0 &&
    form.email.trim().length > 0 &&
    form.address.trim().length > 0 &&
    form.city.trim().length > 0 &&
    form.district.trim().length > 0;

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return message.warning("Vui lòng nhập mã voucher");
    setVoucherLoading(true);
    try {
      const res = await apiClient.post("/vouchers/validate", {
        code: voucherCode.trim(),
        subtotal: total,
      });
      setAppliedVoucher(res.data.data);
      message.success(`Áp dụng thành công! Giảm ${res.data.data.discount.toLocaleString()}đ`);
    } catch (err: any) {
      message.error(err.response?.data?.message || "Mã voucher không hợp lệ");
      setAppliedVoucher(null);
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode("");
    message.info("Đã bỏ mã giảm giá");
  };

  const handlePlaceOrder = async () => {
    if (!isFormValid) return message.warning("Vui lòng điền đầy đủ thông tin");

    setLoading(true);
    try {
      const payload = {
        paymentMethod: form.paymentMethod,
        customer: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          address: `${form.address.trim()}, ${form.ward ? form.ward + ', ' : ''}${form.district.trim()}, ${form.city.trim()}`,
          note: form.note.trim() || undefined,
        },
        items: selectedItems.map((item) => ({
          productId: item._id,
          quantity: item.cartQuantity,
        })),
        voucherCode: appliedVoucher?.code || null,
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
      const status = error.response?.status;
      const msg = error.response?.data?.message || "Đặt hàng thất bại, vui lòng thử lại";

      if (status === 409) {
        // Race condition — hàng vừa hết, sync lại giỏ và thông báo rõ
        message.error({ content: msg, duration: 4 });

        // Sync lại tồn kho trong giỏ
        try {
          const cart = JSON.parse(localStorage.getItem("cart") || "[]");
          const updated = await Promise.all(
            cart.map(async (item: any) => {
              try {
                const res = await apiClient.get(`/products/${item._id}`);
                const latest = res.data?.data;
                if (!latest || latest.quantity === 0) return null; // hết hàng → xóa
                return { ...item, quantity: latest.quantity, cartQuantity: Math.min(item.cartQuantity, latest.quantity) };
              } catch { return item; }
            })
          );
          const validCart = updated.filter(Boolean);
          localStorage.setItem("cart", JSON.stringify(validCart));
          window.dispatchEvent(new Event("cart-change"));

          // Cập nhật lại selectedItems trong state để hiển thị đúng
          const removedCount = cart.length - validCart.length;
          if (removedCount > 0) {
            message.warning(`${removedCount} sản phẩm đã hết hàng và bị xóa khỏi giỏ`);
            navigate("/cart");
          }
        } catch { /* silent */ }
      } else {
        message.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 py-3">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-3">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Thanh Toán Đơn Hàng</h1>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate("/products")}>
              Sản phẩm
            </span>
            <span>→</span>
            <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate("/cart")}>
              Giỏ hàng
            </span>
            <span>→</span>
            <span className="text-blue-600 font-semibold">Thanh toán</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* LEFT - Thông tin */}
          <div className="space-y-2">
            {/* Thông tin nhận hàng */}
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <UserOutlined className="text-[#6272B6]" />
                  <span className="text-lg font-bold">Thông tin nhận hàng</span>
                </div>
              }
              className="shadow-lg border-0 rounded-2xl"
            >
              <div className="space-y-2">
                {/* Row 1: Name + Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="transform transition-all duration-300 hover:scale-[1.02]">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <UserOutlined className="mr-2 text-[#6272B6]" />
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <Input
                      size="large"
                      placeholder="Nguyễn Văn A"
                      prefix={<UserOutlined className="text-gray-400" />}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="rounded-xl border-2 hover:border-[#6272B6] focus:border-[#6272B6] transition-all"
                    />
                  </div>

                  <div className="transform transition-all duration-300 hover:scale-[1.02]">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <PhoneOutlined className="mr-2 text-[#6272B6]" />
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <Input
                      size="large"
                      placeholder="0912345678"
                      prefix={<PhoneOutlined className="text-gray-400" />}
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="rounded-xl border-2 hover:border-[#6272B6] focus:border-[#6272B6] transition-all"
                    />
                  </div>
                </div>

                {/* Row 2: Email */}
                <div className="transform transition-all duration-300 hover:scale-[1.02]">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <MailOutlined className="mr-2 text-[#6272B6]" />
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    size="large"
                    type="email"
                    placeholder="example@email.com"
                    prefix={<MailOutlined className="text-gray-400" />}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="rounded-xl border-2 hover:border-[#6272B6] focus:border-[#6272B6] transition-all"
                  />
                </div>

                {/* Row 3: City + District */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="transform transition-all duration-300 hover:scale-[1.02]">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <EnvironmentOutlined className="mr-2 text-[#6272B6]" />
                      Tỉnh/Thành phố <span className="text-red-500">*</span>
                    </label>
                    <Input
                      size="large"
                      placeholder="VD: Hồ Chí Minh"
                      prefix={<EnvironmentOutlined className="text-gray-400" />}
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="rounded-xl border-2 hover:border-[#6272B6] focus:border-[#6272B6] transition-all"
                    />
                  </div>

                  <div className="transform transition-all duration-300 hover:scale-[1.02]">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <EnvironmentOutlined className="mr-2 text-[#6272B6]" />
                      Quận/Huyện <span className="text-red-500">*</span>
                    </label>
                    <Input
                      size="large"
                      placeholder="VD: Quận 1"
                      prefix={<EnvironmentOutlined className="text-gray-400" />}
                      value={form.district}
                      onChange={(e) => setForm({ ...form, district: e.target.value })}
                      className="rounded-xl border-2 hover:border-[#6272B6] focus:border-[#6272B6] transition-all"
                    />
                  </div>
                </div>

                {/* Row 4: Ward */}
                <div className="transform transition-all duration-300 hover:scale-[1.02]">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <EnvironmentOutlined className="mr-2 text-[#6272B6]" />
                    Phường/Xã (Tùy chọn)
                  </label>
                  <Input
                    size="large"
                    placeholder="VD: Phường Bến Nghé"
                    prefix={<EnvironmentOutlined className="text-gray-400" />}
                    value={form.ward}
                    onChange={(e) => setForm({ ...form, ward: e.target.value })}
                    className="rounded-xl border-2 hover:border-[#6272B6] focus:border-[#6272B6] transition-all"
                  />
                </div>

                {/* Row 5: Address */}
                <div className="transform transition-all duration-300 hover:scale-[1.02]">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <HomeOutlined className="mr-2 text-[#6272B6]" />
                    Địa chỉ cụ thể <span className="text-red-500">*</span>
                  </label>
                  <Input.TextArea
                    rows={3}
                    placeholder="Số nhà, tên đường..."
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="rounded-xl border-2 hover:border-[#6272B6] focus:border-[#6272B6] transition-all"
                  />
                </div>

                {/* Row 6: Note */}
                <div className="transform transition-all duration-300 hover:scale-[1.02]">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <EditOutlined className="mr-2 text-[#6272B6]" />
                    Ghi chú (Tùy chọn)
                  </label>
                  <Input.TextArea
                    rows={2}
                    placeholder="Ghi chú cho người bán (giao hàng giờ hành chính, gọi trước khi giao...)"
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    className="rounded-xl border-2 hover:border-[#6272B6] focus:border-[#6272B6] transition-all"
                    showCount
                    maxLength={200}
                  />
                </div>
              </div>
            </Card>

            {/* Phương thức thanh toán */}
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <CreditCardOutlined className="text-[#6272B6]" />
                  <span className="text-lg font-bold">Phương thức thanh toán</span>
                </div>
              }
              className="shadow-lg border-0 rounded-2xl"
            >
              <Radio.Group
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                className="w-full"
              >
                <div className="space-y-3">
                  <div className="p-3 border-2 rounded-xl hover:border-orange-400 hover:shadow-md transition-all cursor-pointer transform hover:scale-[1.02]">
                    <Radio value="cod">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                          <CarOutlined className="text-orange-500 text-xl" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">Thanh toán khi nhận hàng (COD)</div>
                          <p className="text-sm text-gray-500 mt-1">Thanh toán bằng tiền mặt khi nhận hàng</p>
                        </div>
                      </div>
                    </Radio>
                  </div>
                  
                  <div className="p-3 border-2 rounded-xl hover:border-blue-400 hover:shadow-md transition-all cursor-pointer transform hover:scale-[1.02]">
                    <Radio value="vnpay">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <BankOutlined className="text-blue-500 text-xl" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">VNPay</div>
                          <p className="text-sm text-gray-500 mt-1">ATM, Visa, MasterCard, QR Code</p>
                          <div className="flex gap-2 mt-2">
                            <Tag color="blue" className="text-xs">Nhanh chóng</Tag>
                            <Tag color="green" className="text-xs">Bảo mật</Tag>
                          </div>
                        </div>
                      </div>
                    </Radio>
                  </div>
                </div>
              </Radio.Group>
            </Card>
          </div>

          {/* RIGHT - Đơn hàng */}
          <Card 
            title={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCartOutlined className="text-[#6272B6]" />
                  <span className="text-lg font-bold">Đơn hàng ({totalQty} sản phẩm)</span>
                </div>
                <Tag color="blue" className="text-sm">{totalQty} SP</Tag>
              </div>
            }
            className="shadow-lg border-0 rounded-2xl h-fit lg:sticky lg:top-24"
          >
            <div className="space-y-4 max-h-80 overflow-y-auto mb-4">
              {selectedItems.map((item) => (
                <div key={item._id} className="flex items-center gap-3 pb-3 border-b last:border-0">
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/48x48?text=No+Image";
                      }}
                    />
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                      {item.cartQuantity}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-800 truncate text-sm">{item.name}</h3>
                    <p className="text-gray-500 text-xs">
                      {item.cartQuantity} × {item.price.toLocaleString()}đ
                    </p>
                  </div>

                  <div className="font-semibold text-blue-600 text-sm">
                    {(item.price * item.cartQuantity).toLocaleString()}đ
                  </div>
                </div>
              ))}
            </div>

            <Divider />

            {/* Voucher */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-600 mb-2">Mã giảm giá</p>
              {appliedVoucher ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircleOutlined className="text-green-500" />
                    <div>
                      <span className="font-medium text-green-700">{appliedVoucher.code}</span>
                      {appliedVoucher.description && (
                        <p className="text-xs text-gray-500">{appliedVoucher.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 font-medium">
                      -{appliedVoucher.discount.toLocaleString()}đ
                    </span>
                    <button onClick={handleRemoveVoucher} className="text-gray-400 hover:text-red-500">
                      <CloseCircleOutlined />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Nhập mã voucher..."
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    onPressEnter={handleApplyVoucher}
                    prefix={<TagOutlined />}
                  />
                  <Button onClick={handleApplyVoucher} loading={voucherLoading} type="primary">
                    Áp dụng
                  </Button>
                </div>
              )}
            </div>

            <Divider />

            {/* Totals */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính</span>
                <span>{total.toLocaleString()}đ</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá ({appliedVoucher?.code})</span>
                  <span>-{discount.toLocaleString()}đ</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                <span className="text-green-500">Miễn phí</span>
              </div>
              <Divider />
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Tổng thanh toán</span>
                <div className="text-right">
                  {discount > 0 && (
                    <p className="text-sm text-gray-400 line-through">{total.toLocaleString()}đ</p>
                  )}
                  <span className="text-2xl font-bold text-blue-600">
                    {finalTotal.toLocaleString()}đ
                  </span>
                </div>
              </div>
            </div>

            <Button
              type="primary"
              size="large"
              loading={loading}
              icon={<CreditCardOutlined />}
              onClick={handlePlaceOrder}
              disabled={!isFormValid}
              className="w-full bg-gradient-to-r from-[#6272B6] to-purple-600 border-0 rounded-full text-lg font-bold py-6 h-auto hover:scale-105 transition-transform shadow-lg"
            >
              {loading
                ? "Đang xử lý..."
                : form.paymentMethod === "vnpay"
                ? "💳 Thanh toán qua VNPay"
                : "🛒 Đặt hàng (COD)"}
            </Button>

            {form.paymentMethod === "vnpay" && (
              <div className="text-center bg-blue-50 p-3 rounded-xl border border-blue-200">
                <p className="text-xs text-blue-600 flex items-center justify-center gap-2">
                  <CheckCircleOutlined />
                  Bạn sẽ được chuyển đến trang thanh toán VNPay an toàn
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}