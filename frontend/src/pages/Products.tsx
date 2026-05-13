import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../api/http"; 
import { message, Skeleton, Tag, Badge, Input, Select, Slider, Card, Button, Tabs, Row, Col, Empty } from "antd";
import { ShoppingCartOutlined, EyeOutlined, SearchOutlined, FilterOutlined, ReloadOutlined, AppstoreOutlined, StarOutlined } from "@ant-design/icons";

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

interface Category {
  _id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const categoryIcons: Record<string, string> = {
  "Thức ăn & Dinh dưỡng": "🍖",
  "Chăm sóc sức khỏe & Y tế": "🏥", 
  "Vệ sinh & Làm sạch": "🧽",
  "Chăm sóc sắc đẹp": "✨",
  "Đồ dùng sinh hoạt & Chỗ ở": "🏠",
  "Phụ kiện đi dạo & Vận chuyển": "🚶",
  "Đồ chơi & Huấn luyện": "🎾"
};

export default function Products() {
  const navigate = useNavigate();
  const [data, setData] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // --- States phục vụ Tìm kiếm & Lọc ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000]);

  const handleAddToCart = (p: Product) => {
    if (p.quantity <= 0) return message.warning("Sản phẩm đã hết hàng");
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const idx = cart.findIndex((item: any) => item._id === p._id);
    if (idx > -1) {
      cart[idx].cartQuantity += 1;
    } else {
      cart.push({ ...p, cartQuantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart-change"));
    message.success(`Đã thêm "${p.name}" vào giỏ hàng`);
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        apiClient.get("/products", { params: { limit: 100, page: 1 } }),
        apiClient.get("/category").catch(() => ({ data: { data: [] } }))
      ]);
      
      if (productsRes.data && productsRes.data.success) {
        setData(productsRes.data.data);
      } else {
        const result = productsRes.data.data || productsRes.data;
        setData(Array.isArray(result) ? result : []);
      }
      
      if (categoriesRes.data && categoriesRes.data.data) {
        setCategories(categoriesRes.data.data);
      }
    } catch (error: any) {
      message.error("Không thể kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // --- Lấy danh sách các danh mục duy nhất từ dữ liệu thực tế ---
  const availableCategories = useMemo(() => {
    const list = data.map((p) => p.category).filter(Boolean) as string[];
    return Array.from(new Set(list));
  }, [data]);

  // --- Logic lọc dữ liệu ---
  const filteredProducts = useMemo(() => {
    return data.filter((product) => {
      // 1. Lọc theo từ khóa tìm kiếm
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      // 2. Lọc theo danh mục
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;

      // 3. Lọc theo khoảng giá
      const matchesPrice =
        product.price >= priceRange[0] && product.price <= priceRange[1];

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [data, searchQuery, selectedCategory, priceRange]);

  // --- Reset bộ lọc về mặc định ---
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setPriceRange([0, 2000000]);
  };

  // --- Group products by category for tabs ---
  const productsByCategory = useMemo(() => {
    const grouped = filteredProducts.reduce((acc, product) => {
      const cat = product.category || "Khác";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(product);
      return acc;
    }, {} as Record<string, Product[]>);
    return grouped;
  }, [filteredProducts]);

  const tabItems = [
    {
      key: "all",
      label: (
        <span className="flex items-center gap-2">
          <AppstoreOutlined />
          Tất cả ({filteredProducts.length})
        </span>
      ),
    },
    ...availableCategories.map(cat => ({
      key: cat,
      label: (
        <span className="flex items-center gap-2">
          <span>{categoryIcons[cat] || "📦"}</span>
          {cat} ({productsByCategory[cat]?.length || 0})
        </span>
      ),
    }))
  ];

  const displayProducts = selectedCategory === "all" 
    ? filteredProducts 
    : productsByCategory[selectedCategory] || [];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-[1400px] mx-auto py-16 px-6">
        
        {/* Tiêu đề */}
        <div className="flex flex-col items-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
            Cửa Hàng <span className="text-[#6272B6]">Thú Cưng</span> 🐾
          </h1>
          <div className="h-1 w-20 bg-[#6272B6] rounded-full"></div>
          <p className="text-gray-500 mt-4">Mọi thứ thú cưng cần cho cuộc sống hạnh phúc ❤️</p>
        </div>

        {/* Categories showcase */}
        {!loading && categories.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Danh mục sản phẩm</h2>
            <Row gutter={[16, 16]}>
              {availableCategories.map(cat => {
                const count = productsByCategory[cat]?.length || 0;
                return (
                  <Col key={cat} xs={12} sm={8} md={6} lg={4} xl={3}>
                    <Card
                      hoverable
                      className="text-center h-full rounded-2xl border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => setSelectedCategory(cat)}
                      style={{ 
                        borderTop: `4px solid ${categories.find(c => c.name === cat)?.color || "#6272B6"}` 
                      }}
                    >
                      <div className="text-4xl mb-3">{categoryIcons[cat] || "📦"}</div>
                      <div className="font-bold text-gray-800 text-sm mb-1">{cat}</div>
                      <div className="text-xs text-gray-500">{count} sản phẩm</div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </div>
        )}

        {/* ================= THANH TÌM KIẾM & BỘ LỌC ================= */}
        <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            
            {/* Ô tìm kiếm */}
            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Tìm kiếm sản phẩm
              </label>
              <Input
                placeholder="Nhập tên sản phẩm cần tìm..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                allowClear
                size="large"
                className="rounded-xl border-gray-200 hover:border-[#6272B6] focus:border-[#6272B6] h-11"
              />
            </div>

            {/* Bộ lọc danh mục */}
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Danh mục
              </label>
              <Select
                value={selectedCategory}
                onChange={(value) => setSelectedCategory(value)}
                size="large"
                className="w-full rounded-xl"
                popupClassName="rounded-xl"
              >
                <Select.Option value="all">Tất cả danh mục</Select.Option>
                {availableCategories.map((cat) => (
                  <Select.Option key={cat} value={cat}>
                    {categoryIcons[cat]} {cat}
                  </Select.Option>
                ))}
              </Select>
            </div>

            {/* Bộ lọc khoảng giá */}
            <div className="md:col-span-4">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Khoảng giá (VNĐ)
                </label>
                <span className="text-xs font-semibold text-[#6272B6]">
                  {priceRange[0].toLocaleString()}đ - {priceRange[1].toLocaleString()}đ
                </span>
              </div>
              <div className="px-2">
                <Slider
                  range
                  min={0}
                  max={2000000}
                  step={50000}
                  value={priceRange}
                  onChange={(val) => setPriceRange(val as [number, number])}
                  tooltip={{ formatter: (val) => `${val?.toLocaleString()}đ` }}
                  trackStyle={{ backgroundColor: "#6272B6" }}
                  handleStyle={{ borderColor: "#6272B6" }}
                />
              </div>
            </div>

            {/* Nút reset */}
            <div className="md:col-span-1 flex justify-end">
              <Button
                type="text"
                danger
                onClick={handleResetFilters}
                icon={<ReloadOutlined />}
                className="h-11 w-full md:w-11 flex items-center justify-center rounded-xl hover:bg-red-50"
                title="Xóa bộ lọc"
              />
            </div>

          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-6">
          <Tabs
            activeKey={selectedCategory}
            onChange={setSelectedCategory}
            items={tabItems}
            className="category-tabs"
            size="large"
          />
        </div>

        {/* Danh sách sản phẩm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading
            ? // Hiển thị Skeleton khi đang load
              Array(12).fill(0).map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-3xl shadow-sm">
                  <Skeleton.Image active className="w-full !h-48 !w-full rounded-2xl mb-4" />
                  <Skeleton active paragraph={{ rows: 3 }} title={{ width: '80%' }} />
                  <div className="flex justify-between items-center mt-4">
                    <Skeleton.Button active size="small" />
                    <Skeleton.Button active size="small" shape="circle" />
                  </div>
                </div>
              ))
            : displayProducts.map((p) => (
                <Badge.Ribbon 
                    key={p._id} 
                    text={p.quantity <= 0 ? "Hết hàng" : p.quantity <= 5 ? `Còn ${p.quantity}` : "Mới"} 
                    color={p.quantity <= 0 ? "red" : p.quantity <= 5 ? "orange" : "#6272B6"}
                >
                  <div className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-transparent hover:border-blue-100 flex flex-col h-full relative">
                    {/* Image Container */}
                    <div className="relative overflow-hidden aspect-square">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://placehold.co/400x400?text=Pet+Product";
                        }}
                      />
                      {/* Overlay khi hover */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                        <button 
                          onClick={() => navigate(`/products/${p._id}`)}
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
                          {categoryIcons[p.category || ""] || "📦"} {p.category || "Sản phẩm"}
                        </Tag>
                        {p.brand && (
                          <Tag className="text-[10px] bg-gray-100 border-none text-gray-600">
                            {p.brand}
                          </Tag>
                        )}
                      </div>
                      
                      <h2 
                        className="font-bold text-gray-800 text-base mb-2 line-clamp-2 group-hover:text-[#6272B6] transition-colors cursor-pointer leading-tight"
                        onClick={() => navigate(`/products/${p._id}`)}
                        title={p.name}
                      >
                        {p.name}
                      </h2>

                      {p.description && (
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">
                          {p.description}
                        </p>
                      )}
                      
                      <div className="mt-auto flex justify-between items-center">
                        <div>
                          <p className="text-[#6272B6] font-black text-xl">
                            {(p.price || 0).toLocaleString()}đ
                          </p>
                          <p className="text-xs text-gray-400">
                            Kho: {p.quantity > 0 ? p.quantity : "Hết hàng"}
                          </p>
                        </div>
                        <button 
                          onClick={() => handleAddToCart(p)}
                          disabled={p.quantity <= 0}
                          className={`p-3 rounded-xl transition-all shadow-sm ${
                            p.quantity > 0
                              ? "bg-[#6272B6] text-white hover:bg-[#4a569d] hover:scale-105"
                              : "bg-gray-100 text-gray-300 cursor-not-allowed"
                          }`}
                          title={p.quantity > 0 ? "Thêm vào giỏ" : "Hết hàng"}
                        >
                          <ShoppingCartOutlined className="text-lg" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Badge.Ribbon>
              ))}
        </div>

        {/* Empty State */}
        {!loading && displayProducts.length === 0 && (
          <div className="text-center py-24 bg-white rounded-[3rem] shadow-sm border border-dashed border-gray-200">
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-gray-700 font-bold text-xl mb-2">Không tìm thấy sản phẩm phù hợp</h3>
            <p className="text-gray-400 mb-6">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn 🤔</p>
            <Button 
              onClick={handleResetFilters} 
              type="primary" 
              className="bg-[#6272B6] hover:bg-[#505f9c] border-none rounded-xl px-8 h-12 text-base"
            >
              🔄 Reset bộ lọc
            </Button>
          </div>
        )}
      </div>

      <style jsx>{`
        .category-tabs .ant-tabs-tab {
          border-radius: 12px !important;
          margin-right: 8px !important;
        }
        .category-tabs .ant-tabs-tab-active {
          background: #6272B6 !important;
          color: white !important;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}