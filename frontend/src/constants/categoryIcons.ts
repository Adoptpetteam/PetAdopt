/**
 * 🎨 Category Icons Constants
 * Mapping các danh mục sản phẩm với emoji tương ứng
 */

export const CATEGORY_ICONS: Record<string, string> = {
  "Thức ăn & Dinh dưỡng": "🍖",
  "Chăm sóc sức khỏe & Y tế": "🏥", 
  "Vệ sinh & Làm sạch": "🧽",
  "Chăm sóc sắc đẹp": "✨",
  "Đồ dùng sinh hoạt & Chỗ ở": "🏠",
  "Phụ kiện đi dạo & Vận chuyển": "🚶",
  "Đồ chơi & Huấn luyện": "🎾"
};

/**
 * Lấy icon cho category, fallback về 📦 nếu không tìm thấy
 */
export const getCategoryIcon = (categoryName?: string): string => {
  if (!categoryName) return "📦";
  return CATEGORY_ICONS[categoryName] || "📦";
};

/**
 * Danh sách tất cả categories có sẵn
 */
export const AVAILABLE_CATEGORIES = Object.keys(CATEGORY_ICONS);