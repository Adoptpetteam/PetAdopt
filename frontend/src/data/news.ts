export interface News {
  id: number
  title: string
  image: string
  description: string
  content: string
  createdAt: string
}

export const newsList: News[] = [
  {
    id: 1,
    title: "Giải cứu 5 chú chó bị bỏ rơi",
    image: "/images/Jack.png",
    description: "Chúng tôi đã cứu 5 chú chó...",
    content: "Chi tiết câu chuyện giải cứu...",
    createdAt: "2026-03-20",
  },
  {
    id: 2,
    title: "Cách chăm sóc mèo mới nhận nuôi",
    image: "/images/Jack.png",
    description: "Hướng dẫn cơ bản cho người mới...",
    content: "Chi tiết cách chăm sóc mèo...",
    createdAt: "2026-03-22",
  },
]