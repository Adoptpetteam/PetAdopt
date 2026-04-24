import { useState, useEffect } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination, EffectFade, Navigation, Parallax } from "swiper/modules"

// Import Swiper styles
import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation"
import "swiper/css/effect-fade"

import Banner from "../assets/images/Banner.png"
import pic1 from "../assets/images/pic1.png"
import pic2 from "../assets/images/pic2.png"
import pic3 from "../assets/images/pic3.png"
import PetCard from "../components/PetCard"
import ShoppingChatBot from "../components/ShoppingChatBot"
import { pets } from "../data/pet"

export default function Home() {
  const [chatOpen, setChatOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Hiệu ứng đổi màu nhẹ khi cuộn trang
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className={`w-full relative transition-colors duration-500 ${scrolled ? 'bg-[#f8f9ff]' : 'bg-white'} overflow-x-hidden`}>
      <style>{`
        .hero-swiper .swiper-pagination-bullet { width: 10px; height: 10px; background: #fff; opacity: 0.4; transition: 0.3s; }
        .hero-swiper .swiper-pagination-bullet-active { width: 40px; border-radius: 5px; background: #fff !important; opacity: 1; }
        .hero-swiper .swiper-button-next, .hero-swiper .swiper-button-prev { 
            color: white !important; 
            background: rgba(255,255,255,0.1); 
            width: 50px; height: 50px; border-radius: 50%; 
            backdrop-filter: blur(5px);
        }
        .hero-swiper .swiper-button-next:after, .hero-swiper .swiper-button-prev:after { font-size: 18px; font-weight: bold; }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .glass-card { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.3); }
      `}</style>

      {/* --- SECTION 1: HERO BANNER CAO CẤP --- */}
      <section className="w-full h-[600px] lg:h-[750px] relative">
        <Swiper
          modules={[Autoplay, Pagination, EffectFade, Navigation, Parallax]}
          effect="fade"
          parallax={true}
          loop={true}
          speed={1200}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation={true}
          className="hero-swiper w-full h-full"
        >
          {/* Slide 1: Theo mẫu của bạn */}
          <SwiperSlide>
            <div className="relative w-full h-full overflow-hidden">
              <div
className="absolute inset-0 scale-110" 
                data-swiper-parallax="20%"
                style={{ backgroundImage: `url(${Banner})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent flex items-center px-[130px]">
                <div className="max-w-[800px] text-white" data-swiper-parallax="-300">
                  <h1 className="text-[72px] font-bold leading-[1.1] mb-6 drop-shadow-2xl">
                    Tìm Người Bạn <br /> <span className="text-[#A5B4FC]">Đồng Hành</span> Mới
                  </h1>
                  <p className="text-2xl mb-12 opacity-90 max-w-[500px] leading-relaxed">
                    Mỗi bé thú cưng là một câu chuyện tình yêu đang chờ bạn viết tiếp.
                  </p>
                  <div className="flex gap-4">
                    <button className="bg-[#6272B6] hover:bg-[#4e5fa8] text-white px-10 py-5 rounded-full font-bold text-xl transition-all shadow-[0_10px_20px_rgba(98,114,182,0.4)] hover:-translate-y-1">
                      Khám phá ngay
                    </button>
                    <button className="bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 text-white px-10 py-5 rounded-full font-bold text-xl transition-all">
                      Tìm hiểu thêm
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>

          {/* Slide 2: Minimalist & xịn xò */}
          <SwiperSlide>
            <div className="relative w-full h-full bg-[#1e1e2e] flex items-center justify-center overflow-hidden">
                <div className="absolute top-20 left-20 w-64 h-64 bg-[#6272B6]/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
                <div className="text-center z-10" data-swiper-parallax="-500">
                   <h2 className="text-[80px] font-black text-white mb-4 tracking-tighter">LOVE & CARE</h2>
                   <div className="h-1.5 w-32 bg-[#6272B6] mx-auto mb-8 rounded-full" />
                   <p className="text-white/70 text-2xl font-light tracking-[0.2em] uppercase">Mái ấm tình thương cho thú cưng</p>
                </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </section>

      {/* --- SECTION 2: STATS/FEATURES TRÀN VIỀN NHẸ --- */}
      <div className="px-[130px] -mt-16 relative z-20">
        <div className="grid grid-cols-3 gap-8">
            {[
                { title: "2000+", sub: "Bé đã có chủ", icon: "🐾" },
                { title: "150+", sub: "Trạm cứu trợ", icon: "🏠" },
                { title: "24/7", sub: "Hỗ trợ y tế", icon: "🩺" }
            ].map((stat, i) => (
<div key={i} className="glass-card p-8 rounded-[30px] flex items-center gap-6 shadow-xl hover:shadow-[#6272B6]/10 transition-all group cursor-default">
                    <div className="text-5xl group-hover:scale-125 transition-transform">{stat.icon}</div>
                    <div>
                        <h4 className="text-3xl font-black text-[#6272B6]">{stat.title}</h4>
                        <p className="text-gray-500 font-medium uppercase tracking-wider text-sm">{stat.sub}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* --- SECTION 3: DANH SÁCH BÉ NGOAN (LUNG LINH HƠN) --- */}
      <div className="px-[130px] py-32">
        <div className="flex justify-between items-end mb-16">
          <div className="relative">
            <span className="text-[#6272B6] font-bold tracking-[0.3em] uppercase text-sm mb-2 block">Weekly Favorites</span>
            <h2 className="text-5xl font-black italic uppercase text-gray-900 leading-none">Bé Ngoan Trong Tuần</h2>
            <div className="absolute -left-4 top-0 w-1 h-full bg-[#6272B6] rounded-full opacity-50" />
          </div>
          <button className="text-[#6272B6] font-bold border-b-2 border-[#6272B6] pb-1 hover:text-black hover:border-black transition-all">
            Xem tất cả các bé →
          </button>
        </div>

        {/* Lưới PetCard với hiệu ứng hover nâng cao */}
        <div className="grid grid-cols-4 gap-10">
          {pets.map((pet, idx) => (
            <div key={pet.id} className="transition-all duration-500" style={{ transitionDelay: `${idx * 100}ms` }}>
              <div className="relative group overflow-hidden rounded-[40px] bg-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-4">
                <PetCard pet={pet} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- SECTION 4: CALL TO ACTION (CTA) --- */}
      <div className="px-[130px] pb-32">
        <div className="w-full h-[400px] rounded-[50px] bg-[#6272B6] relative overflow-hidden flex items-center p-20 shadow-2xl">
            <div className="absolute right-0 top-0 w-1/2 h-full opacity-20 pointer-events-none">
                {/* Một hình ảnh chó/mèo mờ mờ ở góc */}
                <img src={pic1} alt="" className="w-full h-full object-contain scale-150 animate-float" />
            </div>
            <div className="relative z-10 max-w-[600px]">
                <h2 className="text-white text-5xl font-black mb-6 leading-tight">Sẵn sàng để mở lòng đón một người bạn?</h2>
                <p className="text-white/80 text-xl mb-10">Chúng tôi sẽ đồng hành cùng bạn trong hành trình tìm thấy thành viên mới cho gia đình.</p>
                <div className="flex gap-4">
<button className="bg-white text-[#6272B6] px-10 py-4 rounded-2xl font-black text-lg hover:bg-black hover:text-white transition-all">
                        ĐĂNG KÝ NGAY
                    </button>
                    <button className="border-2 border-white/50 text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-white/10 transition-all">
                        TƯ VẤN THÊM
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* --- CHAT BOT & FLOAT BUTTON --- */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-10 right-10 z-[100] w-20 h-20 bg-white text-[#6272B6] rounded-full shadow-[0_15px_40px_rgba(0,0,0,0.15)] flex items-center justify-center hover:scale-110 hover:bg-[#6272B6] hover:text-white transition-all duration-300 group"
      >
        <svg className="group-hover:rotate-12 transition-transform" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {chatOpen && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-md flex justify-end items-end p-10 animate-in fade-in duration-300" onClick={() => setChatOpen(false)}>
          <div className="w-[450px] h-[700px] bg-white rounded-[40px] overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <ShoppingChatBot variant="widget" onClose={() => setChatOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
} 