import Banner from "../assets/images/Banner.png"
import pic1 from "../assets/images/pic1.png"
import pic2 from "../assets/images/pic2.png"
import pic3 from "../assets/images/pic3.png"
import PetCard from "../components/PetCard"
import { listPets } from "../api/petApi"
import { useEffect, useState, useRef } from "react"

export default function Home() {
  const [pets, setPets] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Danh sách ảnh chạy trong Slideshow (Bạn hãy thay thế bằng các ảnh Banner khác)
  const bannerImages = [Banner, pic1, pic2, pic3]

  useEffect(() => {
    listPets({ limit: 8 })
      .then(res => setPets(res.data || []))
      .catch(() => setPets([]))
  }, [])

  // Hàm dọn dẹp timeout cũ tránh chạy loạn nhịp
  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  // Fix slide show
  useEffect(() => {
  const interval = setInterval(() => {
    setCurrentIndex((prev) =>
      prev === bannerImages.length - 1 ? 0 : prev + 1
    )
  }, 4000)

  return () => clearInterval(interval)
}, [bannerImages.length])


  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === bannerImages.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? bannerImages.length - 1 : prev - 1))
  }

  return (
    <div className="w-full">
      {/* Section 1 - Custom Slideshow Banner */}
      <section className="w-full px-[130px] pt-8">
        <div className="relative w-full aspect-[1140/380] rounded-[2rem] overflow-hidden group shadow-md bg-gray-100">
          
          {/* Track chứa các Slide */}
          <div 
            className="flex w-full h-full transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {bannerImages.map((img, index) => (
              <div key={index} className="w-full h-full shrink-0">
                <img 
                  src={img} 
                  className="w-full h-full object-cover"
                  alt={`T1 Pet Adopt Banner ${index + 1}`}
                />
              </div>
            ))}
          </div>

          {/* Nút chuyển đổi Trái - Phải (Ẩn mặc định, hover vào banner mới hiện) */}
          <button 
            onClick={prevSlide}
            className="absolute left-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 hover:bg-[#6272B6] hover:text-white text-[#6272B6] flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 font-bold"
          >
            &#10094;
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 hover:bg-[#6272B6] hover:text-white text-[#6272B6] flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 font-bold"
          >
            &#10095;
          </button>

          {/* Các dấu chấm phân trang (Pagination dots) */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {bannerImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  currentIndex === index ? "w-7 bg-[#6272B6]" : "w-2.5 bg-white/60 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Bao bọc các phần nội dung còn lại */}
      <div className="w-full px-[130px]">
        {/* Section 2 */} 
        <section className="w-full bg-white py-20">
          <div className="flex justify-between items-center">
            {/* LEFT - 60% */}
            <div className="w-[60%] text-left">
              <h2 className="text-[32px] font-bold text-[#6272B6] mb-6">
                Nhận nuôi thú cưng - T1 Pet Adopt
              </h2>

              <p className="text-gray-700 leading-7 mb-8">
                T1 Pet Adopt là một dự án/đơn vị hoạt động trong lĩnh vực hỗ trợ nhận nuôi thú cưng, 
                hướng đến việc kết nối những thú cưng bị bỏ rơi hoặc cần tìm mái ấm mới với những người yêu động vật.
                T1 Pet Adopt thường chia sẻ thông tin về thú cưng cần nhận nuôi, hỗ trợ tư vấn chăm sóc, 
                cũng như lan tỏa thông điệp nuôi thú cưng có trách nhiệm. Bên cạnh đó, đơn vị còn góp phần 
                nâng cao nhận thức cộng đồng về bảo vệ động vật và hạn chế tình trạng bỏ rơi thú cưng.
              </p>

              <button className="bg-[#6272B6] text-white px-6 py-3 rounded-lg hover:bg-[#4f5fa3] transition">
                Về chúng tôi
              </button>
            </div>

            {/* RIGHT - 40% (Đã được chuẩn hóa thuộc tính clipPath viết chuẩn React) */}
            <div className="w-[40%] flex justify-end">
              <svg xmlns="http://www.w3.org/2000/svg" width="379" height="371" viewBox="0 0 379 371" fill="none">
                <g clipPath="url(#clip0_33_111)">
                  <path d="M321.812 284.032C317.141 272.704 308.952 264.611 300.543 258.45C292.134 252.288 282.931 247.814 274.857 240.838C244.271 214.424 235.895 165.516 189.496 165.516C143.098 165.516 134.688 214.416 104.135 240.838C96.0529 247.814 86.9564 252.297 78.4898 258.45C70.0232 264.603 61.8511 272.704 57.2211 284.032C51.8876 296.966 51.9367 312.818 55.945 325.801C59.6701 337.765 66.7689 348.411 76.3957 356.469C95.7011 372.769 121.322 375.564 143.662 363.869C158.975 355.857 173.585 341.261 189.553 341.758C205.513 341.261 220.131 355.857 235.445 363.869C257.785 375.564 283.397 372.744 302.711 356.469C312.341 348.413 319.44 337.767 323.162 325.801C327.096 312.818 327.137 296.966 321.812 284.032ZM197.423 263.658H180.784V307.251H165.438V263.641H148.783V251.156H197.423V263.658ZM230.201 307.251H214.986V264.399H214.642L202.298 272.549V259.583L215.141 251.156H230.168L230.201 307.251Z" fill="#6272B6"/>
                  <path d="M134.525 141.857C159.646 139.526 175.892 115.778 175.426 88.6221C174.845 54.5392 159.515 0.431935 130.811 -9.68412e-06C105.567 -0.374905 80.0931 50.3664 83.2998 84.6205C86.3265 117.041 109.403 144.188 134.525 141.857Z" fill="#6272B6"/>
                  <path d="M83.5534 158.923C77.8272 129.16 55.9859 84.1396 30.8152 88.1575C8.64671 91.6864 -5.81601 140.015 2.2661 169.518C9.92283 197.448 34.3573 217.676 55.9532 211.792C77.5491 205.907 88.1589 182.631 83.5534 158.923Z" fill="#6272B6"/>
                  <path d="M244.475 141.857C269.589 144.188 292.665 117.041 295.7 84.6205C298.899 50.3664 273.434 -0.374905 248.181 -9.68412e-06C219.55 0.431935 204.155 54.5392 203.566 88.6221C203.1 115.794 219.354 139.526 244.475 141.857Z" fill="#6272B6"/>
                  <path d="M348.185 88.1493C323.014 84.1314 301.214 129.152 295.439 158.915C290.841 182.631 301.402 205.899 323.039 211.792C344.676 217.684 369.069 197.448 376.726 169.518C384.816 140.015 370.345 91.6864 348.185 88.1493Z" fill="#6272B6"/>
                </g>
                <defs>
                  <clipPath id="clip0_33_111">
                    <rect width="379" height="371" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
            </div>
          </div>
        </section>

        {/* Section 3 */} 
        <section className="py-20 bg-white">
          <div className="flex justify-between gap-6">
            {/* CARD 1 */}
            <div className="flex-1 h-[440px] bg-[#F1F3FF] rounded-[20px] flex flex-col items-center justify-center text-center p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
              <div className="w-[180px] h-[180px] rounded-full overflow-hidden mb-6">
                <img src={pic1} className="w-full h-full object-cover" alt="Ung ho"/>
              </div>
              <h3 className="text-[#6272B6] text-xl font-semibold mb-4">
                ỦNG HỘ
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-5">
                Giúp duy trì hoạt động của TPA thông qua hình thức quyên góp tiền hoặc ủng hộ.
              </p>
              <a href="/donate" className="text-[#6272B6] font-medium hover:underline hover:text-[#4e5fa8] transition">
                Tìm hiểu thêm
              </a>
            </div>

            {/* CARD 2 */}
            <div className="flex-1 h-[440px] bg-[#F1F3FF] rounded-[20px] flex flex-col items-center justify-center text-center p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
              <div className="w-[180px] h-[180px] rounded-full overflow-hidden mb-6">
                <img src={pic2} className="w-full h-full object-cover" alt="Tinh nguyen"/>
              </div>
              <h3 className="text-[#6272B6] text-xl font-semibold mb-4">
                TÌNH NGUYỆN
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-5">
                Tham gia cùng chúng tôi để chăm sóc và hỗ trợ thú cưng tìm mái ấm mới.
              </p>
              <a href="/volunteer" className="text-[#6272B6] font-medium hover:underline hover:text-[#4e5fa8] transition">
                Tìm hiểu thêm
              </a>
            </div>

            {/* CARD 3 */}
            <div className="flex-1 h-[440px] bg-[#F1F3FF] rounded-[20px] flex flex-col items-center justify-center text-center p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
              <div className="w-[180px] h-[180px] rounded-full overflow-hidden mb-6">
                <img src={pic3} className="w-full h-full object-cover" alt="Nhan nuoi"/>
              </div>
              <h3 className="text-[#6272B6] text-xl font-semibold mb-4">
                NHẬN NUÔI
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-5">
                Kết nối những thú cưng cần mái ấm với những người yêu động vật.
              </p>
              <a href="/adopt" className="text-[#6272B6] font-medium hover:underline hover:text-[#4e5fa8] transition">
                Tìm hiểu thêm
              </a>
            </div>
          </div>
        </section>

        {/* Section 4 - Pet Adoption */}
        <section className="py-24 bg-white">
          {/* ===== TOP ===== */}
          <div className="text-center mb-16">
            <h2 className="text-[#6272B6] text-3xl font-bold uppercase tracking-wide">
              Bé ngoan trong tuần
            </h2>
          </div>

          {/* ===== MIDDLE ===== */}
          <div className="w-full mb-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {pets && pets.length > 0 ? (
                pets.map((pet) => (
                  <PetCard key={pet._id} pet={pet} />
                ))
              ) : (
                <div className="col-span-4 text-center py-10 text-gray-400">
                  Chưa có dữ liệu thú cưng tuần này.
                </div>
              )}
            </div>
          </div>

          {/* ===== BOTTOM ===== */}
          <div className="text-center">
            <a href="/adopt">
              <button className="bg-[#6272B6] text-white px-10 py-3 rounded-full font-medium transition duration-300 hover:bg-[#4e5fa8] shadow-md hover:shadow-lg">
                Nhận nuôi ngay
              </button>
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}