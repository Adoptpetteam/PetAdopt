import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { getPetById } from "../api/petApi"

export default function PetDetail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [pet, setPet] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getPetById(id)
      .then(res => setPet(res.data))
      .catch(() => setPet(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="text-center py-40">Đang tải...</div>
  }

  if (!pet) {
    return <div className="text-center py-40">Không tìm thấy thú cưng</div>
  }

  const petImage = pet.image || (pet.images?.[0]) || "/images/Jack.png"
  const petId = pet._id || id

  return (
    <div className="max-w-[1200px] mx-auto py-20 px-6">

      <div className="grid grid-cols-2 gap-16 items-start">

        {/* IMAGE */}
        <div className="bg-white rounded-[24px] overflow-hidden shadow-md">
          <img
            src={petImage}
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
              <span className="font-semibold">Tuổi:</span> {pet.age || "N/A"}
            </p>

            <p>
              <span className="font-semibold">Giới tính:</span> {pet.gender || "N/A"}
            </p>

            <p>
              <span className="font-semibold">Loài:</span> {pet.species || pet.type || "N/A"}
            </p>

            <p>
              <span className="font-semibold">Giống:</span> {pet.breed || "N/A"}
            </p>

            <p>
              <span className="font-semibold">Màu sắc:</span> {pet.color || "N/A"}
            </p>

            <p>
              <span className="font-semibold">Triệt sản:</span>{" "}
              {pet.neutered ? "Đã triệt sản" : "Chưa triệt sản"}
            </p>

            <p>
              <span className="font-semibold">Tiêm phòng:</span>{" "}
              {pet.vaccinated ? "Đã tiêm" : "Chưa tiêm"}
            </p>

            <p>
              <span className="font-semibold">Tình trạng:</span>{" "}
              {pet.status === 'available' ? 'Có thể nhận nuôi' : pet.status || "N/A"}
            </p>

            {pet.description && (
              <p>
                <span className="font-semibold">Mô tả:</span> {pet.description}
              </p>
            )}

            <button
              onClick={() => navigate(`/adopt-form/${petId}`)}
              className="mt-6 bg-[#6272B6] text-white px-8 py-3 rounded-full hover:bg-[#4e5fa8] transition"
            >
              Nhận nuôi ngay
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}