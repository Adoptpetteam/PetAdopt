import Banner from "../assets/images/Banner.png";
import Pagination from "../components/Pagination";
import PetCard from "../components/PetCard";
import { useState, useEffect } from "react";
import { useListCategory } from "../hook/huyHook";
import { listPets } from "../api/petApi";

export default function Pets() {
  const [currentPage, setCurrentPage] = useState(1);
  const petsPerPage = 12;
  const [category, setCategory] = useState("all");

  // 2. Lấy danh sách danh mục từ database
  const { data: categoriesData } = useListCategory();

  const [searchTerm, setSearchTerm] = useState("");
  const [gender, setGender] = useState("all");
  const [loading, setLoading] = useState(true);
  const [allPets, setAllPets] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    listPets({ limit: 100, species: category !== "all" ? category : undefined })
      .then(res => setAllPets(res.data || []))
      .catch(() => setAllPets([]))
      .finally(() => setLoading(false));
  }, [category]);

  // 3. Logic Filter động
  const filteredPets = allPets.filter((pet) => {
    const matchSearch = searchTerm === "" || pet.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchGender = gender === "all" || pet.gender?.toLowerCase() === gender.toLowerCase();

    return matchSearch && matchGender;
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

        <div className="mb-20">
          {/* ================= NÚT DANH MỤC ĐỘNG ================= */}
          <div className="flex justify-center flex-wrap gap-6 mb-10">
            <button
              onClick={() => { setCategory("all"); setCurrentPage(1); }}
              className={`px-8 py-3 rounded-full transition ${category === "all" ? "bg-[#6272B6] text-white" : "bg-[#DDEDFF]"}`}
            >
              Tất cả
            </button>

            {/* Map danh mục từ Admin */}
            {categoriesData?.map((cat: any) => (
              <button
                key={cat.id || cat._id}
                onClick={() => { setCategory(cat.name); setCurrentPage(1); }}
                className={`px-8 py-3 rounded-full transition ${category === cat.name ? "bg-[#6272B6] text-white" : "bg-[#DDEDFF]"}`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Filter fields giữ nguyên logic select của bạn */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <select value={gender} onChange={(e) => { setGender(e.target.value); setCurrentPage(1); }} className="h-12 bg-[#DDEDFF] rounded-full px-6 outline-none">
              <option value="all">Giới tính</option>
              <option value="Male">Đực</option>
              <option value="Female">Cái</option>
            </select>
            <input
              type="text"
              placeholder="Tên, Code, Chip"
              className="h-12 bg-[#DDEDFF] rounded-full px-6 outline-none"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
            <button className="h-12 rounded-full bg-[#6272B6] text-white font-medium">Tìm kiếm</button>
          </div>
        </div>

        {/* HIỂN THỊ DANH SÁCH */}
        <div className="grid grid-cols-4 gap-y-16 gap-x-10 justify-items-center mb-20">
          {loading ? (
            <div className="col-span-4 py-20 text-gray-400 text-xl text-center w-full">Đang tải...</div>
          ) : currentPets.length > 0 ? (
            currentPets.map((pet) => <PetCard key={pet._id} pet={pet} />)
          ) : (
            <div className="col-span-4 py-20 text-gray-400 text-xl">Không có thú cưng nào thuộc danh mục này.</div>
          )}
        </div>

        <Pagination totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage} />
      </section>
    </div>
  );
}