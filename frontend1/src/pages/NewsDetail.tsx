import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { getNewsById } from "../api/newsApi"

export default function NewsDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getNewsById(id)
      .then(res => setArticle(res.data))
      .catch(() => setArticle(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="text-center py-20">Đang tải...</div>
  }

  if (!article) {
    return <div className="text-center py-20">Không tìm thấy bài viết</div>
  }

  return (
    <div className="max-w-[800px] mx-auto py-20 px-6">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-500">
        ← Quay lại
      </button>

      <h1 className="text-3xl font-bold mb-4">
        {article.title}
      </h1>

      <img
        src={article.image || "/images/Jack.png"}
        className="w-full h-[400px] object-cover rounded-xl mb-6"
      />

      <p className="text-gray-500 mb-4">
        Ngày đăng: {article.createdAt ? new Date(article.createdAt).toLocaleDateString("vi-VN") : ""}
      </p>

      <p>{article.description}</p>

      {article.content && (
        <div className="mt-6 whitespace-pre-wrap">{article.content}</div>
      )}
    </div>
  )
}