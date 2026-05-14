import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "../api/http";
import { Spin, message, InputNumber, Breadcrumb, Tag } from "antd";
import { 
  ShoppingCartOutlined, 
  ArrowLeftOutlined, 
  HeartOutlined, 
  SafetyCertificateOutlined,
  TruckOutlined,
  UndoOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";

interface Product {
  _id: string;
  name: string;
  image: string;
  price: number;
  description: string;
  quantity: number;
  category?: string;
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [buyQty, setBuyQty] = useState(1);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/products/${id}`);
      if (res.data && res.data.success) {
        setProduct(res.data.data);
      }
    } catch (error) {
      message.error("Không tìm thấy sản phẩm này");
      navigate("/products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      // Fetch tồn kho mới nhất từ DB
      const res = await apiClient.get(`/products/${product._id}`);
      const latest: Product = res.data?.data;
      if (!latest || latest.quantity <= 0) {
        setProduct(prev => prev ? { ...prev, quantity: 0 } : prev);
        return message.warning("Sản phẩm vừa hết hàng");
      }
      // Kiểm tra tổng số đã có trong giỏ + số muốn thêm
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existingItem = cart.find((item: any) => item._id === product._id);
      const currentInCart = existingItem ? existingItem.cartQuantity : 0;
      if (currentInCart + buyQty > latest.quantity) {
        const canAdd = latest.quantity - currentInCart;
        if (canAdd <= 0) return message.warning(`Bạn đã có ${currentInCart} trong giỏ, không thể thêm (kho còn ${latest.quantity})`);
        return message.warning(`Chỉ có thể thêm tối đa ${canAdd} sản phẩm nữa (kho còn ${latest.quantity})`);
      }
      const existingItemIndex = cart.findIndex((item: any) => item._id === product._id);
      if (existingItemIndex > -1) {
        cart[existingItemIndex].cartQuantity += buyQty;
        cart[existingItemIndex].quantity = latest.quantity;
      } else {
        cart.push({ ...latest, cartQuantity: buyQty });
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cart-change"));
      // Cập nhật UI với tồn kho mới nhất
      setProduct(latest);
      message.open({
        type: 'success',
        content: `Đã thêm ${buyQty} ${product.name} vào giỏ hàng!`,
        icon: <ShoppingCartOutlined style={{ color: '#6272B6' }} />,
      });
    } catch {
      message.error("Không thể kiểm tra tồn kho, thử lại sau");
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    try {
      const res = await apiClient.get(`/products/${product._id}`);
      const latest: Product = res.data?.data;
      if (!latest || latest.quantity <= 0) {
        setProduct(prev => prev ? { ...prev, quantity: 0 } : prev);
        return message.warning("Sản phẩm vừa hết hàng");
      }
      if (buyQty > latest.quantity) {
        return message.warning(`Chỉ còn ${latest.quantity} sản phẩm trong kho`);
      }
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existingItemIndex = cart.findIndex((item: any) => item._id === product._id);
      if (existingItemIndex > -1) {
        cart[existingItemIndex].cartQuantity += buyQty;
        cart[existingItemIndex].quantity = latest.quantity;
      } else {
        cart.push({ ...latest, cartQuantity: buyQty });
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cart-change"));
      navigate("/checkout", {
        state: { selectedItems: [{ ...latest, cartQuantity: buyQty }] },
      });
    } catch {
      message.error("Không thể kiểm tra tồn kho, thử lại sau");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <Spin size="large" description="Đang tải siêu phẩm..." />
    </div>
  );

  if (!product) return null;

  return (
    <div className="bg-[#F8F9FB] min-h-screen pb-20">
      <div className="max-w-[1200px] mx-auto pt-10 px-6">
        {/* Breadcrumb cho chuyên nghiệp */}
        <Breadcrumb 
          className="mb-8 text-gray-500"
          items={[
            {
              title: <span className="cursor-pointer" onClick={() => navigate("/")}>Trang chủ</span>
            },
            {
              title: <span className="cursor-pointer" onClick={() => navigate("/products")}>Sản phẩm</span>
            },
            {
              title: product.name
            }
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* CỘT TRÁI: HÌNH ẢNH (6/12) */}
          <div className="lg:col-span-7">
            <div className="sticky top-28">
              <div className="bg-white p-4 rounded-[2.5rem] shadow-xl shadow-blue-100/50 relative group">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-auto rounded-[2rem] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <button className="absolute top-8 right-8 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shadow-md">
                  <HeartOutlined className="text-xl" />
                </button>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: THÔNG TIN (5/12) */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
              <Tag color="blue" className="mb-4 border-none bg-blue-50 text-[#6272B6] font-bold px-4 py-1 rounded-full">
                SẢN PHẨM BÁN CHẠY
              </Tag>
              
              <h1 className="text-4xl font-black text-gray-900 leading-tight mb-4">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-4xl font-black text-[#6272B6]">
                  {(product.price || 0).toLocaleString()}đ
                </span>
                <span className="text-gray-400 line-through text-lg">
                  {(product.price * 1.2).toLocaleString()}đ
                </span>
              </div>

              <div className="space-y-6 mb-10">
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Mô tả chi tiết</h3>
                  <p className="text-gray-600 leading-relaxed text-lg italic">
                    "{product.description || "Một sản phẩm tuyệt vời dành cho thú cưng của bạn với chất lượng đã được kiểm chứng."}"
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-bold text-gray-700">Số lượng:</span>
                  <InputNumber 
                    min={1} 
                    max={product.quantity}
                    value={buyQty} 
                    onChange={(v) => {
                      const val = v || 1;
                      if (val > product.quantity) {
                        message.warning(`Kho chỉ còn ${product.quantity} sản phẩm`);
                        setBuyQty(product.quantity);
                      } else {
                        setBuyQty(val);
                      }
                    }}
                    className="rounded-lg h-10 flex items-center w-24 border-gray-200"
                    keyboard
                  />
                  <span className={`text-sm font-medium ${product.quantity <= 5 ? "text-red-500" : "text-gray-400"}`}>
                    (Kho còn: <strong>{product.quantity}</strong>)
                  </span>
                </div>
                {buyQty >= product.quantity && product.quantity > 0 && (
                  <p className="text-orange-500 text-xs mt-1">
                    ⚠️ Bạn đang chọn tối đa số lượng trong kho
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.quantity <= 0}
                  className={`flex-1 h-14 rounded-2xl flex items-center justify-center gap-2 font-bold text-base transition-all border-2 ${
                    product.quantity > 0
                    ? "border-[#6272B6] text-[#6272B6] hover:bg-blue-50 active:scale-95"
                    : "border-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <ShoppingCartOutlined className="text-xl" />
                  {product.quantity > 0 ? "Thêm vào giỏ" : "Hết hàng"}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.quantity <= 0}
                  className={`flex-1 h-14 rounded-2xl flex items-center justify-center gap-2 font-bold text-base transition-all shadow-lg ${
                    product.quantity > 0
                    ? "bg-[#6272B6] text-white hover:bg-[#4a569d] hover:-translate-y-1 active:scale-95 shadow-blue-200"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <ThunderboltOutlined className="text-xl" />
                  Mua ngay
                </button>
              </div>

              {/* Các cam kết bên dưới nút mua */}
              <div className="grid grid-cols-3 gap-2 mt-10 pt-10 border-t border-gray-50">
                <div className="text-center">
                  <TruckOutlined className="text-2xl text-blue-400 mb-2" />
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Giao nhanh</p>
                </div>
                <div className="text-center">
                  <SafetyCertificateOutlined className="text-2xl text-green-400 mb-2" />
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Chính hãng</p>
                </div>
                <div className="text-center">
                  <UndoOutlined className="text-2xl text-orange-400 mb-2" />
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Đổi trả 7 ngày</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}