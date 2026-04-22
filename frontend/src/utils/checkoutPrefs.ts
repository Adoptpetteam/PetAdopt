import type { PaymentMethod } from "../api/orderApi"

const PAYMENT_KEY = "checkout_payment_method"

export function getPreferredPaymentMethod(): PaymentMethod {
  const raw = localStorage.getItem(PAYMENT_KEY)
  if (raw === "momo" || raw === "zalopay") return raw
  return "momo"
}

export function setPreferredPaymentMethod(method: PaymentMethod): void {
  localStorage.setItem(PAYMENT_KEY, method)
}
