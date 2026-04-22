import { Link } from "react-router-dom"

type Pet = {
  _id?: string
  id?: number
  name: string
  age?: number
  gender?: string
  image?: string
  images?: string[]
  type?: string
  species?: string
  sterilized?: boolean
  color?: string
}

type Props = {
  pet: Pet
}

export default function PetCard({ pet }: Props) {
  const petId = pet._id || pet.id
  const petImage = pet.image || (pet.images?.[0]) || "/images/Jack.png"
  const petType = pet.type || pet.species || ""

  return (
    <Link to={`/pet/${petId}`}>
      <div className="w-[280px] h-[520px] bg-white rounded-[20px] overflow-hidden hover:shadow-xl transition">

        <img
          src={petImage}
          alt={pet.name}
          className="w-full h-[300px] object-cover"
        />

        <div className="text-center p-4">
          <h3 className="text-[#6272B6] font-semibold">
            {pet.name}
          </h3>

          <p className="text-gray-600 text-sm mt-2">
            Tuổi: {pet.age || "N/A"} <br />
            Giới tính: {pet.gender || "N/A"}
          </p>
        </div>

      </div>
    </Link>
  )
}