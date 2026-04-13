import { useNavigate } from "react-router-dom";
import { useDeletePet, useListPet } from "../../hook/huyHook";

interface PetCategory {
  id?: string;
  _id?: string;
  name: string;
  status?: string;
}

interface Pet {
  id: string;
  name: string;
  age: number;
  gender: string;
  image: string;
  type?: string;
  category?: string | PetCategory;
  sterilized: boolean;
  color: string;
  vaccinated: boolean;
  description?: string;
  status?: string;
}

const mapGender = (gender: string) => {
  if (gender === "male") return "Đực";
  if (gender === "female") return "Cái";
  return "Không rõ";
};

const getCategoryName = (category?: string | PetCategory) => {
  if (!category) return "Chưa có danh mục";
  if (typeof category === "string") return category;
  return category.name || "Chưa có danh mục";
};

export default function AdminPets() {
  const navigate = useNavigate();
  const { data: pets = [] } = useListPet({ resource: "pets" });
  const { mutate: removePet } = useDeletePet({ resource: "pets" });

  const handleDelete = (id: string) => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa thú cưng này không?");
    if (!confirmed) return;
    removePet(id);
  };

  return (
    <div className="max-w-[1100px] mx-auto py-10 px-6">
      <h1 className="text-2xl font-bold text-[#6272B6] mb-6">Quản lý thú cưng</h1>

      <button
        onClick={() => navigate("/admin/pets/add")}
        className="mb-6 px-6 py-3 bg-[#6272B6] text-white rounded-full"
      >
        + Thêm thú cưng
      </button>

      <div className="space-y-4">
        {pets.length > 0 ? (
          pets.map((p: Pet) => (
            <div
              key={p.id}
              className="bg-white shadow rounded-xl p-4 flex justify-between items-center"
            >
              <div className="flex gap-4 items-center">
                <img
                  src={p.image || "https://via.placeholder.com/80?text=No+Image"}
                  alt={p.name}
                  className="w-20 h-20 object-cover rounded"
                />

                <div>
                  <p className="font-semibold">{p.name}</p>

                  <p className="text-sm text-gray-500">
                    {getCategoryName(p.category)} | {p.age} tuổi | {mapGender(p.gender)}
                  </p>

                  <p className="text-sm">
                    {p.color || "Chưa rõ màu"} |{" "}
                    {p.vaccinated ? "Đã tiêm" : "Chưa tiêm"} |{" "}
                    {p.sterilized ? "Đã triệt sản" : "Chưa triệt sản"}
                  </p>

                  {p.description && (
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                      {p.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/admin/pets/edit/${p.id}`)}
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Sửa
                </button>

                <button
                  onClick={() => handleDelete(p.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white shadow rounded-xl p-6 text-center text-gray-500">
            Chưa có thú cưng nào
          </div>
        )}
      </div>
    </div>
  );
}