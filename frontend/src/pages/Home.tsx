import { useState } from "react"
import Banner from "../assets/images/Banner.png"
import pic1 from "../assets/images/pic1.png"
import pic2 from "../assets/images/pic2.png"
import pic3 from "../assets/images/pic3.png"
import PetCard from "../components/PetCard"
import ShoppingChatBot from "../components/ShoppingChatBot"
import { pets } from "../data/pet"


export default function Home() {
  const [chatOpen, setChatOpen] = useState(false)

  return (
<div className="w-full px-[130px] relative">
{/* Section 1 - Banner */}
  <section>
    <div>
      {/* Banner content */}
      <img src={Banner} className="w-full"/>
    </div>
  </section>

{/* Section 2*/} 
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

    {/* RIGHT - 40% */}
    <div className="w-[40%] flex justify-end">
      <svg xmlns="http://www.w3.org/2000/svg" width="379" height="371" viewBox="0 0 379 371" fill="none">
<g clip-path="url(#clip0_33_111)">
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

{/* Section 3*/} 
<section className="py-20 bg-white">
  <div className="flex justify-between">

    {/* CARD 1 */}
    <div className="w-[380px] h-[440px] bg-[#F1F3FF] rounded-[20px] flex flex-col items-center justify-center text-center p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
      
      {/* Image */}
      <div className="w-[180px] h-[180px] rounded-full overflow-hidden mb-6">
        {/* <img 
          src="/images/pet1.png" 
          alt="Pet" 
          className="w-full h-full object-cover"
        /> */}

        <img src={pic1}/>
      </div>

      {/* Title */}
      <h3 className="text-[#6272B6] text-xl font-semibold mb-4">
        ỦNG HỘ
      </h3>

      {/* Text */}
      <p className="text-gray-600 text-sm leading-relaxed mb-5">
        Giúp duy trì hoạt động của TPA thông qua hình thức quyên góp tiền hoặc ủng hộ.
      </p>

      {/* Link */}
      <a 
        href="#" 
        className="text-[#6272B6] font-medium hover:underline hover:text-[#4e5fa8] transition"
      >
        Tìm hiểu thêm
      </a>

    </div>


    {/* CARD 2 */}
    <div className="w-[380px] h-[440px] bg-[#F1F3FF] rounded-[20px] flex flex-col items-center justify-center text-center p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
      
      <div className="w-[180px] h-[180px] rounded-full overflow-hidden mb-6">
        <img src={pic2}/>
      </div>

      <h3 className="text-[#6272B6] text-xl font-semibold mb-4">
        TÌNH NGUYỆN
      </h3>

      <p className="text-gray-600 text-sm leading-relaxed mb-5">
        Tham gia cùng chúng tôi để chăm sóc và hỗ trợ thú cưng tìm mái ấm mới.
      </p>

      <a 
        href="#" 
        className="text-[#6272B6] font-medium hover:underline hover:text-[#4e5fa8] transition"
      >
        Tìm hiểu thêm
      </a>

    </div>


    {/* CARD 3 */}
    <div className="w-[380px] h-[440px] bg-[#F1F3FF] rounded-[20px] flex flex-col items-center justify-center text-center p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
      
      <div className="w-[180px] h-[180px] rounded-full overflow-hidden mb-6">
        <img src={pic3}/>
      </div>

      <h3 className="text-[#6272B6] text-xl font-semibold mb-4">
        NHẬN NUÔI
      </h3>

      <p className="text-gray-600 text-sm leading-relaxed mb-5">
        Kết nối những thú cưng cần mái ấm với những người yêu động vật.
      </p>

      <a 
        href="#" 
        className="text-[#6272B6] font-medium hover:underline hover:text-[#4e5fa8] transition"
      >
        Tìm hiểu thêm
      </a>

    </div>

  </div>
</section>


<section className="py-24 bg-white">

  {/* ===== TOP ===== */}
  <div className="text-center mb-16">
    <h2 className="text-[#6272B6] text-3xl font-bold">
      BÉ NGOAN TRONG TUẦN
    </h2>
  </div>

  {/* ===== MIDDLE ===== */}
  <div className="flex justify-between mb-16">

 <div className="container mx-auto py-10">

      <h1 className="text-3xl font-bold mb-8">
        Pet Adoption
      </h1>

      <div className="grid grid-cols-4 gap-6">

        {pets.map((pet) => (
          <PetCard key={pet.id} pet={pet} />
        ))}

      </div>

    </div>



  </div>

  {/* ===== BOTTOM ===== */}
  <div className="text-center">
    <button className="bg-[#6272B6] text-white px-10 py-3 rounded-full font-medium transition duration-300 hover:bg-[#4e5fa8]">
      Nhận nuôi
    </button>
  </div>

</section>

  {/* Trợ lý mua hàng — nút nổi + khung chat đầy đủ */}
  {chatOpen && (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-end sm:items-end sm:justify-end p-4 sm:p-6 bg-black/25 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Trợ lý mua hàng"
      onClick={() => setChatOpen(false)}
    >
      <div
        className="w-full max-w-[400px] h-[min(580px,calc(100vh-7rem))] flex flex-col rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/10"
        onClick={(e) => e.stopPropagation()}
      >
        <ShoppingChatBot variant="widget" onClose={() => setChatOpen(false)} />
      </div>
    </div>
  )}

  <button
    type="button"
    onClick={() => setChatOpen(true)}
    className="fixed bottom-6 right-6 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#6272B6] to-[#4f5fa3] text-white shadow-lg shadow-[#6272B6]/40 ring-2 ring-white hover:scale-105 hover:shadow-xl hover:shadow-[#6272B6]/50 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-[#6272B6]/35"
    aria-label="Mở trợ lý mua hàng"
    aria-expanded={chatOpen}
  >
    <span className="relative flex h-9 w-9 items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#4f5fa3]" />
    </span>
  </button>

</div>
  )
}