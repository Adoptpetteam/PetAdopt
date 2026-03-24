
import Banner from "../assets/images/Banner.png"
import Pagination from "../components/Pagination"
import PetCard from "../components/PetCard"
import { useEffect, useMemo, useState } from "react"
import { listPets, type PetEntity } from "../api/petApi"

export default function Pets() {

  const [currentPage, setCurrentPage] = useState(1)
  const petsPerPage = 12
  const [category, setCategory] = useState("all")
  const [pets, setPets] = useState<PetEntity[]>([])

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await listPets({ limit: 100, status: "available" })
        setPets(response.data ?? [])
      } catch (error) {
        console.error("Load pets failed:", error)
      }
    }

    fetchPets()
  }, [])

  // Filter
  const filteredPets = useMemo(() => {
    if (category === "all") {
      return pets
    }

    if (category === "other") {
      return pets.filter((pet) => !["dog", "cat"].includes(pet.species))
    }

    return pets.filter((pet) => pet.species === category)
  }, [category, pets])

  // Math
  // const startIndex = (currentPage - 1) * petsPerPage
  // const currentPets = pets.slice(startIndex, startIndex + petsPerPage)
  // const totalPages = Math.ceil(pets.length / petsPerPage)

  const startIndex = (currentPage - 1) * petsPerPage
  const currentPets = filteredPets.slice(startIndex, startIndex + petsPerPage)
  const totalPages = Math.ceil(filteredPets.length / petsPerPage)

  const displayPets = currentPets.map((pet) => ({
    id: pet._id,
    name: pet.name,
    age: pet.age ?? 0,
    gender: pet.gender ?? "unknown",
    image: pet.images?.[0] || "/images/Jack.png",
  }))



  return (
<div className="w-full px-[130px]">
{/* Section 1 - Banner */}
  <section>
    <div>
      {/* Banner content */}
      <img src={Banner} className="w-full"/>
    </div>
  </section>

{/* Section 2*/}
<section className="py-10 bg-white">
  <div className="max-w-[900px]">

    {/* TITLE */}
    <h2 className="text-3xl font-bold text-[#6272B6]">
      Quy trình nhận nuôi thú cưng
    </h2>

    {/* INTRO */}
    <p className="text-gray-700 leading-7 mt-4">
      Trước khi quyết định nhận nuôi bé chó hay mèo nào, bạn hãy tự hỏi bản thân rằng mình đã sẵn sàng để chịu trách nhiệm cả đời cho bé chưa, cả về tài chính, nơi ở cũng như tinh thần. Việc nhận nuôi cần được sự đồng thuận lớn từ bản thân bạn cũng như gia đình và những người liên quan. Xin cân nhắc kỹ trước khi liên hệ với HPA về việc nhận nuôi.
      <br /><br />
      Bạn đã sẵn sàng? Hãy thực hiện các bước sau đây nhé:
    </p>

    {/* STEPS */}
    <ol className="mt-4">
      <li className="leading-7">
        <span className="text-[#6272B6] font-semibold">1.</span> Tìm hiểu về thú cưng bạn muốn nhận nuôi trên trang web của HPA.
      </li>
      <li className="leading-7">
        <span className="text-[#6272B6] font-semibold">2.</span> Liên hệ với Tình nguyện viên phụ trách bé để tìm hiểu thêm về bé.
      </li>
      <li className="leading-7">
        <span className="text-[#6272B6] font-semibold">3.</span> Tham gia phỏng vấn nhận nuôi.
      </li>
      <li className="leading-7">
        <span className="text-[#6272B6] font-semibold">4.</span> Chuẩn bị cơ sở vật chất, ký giấy tờ nhận nuôi và đóng tiền vía để đón bé về.
      </li>
      <li className="leading-7">
        <span className="text-[#6272B6] font-semibold">5.</span> Thường xuyên cập nhật về tình hình của bé, đặc biệt là khi có sự cố để được tư vấn kịp thời.
      </li>
    </ol>

    {/* NOTE */}
    <h3 className="text-xl font-semibold text-[#6272B6] mt-6">
      Lưu ý:
    </h3>

    <ul className="list-disc pl-6 text-gray-700 leading-7 mt-3">
      <li>Chỉ inbox 01 Tình nguyện viên phỏng vấn...</li>
      <li>Phần phỏng vấn có thể có nhiều câu hỏi...</li>
      <li>Tiền vía mỗi bé sẽ khác nhau...</li>
      <li>Tiền vía dùng để trả các khoản chi...</li>
      <li>Trường hợp không nuôi được tiếp...</li>
    </ul>

    {/* FINAL */}
    <p className="text-gray-700 leading-7 mt-4">
      Nếu bạn chỉ có thể chăm sóc tạm thời (foster), tham khảo thông tin tại mục Tình nguyện.
      <br /><br />
      Tìm hiểu thêm về chương trình Nhận nuôi Ảo ở banner cuối trang này.
    </p>

  </div>
</section>

<section
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "80px 0",
  }}
>
  {/* Top */}
  <h2
    style={{
      marginBottom: 60,
      fontSize: 32,
      fontWeight: 700,
    }}
    className="text-[#6272B6]"
  >
    ĐIỀU KIỆN NHẬN NUÔI
  </h2>

  {/* Bottom - 3 items */}
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      gap: 100,
    }}
  >
    {/* Item 1 */}
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          backgroundColor: "#6272B6",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 40,
          fontWeight: 600,
        }}
      >
        1
      </div>

      <p style={{ fontSize: 18 }}>
        Tài chính tự chủ và ổn định
      </p>
    </div>

    {/* Item 2 */}
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          backgroundColor: "#6272B6",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 40,
          fontWeight: 600,
        }}
      >
        2
      </div>

      <p style={{ fontSize: 18 }}>
        Cam kết chăm sóc lâu dài
      </p>
    </div>

    {/* Item 3 */}
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          backgroundColor: "#6272B6",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 40,
          fontWeight: 600,
        }}
      >
        3
      </div>

      <p style={{ fontSize: 18 }}>
        Yêu thương và bảo vệ thú cưng
      </p>
    </div>
  </div>
</section>


<section className="w-full bg-white py-20">
  <div>

    {/* ================= TITLE ================= */}
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold text-[#6272B6] tracking-wide">
        TÌM THÚ CƯNG
      </h2>
    </div>

    {/* ================= FILTER ================= */}
    <div className="mb-20">

      {/* Category Buttons */}
      <div className="flex justify-center gap-6 mb-10">
        <button
          onClick={() => setCategory("all")}
          className="px-8 py-3 rounded-full bg-[#6272B6] text-white"
        >
          Tất cả
        </button>

        <button
          onClick={() => setCategory("dog")}
          className="px-8 py-3 rounded-full bg-[#DDEDFF]"
        >
          Chó
        </button>

        <button
          onClick={() => setCategory("cat")}
          className="px-8 py-3 rounded-full bg-[#DDEDFF]"
        >
          Mèo
        </button>

        <button
          onClick={() => setCategory("other")}
          className="px-8 py-3 rounded-full bg-[#DDEDFF]"
        >
          Thú cưng khác
        </button>
      </div>

      {/* Filter Fields */}
      <div className="grid grid-cols-3 gap-6 mb-6">

        <select className="h-12 bg-[#DDEDFF] rounded-full px-6 outline-none text-gray-700">
          <option>Giới tính</option>
        </select>

        <select className="h-12 bg-[#DDEDFF] rounded-full px-6 outline-none text-gray-700">
          <option>Độ tuổi</option>
        </select>

        <select className="h-12 bg-[#DDEDFF] rounded-full px-6 outline-none text-gray-700">
          <option>Triệt sản</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <select className="h-12 bg-[#DDEDFF] rounded-full px-6 outline-none text-gray-700">
          <option>Màu</option>
        </select>

        <input
          type="text"
          placeholder="Tên, Code, Chip"
          className="h-12 bg-[#DDEDFF] rounded-full px-6 outline-none"
        />

        <button className="h-12 rounded-full bg-[#6272B6] text-white font-medium hover:opacity-90 transition">
          Tìm kiếm
        </button>
      </div>
    </div>

    {/* ================= PET GRID ================= */}

 
  {/* CARD */}
<div className="grid grid-cols-4 gap-y-16 gap-x-10 justify-items-center mb-20">

  {displayPets.map((pet) => (
    <PetCard key={pet.id} pet={pet} />
  ))}

</div>

    
 
<Pagination
  totalPages={totalPages}
  currentPage={currentPage}
  onPageChange={setCurrentPage}
/>

  </div>
</section>

</div>
  )
}