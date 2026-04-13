import type { Pet } from "../data/pet"

export const getFavorites = (): Pet[] => {
  return JSON.parse(localStorage.getItem("favorites") || "[]")
}

export const addToFavorites = (pet: Pet) => {
  const favorites = getFavorites()

  const exists = favorites.find((p) => p.id === pet.id)
  if (exists) return

  favorites.push(pet)
  localStorage.setItem("favorites", JSON.stringify(favorites))
}

export const removeFromFavorites = (id: string | number) => {
  const favorites = getFavorites().filter((p) => p.id !== id)
  localStorage.setItem("favorites", JSON.stringify(favorites))
}
