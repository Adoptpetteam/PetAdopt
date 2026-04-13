import { Link } from "react-router-dom"
import type { Pet } from "../data/pet"
import { addToFavorites } from "../utils/favorite"

type Props = {
  pet: Pet
}

export default function PetCard({ pet }: Props) {
  return (
    <Link to={`/pet/${pet.id}`}>
      <div className="w-[280px] h-[520px] bg-white rounded-[20px] overflow-hidden hover:shadow-xl transition">

        <img
          src={pet.image}
          alt={pet.name}
          className="w-full h-[300px] object-cover"
        />

        <div className="text-center p-4">
          <h3 className="text-[#6272B6] font-semibold">
            {pet.name}
          </h3>

          <p className="text-gray-600 text-sm mt-2">
            Tuổi: {pet.age} <br />
            Giới tính: {pet.gender}
          </p>

          {/* ❤️ BUTTON */}
          <button
            onClick={(e) => {
              e.preventDefault() // 🔥 tránh click vào Link
              addToFavorites(pet)
              alert("Đã thêm vào yêu thích ❤️")
            }}
            className="mt-4 bg-pink-500 text-white px-4 py-2 rounded-full hover:bg-pink-600"
          >
            Yêu thích
          </button>
        </div>

      </div>
    </Link>
  )
}