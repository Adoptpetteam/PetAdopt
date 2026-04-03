import { useEffect, useMemo, useRef, useState } from "react"
import { Button, Input } from "antd"
import type { Product } from "../data/products"
import { listProducts as listProductsApi } from "../api/productApi"
import {
  addProduct,
  deleteProduct,
  getProductById,
  listProducts,
  saveProducts,
  updateProduct,
} from "../utils/productStore"
import { adjustProductStockDelta } from "../utils/inventoryAdjust"
import {
  addToCart,
  clearCart,
  calculateCartTotal,
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
  | { type: "product_add"; step: number; draft: Partial<Omit<Product, "id">> }
  | { type: "product_edit"; productId: number; step: number; original: Product; draft: Partial<Omit<Product, "id">> }
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
  /** `page` = trang đầy đủ; `widget` = khung nổi trên trang chủ */
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
        "Chào bạn! Mình là trợ lý mua hàng (demo). Bạn muốn làm gì?\n\n" +
        "1) Xem danh sách sản phẩm\n" +
        "2) Xem chi tiết sản phẩm (nhập productId)\n" +
        "3) Cách mua hàng (thêm vào giỏ + thanh toán)\n" +
        "4) Phương thức thanh toán\n" +
        "5) Xem đơn đã thanh toán\n" +
        "0) Trợ giúp\n\n" +
        "Bạn có thể gõ số (ví dụ: `3`) hoặc gõ đúng tên chức năng. Gõ `menu` để quay lại.",
    },
  ])

  const [flow, setFlow] = useState<Flow>({ type: "menu" })
  const [input, setInput] = useState("")
  const endRef = useRef<HTMLDivElement | null>(null)
  const syncingRef = useRef(false)
  const lastSyncAtRef = useRef(0)
  const flowRef = useRef(flow)

  // Keep an always-fresh ref for sync decisions (without re-creating intervals).
  useEffect(() => {
    flowRef.current = flow
  }, [flow])

  // "Realtime" sync for chatbot product cache:
  // - Bot uses `productStore` (localStorage) synchronously.
  // - Here we periodically refresh that cache from backend so stock/quantity stays current.
  useEffect(() => {
    let mounted = true

    const intervalMs = variant === "widget" ? 8000 : 15000

    async function syncOnce() {
      if (!mounted) return
      if (syncingRef.current) return

      const now = Date.now()
      // Hard throttle to avoid accidental bursts.
      if (now - lastSyncAtRef.current < 2500) return
      lastSyncAtRef.current = now

      // Pause sync while user is in product CRUD flows, to avoid overwriting local demo edits.
      const ft = flowRef.current.type
      if (
        ft === "product_add" ||
        ft === "product_edit" ||
        ft === "product_delete_id" ||
        ft === "product_delete_confirm"
      ) {
        return
      }

      syncingRef.current = true
      try {
        const res = await listProductsApi()
        if (res?.success && Array.isArray(res.data)) {
          saveProducts(res.data)
        }
      } catch {
        // Ignore network errors; bot can still work with cached data.
      } finally {
        syncingRef.current = false
      }
    }

    void syncOnce()
    const id = window.setInterval(() => {
      void syncOnce()
    }, intervalMs)

    return () => {
      mounted = false
      window.clearInterval(id)
    }
  }, [variant])

  function append(role: "bot" | "user", text: string) {
    setMessages((prev) => [...prev, { id: genId(), role, text }])
  }

  function showMenu() {
    append(
      "bot",
      "Bạn muốn làm gì tiếp?\n\n" +
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
      append("bot", "Giỏ hàng hiện đang trống. Bạn muốn: 1) Thêm vào giỏ hàng 2) Quay lại menu")
      setFlow({ type: "menu" })
      return
    }

    append("bot", "Chọn phương thức thanh toán:\n1) momo\n2) zalopay\n\nTrả lời: `1` hoặc `2`.")
    setFlow({ type: "checkout_payment_method" })
  }

  function showProducts() {
    const items = listProducts()
    if (items.length === 0) {
      append("bot", "Chưa có sản phẩm nào.")
      showMenu()
      return
    }
    append(
      "bot",
      "Danh sách sản phẩm hiện có:\n" +
        items
          .slice(0, 30)
          .map((p) => `- ID ${p.id}: ${p.name} | ${formatVND(p.price)} | quantity: ${p.quantity}`)
          .join("\n") +
        (items.length > 30 ? `\n... và ${items.length - 30} sản phẩm khác.` : "") +
        "\n\nBạn muốn làm gì tiếp? (gõ `menu` hoặc chọn 2/3/4/5)"
    )
    setFlow({ type: "product_list" })
  }

  function showCart() {
    const items = loadCartItems()
    if (items.length === 0) {
      append("bot", "Giỏ hàng trống.")
      setFlow({ type: "menu" })
      return
    }

    const subtotal = calculateCartTotal(items)
    append(
      "bot",
      "Giỏ hàng của bạn:\n" +
        items.map((i) => `- ${i.name} (ID ${i.productId}) | ${formatVND(i.price)} x ${i.quantity} = ${formatVND(i.price * i.quantity)}`).join("\n") +
        `\n\nTổng tạm tính: ${formatVND(subtotal)}\n\nBạn muốn:\n1) Thanh toán\n2) Tiếp tục xem sản phẩm\n3) Quay lại menu`
    )
    setFlow({ type: "cart_after_view_menu" })
  }

  function showProductDetail(product: Product) {
    append(
      "bot",
      "Chi tiết sản phẩm:\n" +
        `- productId: ${product.id}\n` +
        `- name: ${product.name}\n` +
        `- image: ${product.image}\n` +
        `- price: ${formatVND(product.price)}\n` +
        `- quantity: ${product.quantity}\n` +
        `- description: ${product.description}\n\n` +
        `Bạn có thể thêm vào giỏ tại trang: /products/${product.id}\nGõ \`menu\` để xem tiếp.`
    )
  }

  function handleMenuInput(text: string) {
    const t = normalizeText(text)
    if (t === "0" || t.includes("trợ giúp") || t.includes("help")) {
      append(
        "bot",
        "Trợ giúp nhanh:\n- Gõ `1..9` để chọn chức năng.\n- Trong các form, bạn cần nhập đủ fields theo câu hỏi.\n- Soạn xong, thường bot sẽ hỏi `xác nhận`/`hủy`.\n- Gõ `menu` để quay lại bất cứ lúc nào."
      )
      showMenu()
      return
    }

    if (t === "1" || t.includes("danh sách") || t.includes("liệt kê") || t.includes("xem sản phẩm")) {
      showProducts()
      return
    }

    if (t === "2" || t.includes("chi tiết")) {
      append("bot", "Nhập `productId` để xem chi tiết (ví dụ: 1).")
      setFlow({ type: "product_detail_id" })
      return
    }

    if (t === "3" || t.includes("cách mua") || t.includes("thêm vào giỏ") || t.includes("add to cart")) {
      append(
        "bot",
        "Cách mua hàng:\n" +
          "1) Vào `Sản phẩm` và mở chi tiết sản phẩm.\n" +
          "2) Bấm `Thêm vào giỏ hàng`.\n" +
          "3) Vào `Giỏ hàng` (/cart) rồi bấm `Thanh toán`.\n" +
          "4) Điền `customer.name/phone/address/reason` trên `/checkout` và bấm `Xác nhận thanh toán`.\n\n" +
          "Chatbot chỉ trả lời thắc mắc; thao tác giỏ/thanh toán làm trên giao diện."
      )
      showMenu()
      return
    }

    if (t === "4" || t.includes("phương thức") || t.includes("momo") || t.includes("zalopay") || t.includes("xem giỏ") || t.includes("cart")) {
      append(
        "bot",
        "Phương thức thanh toán (demo):\n- `momo`\n- `zalopay`\n\n" +
          "Nếu bạn muốn xem giỏ hàng, vào `/cart`."
      )
      showMenu()
      return
    }

    if (t === "5" || t.includes("thanh toán") || t.includes("checkout")) {
      append(
        "bot",
        "Bạn thanh toán tại trang `/checkout`.\n" +
          "Bạn sẽ chọn `momo` hoặc `zalopay`, sau đó điền:\n" +
          "- customer.name\n- customer.phone\n- customer.address\n- customer.reason\n" +
          "Rồi bấm `Xác nhận thanh toán`."
      )
      showMenu()
      return
    }

    if (t === "6" || t.includes("xem đơn") || t.includes("orders") || t.includes("đơn đã")) {
      append(
        "bot",
        "Bạn có thể xem đơn đã thanh toán tại: `/orders`.\nGõ `menu` để xem tiếp."
      )
      showMenu()
      return
    }

    if (t === "7" || t.includes("xem giỏ") || t === "cart") {
      append("bot", "Bạn xem giỏ hàng tại: `/cart`.")
      showMenu()
      return
    }

    if (t === "8" || t.includes("thanh toán") || t.includes("checkout")) {
      append("bot", "Thanh toán tại: `/checkout`. Điền đủ `customer.name/phone/address/reason` rồi bấm `Xác nhận thanh toán`.")
      showMenu()
      return
    }

    if (t === "9" || t.includes("xem đơn") || t.includes("orders") || t.includes("đơn đã")) {
      append("bot", "Bạn xem đơn tại: `/orders`. Gõ `menu` để xem tiếp.")
      showMenu()
      return
    }

    // Client only: product CRUD belongs to ADMIN.
    if (
      t.includes("thêm sản phẩm") ||
      t.includes("add product") ||
      t.includes("sửa sản phẩm") ||
      t.includes("update product") ||
      t.includes("xóa sản phẩm") ||
      t.includes("delete product")
    ) {
      append(
        "bot",
        "Chức năng thêm/sửa/xóa sản phẩm thuộc ADMIN. Bạn hãy vào `admin/product` để thao tác."
      )
      showMenu()
      return
    }

    append("bot", "Mình chưa hiểu. Bạn hãy gõ `menu` hoặc chọn số từ 0..6.")
  }

  function handleUser(textRaw: string) {
    const text = textRaw.trim()
    if (!text) return
    if (isCancel(text)) {
      append("bot", "Đã hủy thao tác hiện tại. Quay lại menu.")
      showMenu()
      return
    }
    if (isBackToMenu(text)) {
      append("bot", "Ok, quay lại menu.")
      showMenu()
      return
    }

    append("user", text)

    if (flow.type === "menu") {
      handleMenuInput(text)
      return
    }

    // Product list flow: just forward to menu unless user types one of main choices.
    if (flow.type === "product_list") {
      handleMenuInput(text)
      return
    }

    if (flow.type === "product_detail_id") {
      const id = parseIntLoose(text)
      if (!id) {
        append("bot", "productId chưa hợp lệ. Nhập lại (ví dụ: 1).")
        return
      }
      const product = getProductById(id)
      if (!product) {
        append("bot", `Không tìm thấy sản phẩm với productId = ${id}. Nhập lại.`)
        return
      }
      showProductDetail(product)
      setFlow({ type: "menu" })
      return
    }

    if (flow.type === "product_detail_action") {
      const t = normalizeText(text)
      if (t === "1" || t.includes("thêm vào giỏ") || t.includes("add to cart") || t.includes("them vao gio")) {
        const product = getProductById(flow.productId)
        if (!product) {
          append("bot", "Sản phẩm không còn tồn tại. Quay lại menu.")
          showMenu()
          return
        }
        append(
          "bot",
          `Bạn chọn: ${product.name} (productId: ${product.id}).\nNhập số lượng cần thêm vào giỏ (quantity, ví dụ: 1).`
        )
        setFlow({ type: "cart_add_qty", productId: flow.productId })
        return
      }

      if (t === "2" || t.includes("quay lại") || t.includes("menu") || t.includes("trở lại")) {
        showMenu()
        return
      }

      append("bot", "Mình chưa hiểu. Trả lời `1` (thêm vào giỏ) hoặc `2` (quay lại menu).")
      return
    }

    if (flow.type === "cart_add_id") {
      const id = parseIntLoose(text)
      if (!id) {
        append("bot", "productId chưa hợp lệ. Nhập lại (ví dụ: 1).")
        return
      }
      const product = getProductById(id)
      if (!product) {
        append("bot", `Không tìm thấy sản phẩm với productId = ${id}. Nhập lại.`)
        return
      }
      append(
        "bot",
        `Sản phẩm bạn chọn: ${product.name}.\nBước 2/3: Nhập số lượng thêm vào giỏ (quantity, ví dụ: 1).`
      )
      setFlow({ type: "cart_add_qty", productId: id })
      return
    }

    if (flow.type === "cart_add_qty") {
      const qty = parseIntLoose(text)
      if (!qty || qty <= 0) {
        append("bot", "quantity chưa hợp lệ. Nhập lại (ví dụ: 1).")
        return
      }
      const product = getProductById(flow.productId)
      if (!product) {
        append("bot", "Sản phẩm không tồn tại nữa (có thể đã bị xóa). Quay lại menu.")
        showMenu()
        return
      }
      append(
        "bot",
        `Bước 3/3: Xác nhận thêm vào giỏ?\n- ${product.name}\n- productId: ${product.id}\n- quantity: ${qty}\n\nTrả lời: \`xác nhận\` hoặc \`hủy\` (hoặc menu).`
      )
      setFlow({ type: "cart_add_confirm", productId: flow.productId, quantity: qty })
      return
    }

    if (flow.type === "cart_add_confirm") {
      const t = normalizeText(text)
      if (t.includes("xác nhận") || t === "xacnhan" || t === "ok" || t === "yes" || t === "y") {
        const product = getProductById(flow.productId)
        if (!product) {
          append("bot", "Sản phẩm không tồn tại nữa. Quay lại menu.")
          showMenu()
          return
        }
        void (async () => {
          try {
            await adjustProductStockDelta(product.id, -flow.quantity)
          } catch {
            append("bot", "Không đủ tồn kho hoặc không thể cập nhật kho. Thử lại hoặc gõ `menu`.")
            showMenu()
            return
          }
          const added = addToCart(product, flow.quantity, { skipStockCheck: true })
          if (!added.ok) {
            await adjustProductStockDelta(product.id, flow.quantity).catch(() => {})
            append("bot", added.error)
            showMenu()
            return
          }
          append(
            "bot",
            "Đã thêm vào giỏ hàng (đã trừ kho). Bạn muốn:\n1) Xem giỏ hàng\n2) Tiếp tục thêm sản phẩm\n3) Thanh toán\n4) Quay lại menu"
          )
          setFlow({ type: "cart_after_add_menu" })
        })()
        return
      }

      if (t.includes("hủy") || t === "cancel" || t === "no" || t === "n") {
        append("bot", "Đã hủy thêm vào giỏ hàng.")
        showMenu()
        return
      }

      append("bot", "Mình chưa hiểu. Bạn trả lời `xác nhận` hoặc `hủy`.")
      return
    }

    if (flow.type === "cart_after_add_menu") {
      const t = normalizeText(text)
      if (t === "1" || t.includes("xem giỏ") || t.includes("gio hang") || t.includes("cart")) {
        showCart()
        return
      }
      if (t === "2" || t.includes("tiếp tục")) {
        append("bot", "Ok. Bạn có muốn:\n1) Xem danh sách sản phẩm\n2) Tìm theo productId (xem chi tiết)\n3) Quay lại menu")
        setFlow({ type: "menu" })
        return
      }
      if (t === "3" || t.includes("thanh toán") || t.includes("checkout")) {
        startCheckout()
        return
      }
      if (t === "4") {
        showMenu()
        return
      }
      handleMenuInput(text)
      return
    }

    if (flow.type === "cart_after_view_menu") {
      const t = normalizeText(text)
      if (t === "1" || t.includes("thanh toán") || t.includes("checkout")) {
        startCheckout()
        return
      }
      if (t === "2" || t.includes("tiếp tục")) {
        showProducts()
        return
      }
      if (t === "3" || t.includes("quay lại") || t === "menu") {
        showMenu()
        return
      }
      handleMenuInput(text)
      return
    }

    // CRUD: Add product
    if (flow.type === "product_add") {
      const step = flow.step
      const draft = { ...flow.draft }

      if (step === 0) {
        draft.name = text
        append("bot", "Bước 2/5: Nhập `image` (link ảnh hoặc đường dẫn, ví dụ: /images/Jack.png).")
        setFlow({ type: "product_add", step: 1, draft })
        return
      }

      if (step === 1) {
        draft.image = text
        append("bot", "Bước 3/5: Nhập `price` (VND, ví dụ: 120000).")
        setFlow({ type: "product_add", step: 2, draft })
        return
      }

      if (step === 2) {
        const price = parseIntLoose(text)
        if (price == null || price < 0) {
          append("bot", "price chưa hợp lệ. Nhập lại (ví dụ: 120000).")
          return
        }
        draft.price = price
        append("bot", "Bước 4/5: Nhập `quantity` tồn kho (ví dụ: 10).")
        setFlow({ type: "product_add", step: 3, draft })
        return
      }

      if (step === 3) {
        const quantity = parseIntLoose(text)
        if (quantity == null || quantity < 0) {
          append("bot", "quantity chưa hợp lệ. Nhập lại (ví dụ: 10).")
          return
        }
        draft.quantity = quantity
        append("bot", "Bước 5/5: Nhập `description` (mô tả sản phẩm).")
        setFlow({ type: "product_add", step: 4, draft })
        return
      }

      if (step === 4) {
        draft.description = text

        // Validate required fields.
        const requiredOk =
          typeof draft.name === "string" &&
          draft.name.trim().length > 0 &&
          typeof draft.image === "string" &&
          draft.image.trim().length > 0 &&
          typeof draft.price === "number" &&
          typeof draft.quantity === "number" &&
          typeof draft.description === "string"

        if (!requiredOk) {
          append("bot", "Thiếu field bắt buộc. Vui lòng bắt đầu lại bằng menu.")
          showMenu()
          return
        }

        const preview = draft as Omit<Product, "id">
        append(
          "bot",
          "Tóm tắt sản phẩm sắp thêm:\n" +
            `- name: ${preview.name}\n` +
            `- image: ${preview.image}\n` +
            `- price: ${formatVND(preview.price)}\n` +
            `- quantity: ${preview.quantity}\n` +
            `- description: ${preview.description}\n\n` +
            "Trả lời: `xác nhận` để lưu, hoặc `hủy` để bỏ."
        )
        // Reuse step=5 as confirm, without changing draft structure.
        setFlow({ type: "product_add", step: 5, draft })
        return
      }

      if (step === 5) {
        const t = normalizeText(text)
        if (t.includes("xác nhận") || t === "xacnhan" || t === "ok" || t === "yes" || t === "y") {
          const preview = flow.draft as Omit<Product, "id">
          const created = addProduct({
            name: String(preview.name ?? ""),
            image: String(preview.image ?? ""),
            price: Number(preview.price ?? 0),
            quantity: Number(preview.quantity ?? 0),
            description: String(preview.description ?? ""),
          })

          append(
            "bot",
            `Đã thêm thành công! productId mới = ${created.id}.\nBạn muốn:\n1) Xem danh sách sản phẩm\n2) Xem chi tiết sản phẩm (ID vừa tạo)\n3) Quay lại menu`
          )
          setFlow({ type: "menu" })
          return
        }

        if (t.includes("hủy") || t === "cancel" || t === "no" || t === "n") {
          append("bot", "Đã hủy thêm sản phẩm.")
          showMenu()
          return
        }

        append("bot", "Mình chưa hiểu. Bạn trả lời `xác nhận` hoặc `hủy`.")
        return
      }
    }

    // CRUD: Delete product
    if (flow.type === "product_delete_id") {
      const id = parseIntLoose(text)
      if (!id) {
        append("bot", "productId chưa hợp lệ. Nhập lại.")
        return
      }
      const product = getProductById(id)
      if (!product) {
        append("bot", `Không tìm thấy sản phẩm với productId = ${id}. Nhập lại.`)
        return
      }
      append(
        "bot",
        "Xác nhận xóa?\n" +
          `- productId: ${product.id}\n` +
          `- name: ${product.name}\n\n` +
          "Trả lời: `xóa` để xóa, hoặc `hủy` để bỏ."
      )
      setFlow({ type: "product_delete_confirm", productId: id })
      return
    }

    if (flow.type === "product_delete_confirm") {
      const t = normalizeText(text)
      if (t === "xóa" || t === "xoa" || t === "delete" || t === "yes" || t === "y" || t === "ok") {
        const ok = deleteProduct(flow.productId)
        if (!ok) {
          append("bot", "Xóa thất bại (có thể sản phẩm không tồn tại).")
          showMenu()
          return
        }

        append("bot", `Đã xóa thành công productId = ${flow.productId}.\nBạn muốn tiếp tục?\n1) Xem danh sách sản phẩm\n2) Quay lại menu`)
        setFlow({ type: "menu" })
        return
      }
      if (t.includes("hủy") || t === "cancel" || t === "no" || t === "n") {
        append("bot", "Đã hủy xóa sản phẩm.")
        showMenu()
        return
      }
      append("bot", "Mình chưa hiểu. Trả lời `xóa` hoặc `hủy`.")
      return
    }

    // CRUD: Edit product
    if (flow.type === "product_edit") {
      if (flow.productId === -1) {
        const id = parseIntLoose(text)
        if (!id) {
          append("bot", "productId chưa hợp lệ. Nhập lại (ví dụ: 1).")
          return
        }
        const original = getProductById(id)
        if (!original) {
          append("bot", `Không tìm thấy sản phẩm productId = ${id}. Nhập lại.`)
          return
        }
        append(
          "bot",
          `Bạn đang sửa sản phẩm:\n- ID ${original.id}: ${original.name}\n\n` +
            "Bước 1/5: Nhập `name` mới (hoặc gõ `giữ nguyên`)."
        )
        setFlow({ type: "product_edit", productId: id, step: 0, original, draft: {} })
        return
      }

      const t = normalizeText(text)
      const keep = t === "giữ nguyên" || t === "giu nguyen" || t === "giữ" || t === "giu" || t === "keep"

      const original = flow.original
      const draft = { ...flow.draft }

      if (flow.step === 0) {
        if (!keep) draft.name = text
        append(
          "bot",
          `Bước 2/5: Nhập \`image\` mới (hiện tại: ${original.image}). Gõ \`giữ nguyên\` để không đổi.`
        )
        setFlow({ ...flow, step: 1, draft })
        return
      }
      if (flow.step === 1) {
        if (!keep) draft.image = text
        append("bot", `Bước 3/5: Nhập \`price\` mới (hiện tại: ${formatVND(original.price)}). Hoặc gõ 'giữ nguyên'.`)
        setFlow({ ...flow, step: 2, draft })
        return
      }
      if (flow.step === 2) {
        if (!keep) {
          const price = parseIntLoose(text)
          if (price == null || price < 0) {
            append("bot", "price chưa hợp lệ. Nhập lại hoặc gõ 'giữ nguyên'.")
            return
          }
          draft.price = price
        }
        append(`bot`, `Bước 4/5: Nhập \`quantity\` mới (hiện tại: ${original.quantity}). Hoặc gõ 'giữ nguyên'.`)
        setFlow({ ...flow, step: 3, draft })
        return
      }
      if (flow.step === 3) {
        if (!keep) {
          const quantity = parseIntLoose(text)
          if (quantity == null || quantity < 0) {
            append("bot", "quantity chưa hợp lệ. Nhập lại hoặc gõ 'giữ nguyên'.")
            return
          }
          draft.quantity = quantity
        }
        append("bot", `Bước 5/5: Nhập \`description\` mới (hiện tại: ${original.description}). Gõ 'giữ nguyên' nếu không đổi.`)
        setFlow({ ...flow, step: 4, draft })
        return
      }
      if (flow.step === 4) {
        if (!keep) draft.description = text

        const merged: Product = {
          ...original,
          ...(draft as Omit<Product, "id">),
          id: original.id,
        }

        append(
          "bot",
          "Tóm tắt cập nhật:\n" +
            `- productId: ${merged.id}\n` +
            `- name: ${merged.name}\n` +
            `- image: ${merged.image}\n` +
            `- price: ${formatVND(merged.price)}\n` +
            `- quantity: ${merged.quantity}\n` +
            `- description: ${merged.description}\n\n` +
            "Trả lời: `xác nhận` để lưu, hoặc `hủy` để bỏ."
        )
        setFlow({ ...flow, step: 5, draft })
        return
      }
      if (flow.step === 5) {
        const t2 = normalizeText(text)
        if (t2.includes("xác nhận") || t2 === "xacnhan" || t2 === "ok" || t2 === "yes" || t2 === "y") {
          const ok = updateProduct(flow.productId, flow.draft)
          if (!ok) {
            append("bot", "Cập nhật thất bại (sản phẩm không tồn tại).")
            showMenu()
            return
          }
          append("bot", "Đã cập nhật thành công. Bạn muốn:\n1) Xem danh sách sản phẩm\n2) Quay lại menu")
          setFlow({ type: "menu" })
          return
        }
        if (t2.includes("hủy") || t2 === "cancel" || t2 === "no" || t2 === "n") {
          append("bot", "Đã hủy cập nhật sản phẩm.")
          showMenu()
          return
        }
        append("bot", "Mình chưa hiểu. Bạn trả lời `xác nhận` hoặc `hủy`.")
        return
      }
    }

    if (flow.type === "orders_list_choice") {
      const t = normalizeText(text)
      const orders = loadOrders().slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      if (t === "1" || t.includes("tất cả") || t === "all") {
        if (orders.length === 0) {
          append("bot", "Chưa có đơn nào.")
          showMenu()
          return
        }
        append(
          "bot",
          "Danh sách đơn đã thanh toán:\n" +
            orders.map((o) => `- orderId: ${o.id} | ${o.customer.name} | method: ${o.paymentMethod} | total: ${formatVND(o.totals.total)} | ${new Date(o.createdAt).toLocaleString("vi-VN")}`).join("\n") +
            "\n\nBạn muốn xem chi tiết? Gõ `2` và nhập orderId, hoặc gõ `menu`."
        )
        setFlow({ type: "orders_detail_id" })
        return
      }

      if (t === "2" || t.includes("nhập") || t.includes("chi tiết")) {
        append("bot", "Nhập `orderId` để xem chi tiết đơn hàng.")
        setFlow({ type: "orders_detail_id" })
        return
      }

      append("bot", "Mình chưa hiểu. Trả lời `1` hoặc `2`.")
      return
    }

    if (flow.type === "orders_detail_id") {
      const t = normalizeText(text)
      const orders = loadOrders().slice()
      if (t === "all" || t.includes("tất cả")) {
        setFlow({ type: "orders_list_choice" })
        handleUser("1")
        return
      }
      const id = text.trim()
      const order = orders.find((o) => o.id === id)
      if (!order) {
        append("bot", "Không tìm thấy orderId. Nhập lại hoặc gõ `menu`.")
        return
      }

      append(
        "bot",
        "Chi tiết đơn hàng:\n" +
          `- orderId: ${order.id}\n` +
          `- createdAt: ${new Date(order.createdAt).toLocaleString("vi-VN")}\n` +
          `- status: ${order.status}\n` +
          `- paymentMethod: ${order.paymentMethod}\n` +
          `- customer.name: ${order.customer.name}\n` +
          `- customer.phone: ${order.customer.phone}\n` +
          `- customer.address: ${order.customer.address}\n` +
          `- customer.reason: ${order.customer.reason}\n\n` +
          "Items:\n" +
          order.items
            .map((i) => `- ${i.name} (ID ${i.productId}) | ${formatVND(i.price)} x ${i.quantity} = ${formatVND(i.price * i.quantity)}`)
            .join("\n") +
          `\n\nSubtotal: ${formatVND(order.totals.subtotal)}\nTotal: ${formatVND(order.totals.total)}\n\nBạn muốn:\n1) Thanh toán đơn mới\n2) Quay lại menu`
      )
      setFlow({ type: "menu" })
      return
    }

    // Checkout
    if (flow.type === "checkout_payment_method") {
      const t = normalizeText(text)
      const method: "momo" | "zalopay" | null = t === "1" || t === "momo" ? "momo" : t === "2" || t === "zalopay" ? "zalopay" : null
      if (!method) {
        append("bot", "Chưa đúng. Trả lời `1` (momo) hoặc `2` (zalopay).")
        return
      }
      append("bot", "Bước 2/6: Nhập `customer.name` (họ và tên).")
      setFlow({
        type: "checkout_customer_name",
        paymentMethod: method,
      })
      return
    }

    if (flow.type === "checkout_customer_name") {
      const name = text
      append("bot", "Bước 3/6: Nhập `customer.phone` (số điện thoại).")
      setFlow({
        type: "checkout_customer_phone",
        paymentMethod: flow.paymentMethod,
        customer: {
          name,
          phone: "",
          address: "",
          reason: "",
        },
      })
      return
    }

    if (flow.type === "checkout_customer_phone") {
      const phoneDigits = text.replace(/[^\d]/g, "")
      if (phoneDigits.length < 8) {
        append("bot", "Số điện thoại chưa hợp lệ. Nhập lại (ví dụ: 0866192325).")
        return
      }
      append("bot", "Bước 4/6: Nhập `customer.address` (địa chỉ).")
      setFlow({
        type: "checkout_customer_address",
        paymentMethod: flow.paymentMethod,
        customer: {
          ...flow.customer,
          phone: phoneDigits,
        },
      })
      return
    }

    if (flow.type === "checkout_customer_address") {
      append("bot", "Bước 5/6: Nhập `customer.reason` (ghi chú/lý do cho đơn hàng).")
      setFlow({
        type: "checkout_customer_reason",
        paymentMethod: flow.paymentMethod,
        customer: {
          ...flow.customer,
          address: text,
        },
      })
      return
    }

    if (flow.type === "checkout_customer_reason") {
      const items = loadCartItems()
      const subtotal = calculateCartTotal(items)
      const customer = { ...flow.customer, reason: text }

      const orderPreview: BotOrder["customer"] = customer
      append(
        "bot",
        "Bước 6/6: Xác nhận đơn thanh toán:\n" +
          `- paymentMethod: ${flow.paymentMethod}\n` +
          `- customer.name: ${orderPreview.name}\n` +
          `- customer.phone: ${orderPreview.phone}\n` +
          `- customer.address: ${orderPreview.address}\n` +
          `- customer.reason: ${orderPreview.reason}\n\n` +
          "Items:\n" +
          items
            .map((i) => `- ${i.name} | ${formatVND(i.price)} x ${i.quantity} = ${formatVND(i.price * i.quantity)}`)
            .join("\n") +
          `\n\nTotal: ${formatVND(subtotal)}\n\nTrả lời: \`thanh toán\` để xác nhận hoặc \`hủy\` để bỏ.`
      )
      setFlow({
        type: "checkout_confirm",
        paymentMethod: flow.paymentMethod,
        customer: orderPreview,
        items,
        subtotal,
      })
      return
    }

    if (flow.type === "checkout_confirm") {
      const t = normalizeText(text)
      if (t === "thanh toán" || t === "thanhtoan" || t === "pay" || t === "ok" || t === "xác nhận" || t === "xacnhan") {
        const id = `${Date.now()}`
        const order: BotOrder = {
          id,
          createdAt: new Date().toISOString(),
          status: "paid",
          paymentMethod: flow.paymentMethod,
          customer: flow.customer,
          items: flow.items,
          totals: {
            subtotal: flow.subtotal,
            total: flow.subtotal,
          },
        }
        const orders = loadOrders()
        orders.push(order)
        saveOrders(orders)

        clearCart()
        append(
          "bot",
          `Thanh toán thành công!\norderId: ${order.id}\n\nBạn muốn:\n1) Xem chi tiết đơn vừa tạo\n2) Thanh toán đơn mới\n3) Quay lại menu`
        )
        setFlow({ type: "menu" })
        return
      }
      if (t.includes("hủy") || t === "cancel" || t === "no" || t === "n") {
        append("bot", "Đã hủy thanh toán.")
        showMenu()
        return
      }
      append("bot", "Mình chưa hiểu. Trả lời `thanh toán` hoặc `hủy`.")
      return
    }
  }

  // Auto-refresh scroll to bottom when messages update.
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

  // Keyboard convenience: Enter to send handled by antd automatically; we also support button click.
  const quickActions = useMemo(() => {
    if (flow.type === "menu") {
      return [
        { label: "1. Xem sản phẩm", value: "1" },
        { label: "2. Chi tiết sản phẩm", value: "2" },
        { label: "3. Cách mua hàng", value: "3" },
        { label: "4. Phương thức thanh toán", value: "4" },
        { label: "5. Xem đơn đã thanh toán", value: "5" },
      ]
    }
    // FAQ-only chatbot: không hiển thị nút cho các luồng giỏ/thanh toán.
    return []
  }, [flow.type])

  const isWidget = variant === "widget"

  return (
    <div
      className={
        isWidget
          ? "flex flex-col h-full min-h-0"
          : "max-w-[980px] mx-auto py-12 px-6"
      }
    >
      {!isWidget && (
        <h1 className="text-3xl font-bold text-[#6272B6] mb-6 text-center">
          Chatbot mua hàng (demo)
        </h1>
      )}

      {isWidget && (
        <div className="flex items-center justify-between gap-3 px-4 py-3.5 shrink-0 rounded-t-2xl bg-gradient-to-r from-[#6272B6] via-[#6d7ebe] to-[#5567a8] text-white shadow-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-lg shrink-0"
              aria-hidden
            >
              💬
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-[15px] leading-tight truncate">Trợ lý mua hàng</p>
              <p className="text-xs text-white/85 truncate">Hỏi đáp đầy đủ — gõ số hoặc nhập tự do</p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-full p-2 text-white/90 hover:bg-white/15 hover:text-white transition"
              aria-label="Đóng chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      <div
        className={
          isWidget
            ? "flex flex-col flex-1 min-h-0 bg-white border-x border-b border-[#E4E8F5] rounded-b-2xl shadow-inner"
            : "bg-white rounded-2xl shadow p-4"
        }
      >
        <div
          className={
            isWidget
              ? "flex-1 overflow-y-auto px-4 py-3 min-h-0"
              : "h-[60vh] overflow-y-auto pr-2"
          }
        >
          {messages.map((m) => (
            <div key={m.id} className={`mb-3 ${m.role === "user" ? "text-right" : "text-left"}`}>
              <div
                className={
                  m.role === "user"
                    ? `inline-block px-4 py-2.5 rounded-2xl text-left max-w-[92%] whitespace-pre-wrap shadow-sm ${
                        isWidget
                          ? "bg-[#6272B6] text-white rounded-br-md"
                          : "bg-[#6272B6] text-white max-w-[85%]"
                      }`
                    : `inline-block px-4 py-2.5 rounded-2xl text-left max-w-[92%] whitespace-pre-wrap ${
                        isWidget
                          ? "bg-[#F4F6FF] text-gray-900 border border-[#E8ECFF] rounded-bl-md"
                          : "bg-gray-100 text-gray-900 max-w-[85%]"
                      }`
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
              <Button
                key={a.value + a.label}
                size="small"
                className={isWidget ? "!border-[#6272B6]/35 !text-[#6272B6] hover:!border-[#6272B6] hover:!text-[#4f5fa3]" : undefined}
                onClick={() => {
                  sendValue(a.value)
                }}
              >
                {a.label}
              </Button>
            ))}
          </div>
        )}

        <div className={`flex gap-2 ${isWidget ? "px-4 pb-3 pt-1 border-t border-[#F0F2FA] bg-[#FAFBFF]" : "mt-4"}`}>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập câu trả lời..."
            onPressEnter={onSend}
            className={isWidget ? "!rounded-xl" : undefined}
          />
          <Button type="primary" onClick={onSend} className={isWidget ? "!rounded-xl !bg-[#6272B6] hover:!bg-[#5567a8]" : undefined}>
            Gửi
          </Button>
        </div>

        <div className={`text-xs text-gray-500 ${isWidget ? "px-4 pb-3 pt-0 bg-[#FAFBFF]" : "mt-3"}`}>
          Gợi ý: nhập `menu` để quay lại, `hủy` để thoát form. Các fields sẽ được hỏi đầy đủ theo đúng yêu cầu. Sản phẩm/tồn kho trong chat sẽ tự cập nhật định kỳ.
        </div>
      </div>
    </div>
  )
}

