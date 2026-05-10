import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../api/http"; 
import { message, Skeleton, Tag, Badge } from "antd";
import { ShoppingCartOutlined, EyeOutlined } from "@ant-design/icons";

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

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-[1200px] mx-auto py-16 px-6">
        {/* Tiêu đề xịn xò */}
        <div className="flex flex-col items-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
            Bộ Sưu Tập <span className="text-[#6272B6]">Thú Cưng</span>
          </h1>
          <div className="h-1 w-20 bg-[#6272B6] rounded-full"></div>
          <p className="text-gray-500 mt-4">Khám phá những người bạn nhỏ đáng yêu nhất</p>
        </div>

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
            : data.map((p) => (
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
                      <div className="mb-2">
                         <Tag color="blue" className="rounded-full px-3 border-none bg-blue-50 text-blue-500 text-[10px] uppercase font-bold">
                            Thú cưng
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

        {/* Empty State */}
        {!loading && data.length === 0 && (
          <div className="text-center py-32 bg-white rounded-[3rem] shadow-inner">
            <img src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png" className="w-24 mx-auto mb-6 opacity-20" alt="empty" />
            <p className="text-gray-400 text-lg">Hiện chưa có người bạn nào sẵn sàng...</p>
          </div>
        )}
      </div>
    </div>
  );
}