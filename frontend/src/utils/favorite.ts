import type { Pet } from "../data/pet"

// lấy danh sách
export const getFavorites = (): Pet[] => {
  return JSON.parse(localStorage.getItem("favorites") || "[]")
}

// thêm
export const addToFavorites = (pet: Pet) => {
  const favorites = getFavorites()

  const exists = favorites.find((p) => p.id === pet.id)
  if (exists) return // tránh trùng

  favorites.push(pet)
  localStorage.setItem("favorites", JSON.stringify(favorites))
}

// xóa
export const removeFromFavorites = (id: number) => {
  const favorites = getFavorites().filter((p) => p.id !== id)
  localStorage.setItem("favorites", JSON.stringify(favorites))
}