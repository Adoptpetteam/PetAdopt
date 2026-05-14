import { useNavigate } from "react-router-dom";
import { message, Tag, Badge } from "antd";
import { ShoppingCartOutlined, EyeOutlined } from "@ant-design/icons";

interface Product {
  _id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  category?: string;
  brand?: string;
  description?: string;
}

interface ProductCardProps {
  product: Product;
  categoryIcon?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, categoryIcon = "📦" }) => {
  const navigate = useNavigate();

  const handleAddToCart = () => {
    if (product.quantity <= 0) return message.warning("Sản phẩm đã hết hàng");
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const idx = cart.findIndex((item: any) => item._id === product._id);
    if (idx > -1) {
      cart[idx].cartQuantity += 1;
    } else {
      cart.push({ ...product, cartQuantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart-change"));
    message.success(`Đã thêm "${product.name}" vào giỏ hàng`);
  };

  return (
    <Badge.Ribbon 
      text={product.quantity <= 0 ? "Hết hàng" : product.quantity <= 5 ? `Còn ${product.quantity}` : "Mới"} 
      color={product.quantity <= 0 ? "#ef4444" : product.quantity <= 5 ? "#f59e0b" : "#6272B6"}
    >
      <div className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-[#6272B6]/30 flex flex-col h-full relative transform hover:-translate-y-2">
        
        {/* Gradient overlay decoration */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#6272B6]/10 to-transparent rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500"></div>
        
        {/* Image Container với hiệu ứng đẹp */}
        <div className="relative overflow-hidden aspect-square bg-gradient-to-br from-gray-50 to-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://placehold.co/400x400?text=Pet+Product";
            }}
          />
          
          {/* Overlay với gradient khi hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <button 
              onClick={() => navigate(`/products/${product._id}`)}
              className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl hover:bg-[#6272B6] hover:text-white transition-all duration-300 shadow-xl transform scale-0 group-hover:scale-100"
            >
              <EyeOutlined className="text-xl" />
            </button>
          </div>
          
          {/* Hiệu ứng shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </div>

        {/* Content với padding đẹp hơn */}
        <div className="p-6 flex flex-col flex-grow relative">
          
          {/* Tags với animation */}
          <div className="mb-4 flex items-center justify-between">
            <Tag 
              className="rounded-full px-3 py-1 border-none text-[10px] uppercase font-bold tracking-wide transform group-hover:scale-105 transition-transform"
              style={{
                background: 'linear-gradient(135deg, #6272B6, #8b5cf6)',
                color: 'white'
              }}
            >
              {categoryIcon} {product.category || "Sản phẩm"}
            </Tag>
            {product.brand && (
              <Tag className="text-[10px] bg-gradient-to-r from-gray-100 to-gray-200 border-none text-gray-600 rounded-full px-2 py-1">
                {product.brand}
              </Tag>
            )}
          </div>
          
          {/* Tên sản phẩm với gradient hover */}
          <h2 
            className="font-bold text-gray-800 text-base mb-3 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#6272B6] group-hover:to-purple-600 transition-all duration-300 cursor-pointer leading-tight"
            onClick={() => navigate(`/products/${product._id}`)}
            title={product.name}
          >
            {product.name}
          </h2>

          {/* Mô tả */}
          {product.description && (
            <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
              {product.description}
            </p>
          )}
          
          {/* Footer với gradient button */}
          <div className="mt-auto flex justify-between items-center">
            <div>
              <p className="text-transparent bg-clip-text bg-gradient-to-r from-[#6272B6] to-purple-600 font-black text-xl">
                {(product.price || 0).toLocaleString()}đ
              </p>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                📦 Kho: {product.quantity > 0 ? product.quantity : "Hết hàng"}
              </p>
            </div>
            
            {/* Button với gradient và animation */}
            <button 
              onClick={handleAddToCart}
              disabled={product.quantity <= 0}
              className={`p-4 rounded-2xl transition-all duration-300 shadow-lg transform group-hover:scale-110 ${
                product.quantity > 0
                  ? "bg-gradient-to-r from-[#6272B6] to-purple-600 text-white hover:shadow-xl hover:from-purple-600 hover:to-[#6272B6]"
                  : "bg-gray-100 text-gray-300 cursor-not-allowed"
              }`}
              title={product.quantity > 0 ? "Thêm vào giỏ" : "Hết hàng"}
            >
              <ShoppingCartOutlined className="text-lg" />
            </button>
          </div>
        </div>
      </div>
    </Badge.Ribbon>
  );
};

export default ProductCard;