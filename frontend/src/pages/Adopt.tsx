import Banner from "../assets/images/Banner.png";
import Pagination from "../components/Pagination";
import { useListPet, useListCategory } from "../hook/huyHook";
import PetCard from "../components/PetCard";
import { useState } from "react";

export default function Pets() {
  const [currentPage, setCurrentPage] = useState(1);
  const petsPerPage = 12;
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: pets = [], isLoading: loadingPets } = useListPet({ resource: "pets" });
  const { data: categoriesData = [], isLoading: loadingCat } = useListCategory({ resource: "category" });

  const [searchTerm, setSearchTerm] = useState("");
  const [gender, setGender] = useState("all");
  const [ageRange, setAgeRange] = useState("all");
  const [sterilized, setSterilized] = useState("all");
  const [color, setColor] = useState("all");

  if (loadingPets || loadingCat) return <div className="text-center py-20">Đang tải thú cưng...</div>;

  // map category name từ categoryId
  const petsWithCategory = pets.map((pet: any) => {
    const category = categoriesData.find((c: any) => c.id === pet.categoryId);
    return { ...pet, categoryName: category?.name || "Chưa xác định" };
  });

  const filteredPets = petsWithCategory.filter((pet: any) => {
    const matchCategory = categoryFilter === "all" || pet.categoryId === categoryFilter;
    const matchSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchGender = gender === "all" || pet.gender === gender;
    const matchAge =
      ageRange === "all" ||
      (ageRange === "baby" && pet.age <= 1) ||
      (ageRange === "young" && pet.age > 1 && pet.age <= 3) ||
      (ageRange === "adult" && pet.age > 3);
    const matchSterilized =
      sterilized === "all" || (sterilized === "yes" && pet.sterilized) || (sterilized === "no" && !pet.sterilized);
    const matchColor = color === "all" || pet.color === color;

    return matchCategory && matchSearch && matchGender && matchAge && matchSterilized && matchColor;
  });

  const startIndex = (currentPage - 1) * petsPerPage;
  const currentPets = filteredPets.slice(startIndex, startIndex + petsPerPage);
  const totalPages = Math.ceil(filteredPets.length / petsPerPage);

  return (
    <div className="w-full px-[130px]">
      <section><img src={Banner} className="w-full" alt="banner" /></section>

      <section className="w-full bg-white py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#6272B6]">TÌM THÚ CƯNG</h2>
        </div>

        {/* Filter danh mục */}
        <div className="flex justify-center flex-wrap gap-6 mb-10">
          <button
            onClick={() => { setCategoryFilter("all"); setCurrentPage(1); }}
            className={`px-8 py-3 rounded-full transition ${categoryFilter === "all" ? "bg-[#6272B6] text-white" : "bg-[#DDEDFF]"}`}
          >
            Tất cả
          </button>

          {categoriesData.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => { setCategoryFilter(cat.id); setCurrentPage(1); }}
              className={`px-8 py-3 rounded-full transition ${categoryFilter === cat.id ? "bg-[#6272B6] text-white" : "bg-[#DDEDFF]"}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Filter search & select */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <select value={gender} onChange={(e) => { setGender(e.target.value); setCurrentPage(1); }} className="h-12 bg-[#DDEDFF] rounded-full px-6 outline-none">
            <option value="all">Giới tính</option>
            <option value="Đực">Đực</option>
            <option value="Cái">Cái</option>
          </select>
          {/* ... các select khác giữ nguyên ... */}
          <input
            type="text"
            placeholder="Tên, Code, Chip"
            className="h-12 bg-[#DDEDFF] rounded-full px-6 outline-none"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
          <button className="h-12 rounded-full bg-[#6272B6] text-white font-medium">Tìm kiếm</button>
        </div>

        {/* Hiển thị pets */}
        <div className="grid grid-cols-4 gap-y-16 gap-x-10 justify-items-center mb-20">
          {currentPets.length > 0 ? (
            currentPets.map((pet) => <PetCard key={pet.id} pet={pet} />)
          ) : (
            <div className="col-span-4 py-20 text-gray-400 text-xl">Không có thú cưng nào thuộc danh mục này.</div>
          )}
        </div>

        <Pagination totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage} />
      </section>
    </div>
  );
}