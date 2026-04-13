import { useParams } from "react-router-dom";
import { usePetDetail } from "../../hook/huyHook";

const mapGender = (gender?: string) => {
  if (gender === "male") return "Đực";
  if (gender === "female") return "Cái";
  return "Không rõ";
};

export default function PetDetailAdmin() {
  const { id } = useParams();

  const { data: pet, isLoading } = usePetDetail({
    resource: "pets",
    id,
  });

  if (isLoading) {
    return <div className="text-center py-20">Đang tải...</div>;
  }

  if (!pet) {
    return <div className="text-center py-20">Không tìm thấy thú cưng</div>;
  }

  return (
    <div className="max-w-[1000px] mx-auto py-20 px-6">
      <h1 className="text-3xl font-bold text-[#6272B6] mb-10">Chi tiết thú cưng (Admin)</h1>

      <div className="grid grid-cols-2 gap-10 bg-white p-6 rounded-2xl shadow">
        <img src={pet.image} className="w-full h-[350px] object-cover rounded-xl" />

        <div className="space-y-4 text-gray-700 text-lg">
          <h2 className="text-2xl font-bold text-[#6272B6]">{pet.name}</h2>

          <p><strong>Tuổi:</strong> {pet.age}</p>
          <p><strong>Giới tính:</strong> {mapGender(pet.gender)}</p>
          <p><strong>Loại:</strong> {pet.type}</p>
          <p><strong>Màu:</strong> {pet.color}</p>
          <p><strong>Mô tả:</strong> {pet.description || "Chưa có mô tả"}</p>
          <p><strong>Tiêm phòng:</strong> {pet.vaccinated ? "Đã tiêm" : "Chưa tiêm"}</p>
          <p><strong>Triệt sản:</strong> {pet.sterilized ? "Đã triệt sản" : "Chưa triệt sản"}</p>
        </div>
      </div>
    </div>
  );
}
