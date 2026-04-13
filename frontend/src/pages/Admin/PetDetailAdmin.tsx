import { useParams } from "react-router-dom"
import { usePetDetail } from "../../hook/huyHook"
import { useListCategory } from "../../hook/huyHook";

export default function PetDetailAdmin() {
  const { id } = useParams();

  const { data: pet, isLoading: loadingPet } = usePetDetail({
    resource: "pets",
    id
  });

  const { data: categories, isLoading: loadingCat } = useListCategory({ resource: "category" });

  if (loadingPet || loadingCat) {
    return <div className="text-center py-20">Đang tải...</div>;
  }

  if (!pet) {
    return <div className="text-center py-20">Không tìm thấy thú cưng</div>;
  }

  // Tìm category tương ứng
  const category = categories?.find((c: any) => c.id === pet.categoryId);

  return (
    <div className="max-w-[1000px] mx-auto py-20 px-6">

      <h1 className="text-3xl font-bold text-[#6272B6] mb-10">
        Chi tiết thú cưng (Admin)
      </h1>

      <div className="grid grid-cols-2 gap-10 bg-white p-6 rounded-2xl shadow">

        {/* IMAGE */}
        <img
          src={pet.image}
          className="w-full h-[350px] object-cover rounded-xl"
        />

        {/* INFO */}
        <div className="space-y-4 text-gray-700 text-lg">

          <h2 className="text-2xl font-bold text-[#6272B6]">
            {pet.name}
          </h2>

          <p><strong>Tuổi:</strong> {pet.age}</p>
          <p><strong>Giới tính:</strong> {pet.gender}</p>
          <p><strong>Loại:</strong> {category?.name || "Chưa xác định"}</p>
          <p><strong>Màu:</strong> {pet.color}</p>

          <p>
            <strong>Tiêm phòng:</strong>{" "}
            {pet.vaccinated ? "Đã tiêm" : "Chưa tiêm"}
          </p>

          <p>
            <strong>Triệt sản:</strong>{" "}
            {pet.sterilized ? "Đã triệt sản" : "Chưa triệt sản"}
          </p>

        </div>

      </div>

    </div>
  )
}