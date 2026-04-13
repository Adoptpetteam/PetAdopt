import { useState } from "react";
import Banner from "../assets/images/Banner.png";
import Pagination from "../components/Pagination";
import PetCard from "../components/PetCard";
import { useListPet, useListCategory } from "../hook/huyHook";

const getCategoryName = (category: any) => {
  if (!category) return "";
  if (typeof category === "string") return category;
  return category.name || "";
};

export default function Pets() {
  const [currentPage, setCurrentPage] = useState(1);
  const petsPerPage = 12;
  const [category, setCategory] = useState("all");

  const { data: pets = [], isLoading } = useListPet({ resource: "pets" });
  const { data: categoriesData = [] } = useListCategory({ resource: "category" });

  const [searchTerm, setSearchTerm] = useState("");
  const [gender, setGender] = useState("all");
  const [ageRange, setAgeRange] = useState("all");
  const [sterilized, setSterilized] = useState("all");
  const [color, setColor] = useState("all");

  const filteredPets = pets.filter((pet: any) => {
    const petName = pet?.name?.toLowerCase?.() || "";
    const petColor = pet?.color || "";
    const petCategoryName = getCategoryName(pet?.category).toLowerCase();

    const matchCategory =
      category === "all" || petCategoryName === category.toLowerCase();

    const matchSearch = petName.includes(searchTerm.toLowerCase());

    const matchGender = gender === "all" || pet?.gender === gender;

    const matchAge =
      ageRange === "all" ||
      (ageRange === "baby" && Number(pet?.age) <= 1) ||
      (ageRange === "young" && Number(pet?.age) > 1 && Number(pet?.age) <= 3) ||
      (ageRange === "adult" && Number(pet?.age) > 3);

    const matchSterilized =
      sterilized === "all" ||
      (sterilized === "yes" && pet?.sterilized) ||
      (sterilized === "no" && !pet?.sterilized);

    const matchColor = color === "all" || petColor === color;

    return (
      matchCategory &&
      matchSearch &&
      matchGender &&
      matchAge &&
      matchSterilized &&
      matchColor
    );
  });

  const startIndex = (currentPage - 1) * petsPerPage;
  const currentPets = filteredPets.slice(startIndex, startIndex + petsPerPage);
  const totalPages = Math.ceil(filteredPets.length / petsPerPage);

  if (isLoading) {
    return <div className="text-center py-20">Đang tải thú cưng...</div>;
  }

  return (
    <div className="w-full px-[130px]">
      <section>
        <img src={Banner} className="w-full" alt="banner" />
      </section>

      <section className="w-full bg-white py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#6272B6]">TÌM THÚ CƯNG</h2>
        </div>

        <div className="mb-20">
          <div className="flex justify-center flex-wrap gap-6 mb-10">
            <button
              onClick={() => {
                setCategory("all");
                setCurrentPage(1);
              }}
              className={`px-8 py-3 rounded-full transition ${
                category === "all"
                  ? "bg-[#6272B6] text-white"
                  : "bg-[#DDEDFF]"
              }`}
            >
              Tất cả
            </button>

            {categoriesData.map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => {
                  setCategory(cat.name);
                  setCurrentPage(1);
                }}
                className={`px-8 py-3 rounded-full transition ${
                  category === cat.name
                    ? "bg-[#6272B6] text-white"
                    : "bg-[#DDEDFF]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6 mb-6">
            <select
              value={gender}
              onChange={(e) => {
                setGender(e.target.value);
                setCurrentPage(1);
              }}
              className="h-12 bg-[#DDEDFF] rounded-full px-6 outline-none"
            >
              <option value="all">Giới tính</option>
              <option value="male">Đực</option>
              <option value="female">Cái</option>
            </select>

            <input
              type="text"
              placeholder="Tên, Code, Chip"
              className="h-12 bg-[#DDEDFF] rounded-full px-6 outline-none"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />

            <button className="h-12 rounded-full bg-[#6272B6] text-white font-medium">
              Tìm kiếm
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-y-16 gap-x-10 justify-items-center mb-20">
          {currentPets.length > 0 ? (
            currentPets.map((pet: any) => <PetCard key={pet.id} pet={pet} />)
          ) : (
            <div className="col-span-4 py-20 text-gray-400 text-xl">
              Không có thú cưng nào thuộc danh mục này.
            </div>
          )}
        </div>

        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </section>
    </div>
  );
}