import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../api/http"; 
import { message, Skeleton, Tag, Badge, Input, Select, Slider, Card, Button } from "antd";
import { ShoppingCartOutlined, EyeOutlined, SearchOutlined, FilterOutlined, ReloadOutlined } from "@ant-design/icons";

interface Product {
  _id: string;
  name: string;
  image: string;
  price: number;
  category?: string;
}

export default function Products() {
  const navigate = useNavigate();
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // --- States phục vụ Tìm kiếm & Lọc ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]); // Mặc định từ 0đ -> 10trđ

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/products", {
        params: { limit: 100, page: 1 },
      });
      if (res.data && res.data.success) {
        setData(res.data.data);
      } else {
        const result = res.data.data || res.data;
        setData(Array.isArray(result) ? result : []);
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

  // --- Lấy danh sách các danh mục duy nhất từ dữ liệu thực tế để hiển thị trong bộ lọc ---
  const categories = useMemo(() => {
    const list = data.map((p) => p.category).filter(Boolean) as string[];
    return ["all", ...Array.from(new Set(list))];
  }, [data]);

  // --- Logic lọc dữ liệu ---
  const filteredProducts = useMemo(() => {
    return data.filter((product) => {
      // 1. Lọc theo từ khóa tìm kiếm (Không phân biệt hoa thường)
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
    setPriceRange([0, 10000000]);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-[1200px] mx-auto py-16 px-6">
        
        {/* Tiêu đề xịn xò */}
        <div className="flex flex-col items-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
            Bộ Sưu Tập <span className="text-[#6272B6]">Thú Cưng</span>
          </h1>
          <div className="h-1 w-20 bg-[#6272B6] rounded-full"></div>
          <p className="text-gray-500 mt-4">Khám phá những người bạn nhỏ đáng yêu nhất</p>
        </div>

        {/* ================= THANH TÌM KIẾM & BỘ LỌC ================= */}
        <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            
            {/* Ô tìm kiếm tên sản phẩm */}
            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Tìm kiếm thú cưng
              </label>
              <Input
                placeholder="Nhập tên bé thú cưng cần tìm..."
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
                Phân loại danh mục
              </label>
              <Select
                value={selectedCategory}
                onChange={(value) => setSelectedCategory(value)}
                size="large"
                className="w-full rounded-xl"
                popupClassName="rounded-xl"
                options={categories.map((cat) => ({
                  value: cat,
                  label: cat === "all" ? "Tất cả danh mục" : cat,
                }))}
              />
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
                  max={10000000}
                  step={100000}
                  value={priceRange}
                  onChange={(val) => setPriceRange(val as [number, number])}
                  tooltip={{ formatter: (val) => `${val?.toLocaleString()}đ` }}
                  trackStyle={{ backgroundColor: "#6272B6" }}
                  handleStyle={{ borderColor: "#6272B6" }}
                />
              </div>
            </div>

            {/* Nút reset lọc nhanh */}
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
        {/* ========================================================= */}

        {/* Danh sách sản phẩm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading
            ? // Hiển thị Skeleton khi đang load
              Array(8).fill(0).map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-3xl">
                  <Skeleton.Image active className="w-full !h-48 !w-full rounded-2xl mb-4" />
                  <Skeleton active paragraph={{ rows: 2 }} />
                </div>
              ))
            : filteredProducts.map((p) => (
                <Badge.Ribbon 
                    key={p._id} 
                    text="New" 
                    color="#6272B6" 
                    style={{ display: p.price > 1000000 ? 'block' : 'none' }}
                >
                  <div
                    className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-transparent hover:border-blue-100 flex flex-col h-full relative"
                  >
                    {/* Image Container */}
                    <div className="relative overflow-hidden aspect-square">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://placehold.co/400x400?text=Pet+Image";
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
                      <div className="mb-2 flex items-center justify-between">
                         <Tag color="blue" className="rounded-full px-3 border-none bg-blue-50 text-blue-500 text-[10px] uppercase font-bold">
                           {p.category || "Thú cưng"}
                         </Tag>
                      </div>
                      
                      <h2 
                        className="font-bold text-gray-800 text-lg mb-2 line-clamp-1 group-hover:text-[#6272B6] transition-colors cursor-pointer"
                        onClick={() => navigate(`/products/${p._id}`)}
                      >
                        {p.name}
                      </h2>
                      
                      <div className="mt-auto flex justify-between items-center">
                        <p className="text-[#6272B6] font-black text-xl">
                          {(p.price || 0).toLocaleString()}đ
                        </p>
                        <button 
                          onClick={() => navigate(`/products/${p._id}`)}
                          className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-[#6272B6] hover:text-white transition-all shadow-sm"
                        >
                          <ShoppingCartOutlined />
                        </button>
                      </div>
                    </div>
                  </div>
                </Badge.Ribbon>
              ))}
        </div>

        {/* Empty State khi không tìm thấy kết quả lọc */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-24 bg-white rounded-[3rem] shadow-sm border border-dashed border-gray-200">
            <img src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png" className="w-24 mx-auto mb-6 opacity-25" alt="empty" />
            <h3 className="text-gray-700 font-bold text-lg mb-1">Không tìm thấy thú cưng phù hợp</h3>
            <p className="text-gray-400 mb-6">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn xem sao nhé!</p>
            <Button 
              onClick={handleResetFilters} 
              type="primary" 
              className="bg-[#6272B6] hover:bg-[#505f9c] border-none rounded-xl px-6 h-10"
            >
              Reset bộ lọc
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}