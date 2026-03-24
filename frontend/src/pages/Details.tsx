// import Sydney from "../assets/images/Sydney.png"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getPetById, type PetEntity } from "../api/petApi"

export default function PetDetail() {
    const { id } = useParams<{ id: string }>()
    const [pet, setPet] = useState<PetEntity | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

  useEffect(() => {
    if (!id) {
      setError("Thiếu mã thú cưng.")
      setLoading(false)
      return
    }

    const fetchPet = async () => {
      try {
        const response = await getPetById(id)
        setPet(response.data)
      } catch (err) {
        console.error("Load pet detail failed:", err)
        setError("Không tìm thấy thú cưng.")
      } finally {
        setLoading(false)
      }
    }

    fetchPet()
  }, [id])

  if (loading) {
    return <div className="max-w-[1200px] mx-auto py-20 px-6">Đang tải dữ liệu...</div>
  }

  if (!pet || error) {
    return <div className="max-w-[1200px] mx-auto py-20 px-6">{error || "Pet not found"}</div>
  }


  return (
    <div className="max-w-[1200px] mx-auto py-20 px-6">

      <div className="grid grid-cols-2 gap-16 items-start">

        {/* IMAGE */}
        <div className="bg-white rounded-[24px] overflow-hidden shadow-md">
          <img
            src={pet.images?.[0] || "/images/Jack.png"}
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