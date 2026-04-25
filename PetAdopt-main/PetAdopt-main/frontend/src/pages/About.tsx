export default function About() {
  return (
    <div className="w-full px-[130px] py-20">

      {/* TITLE */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-[#6272B6] mb-4">
          Về Chúng Tôi
        </h1>
        <p className="text-gray-500 max-w-[600px] mx-auto">
          Nơi kết nối những trái tim yêu thương với những người bạn bốn chân đang cần một mái ấm
        </p>
      </div>
      {/* SECTION 1 */}
      <div className="grid grid-cols-2 gap-16 items-center mb-20">
        <img
          src="/images/tải xuống.jpg"
          className="w-full h-[400px] object-cover rounded-2xl"
        />
        <div>
          <h2 className="text-2xl font-bold text-[#6272B6] mb-4">
            Sứ mệnh của chúng tôi
          </h2>
          <p className="text-gray-600 leading-7">
            Chúng tôi mong muốn mang lại một cuộc sống tốt đẹp hơn cho thú cưng bị bỏ rơi,
            giúp chúng tìm được những gia đình yêu thương và trách nhiệm.
          </p>
        </div>
      </div>
      {/* SECTION 2 */}
      <div className="grid grid-cols-2 gap-16 items-center mb-20">
        <div>
          <h2 className="text-2xl font-bold text-[#6272B6] mb-4">
            Chúng tôi làm gì?
          </h2>
          <ul className="text-gray-600 space-y-3">
            <li>🐾 Cứu hộ thú cưng bị bỏ rơi</li>
            <li>🐾 Chăm sóc và điều trị</li>
            <li>🐾 Tìm người nhận nuôi phù hợp</li>
            <li>🐾 Kêu gọi cộng đồng chung tay giúp đỡ</li>
          </ul>
        </div>

        <img
          src="/images/Malley.png"
          className="w-full h-[400px] object-cover rounded-2xl"
        />
      </div>

      {/* SECTION 3 - STATS */}
      <div className="grid grid-cols-3 gap-10 text-center mb-20">
        <div className="bg-white p-8 rounded-2xl shadow">
          <p className="text-3xl font-bold text-[#6272B6]">500+</p>
          <p className="text-gray-500 mt-2">Thú cưng đã được cứu</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow">
          <p className="text-3xl font-bold text-[#6272B6]">300+</p>
          <p className="text-gray-500 mt-2">Đã tìm được nhà mới</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow">
          <p className="text-3xl font-bold text-[#6272B6]">100+</p>
          <p className="text-gray-500 mt-2">Tình nguyện viên</p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#6272B6] mb-4">
          Hãy cùng chúng tôi tạo nên sự khác biệt
        </h2>
        {/* <button className="bg-[#6272B6] text-white px-8 py-3 rounded-full hover:bg-[#4f5fa3] transition">
          Tham gia ngay
        </button> */}
      </div>

    </div>
  )
}