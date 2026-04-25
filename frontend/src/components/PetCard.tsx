import { Link } from "react-router-dom"

type Props = {
  pet: any
}

export default function PetCard({ pet }: Props) {
  const petId = pet._id || pet.id
  const petName = pet.name || pet.pet?.name || "Unknown"
  const petAge = pet.age || pet.pet?.age || "-"
  const petGender = pet.gender || pet.pet?.gender || "-"
  const petImage = pet.images?.[0] || pet.image || pet.pet?.images?.[0] || "https://via.placeholder.com/300"

  return (
    <Link to={`/pet/${petId}`}>
      <div className="w-[280px] h-[520px] bg-white rounded-[20px] overflow-hidden hover:shadow-xl transition">

        <img
          src={petImage}
          alt={petName}
          className="w-full h-[300px] object-cover"
        />

        <div className="text-center p-4">
          <h3 className="text-[#6272B6] font-semibold">
            {petName}
          </h3>

          <p className="text-gray-600 text-sm mt-2">
            Tuổi: {petAge} <br />
            Giới tính: {petGender}
          </p>
        </div>

      </div>
    </Link>
  )
}
