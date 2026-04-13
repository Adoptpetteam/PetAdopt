import { useEffect, useState } from "react"
import { getFavorites, removeFromFavorites } from "../utils/favorite"
import { useNavigate } from "react-router-dom"
import type { Pet } from "../data/pet"

export default function Favorites() {
  const [favorites, setFavorites] = useState<Pet[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    setFavorites(getFavorites())
  }, [])

  const handleRemove = (id: string | number) => {
    removeFromFavorites(id)
    setFavorites(getFavorites())
  }

  return (
    <div className="max-w-[1000px] mx-auto py-20 px-6">

      <h1 className="text-3xl font-bold text-[#6272B6] mb-10 text-center">
        Danh sách yêu thích ❤️
      </h1>

      <div className="grid grid-cols-3 gap-6">

        {favorites.length > 0 ? (
          favorites.map((pet) => (

            <div key={pet.id} className="bg-white rounded-xl shadow p-4">

              <img
                src={pet.image}
                className="w-full h-40 object-cover rounded"
              />

              <h3 className="mt-3 font-bold text-[#6272B6]">
                {pet.name}
              </h3>

              <p className="text-gray-600 text-sm">
                Tuổi: {pet.age} <br />
                Giới tính: {pet.gender}
              </p>

              <div className="flex gap-2 mt-4">

                {/* XEM CHI TIẾT */}
                <button
                  onClick={() => navigate(`/pet/${pet.id}`)}
                  className="flex-1 bg-blue-500 text-white py-2 rounded"
                >
                  Xem
                </button>

                {/* XÓA */}
                <button
                  onClick={() => handleRemove(pet.id)}
                  className="flex-1 bg-red-500 text-white py-2 rounded"
                >
                  Xóa
                </button>

              </div>

            </div>
          ))
        ) : (
          <div className="col-span-3 text-center text-gray-400">
            Chưa có thú cưng nào được yêu thích
          </div>
        )}

      </div>
    </div>
  )
}