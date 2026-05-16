import { useEffect, useState, useMemo } from "react";
import { message, Skeleton, Input, Select, Slider, Card, Button, Tabs, Row, Col } from "antd";
import { SearchOutlined, ReloadOutlined, AppstoreOutlined } from "@ant-design/icons";
import { apiClient } from "../api/http"; 
import ProductCard from "../components/ProductCard";
import { CATEGORY_ICONS, getCategoryIcon } from "../constants/categoryIcons";

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
  description?: string;
  icon?: string;
  color?: string;
}

const CATEGORY_COLOR_MAP: Record<string, string> = {
  "Thức ăn & Dinh dưỡng": "#f97316",
  "Chăm sóc sức khỏe & Y tế": "#10b981",
  "Vệ sinh & Làm sạch": "#0ea5e9",
  "Chăm sóc sắc đẹp": "#a855f7",
  "Đồ dùng sinh hoạt & Chỗ ở": "#facc15",
  "Phụ kiện đi dạo & Vận chuyển": "#3b82f6",
  "Đồ chơi & Huấn luyện": "#8b5cf6"
};

const getCategoryColor = (categoryName?: string): string => {
  if (!categoryName) return "#6272B6";
  return CATEGORY_COLOR_MAP[categoryName] || "#6272B6";
};

export default function Products() {
  const [data, setData] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // --- States phục vụ Tìm kiếm & Lọc ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        apiClient.get("/products", { params: { limit: 100, page: 1 } }),
        apiClient.get("/category", { params: { type: "product" } }).catch(() => ({ data: { data: [] } }))
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

  // --- Logic lọc dữ liệu với useMemo để tối ưu performance ---
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
          <span>{getCategoryIcon(cat)}</span>
          {cat} ({productsByCategory[cat]?.length || 0})
        </span>
      ),
    }))
  ];

  const displayProducts = selectedCategory === "all" 
    ? filteredProducts 
    : productsByCategory[selectedCategory] || [];

  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 min-h-screen">
      <div className="max-w-[1400px] mx-auto py-16 px-6">
        
        {/* Tiêu đề với gradient và animation */}
        <div className="flex flex-col items-center mb-12">
          <div className="relative">
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#6272B6] via-purple-600 to-pink-500 mb-4 tracking-tight">
              Cửa Hàng Thú Cưng ✨
            </h1>
            <div className="absolute -inset-1 bg-gradient-to-r from-[#6272B6] to-purple-600 rounded-lg blur opacity-25"></div>
          </div>
          <div className="h-1 w-32 bg-gradient-to-r from-[#6272B6] to-purple-600 rounded-full mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Mọi thứ thú cưng cần cho cuộc sống hạnh phúc 🐾</p>
        </div>

        {/* Categories showcase với animation */}
        {!loading && categories.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8 relative">
              🏪 <span className="bg-gradient-to-r from-[#6272B6] to-purple-600 bg-clip-text text-transparent">Danh Mục Sản Phẩm</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
              {categories.map((cat, index) => {
                const count = productsByCategory[cat.name]?.length || 0;
                const categoryColor = cat.color || getCategoryColor(cat.name);
                return (
                  <div
                    key={cat._id}
                    className="group relative bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 cursor-pointer border border-gray-100 overflow-hidden"
                    style={{ 
                      animationDelay: `${index * 100}ms`,
                      background: `linear-gradient(135deg, ${categoryColor}20, white)`
                    }}
                    onClick={() => setSelectedCategory(cat.name)}
                  >
                    {/* Hiệu ứng gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#6272B6]/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Icon với animation */}
                    <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300 relative z-10">
                      {cat.icon || getCategoryIcon(cat.name)}
                    </div>
                    
                    {/* Tên danh mục */}
                    <h3 className="font-bold text-sm text-gray-700 group-hover:text-[#6272B6] transition-colors mb-2 relative z-10">
                      {cat.name}
                    </h3>
                    
                    {/* Số lượng sản phẩm */}
                    <div className="text-xs text-gray-500 group-hover:text-gray-600 relative z-10">
                      {count} sản phẩm
                    </div>
                    
                    {/* Border animation */}
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#6272B6]/30 rounded-2xl transition-colors duration-300"></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= THANH TÌM KIẾM & BỘ LỌC ================= */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl border border-white/50 mb-12 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#6272B6]/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end relative z-10">
            
            {/* Ô tìm kiếm với icon đẹp */}
            <div className="md:col-span-4">
              <label className="block text-sm font-bold text-gray-600 mb-3 flex items-center gap-2">
                <SearchOutlined className="text-[#6272B6]" />
                Tìm kiếm sản phẩm
              </label>
              <Input
                placeholder="Nhập tên sản phẩm cần tìm..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                allowClear
                size="large"
                className="rounded-2xl border-2 border-gray-200 hover:border-[#6272B6] focus:border-[#6272B6] h-12 shadow-sm"
              />
            </div>

            {/* Bộ lọc danh mục với gradient */}
            <div className="md:col-span-3">
              <label className="block text-sm font-bold text-gray-600 mb-3 flex items-center gap-2">
                <AppstoreOutlined className="text-[#6272B6]" />
                Danh mục
              </label>
              <Select
                value={selectedCategory}
                onChange={(value) => setSelectedCategory(value)}
                size="large"
                className="w-full"
                classNames={{ popup: { root: "rounded-2xl" } }}
                style={{
                  borderRadius: '16px'
                }}
              >
                <Select.Option value="all">
                  <span className="flex items-center gap-2">
                    <AppstoreOutlined />
                    Tất cả danh mục
                  </span>
                </Select.Option>
                {availableCategories.map((cat) => (
                  <Select.Option key={cat} value={cat}>
                    <span className="flex items-center gap-2">
                      {getCategoryIcon(cat)} {cat}
                    </span>
                  </Select.Option>
                ))}
              </Select>
            </div>

            {/* Bộ lọc khoảng giá với gradient */}
            <div className="md:col-span-4">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-bold text-gray-600 flex items-center gap-2">
                  💰 Khoảng giá
                </label>
                <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6272B6] to-purple-600">
                  {priceRange[0].toLocaleString()}đ - {priceRange[1].toLocaleString()}đ
                </span>
              </div>
              <div className="px-3 py-2 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl">
                <Slider
                  range
                  min={0}
                  max={2000000}
                  step={50000}
                  value={priceRange}
                  onChange={(val) => setPriceRange(val as [number, number])}
                  tooltip={{ formatter: (val) => `${val?.toLocaleString()}đ` }}
                  styles={{
                    track: { backgroundColor: "#6272B6" },
                    handle: { borderColor: "#6272B6", backgroundColor: "#6272B6" },
                    rail: { backgroundColor: "#e5e7eb" }
                  }}
                />
              </div>
            </div>

            {/* Nút reset với gradient */}
            <div className="md:col-span-1 flex justify-end">
              <Button
                onClick={handleResetFilters}
                icon={<ReloadOutlined />}
                size="large"
                className="h-12 px-6 rounded-2xl border-2 border-gray-200 hover:border-[#6272B6] hover:text-[#6272B6] transition-all duration-300 font-medium shadow-sm hover:shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
                }}
              >
                Reset
              </Button>
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

        {/* Danh sách sản phẩm - Responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
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
                <ProductCard 
                  key={p._id} 
                  product={p} 
                  categoryIcon={getCategoryIcon(p.category)} 
                />
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

      <style jsx="true">{`
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