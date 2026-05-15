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

  // 2. Lấy danh sách danh mục PET từ database
  const { data: categoriesData } = useListCategory({ resource: "category?type=pet" });

  const [searchTerm, setSearchTerm] = useState("");
  const [gender, setGender] = useState("all");
  const [loading, setLoading] = useState(true);
  const [allPets, setAllPets] = useState<any[]>([]);

  // Map category name to species
  const getSpeciesFromCategory = (catName: string) => {
    const mapping: { [key: string]: string } = {
      "Chó": "dog",
      "Mèo": "cat",
      "Chim": "bird"
    };
    return mapping[catName] || catName;
  };

  useEffect(() => {
    setLoading(true);
    const species = category !== "all" ? getSpeciesFromCategory(category) : undefined;
    listPets({ limit: 100, species })
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
    <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 min-h-screen">
      {/* Banner Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#6272B6]/20 to-purple-600/20"></div>
        <img src={Banner} className="w-full h-[400px] object-cover" alt="banner" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">🐾 Tìm Người Bạn Đồng Hành</h1>
            <p className="text-xl drop-shadow-md">Mang tình yêu thương về nhà cùng những chú thú cưng đáng yêu</p>
          </div>
        </div>
      </section>

      <section className="px-4 md:px-[130px] py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="relative inline-block">
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6272B6] to-purple-600 mb-4">
              🔍 TÌM THÚ CƯNG
            </h2>
            <div className="absolute -inset-1 bg-gradient-to-r from-[#6272B6] to-purple-600 rounded-lg blur opacity-25"></div>
          </div>
          <p className="text-gray-600 text-lg">Khám phá những người bạn bốn chân đang chờ đợi một mái ấm</p>
        </div>

        {/* Category Buttons */}
        <div className="mb-12">
          <div className="flex justify-center flex-wrap gap-4 mb-8">
            <button
              onClick={() => { setCategory("all"); setCurrentPage(1); }}
              className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                category === "all" 
                  ? "bg-gradient-to-r from-[#6272B6] to-purple-600 text-white shadow-lg" 
                  : "bg-white text-gray-700 hover:bg-gray-50 shadow-md border border-gray-200"
              }`}
            >
               Tất cả.
            </button>

            {categoriesData?.map((cat: any) => (
              <button
                key={cat.id || cat._id}
                onClick={() => { setCategory(cat.name); setCurrentPage(1); }}
                className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                  category === cat.name 
                    ? "bg-gradient-to-r from-[#6272B6] to-purple-600 text-white shadow-lg" 
                    : "bg-white text-gray-700 hover:bg-gray-50 shadow-md border border-gray-200"
                }`}
              >
                {cat.name === "Chó" ? "🐕" : cat.name === "Mèo" ? "🐱" : cat.name === "Chim" ? "🐦" : "🐾"} {cat.name}
              </button>
            ))}
          </div>

          {/* Filter Section */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative">
                  <select 
                    value={gender} 
                    onChange={(e) => { setGender(e.target.value); setCurrentPage(1); }} 
                    className="w-full h-14 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl px-6 outline-none border-2 border-transparent focus:border-[#6272B6] transition-all duration-300 appearance-none cursor-pointer"
                  >
                    <option value="all"> Tất cả giới tính</option>
                    <option value="Male"> Đực</option>
                    <option value="Female"> Cái</option>
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="🔍 Tìm theo tên, mã, chip..."
                  className="w-full h-14 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl px-6 outline-none border-2 border-transparent focus:border-[#6272B6] transition-all duration-300"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />

                <button className="h-14 rounded-2xl bg-gradient-to-r from-[#6272B6] to-purple-600 text-white font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                  🔍 Tìm kiếm.
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="mb-16">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin w-16 h-16 border-4 border-[#6272B6] border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500 text-lg">Đang tìm kiếm những người bạn đáng yêu...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Results Count */}
              <div className="text-center mb-8">
                <p className="text-gray-600">
                  Tìm thấy <span className="font-bold text-[#6272B6]">{filteredPets.length}</span> thú cưng
                  {category !== "all" && <span> trong danh mục <span className="font-bold text-[#6272B6]">{category}</span></span>}
                </p>
              </div>

              {/* Pet Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
                {currentPets.length > 0 ? (
                  currentPets.map((pet) => (
                    <div key={pet._id} className="transform hover:scale-105 transition-all duration-300">
                      <PetCard pet={pet} />
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-20">
                    <div className="text-6xl mb-4">😿</div>
                    <h3 className="text-2xl font-bold text-gray-600 mb-2">Không tìm thấy thú cưng nào</h3>
                    <p className="text-gray-500 mb-6">Hãy thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
                    <button 
                      onClick={() => {
                        setCategory("all");
                        setGender("all");
                        setSearchTerm("");
                        setCurrentPage(1);
                      }}
                      className="px-8 py-3 bg-gradient-to-r from-[#6272B6] to-purple-600 text-white rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                    >
                      Xóa bộ lọc
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage} />
          </div>
        )}
      </section>
    </div>
  );
}