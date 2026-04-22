import { Link } from "react-router-dom"
import type { Pet } from "../data/pet"

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
        </div>

      </div>
    </Link>
  )
}