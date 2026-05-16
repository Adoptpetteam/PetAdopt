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
import ReviewSection from "../components/ReviewSection";

interface ProductVariant {
  _id: string;
  name: string;
  sku?: string;
  price: number;
  quantity: number;
  attributes?: {
    size?: string;
    weight?: string;
    flavor?: string;
    age?: string;
    color?: string;
  };
  image?: string;
  isActive?: boolean;
}

interface Product {
  _id: string;
  name: string;
  image: string;
  price: number;
  description: string;
  quantity: number;
  category?: string;
  hasVariants?: boolean;
  variants?: ProductVariant[];
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [buyQty, setBuyQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/products/${id}`);
      if (res.data && res.data.success) {
        const productData = res.data.data;
        setProduct(productData);
        // Tự động chọn variant đầu tiên nếu có
        if (productData.hasVariants && productData.variants && productData.variants.length > 0) {
          setSelectedVariant(productData.variants[0]);
        }
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
    
    // Kiểm tra nếu có variants thì phải chọn variant
    if (product.hasVariants && !selectedVariant) {
      return message.warning("Vui lòng chọn phiên bản sản phẩm");
    }
    
    try {
      // Fetch tồn kho mới nhất từ DB
      const res = await apiClient.get(`/products/${product._id}`);
      const latest: Product = res.data?.data;
      
      // Lấy thông tin tồn kho từ variant hoặc product
      const currentStock = selectedVariant ? selectedVariant.quantity : latest.quantity;
      const currentPrice = selectedVariant ? selectedVariant.price : latest.price;
      
      if (!latest || currentStock <= 0) {
        return message.warning("Sản phẩm vừa hết hàng");
      }
      
      // Kiểm tra tổng số đã có trong giỏ + số muốn thêm
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const cartKey = selectedVariant ? `${product._id}_${selectedVariant._id}` : product._id;
      const existingItem = cart.find((item: any) => {
        if (selectedVariant) {
          return item._id === product._id && item.variantId === selectedVariant._id;
        }
        return item._id === product._id && !item.variantId;
      });
      
      const currentInCart = existingItem ? existingItem.cartQuantity : 0;
      if (currentInCart + buyQty > currentStock) {
        const canAdd = currentStock - currentInCart;
        if (canAdd <= 0) return message.warning(`Bạn đã có ${currentInCart} trong giỏ, không thể thêm (kho còn ${currentStock})`);
        return message.warning(`Chỉ có thể thêm tối đa ${canAdd} sản phẩm nữa (kho còn ${currentStock})`);
      }
      
      const existingItemIndex = cart.findIndex((item: any) => {
        if (selectedVariant) {
          return item._id === product._id && item.variantId === selectedVariant._id;
        }
        return item._id === product._id && !item.variantId;
      });
      
      if (existingItemIndex > -1) {
        cart[existingItemIndex].cartQuantity += buyQty;
        cart[existingItemIndex].quantity = currentStock;
      } else {
        const cartItem: any = {
          ...latest,
          cartQuantity: buyQty,
          quantity: currentStock,
          price: currentPrice,
        };
        
        // Thêm thông tin variant nếu có
        if (selectedVariant) {
          cartItem.variantId = selectedVariant._id;
          cartItem.variantName = selectedVariant.name;
          cartItem.variantAttributes = selectedVariant.attributes;
          cartItem.image = selectedVariant.image || latest.image;
        }
        
        cart.push(cartItem);
      }
      
      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cart-change"));
      
      // Cập nhật UI với tồn kho mới nhất
      setProduct(latest);
      
      const displayName = selectedVariant 
        ? `${product.name} - ${selectedVariant.name}` 
        : product.name;
      
      message.open({
        type: 'success',
        content: `Đã thêm ${buyQty} ${displayName} vào giỏ hàng!`,
        icon: <ShoppingCartOutlined style={{ color: '#6272B6' }} />,
      });
    } catch {
      message.error("Không thể kiểm tra tồn kho, thử lại sau");
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    
    // Kiểm tra nếu có variants thì phải chọn variant
    if (product.hasVariants && !selectedVariant) {
      return message.warning("Vui lòng chọn phiên bản sản phẩm");
    }
    
    try {
      const res = await apiClient.get(`/products/${product._id}`);
      const latest: Product = res.data?.data;
      
      const currentStock = selectedVariant ? selectedVariant.quantity : latest.quantity;
      const currentPrice = selectedVariant ? selectedVariant.price : latest.price;
      
      if (!latest || currentStock <= 0) {
        return message.warning("Sản phẩm vừa hết hàng");
      }
      if (buyQty > currentStock) {
        return message.warning(`Chỉ còn ${currentStock} sản phẩm trong kho`);
      }
      
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existingItemIndex = cart.findIndex((item: any) => {
        if (selectedVariant) {
          return item._id === product._id && item.variantId === selectedVariant._id;
        }
        return item._id === product._id && !item.variantId;
      });
      
      const cartItem: any = {
        ...latest,
        cartQuantity: buyQty,
        quantity: currentStock,
        price: currentPrice,
      };
      
      if (selectedVariant) {
        cartItem.variantId = selectedVariant._id;
        cartItem.variantName = selectedVariant.name;
        cartItem.variantAttributes = selectedVariant.attributes;
        cartItem.image = selectedVariant.image || latest.image;
      }
      
      if (existingItemIndex > -1) {
        cart[existingItemIndex].cartQuantity += buyQty;
        cart[existingItemIndex].quantity = currentStock;
      } else {
        cart.push(cartItem);
      }
      
      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cart-change"));
      navigate("/checkout", {
        state: { selectedItems: [cartItem] },
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* CỘT TRÁI: HÌNH ẢNH */}
          <div className="lg:col-span-1">
            <div className="bg-white p-4 rounded-[2rem] shadow-xl shadow-blue-100/50 relative group">
              <img
                src={(selectedVariant?.image) || product.image}
                alt={product.name}
                className="w-full h-auto rounded-[1.5rem] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <button className="absolute top-8 right-8 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shadow-md">
                <HeartOutlined className="text-xl" />
              </button>
            </div>
          </div>

          {/* CỘT PHẢI: THÔNG TIN */}
          <div className="lg:col-span-1 flex flex-col">
            <div className="sticky top-24 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 max-h-[calc(100vh-7rem)] overflow-y-auto">
              <Tag color="blue" className="mb-3 border-none bg-blue-50 text-[#6272B6] font-bold px-4 py-1 rounded-full">
                SẢN PHẨM BÁN CHẠY
              </Tag>
              
              <h1 className="text-3xl font-black text-gray-900 leading-tight mb-3">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-black text-[#6272B6]">
                  {(selectedVariant ? selectedVariant.price : product.price || 0).toLocaleString()}đ
                </span>
                {product.hasVariants && product.variants && product.variants.length > 1 && (
                  <span className="text-gray-400 text-sm">
                    ({Math.min(...product.variants.map(v => v.price)).toLocaleString()}đ - {Math.max(...product.variants.map(v => v.price)).toLocaleString()}đ)
                  </span>
                )}
              </div>

              {/* Hiển thị variants nếu có */}
              {product.hasVariants && product.variants && product.variants.length > 0 && (
                <div className="mb-4 bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-5 bg-gradient-to-b from-[#6272B6] to-purple-500 rounded-full"></div>
                    <h3 className="text-sm font-black text-gray-800">
                      🎯 Chọn phiên bản
                    </h3>
                  </div>
                  
                  <div className="space-y-2">
                    {product.variants.map((variant) => (
                      <button
                        key={variant._id}
                        onClick={() => {
                          setSelectedVariant(variant);
                          setBuyQty(1);
                        }}
                        disabled={variant.quantity === 0}
                        className={`relative w-full p-3 rounded-lg text-left transition-all duration-300 ${
                          selectedVariant?._id === variant._id
                            ? "bg-white border-2 border-[#6272B6] shadow-md"
                            : variant.quantity === 0
                            ? "bg-gray-100 border-2 border-gray-200 cursor-not-allowed opacity-60"
                            : "bg-white border-2 border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        {/* Badge đã chọn */}
                        {selectedVariant?._id === variant._id && (
                          <div className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-[#6272B6] to-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                            ✓ Đã chọn
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-gray-900 text-sm mb-1.5 truncate">
                              {variant.name}
                            </div>
                            
                            {/* Thuộc tính với icon */}
                            {variant.attributes && (
                              <div className="flex flex-wrap gap-1.5">
                                {variant.attributes.weight && (
                                  <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                    ⚖️ {variant.attributes.weight}
                                  </span>
                                )}
                                {variant.attributes.flavor && (
                                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                    🍖 {variant.attributes.flavor}
                                  </span>
                                )}
                                {variant.attributes.age && (
                                  <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                    🐕 {variant.attributes.age}
                                  </span>
                                )}
                                {variant.attributes.size && (
                                  <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                    📏 {variant.attributes.size}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="text-right flex flex-col items-end gap-0.5 flex-shrink-0">
                            <div className={`font-black text-base ${
                              selectedVariant?._id === variant._id ? "text-[#6272B6]" : "text-gray-700"
                            }`}>
                              {variant.price.toLocaleString()}đ
                            </div>
                            <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              variant.quantity === 0 
                                ? "bg-red-100 text-red-600" 
                                : variant.quantity <= 5 
                                ? "bg-orange-100 text-orange-600" 
                                : "bg-green-100 text-green-600"
                            }`}>
                              {variant.quantity === 0 ? "❌ Hết" : `✓ ${variant.quantity}`}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-2 text-[10px] text-gray-500 italic flex items-center gap-1.5">
                    <span>💡</span>
                    <span>Chọn phiên bản phù hợp với thú cưng</span>
                  </div>
                </div>
              )}

              <div className="space-y-4 mb-4">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Mô tả chi tiết</h3>
                  <p className="text-gray-600 leading-relaxed text-sm italic">
                    "{product.description || "Một sản phẩm tuyệt vời dành cho thú cưng của bạn với chất lượng đã được kiểm chứng."}"
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-700 text-sm">Số lượng:</span>
                  <InputNumber 
                    min={1} 
                    max={selectedVariant ? selectedVariant.quantity : product.quantity}
                    value={buyQty} 
                    onChange={(v) => {
                      const val = v || 1;
                      const maxQty = selectedVariant ? selectedVariant.quantity : product.quantity;
                      if (val > maxQty) {
                        message.warning(`Kho chỉ còn ${maxQty} sản phẩm`);
                        setBuyQty(maxQty);
                      } else {
                        setBuyQty(val);
                      }
                    }}
                    className="rounded-lg h-9 flex items-center w-20 border-gray-200"
                    keyboard
                  />
                  <span className={`text-xs font-medium ${
                    (selectedVariant ? selectedVariant.quantity : product.quantity) <= 5 ? "text-red-500" : "text-gray-400"
                  }`}>
                    (Còn: <strong>{selectedVariant ? selectedVariant.quantity : product.quantity}</strong>)
                  </span>
                </div>
                {buyQty >= (selectedVariant ? selectedVariant.quantity : product.quantity) && 
                 (selectedVariant ? selectedVariant.quantity : product.quantity) > 0 && (
                  <p className="text-orange-500 text-[10px]">
                    ⚠️ Bạn đang chọn tối đa số lượng trong kho
                  </p>
                )}
              </div>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={handleAddToCart}
                  disabled={(selectedVariant ? selectedVariant.quantity : product.quantity) <= 0}
                  className={`flex-1 h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all border-2 ${
                    (selectedVariant ? selectedVariant.quantity : product.quantity) > 0
                    ? "border-[#6272B6] text-[#6272B6] hover:bg-blue-50 active:scale-95"
                    : "border-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <ShoppingCartOutlined className="text-lg" />
                  {(selectedVariant ? selectedVariant.quantity : product.quantity) > 0 ? "Thêm vào giỏ" : "Hết hàng"}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={(selectedVariant ? selectedVariant.quantity : product.quantity) <= 0}
                  className={`flex-1 h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all shadow-lg ${
                    (selectedVariant ? selectedVariant.quantity : product.quantity) > 0
                    ? "bg-[#6272B6] text-white hover:bg-[#4a569d] hover:-translate-y-1 active:scale-95 shadow-blue-200"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <ThunderboltOutlined className="text-lg" />
                  Mua ngay
                </button>
              </div>

              {/* Các cam kết bên dưới nút mua */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <TruckOutlined className="text-xl text-blue-400 mb-1" />
                  <p className="text-[9px] font-bold text-gray-500 uppercase">Giao nhanh</p>
                </div>
                <div className="text-center">
                  <SafetyCertificateOutlined className="text-xl text-green-400 mb-1" />
                  <p className="text-[9px] font-bold text-gray-500 uppercase">Chính hãng</p>
                </div>
                <div className="text-center">
                  <UndoOutlined className="text-xl text-orange-400 mb-1" />
                  <p className="text-[9px] font-bold text-gray-500 uppercase">Đổi trả 7 ngày</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Review Section */}
        <div className="mt-12">
          <ReviewSection type="product" id={product._id} />
        </div>

      </div>
    </div>
  );
}