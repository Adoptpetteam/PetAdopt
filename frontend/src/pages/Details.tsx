// import Sydney from "../assets/images/Sydney.png"
import { useParams } from "react-router-dom"
import { pets } from "../data/pet"

export default function PetDetail() {
    const { id } = useParams()

  const pet = pets.find((p) => p.id === Number(id))

  if (!pet) {
    return <div>Pet not found</div>
  }


  return (
    <div className="max-w-[1200px] mx-auto py-20 px-6">

      <div className="grid grid-cols-2 gap-16 items-start">

        {/* IMAGE */}
        <div className="bg-white rounded-[24px] overflow-hidden shadow-md">
          <img
            src={pet.image}
            className="w-full h-[500px] object-cover"
          />
        </div>

        {/* INFO */}
        <div>

          {/* Name */}
          <h1 className="text-4xl font-bold text-[#6272B6] mb-6">
            {pet.name}
          </h1>

          {/* Basic info */}
          <div className="space-y-3 text-gray-700 text-lg mb-8">

            <p>
              <span className="font-semibold">Tuổi:</span> {pet.age}
            </p>

            <p>
              <span className="font-semibold">Giới tính:</span> {pet.gender}
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}