import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { message, Modal, Button, Empty, InputNumber } from "antd";
import {
  ExclamationCircleOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  CreditCardOutlined,
  MinusOutlined,
  PlusOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { apiClient } from "../api/http";

interface CartItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  cartQuantity: number;
  quantity: number; // tồn kho
}

export default function Cart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [syncing, setSyncing] = useState(false);
  const navigate = useNavigate();

  const fetchCart = () => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
  };

  // Sync tồn kho thực tế từ DB khi mở giỏ
  const syncStock = async (currentCart: CartItem[]) => {
    if (currentCart.length === 0) return;
    setSyncing(true);
    try {
      const results = await Promise.all(
        currentCart.map(item => apiClient.get(`/products/${item._id}`).catch(() => null))
      );
      let hasChange = false;
      const updated = currentCart.map((item, i) => {
        const latest = results[i]?.data?.data;
        if (!latest) return item; // API lỗi → giữ nguyên
        if (latest.quantity !== item.quantity) hasChange = true;
        // Nếu cartQuantity vượt tồn kho mới → cap lại
        const newCartQty = Math.min(item.cartQuantity, latest.quantity);
        if (newCartQty !== item.cartQuantity) hasChange = true;
        return { ...item, quantity: latest.quantity, cartQuantity: newCartQty };
      });
      // Xóa sản phẩm hết hàng khỏi giỏ và thông báo
      const outOfStock = updated.filter(i => i.quantity === 0);
      const validCart = updated.filter(i => i.quantity > 0);
      if (outOfStock.length > 0) {
        message.warning(`${outOfStock.map(i => i.name).join(", ")} đã hết hàng và bị xóa khỏi giỏ`);
        hasChange = true;
      }
      if (hasChange) {
        localStorage.setItem("cart", JSON.stringify(validCart));
        setCart(validCart);
        window.dispatchEvent(new Event("cart-change"));
        if (outOfStock.length === 0) message.info("Đã cập nhật tồn kho mới nhất");
      }
    } catch {
      // silent fail
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
    syncStock(savedCart);
  }, []);

  // Lưu cart và dispatch event để Header cập nhật badge
  const persistCart = (newCart: CartItem[]) => {
    localStorage.setItem("cart", JSON.stringify(newCart));
    setCart(newCart);
    window.dispatchEvent(new Event("cart-change"));
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      icon: <ExclamationCircleOutlined />,
      content: "Bạn có chắc muốn bỏ sản phẩm này khỏi giỏ hàng?",
      okText: "Xóa ngay",
      okType: "danger",
      cancelText: "Hủy",
      onOk() {
        const newCart = cart.filter((item) => item._id !== id);
        persistCart(newCart);
        setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
        message.success("Đã xóa khỏi giỏ hàng");
      },
    });
  };

  const handleQuantityChange = (id: string, value: number | null) => {
    if (!value || value < 1) return;
    const item = cart.find((i) => i._id === id);
    if (item && item.quantity > 0 && value > item.quantity) {
      message.warning(`Chỉ còn ${item.quantity} sản phẩm trong kho`);
      value = item.quantity;
    }
    const newCart = cart.map((item) =>
      item._id === id ? { ...item, cartQuantity: value } : item
    );
    persistCart(newCart);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === cart.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cart.map((item) => item._id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    Modal.confirm({
      title: "Xóa các sản phẩm đã chọn",
      icon: <ExclamationCircleOutlined />,
      content: `Xóa ${selectedIds.length} sản phẩm đã chọn?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk() {
        const newCart = cart.filter((item) => !selectedIds.includes(item._id));
        persistCart(newCart);
        setSelectedIds([]);
        message.success("Đã xóa các sản phẩm đã chọn");
      },
    });
  };

  const selectedItems = cart.filter((item) => selectedIds.includes(item._id));
  const total = selectedItems.reduce(
    (sum, item) => sum + item.price * item.cartQuantity,
    0
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-[960px] mx-auto py-16 px-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <ShoppingCartOutlined className="text-4xl text-[#6272B6]" />
          <h1 className="text-3xl font-bold text-[#6272B6]">Giỏ hàng</h1>
          {cart.length > 0 && (
            <span className="bg-[#6272B6] text-white text-sm font-bold px-3 py-1 rounded-full">
              {cart.length}
            </span>
          )}
          {cart.length > 0 && (
            <Button
              icon={<SyncOutlined spin={syncing} />}
              size="small"
              onClick={() => syncStock(cart)}
              loading={syncing}
              className="ml-auto rounded-full text-gray-500"
            >
              Cập nhật tồn kho
            </Button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="bg-white p-16 rounded-3xl shadow-sm text-center">
            <Empty
              description={
                <span className="text-gray-500 text-lg">
                  Giỏ hàng của bạn đang trống
                </span>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
            <Button
              type="primary"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/products")}
              className="mt-6 h-11 rounded-full bg-[#6272B6] px-8"
            >
              Quay lại mua sắm
            </Button>
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div className="mb-4 flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="w-5 h-5 cursor-pointer accent-[#6272B6]"
                  checked={
                    selectedIds.length === cart.length && cart.length > 0
                  }
                  onChange={handleSelectAll}
                />
                <span className="font-semibold text-gray-700">
                  Chọn tất cả ({cart.length})
                </span>
                {selectedIds.length > 0 && (
                  <span className="text-green-600 flex items-center gap-1 text-sm">
                    <CheckCircleOutlined /> Đã chọn {selectedIds.length}
                  </span>
                )}
              </div>
              {selectedIds.length > 0 && (
                <Button
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={handleDeleteSelected}
                  className="rounded-full"
                >
                  Xóa đã chọn
                </Button>
              )}
            </div>

            {/* Cart items */}
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item._id}
                  className={`flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border transition-all ${
                    selectedIds.includes(item._id)
                      ? "border-[#6272B6] shadow-blue-100"
                      : "border-gray-50"
                  }`}
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    className="w-5 h-5 cursor-pointer accent-[#6272B6] flex-shrink-0"
                    checked={selectedIds.includes(item._id)}
                    onChange={() => {
                      if (selectedIds.includes(item._id)) {
                        setSelectedIds(
                          selectedIds.filter((id) => id !== item._id)
                        );
                      } else {
                        setSelectedIds([...selectedIds, item._id]);
                      }
                    }}
                  />

                  {/* Image */}
                  <img
                    src={item.image}
                    className="w-20 h-20 rounded-xl object-cover shadow-sm flex-shrink-0"
                    alt={item.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/80x80?text=No+Image";
                    }}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-bold text-gray-800 truncate cursor-pointer hover:text-[#6272B6]"
                      onClick={() => navigate(`/products/${item._id}`)}
                    >
                      {item.name}
                    </p>
                    <p className="text-[#6272B6] font-bold text-lg">
                      {item.price.toLocaleString()}đ
                    </p>
                    <p className="text-gray-400 text-xs">
                      Tổng:{" "}
                      <span className="text-gray-600 font-semibold">
                        {(item.price * item.cartQuantity).toLocaleString()}đ
                      </span>
                    </p>
                  </div>

                  {/* Quantity control */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() =>
                        handleQuantityChange(
                          item._id,
                          Math.max(1, item.cartQuantity - 1)
                        )
                      }
                      className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition"
                    >
                      <MinusOutlined className="text-xs" />
                    </button>
                    <InputNumber
                      min={1}
                      max={item.quantity || 999}
                      value={item.cartQuantity}
                      onChange={(v) => handleQuantityChange(item._id, v)}
                      className="w-14 text-center rounded-lg"
                      controls={false}
                    />
                    <button
                      onClick={() =>
                        handleQuantityChange(item._id, item.cartQuantity + 1)
                      }
                      className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition"
                    >
                      <PlusOutlined className="text-xs" />
                    </button>
                  </div>

                  {/* Delete */}
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(item._id)}
                    className="hover:bg-red-50 rounded-full h-9 w-9 flex items-center justify-center flex-shrink-0"
                  />
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-8 bg-white p-8 rounded-3xl shadow-xl border-t-4 border-t-[#6272B6]">
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-gray-500">
                  <span>Số sản phẩm đã chọn:</span>
                  <span className="font-semibold text-gray-700">
                    {selectedItems.reduce((s, i) => s + i.cartQuantity, 0)} sản phẩm
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-lg">Tổng thanh toán:</span>
                  <p className="text-3xl font-black text-[#6272B6]">
                    {total.toLocaleString()}đ
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-4">
                <Button
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  onClick={() => navigate("/products")}
                  className="rounded-full h-12 px-8"
                >
                  Mua thêm
                </Button>
                <Button
                  type="primary"
                  size="large"
                  icon={<CreditCardOutlined />}
                  disabled={selectedIds.length === 0}
                  onClick={() =>
                    navigate("/checkout", {
                      state: { selectedItems: selectedItems },
                    })
                  }
                  className="rounded-full h-12 px-10 bg-[#6272B6] shadow-lg shadow-blue-100"
                >
                  Thanh toán ({selectedIds.length})
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
