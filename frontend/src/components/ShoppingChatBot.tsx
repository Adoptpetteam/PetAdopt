import { useEffect, useMemo, useRef, useState } from "react"
import { Button, Input } from "antd"
import {
  getProductById,
  listProducts as listProductsLocal,
} from "../utils/productStore"
import {
  calculateCartTotal,
  clearCart,
  loadCartItems,
  type CartItem,
} from "../utils/cartStore"

type BotMessage = {
  id: string
  role: "bot" | "user"
  text: string
}

type BotOrder = {
  id: string
  createdAt: string
  status: "paid"
  paymentMethod: "momo" | "zalopay"
  customer: {
    name: string
    phone: string
    address: string
    reason: string
  }
  items: CartItem[]
  totals: {
    subtotal: number
    total: number
  }
}

type Flow =
  | { type: "menu" }
  | { type: "product_list" }
  | { type: "product_detail_id" }
  | { type: "product_detail_action"; productId: number }
  | { type: "product_add"; step: number; draft: Partial<{ name: string; image: string; price: number; quantity: number; description: string }> }
  | { type: "product_edit"; productId: number; step: number; original: any; draft: any }
  | { type: "product_delete_id" }
  | { type: "product_delete_confirm"; productId: number }
  | { type: "cart_add_id"; quantityStep?: false }
  | { type: "cart_add_qty"; productId: number }
  | { type: "cart_add_confirm"; productId: number; quantity: number }
  | { type: "cart_after_add_menu" }
  | { type: "cart_after_view_menu" }
  | { type: "checkout_payment_method" }
  | { type: "checkout_customer_name"; paymentMethod: "momo" | "zalopay" }
  | { type: "checkout_customer_phone"; paymentMethod: "momo" | "zalopay"; customer: BotOrder["customer"] }
  | { type: "checkout_customer_address"; paymentMethod: "momo" | "zalopay"; customer: BotOrder["customer"] }
  | { type: "checkout_customer_reason"; paymentMethod: "momo" | "zalopay"; customer: BotOrder["customer"] }
  | { type: "checkout_confirm"; paymentMethod: "momo" | "zalopay"; customer: BotOrder["customer"]; items: CartItem[]; subtotal: number }
  | { type: "orders_list_choice" }
  | { type: "orders_detail_id" }

function genId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function normalizeText(s: string) {
  return s.trim().toLowerCase()
}

function isCancel(s: string) {
  const t = normalizeText(s)
  return t === "hủy" || t === "huy" || t === "cancel" || t === "thoát" || t === "tắt"
}

function isBackToMenu(s: string) {
  const t = normalizeText(s)
  return t === "menu" || t === "trang chủ" || t === "về menu" || t === "quay lại" || t === "back"
}

function parseIntLoose(s: string): number | null {
  const cleaned = s.replace(/[^\d]/g, "")
  if (!cleaned) return null
  const n = Number(cleaned)
  if (Number.isNaN(n)) return null
  return n
}

function formatVND(n: number) {
  return `${n.toLocaleString("vi-VN")}đ`
}

const BOT_ORDERS_KEY = "bot_orders"

function loadOrders(): BotOrder[] {
  const raw = localStorage.getItem(BOT_ORDERS_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as BotOrder[]
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

function saveOrders(orders: BotOrder[]) {
  localStorage.setItem(BOT_ORDERS_KEY, JSON.stringify(orders))
}

export type ShoppingChatBotProps = {
  variant?: "page" | "widget"
  onClose?: () => void
}

export default function ShoppingChatBot({
  variant = "page",
  onClose,
}: ShoppingChatBotProps) {
  const [messages, setMessages] = useState<BotMessage[]>(() => [
    {
      id: genId(),
      role: "bot",
      text:
        "Chào bạn! Mình là trợ lý mua hàng.\n\n" +
        "1) Xem danh sách sản phẩm\n" +
        "2) Xem chi tiết sản phẩm\n" +
        "3) Cách mua hàng\n" +
        "4) Phương thức thanh toán\n" +
        "5) Xem đơn đã thanh toán\n" +
        "0) Trợ giúp\n\n" +
        "Gõ `menu` để quay lại.",
    },
  ])

  const [flow, setFlow] = useState<Flow>({ type: "menu" })
  const [input, setInput] = useState("")
  const endRef = useRef<HTMLDivElement | null>(null)
  const flowRef = useRef(flow)

  useEffect(() => {
    flowRef.current = flow
  }, [flow])

  function append(role: "bot" | "user", text: string) {
    setMessages((prev) => [...prev, { id: genId(), role, text }])
  }

  function showMenu() {
    append(
      "bot",
      "Bạn muốn làm gì?\n\n" +
        "1) Xem danh sách sản phẩm\n" +
        "2) Xem chi tiết sản phẩm\n" +
        "3) Cách mua hàng\n" +
        "4) Phương thức thanh toán\n" +
        "5) Xem đơn đã thanh toán\n" +
        "0) Trợ giúp"
    )
    setFlow({ type: "menu" })
  }

  function startCheckout() {
    const items = loadCartItems()
    if (items.length === 0) {
      append("bot", "Giỏ hàng trống. Vào /products để thêm sản phẩm.")
      setFlow({ type: "menu" })
      return
    }
    append("bot", "Chọn phương thức thanh toán:\n1) MoMo\n2) ZaloPay")
    setFlow({ type: "checkout_payment_method" })
  }

  function showProducts() {
    const items = listProductsLocal()
    if (items.length === 0) {
      append("bot", "Chưa có sản phẩm nào.")
      showMenu()
      return
    }
    append(
      "bot",
      "Danh sách sản phẩm:\n" +
        items.slice(0, 20).map((p) => `- ${p.name} | ${formatVND(p.price)} | Tồn: ${p.quantity}`).join("\n") +
        "\n\nGõ `menu` để quay lại."
    )
    setFlow({ type: "product_list" })
  }

  function handleMenuInput(text: string) {
    const t = normalizeText(text)
    if (t === "0" || t.includes("trợ giúp")) {
      append("bot", "Gõ số 1-5 để chọn chức năng. Gõ `menu` để quay lại.")
      showMenu()
      return
    }
    if (t === "1" || t.includes("danh sách")) {
      showProducts()
      return
    }
    if (t === "2" || t.includes("chi tiết")) {
      append("bot", "Nhập mã ID sản phẩm (xem từ danh sách).")
      setFlow({ type: "product_detail_id" })
      return
    }
    if (t === "3" || t.includes("cách mua")) {
      append("bot", "1) Vào /products\n2) Chọn sản phẩm\n3) Thêm vào giỏ\n4) Vào /checkout để thanh toán")
      showMenu()
      return
    }
    if (t === "4" || t.includes("thanh toán")) {
      append("bot", "Phương thức: MoMo, ZaloPay. Xem thêm tại /checkout")
      showMenu()
      return
    }
    if (t === "5" || t.includes("đơn")) {
      append("bot", "Xem đơn tại /orders")
      showMenu()
      return
    }
    append("bot", "Mình chưa hiểu. Gõ `menu` hoặc chọn số 1-5.")
  }

  function handleUser(textRaw: string) {
    const text = textRaw.trim()
    if (!text) return
    if (isCancel(text)) {
      append("bot", "Đã hủy. Quay lại menu.")
      showMenu()
      return
    }
    if (isBackToMenu(text)) {
      append("bot", "Quay lại menu.")
      showMenu()
      return
    }

    append("user", text)

    if (flow.type === "menu") {
      handleMenuInput(text)
      return
    }
    if (flow.type === "product_list") {
      handleMenuInput(text)
      return
    }
    if (flow.type === "product_detail_id") {
      const id = parseIntLoose(text)
      if (!id) {
        append("bot", "Mã không hợp lệ.")
        return
      }
      const product = getProductById(id)
      if (!product) {
        append("bot", `Không tìm thấy sản phẩm ID=${id}`)
        return
      }
      append("bot", `Sản phẩm: ${product.name}\nGiá: ${formatVND(product.price)}\nTồn kho: ${product.quantity}`)
      setFlow({ type: "menu" })
      return
    }
    if (flow.type === "cart_after_view_menu") {
      const t = normalizeText(text)
      if (t === "1") startCheckout()
      else showMenu()
      return
    }
    if (flow.type === "checkout_payment_method") {
      const t = normalizeText(text)
      const method: "momo" | "zalopay" | null = t === "1" || t === "momo" ? "momo" : t === "2" || t === "zalopay" ? "zalopay" : null
      if (!method) {
        append("bot", "Trả lời `1` (MoMo) hoặc `2` (ZaloPay).")
        return
      }
      append("bot", "Nhập họ tên.")
      setFlow({ type: "checkout_customer_name", paymentMethod: method })
      return
    }
    if (flow.type === "checkout_customer_name") {
      setFlow({
        type: "checkout_customer_phone",
        paymentMethod: flow.paymentMethod,
        customer: { name: text, phone: "", address: "", reason: "" },
      })
      append("bot", "Nhập số điện thoại.")
      return
    }
    if (flow.type === "checkout_customer_phone") {
      setFlow({
        type: "checkout_customer_address",
        paymentMethod: flow.paymentMethod,
        customer: { ...flow.customer, phone: text },
      })
      append("bot", "Nhập địa chỉ giao hàng.")
      return
    }
    if (flow.type === "checkout_customer_address") {
      setFlow({
        type: "checkout_customer_reason",
        paymentMethod: flow.paymentMethod,
        customer: { ...flow.customer, address: text },
      })
      append("bot", "Nhập ghi chú (hoặc bỏ trống).")
      return
    }
    if (flow.type === "checkout_customer_reason") {
      const items = loadCartItems()
      const subtotal = calculateCartTotal(items)
      const customer = { ...flow.customer, reason: text }
      append(
        "bot",
        "Xác nhận đơn:\n" +
          `- Khách: ${customer.name}\n- SĐT: ${customer.phone}\n- Địa chỉ: ${customer.address}\n- Tổng: ${formatVND(subtotal)}\n\nTrả lời \`xác nhận\` hoặc \`hủy\``
      )
      setFlow({ type: "checkout_confirm", paymentMethod: flow.paymentMethod, customer, items, subtotal })
      return
    }
    if (flow.type === "checkout_confirm") {
      const t = normalizeText(text)
      if (t.includes("xác nhận") || t === "ok" || t === "yes") {
        const id = `${Date.now()}`
        const order: BotOrder = {
          id,
          createdAt: new Date().toISOString(),
          status: "paid",
          paymentMethod: flow.paymentMethod,
          customer: flow.customer,
          items: flow.items,
          totals: { subtotal: flow.subtotal, total: flow.subtotal },
        }
        const orders = loadOrders()
        orders.push(order)
        saveOrders(orders)
        clearCart()
        append("bot", `Thanh toán thành công! Mã đơn: ${id}`)
        showMenu()
        return
      }
      if (t.includes("hủy")) {
        append("bot", "Đã hủy.")
        showMenu()
        return
      }
      append("bot", "Trả lời `xác nhận` hoặc `hủy`.")
      return
    }
    handleMenuInput(text)
  }

  function sendValue(valueRaw: string) {
    const value = valueRaw.trim()
    if (!value) return
    setInput("")
    handleUser(value)
    setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
    }, 0)
  }

  function onSend() {
    sendValue(input)
  }

  const quickActions = useMemo(() => {
    if (flow.type === "menu") {
      return [
        { label: "1. Sản phẩm", value: "1" },
        { label: "2. Chi tiết", value: "2" },
        { label: "3. Cách mua", value: "3" },
        { label: "4. Thanh toán", value: "4" },
      ]
    }
    return []
  }, [flow.type])

  const isWidget = variant === "widget"

  return (
    <div className={isWidget ? "flex flex-col h-full min-h-0" : "max-w-[980px] mx-auto py-12 px-6"}>
      {!isWidget && (
        <h1 className="text-3xl font-bold text-[#6272B6] mb-6 text-center">
          Trợ lý mua hàng
        </h1>
      )}

      {isWidget && (
        <div className="flex items-center justify-between gap-3 px-4 py-3.5 shrink-0 rounded-t-2xl bg-gradient-to-r from-[#6272B6] to-[#5567a8] text-white shadow-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-lg shrink-0">💬</span>
            <div className="min-w-0">
              <p className="font-semibold text-[15px] leading-tight truncate">Trợ lý</p>
              <p className="text-xs text-white/85 truncate">Hỏi đáp nhanh</p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-full p-2 text-white/90 hover:bg-white/15 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      <div className={isWidget ? "flex flex-col flex-1 min-h-0 bg-white border-x border-b border-[#E4E8F5] rounded-b-2xl shadow-inner" : "bg-white rounded-2xl shadow p-4"}>
        <div className={isWidget ? "flex-1 overflow-y-auto px-4 py-3 min-h-0" : "h-[60vh] overflow-y-auto pr-2"}>
          {messages.map((m) => (
            <div key={m.id} className={`mb-3 ${m.role === "user" ? "text-right" : "text-left"}`}>
              <div
                className={
                  m.role === "user"
                    ? `inline-block px-4 py-2.5 rounded-2xl text-left max-w-[92%] whitespace-pre-wrap shadow-sm ${isWidget ? "bg-[#6272B6] text-white rounded-br-md" : "bg-[#6272B6] text-white max-w-[85%]"}`
                    : `inline-block px-4 py-2.5 rounded-2xl text-left max-w-[92%] whitespace-pre-wrap ${isWidget ? "bg-[#F4F6FF] text-gray-900 border border-[#E8ECFF] rounded-bl-md" : "bg-gray-100 text-gray-900 max-w-[85%]"}`
                }
              >
                {m.text}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {quickActions.length > 0 && (
          <div className={`flex flex-wrap gap-2 ${isWidget ? "px-4 pb-2" : "mt-4"}`}>
            {quickActions.map((a) => (
              <Button key={a.value + a.label} size="small" onClick={() => sendValue(a.value)}>
                {a.label}
              </Button>
            ))}
          </div>
        )}

        <div className={`flex gap-2 ${isWidget ? "px-4 pb-3 pt-1 border-t border-[#F0F2FA] bg-[#FAFBFF]" : "mt-4"}`}>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập câu hỏi..."
            onPressEnter={onSend}
          />
          <Button type="primary" onClick={onSend}>Gửi</Button>
        </div>
      </div>
    </div>
  )
}
