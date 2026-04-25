import { useParams, useNavigate } from "react-router-dom";
import { usePetDetail } from "../hook/huyHook";

const mapGender = (gender?: string) => {
  if (gender === "male") return "Đực";
  if (gender === "female") return "Cái";
  return "Không rõ";
};

export default function PetDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: pet, isLoading } = usePetDetail({
    resource: "pets",
    id,
  });

  if (isLoading) {
    return <div className="text-center py-20">Đang tải...</div>;
  }

  if (!pet) {
    return <div>Pet not found</div>;
  }

  return (
    <div className="max-w-[1200px] mx-auto py-20 px-6">
      <div className="grid grid-cols-2 gap-16 items-start">
        <div className="bg-white rounded-[24px] overflow-hidden shadow-md">
          <img src={pet.image} className="w-full h-[500px] object-cover" />
        </div>

        <div>
          <h1 className="text-4xl font-bold text-[#6272B6] mb-6">{pet.name}</h1>

          <div className="space-y-3 text-gray-700 text-lg mb-8">
            <p><span className="font-semibold">Tuổi:</span> {pet.age}</p>
            <p><span className="font-semibold">Giới tính:</span> {mapGender(pet.gender)}</p>
            <p><span className="font-semibold">Loại:</span> {pet.type}</p>
            <p><span className="font-semibold">Màu sắc:</span> {pet.color}</p>
            <p><span className="font-semibold">Mô tả:</span> {pet.description || "Chưa có mô tả"}</p>
            <p><span className="font-semibold">Triệt sản:</span> {pet.sterilized ? "Đã triệt sản" : "Chưa triệt sản"}</p>
            <p><span className="font-semibold">Tiêm chủng:</span> {pet.vaccinated ? "Đã tiêm chủng" : "Chưa tiêm chủng"}</p>

            <button
              onClick={() => navigate(`/adopt-form/${pet.id}`)}
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
