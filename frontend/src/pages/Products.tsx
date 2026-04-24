
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Select, Skeleton, ConfigProvider, Breadcrumb, Tag, Button } from "antd";
import { 
  SearchOutlined, 
  ShoppingCartOutlined,
  HeartOutlined,
  FilterOutlined,
  HomeOutlined,
  SwapOutlined
} from "@ant-design/icons";
import { listProducts as listProductsApi } from "../api/productApi";
import type { Product } from "../data/products";

const { Option } = Select;

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");

  useEffect(() => {
    async function load() {
      try {
        const res = await listProductsApi();
        setProducts(Array.isArray(res?.data) ? res.data : []);
      } catch {
        setProducts([]);
      } finally {
        setTimeout(() => setLoading(false), 600);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    let data = [...products];
    if (search) data = data.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (sort === "price-asc") data.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") data.sort((a, b) => b.price - a.price);
    return data;
  }, [products, search, sort]);

  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 12,
          colorPrimary: "#5b6db1",
          fontFamily: "'Inter', -apple-system, sans-serif",
        },
      }}
    >
      <div className="t1-ultimate-shop">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

          .t1-ultimate-shop {
            background: #ffffff;
            min-height: 100vh;
            padding-bottom: 100px;
            color: #1d1d1f;
          }

          .t1-container {
            max-width: 1240px;
            margin: 0 auto;
            padding: 0 20px;
          }

          /* HERO SECTION */
          .t1-hero-section {
            padding: 60px 0 20px;
          }

          .t1-breadcrumb-luxury {
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: #86868b;
          }

          .t1-hero-title {
            font-size: 48px;
            font-weight: 800;
            letter-spacing: -0.03em;
            margin: 0 0 12px 0;
            color: #1a202c;
          }

          .t1-hero-subtitle {
            font-size: 18px;
            color: #636e72;
            font-weight: 400;
          }

          /* TOOLBAR XỊN XÒ (THEO ẢNH) */
          .t1-luxury-toolbar {
            margin: 40px 0 50px;
            display: flex;
            align-items: center;
            justify-content: space-between;
padding: 10px;
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            border: 1px solid #f2f2f7;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
            position: relative;
            z-index: 10;
          }

          .filter-pill {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 20px;
            background: #fff;
            border-radius: 18px;
            border: 1px solid #f2f2f7;
            box-shadow: 0 4px 10px rgba(0,0,0,0.03);
            cursor: pointer;
            transition: 0.3s;
          }

          .filter-pill:hover { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(0,0,0,0.06); }

          .filter-count {
            background: #5b6db1;
            color: white;
            padding: 2px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
          }

          .search-luxury-wrapper {
            flex: 1;
            margin: 0 25px;
          }

          .search-luxury-input {
            background: #f5f5f7 !important;
            border-radius: 16px !important;
            height: 48px !important;
            padding: 0 20px !important;
            transition: 0.3s !important;
          }

          .search-luxury-input:focus {
            background: #fff !important;
            box-shadow: 0 0 0 4px rgba(91, 109, 177, 0.1) !important;
          }

          .sort-luxury-select {
            min-width: 150px;
            border-left: 1px solid #e5e5ea;
            padding-left: 15px;
          }

          /* PRODUCT GRID */
          .t1-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
            gap: 35px;
          }

          .product-card-luxury {
            background: #fff;
            border-radius: 28px;
            padding: 15px;
            border: 1px solid #f2f2f7;
            transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          }

          .product-card-luxury:hover {
            transform: translateY(-12px);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
            border-color: #5b6db1;
          }

          .image-wrapper {
            background: #f9f9fb;
            border-radius: 22px;
            aspect-ratio: 1/1;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            position: relative;
          }

          .image-wrapper img {
            width: 80%;
            object-fit: contain;
            transition: 0.6s ease;
          }

          .product-card-luxury:hover .image-wrapper img { transform: scale(1.1); }

          .wishlist-btn {
            position: absolute;
            top: 15px;
            right: 15px;
            background: white;
            width: 38px;
height: 38px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
            color: #d1d1d6;
          }

          .card-body { padding: 18px 8px 5px; }

          .p-tag {
            font-size: 10px;
            font-weight: 800;
            color: #5b6db1;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
            display: block;
          }

          .p-name {
            font-size: 18px;
            font-weight: 700;
            color: #1d1d1f;
            margin-bottom: 15px;
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .p-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .p-price { font-size: 20px; font-weight: 800; color: #1d1d1f; }

          .btn-add-luxury {
            width: 44px;
            height: 44px;
            background: #1d1d1f;
            color: white;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: 0.3s;
          }

          .product-card-luxury:hover .btn-add-luxury { background: #5b6db1; }
        `}</style>

        <div className="t1-container">
          {/* Header Section */}
          <div className="t1-hero-section">
            <div className="t1-breadcrumb-luxury">
              <HomeOutlined style={{fontSize: 14}} />
              <span>Trang chủ</span>
              <span style={{opacity: 0.3}}>/</span>
              <span style={{color: '#1d1d1f', fontWeight: 600}}>Sản phẩm</span>
            </div>
            <h1 className="t1-hero-title">Tất cả sản phẩm</h1>
            <p className="t1-hero-subtitle">Chăm sóc thú cưng bằng sự tinh tế và tình yêu thương.</p>
          </div>

          {/* Toolbar Xịn Xò (Khớp ảnh mẫu) */}
          <div className="t1-luxury-toolbar">
            <div className="filter-pill">
              <FilterOutlined style={{color: '#5b6db1', fontSize: 16}} />
              <b style={{fontSize: 15}}>Bộ lọc</b>
              <div className="filter-count">{filtered.length}</div>
            </div>

            <div className="search-luxury-wrapper">
              <Input 
                className="search-luxury-input"
                placeholder="Tìm kiếm sản phẩm cho thú cưng..." 
                prefix={<SearchOutlined style={{color: '#86868b'}} />}
                variant="borderless"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="sort-luxury-select">
              <Select 
                defaultValue="default" 
                variant="borderless" 
style={{width: '100%', fontWeight: 600}}
                onChange={setSort}
                suffixIcon={<SwapOutlined rotate={90} style={{color: '#1d1d1f'}}/>}
              >
                <Option value="default">Mới nhất</Option>
                <Option value="price-asc">Giá: Thấp - Cao</Option>
                <Option value="price-desc">Giá: Cao - Thấp</Option>
              </Select>
            </div>
          </div>

          {/* Grid sản phẩm */}
          <div className="t1-grid">
            {loading ? (
              [...Array(8)].map((_, i) => (
                <div key={i}><Skeleton.Button active block style={{height: 320, borderRadius: 28}} /><Skeleton active title paragraph={{rows: 1}} /></div>
              ))
            ) : (
              filtered.map((p) => (
                <div key={p.id} className="product-card-luxury" onClick={() => navigate(`/products/${p.id}`)}>
                  <div className="image-wrapper">
                    <div className="wishlist-btn" onClick={(e) => e.stopPropagation()}>
                      <HeartOutlined />
                    </div>
                    <img src={p.image} alt={p.name} />
                  </div>
                  
                  <div className="card-body">
                    <span className="p-tag">T1 Pet Adopt Selection</span>
                    <div className="p-name">{p.name}</div>
                    
                    <div className="p-footer">
                      <div className="p-price">{p.price.toLocaleString()}đ</div>
                      <div className="btn-add-luxury" onClick={(e) => e.stopPropagation()}>
                        <ShoppingCartOutlined style={{fontSize: 18}} />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
} 