export interface Product {
  id: number
  name: string
  price: number
  image: string
  description: string
  quantity: number
}

export const products: Product[] = [
  {
    id: 1,
    name: "Thức ăn cho chó",
    price: 120000,
    image: "/images/Jack.png",
    description: "Thức ăn dinh dưỡng cho chó",
    quantity: 10,
  },
  {
    id: 2,
    name: "Cát vệ sinh cho mèo",
    price: 80000,
    image: "/images/Jack.png",
    description: "Cát sạch, khử mùi tốt",
    quantity: 20,
  },
]