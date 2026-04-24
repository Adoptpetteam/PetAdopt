import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  useListPet,
  useDeletePet,
  useListCategory,
} from "../../hook/huyHook";

interface Pet {
  id: string;
  name: string;
  age: number;
  gender: string;
  image: string;
  categoryId: string;
  sterilized: boolean;
  color: string;
  vaccinated: boolean;
}

export default function AdminPets() {
const navigate = useNavigate();
  const { data: pets, isLoading } = useListPet({ resource: "pets" });
  const { data: categories } = useListCategory({ resource: "category" });
  const { mutate: deletePet } = useDeletePet({ resource: "pets" });
  const getCategoryName = (id: string) => {
    return categories?.find((c: any) => c.id === id)?.name || "Không rõ";
  };

  if (isLoading) {
    return <p className="text-center mt-10">Đang tải dữ liệu...</p>;
  }

  return (
    <div className="max-w-[1100px] mx-auto py-10 px-6">
      <h1 className="text-2xl font-bold text-[#6272B6] mb-6">
        Quản lý thú cưng 
      </h1>

      <button
        onClick={() => navigate("/admin/pets/add")}
        className="mb-6 px-6 py-3 bg-[#6272B6] text-white rounded-full"
      >
        + Thêm thú cưng mới
      </button>

      <div className="space-y-4">
        {pets?.map((p) => (
          <div
            key={p.id}
            className="bg-white shadow rounded-xl p-4 flex justify-between items-center"
          >
            <div className="flex gap-4 items-center">
              <img src={p.image} className="w-20 h-20 object-cover rounded" />

              <div>
                <p className="font-semibold">{p.name}</p>
          
                <p className="text-sm text-gray-500">
                  {getCategoryName(p.categoryId)} | {p.age} tuổi | {p.gender}
                </p>
                <p className="text-sm">
                  {p.color} | {p.vaccinated ? "Đã tiêm" : "Chưa tiêm"} | {p.sterilized ? "Đã triệt sản" : "Chưa"}
                </p>
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
                onClick={() => deletePet(p.id)}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}