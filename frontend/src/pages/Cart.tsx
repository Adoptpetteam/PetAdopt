import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { message, Modal, Button, Empty } from "antd";
import { 
  ExclamationCircleOutlined, 
  DeleteOutlined, 
  ShoppingCartOutlined, 
  CheckCircleOutlined,
  ArrowLeftOutlined,
  CreditCardOutlined
} from "@ant-design/icons";

interface CartItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  cartQuantity: number;
}

export default function Cart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const navigate = useNavigate();

  const fetchCart = () => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc muốn bỏ sản phẩm này khỏi giỏ hàng?',
      okText: 'Xóa ngay',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        const newCart = cart.filter(item => item._id !== id);
        localStorage.setItem("cart", JSON.stringify(newCart));
        setCart(newCart);
        setSelectedIds(prev => prev.filter(itemId => itemId !== id));
        message.success("Đã xóa khỏi giỏ hàng");
      },
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.length === cart.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cart.map(item => item._id));
    }
  };

  const total = cart
    .filter(item => selectedIds.includes(item._id))
    .reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);

  return (
    <div className="max-w-[900px] mx-auto py-20 px-6">
      <div className="flex items-center gap-3 mb-10">
        <ShoppingCartOutlined className="text-4xl text-[#6272B6]" />
        <h1 className="text-3xl font-bold text-[#6272B6]">Giỏ hàng</h1>
      </div>

      {cart.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl shadow-sm text-center">
          <Empty 
            description="Giỏ hàng của bạn đang trống" 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
          />
          <Button 
            type="primary" 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/products")}
            className="mt-6 h-10 rounded-full bg-[#6272B6]"
          >
            Quay lại mua sắm
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-6 flex justify-between items-center bg-[#f8f9ff] p-4 rounded-2xl border border-blue-50">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                className="w-5 h-5 cursor-pointer accent-[#6272B6]"
                checked={selectedIds.length === cart.length && cart.length > 0}
                onChange={handleSelectAll}
              />
              <span className="font-semibold text-gray-700">Chọn tất cả ({cart.length})</span>
            </div>
            {selectedIds.length > 0 && (
              <span className="text-green-600 flex items-center gap-1 animate-pulse">
                <CheckCircleOutlined /> Đã chọn {selectedIds.length} sản phẩm
              </span>
            )}
          </div>

          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item._id}
                className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition border border-gray-50"
              >
                <div className="flex gap-4 items-center">
                  <input
                    type="checkbox"
                    className="w-5 h-5 cursor-pointer accent-[#6272B6]"
                    checked={selectedIds.includes(item._id)}
                    onChange={() => {
                      if (selectedIds.includes(item._id)) {
                        setSelectedIds(selectedIds.filter(id => id !== item._id));
                      } else {
                        setSelectedIds([...selectedIds, item._id]);
                      }
                    }}
                  />

                  <img 
                    src={item.image} 
                    className="w-20 h-20 rounded-xl object-cover shadow-sm" 
                    alt={item.name}
                  />

                  <div>
                    <p className="font-bold text-lg text-gray-800">{item.name}</p>
                    <p className="text-[#6272B6] font-bold">
                      {item.price.toLocaleString()}đ
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Tag color="blue" className="rounded-md">SL: {item.cartQuantity}</Tag>
                    </div>
                  </div>
                </div>

                <Button 
                  type="text" 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={() => handleDelete(item._id)}
                  className="hover:bg-red-50 rounded-full h-10 w-10 flex items-center justify-center"
                />
              </div>
            ))}
          </div>

          <div className="mt-12 bg-white p-8 rounded-3xl shadow-xl border-t-4 border-t-[#6272B6]">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-500 text-lg">Tổng thanh toán:</span>
              <p className="text-3xl font-black text-[#6272B6]">
                {total.toLocaleString()}đ
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-4">
              <Button 
                size="large" 
                icon={<ShoppingCartOutlined />}
                onClick={() => navigate("/products")}
                className="rounded-full h-12 px-8"
              >
                Mua thêm
              </Button>
              <Button 
                type="primary" 
                size="large" 
                icon={<CreditCardOutlined />}
                disabled={selectedIds.length === 0}
                onClick={() => navigate("/checkout", { state: { selectedItems: cart.filter(i => selectedIds.includes(i._id)) } })}
                className="rounded-full h-12 px-10 bg-[#6272B6] shadow-lg shadow-blue-100"
              >
                Thanh toán ngay
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Helper component nhỏ để dùng Tag của Antd
function Tag({ children, color, className }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
  };
  return (
    <span className={`px-2 py-0.5 text-xs border rounded ${colors[color]} ${className}`}>
      {children}
    </span>
  );
}