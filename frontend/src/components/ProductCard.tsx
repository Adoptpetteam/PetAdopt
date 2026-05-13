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
      color={product.quantity <= 0 ? "red" : product.quantity <= 5 ? "orange" : "#6272B6"}
    >
      <div className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-transparent hover:border-blue-100 flex flex-col h-full relative">
        {/* Image Container */}
        <div className="relative overflow-hidden aspect-square">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://placehold.co/400x400?text=Pet+Product";
            }}
          />
          {/* Overlay khi hover */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <button 
              onClick={() => navigate(`/products/${product._id}`)}
              className="bg-white p-3 rounded-full hover:bg-[#6272B6] hover:text-white transition-colors shadow-lg"
            >
              <EyeOutlined className="text-xl" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-grow">
          <div className="mb-3 flex items-center justify-between">
            <Tag color="blue" className="rounded-full px-3 border-none bg-blue-50 text-blue-500 text-[10px] uppercase font-bold">
              {categoryIcon} {product.category || "Sản phẩm"}
            </Tag>
            {product.brand && (
              <Tag className="text-[10px] bg-gray-100 border-none text-gray-600">
                {product.brand}
              </Tag>
            )}
          </div>
          
          <h2 
            className="font-bold text-gray-800 text-base mb-2 line-clamp-2 group-hover:text-[#6272B6] transition-colors cursor-pointer leading-tight"
            onClick={() => navigate(`/products/${product._id}`)}
            title={product.name}
          >
            {product.name}
          </h2>

          {product.description && (
            <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
          
          <div className="mt-auto flex justify-between items-center">
            <div>
              <p className="text-[#6272B6] font-black text-xl">
                {(product.price || 0).toLocaleString()}đ
              </p>
              <p className="text-xs text-gray-400">
                Kho: {product.quantity > 0 ? product.quantity : "Hết hàng"}
              </p>
            </div>
            <button 
              onClick={handleAddToCart}
              disabled={product.quantity <= 0}
              className={`p-3 rounded-xl transition-all shadow-sm ${
                product.quantity > 0
                  ? "bg-[#6272B6] text-white hover:bg-[#4a569d] hover:scale-105"
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