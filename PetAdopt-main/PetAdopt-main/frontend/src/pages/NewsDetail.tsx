import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"

export default function NewsDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [article, setArticle] = useState<any>(null)

  useEffect(() => {
    axios
      .get(`http://localhost:3000/news/${id}`)
      .then(res => setArticle(res.data))
      .catch(() => setArticle(null))
  }, [id])

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
        src={article.image}
        className="w-full h-[400px] object-cover rounded-xl mb-6"
      />

      <p className="text-gray-500 mb-4">
        Ngày đăng: {article.createdAt}
      </p>

      <p>{article.description}</p>
    </div>
  )
}