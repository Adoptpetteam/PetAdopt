import { useParams, useNavigate } from "react-router-dom"
import { message } from "antd"

// Page này không còn cần thiết vì adoption form submit trực tiếp.
// Giữ lại để tránh lỗi route, nhưng redirect về adopt.
export default function PaymentMethod() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  message.info("Vui lòng điền form nhận nuôi trước.")
  navigate(`/adopt-form/${id}`)

  return null
}