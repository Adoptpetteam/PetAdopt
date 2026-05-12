import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiClient } from "../api/http"; // Dùng apiClient để tự động đính kèm Token
import { message, Button, Input, Radio } from "antd";
import { UserOutlined, PhoneOutlined, HomeOutlined, CreditCardOutlined } from "@ant-design/icons";

interface CartItem {
  _id: string;      // ID của sản phẩm trong giỏ (MongoDB string)
  name: string;
  price: number;
  image: string;
  cartQuantity: number; // Tên biến số lượng khớp với ProductDetail/Cart
}

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Lấy danh sách item đã chọn được truyền từ trang Cart sang
  const selectedItems: CartItem[] = location.state?.selectedItems || [];
  
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    reason: "",
    paymentMethod: "COD"
  });

  // Chặn nếu khách truy cập "lụi" vào trang này mà không có hàng
  useEffect(() => {
    if (selectedItems.length === 0) {
      message.warning("Vui lòng chọn sản phẩm trước khi thanh toán");
      navigate("/cart");
    }
  }, [selectedItems, navigate]);

  const total = selectedItems.reduce(
    (sum, item) => sum + item.price * item.cartQuantity,
    0
  );

  const handlePlaceOrder = async () => {
    // 1. Kiểm tra nhập liệu cơ bản
    if (!form.name || !form.phone || !form.address) {
      return message.error("Vui lòng nhập đầy đủ thông tin giao hàng");
    }

    try {
      // 2. Build payload đúng cấu trúc Backend yêu cầu
      const payload = {
        paymentMethod: form.paymentMethod,
        customer: {
          name: form.name,
          phone: form.phone,
          address: form.address,
          reason: form.reason || "Mua hàng online"
        },
        items: selectedItems.map(item => ({
          productId: item._id, // Phải dùng productId như Controller Backend
          quantity: item.cartQuantity
        }))
      };

      // 3. Gọi API Checkout (Backend sẽ xử lý trừ kho + lưu Order)
      const res = await apiClient.post("/orders/checkout", payload);

      if (res.data.success) {
        message.success("Đặt hàng thành công! Đã cập nhật kho hàng.");
        
        // 4. Xóa những món đã mua khỏi giỏ hàng trong localStorage
        const fullCart = JSON.parse(localStorage.getItem("cart") || "[]");
        const remainingCart = fullCart.filter(
          (item: any) => !selectedItems.some((s) => s._id === item._id)
        );
        localStorage.setItem("cart", JSON.stringify(remainingCart));

        // 5. Về trang chủ hoặc trang đơn hàng
        navigate("/products");
      }
    } catch (error: any) {
      console.error("Lỗi đặt hàng:", error);
      message.error(error.response?.data?.message || "Thanh toán thất bại, vui lòng thử lại");
    }
  };

  return (
    <div className="max-w-[900px] mx-auto py-20 px-6 grid grid-cols-1 md:grid-cols-2 gap-10">
      
      {/* CỘT TRÁI: THÔNG TIN GIAO HÀNG */}
      <div>
        <h1 className="text-3xl font-bold text-[#6272B6] mb-8 flex items-center gap-2">
          <HomeOutlined /> Thông tin nhận hàng
        </h1>
        
        <div className="space-y-4">
          <Input 
            size="large"
            placeholder="Họ và tên người nhận" 
            prefix={<UserOutlined />}
            className="rounded-xl h-12" 
            onChange={e => setForm({...form, name: e.target.value})}
          />
          <Input 
            size="large"
            placeholder="Số điện thoại" 
            prefix={<PhoneOutlined />}
            className="rounded-xl h-12"
            onChange={e => setForm({...form, phone: e.target.value})}
          />
          <Input.TextArea 
            placeholder="Địa chỉ nhận hàng chi tiết" 
            className="rounded-xl"
            rows={3}
            onChange={e => setForm({...form, address: e.target.value})}
          />
          
          <div className="mt-6 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
            <p className="font-bold mb-3">Phương thức thanh toán:</p>
            <Radio.Group 
              value={form.paymentMethod} 
              onChange={e => setForm({...form, paymentMethod: e.target.value})}
            >
              <Radio value="COD">Tiền mặt (COD)</Radio>
              <Radio value="Banking">Chuyển khoản</Radio>
            </Radio.Group>
          </div>
        </div>
      </div>

      {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
      <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-blue-50 flex flex-col">
        <h2 className="text-xl font-bold mb-6">Tóm tắt đơn hàng</h2>
        
        <div className="flex-grow space-y-4 max-h-[300px] overflow-y-auto pr-2">
          {selectedItems.map(item => (
            <div key={item._id} className="flex items-center gap-4 border-b border-gray-50 pb-4">
              <img src={item.image} className="w-16 h-16 rounded-xl object-cover border" alt={item.name} />
              <div className="flex-grow">
                <p className="font-semibold text-gray-800 line-clamp-1">{item.name}</p>
                <p className="text-gray-400 text-sm">{item.cartQuantity} x {item.price.toLocaleString()}đ</p>
              </div>
              <p className="font-bold text-[#6272B6]">{(item.price * item.cartQuantity).toLocaleString()}đ</p>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-dashed border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-500">Tổng cộng thanh toán:</span>
            <span className="text-2xl font-black text-[#6272B6]">{total.toLocaleString()}đ</span>
          </div>

          <Button 
            type="primary" 
            size="large" 
            block 
            icon={<CreditCardOutlined />}
            onClick={handlePlaceOrder}
            className="h-14 rounded-2xl bg-[#6272B6] text-lg font-bold shadow-lg shadow-blue-100 hover:scale-[1.02] transition-transform"
          >
            ĐẶT HÀNG NGAY
          </Button>
        </div>
      </div>

    </div>
  );
}