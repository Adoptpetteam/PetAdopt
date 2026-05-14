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
  const discount = appliedVoucher?.discount ?? 0;
  const finalTotal = total - discount;

  const totalQty = selectedItems.reduce((sum, item) => sum + item.cartQuantity, 0);

  const isFormValid =
    form.name.trim().length > 0 &&
    form.phone.trim().length > 0 &&
    form.address.trim().length > 0;

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
          address: form.address.trim(),
          reason: "Mua hàng online",
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Thanh Toán Đơn Hàng</h1>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT - Thông tin */}
          <div className="space-y-6">
            {/* Thông tin nhận hàng */}
            <Card title="Thông tin nhận hàng" className="shadow-sm">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <Input
                    size="large"
                    placeholder="Nguyễn Văn A"
                    prefix={<UserOutlined />}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <Input
                    size="large"
                    placeholder="0912345678"
                    prefix={<PhoneOutlined />}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ giao hàng <span className="text-red-500">*</span>
                  </label>
                  <Input.TextArea
                    rows={3}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>
              </div>
            </Card>

            {/* Phương thức thanh toán */}
            <Card title="Phương thức thanh toán" className="shadow-sm">
              <Radio.Group
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                className="w-full"
              >
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <Radio value="cod">
                      <div className="flex items-center gap-3">
                        <CarOutlined className="text-orange-500" />
                        <div>
                          <div className="font-medium">Thanh toán khi nhận hàng (COD)</div>
                          <p className="text-sm text-gray-500">Thanh toán bằng tiền mặt khi nhận hàng</p>
                        </div>
                      </div>
                    </Radio>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <Radio value="vnpay">
                      <div className="flex items-center gap-3">
                        <BankOutlined className="text-blue-500" />
                        <div>
                          <div className="font-medium">VNPay</div>
                          <p className="text-sm text-gray-500">ATM, Visa, MasterCard, QR Code</p>
                        </div>
                      </div>
                    </Radio>
                  </div>
                </div>
              </Radio.Group>
            </Card>
          </div>

          {/* RIGHT - Đơn hàng */}
          <Card title={`Đơn hàng (${totalQty} sản phẩm)`} className="shadow-sm">
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
              className="w-full"
            >
              {loading
                ? "Đang xử lý..."
                : form.paymentMethod === "vnpay"
                ? "Thanh toán qua VNPay"
                : "Đặt hàng (COD)"}
            </Button>

            {form.paymentMethod === "vnpay" && (
              <p className="text-center text-xs text-gray-500 mt-2">
                Bạn sẽ được chuyển đến trang thanh toán VNPay an toàn
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}