import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { donateApi } from "../api/donateApi";

// Sponsor logos
const SPONSORS = [
  {
    name: "Me-O Việt Nam",
    img: "https://hanoipetadoption.com/admin/user-content/Sponsor/74d2c776-c41d-4be9-aac5-2b54ff8a3817.png",
    desc: "Nhà cung cấp thức ăn dinh dưỡng cho mèo",
  },
  {
    name: "SmartHeart Việt Nam",
    img: "https://hanoipetadoption.com/admin/user-content/Sponsor/20604b71-cead-4041-a6d7-ff66f9604056.jpg",
    desc: "Nhà cung cấp thức ăn dinh dưỡng cho chó",
  },
  {
    name: "Better World Hanoi",
    img: "https://hanoipetadoption.com/admin/user-content/Sponsor/7f7df734-8d0f-4ec5-bff8-a26555d4a7c0.jpg",
    desc: "Shop quà lưu niệm bán đồ gây quỹ cho các nhóm từ thiện",
  },
  {
    name: "IELTS Thầy Jim",
    img: "https://hanoipetadoption.com/admin/user-content/Sponsor/6bf5c6cd-3ab8-4783-8909-4fe711e2c185.jpg",
    desc: "IELTS Thầy Jim",
  },
];

// Donation item icons
const DONATE_ITEMS = [
  {
    name: "Bỉm",
    img: "https://hanoipetadoption.com/admin/user-content/Donate/c3dbc1ed-917a-4378-9288-d9e63084ea0c.png",
  },
  {
    name: "Quần áo",
    img: "https://hanoipetadoption.com/admin/user-content/Donate/7f1c2e8e-886f-453c-becc-a2fc21abc62a.png",
  },
  {
    name: "Thức ăn",
    img: "https://hanoipetadoption.com/admin/user-content/Donate/953e4616-2614-4c17-873b-2c0722ec7929.png",
  },
];

// Pets of the week
const PETS = [
  {
    name: "Elvis",
    img: "/images/c19238f6-66f4-4e75-94a0-c49cda8913f5.jpeg",
    gender: "Đực",
    age: "Trưởng thành",
    vaccinated: "Có",
  },
  {
    name: "Mimi",
    img: "/images/fcbff275-dff6-49a5-93b9-feb639146088.jpg",
    gender: "Cái",
    age: "Trưởng thành",
    vaccinated: "Có",
  },
  {
    name: "Aka",
    img: "/images/f4fbeabe-0cb1-4423-8085-34dd4627ee8e.jpeg",
    gender: "Đực",
    age: "Trưởng thành",
    vaccinated: "Có",
  },
  {
    name: "Nhem",
    img: "/images/94ac553b-cb03-4b48-8cbc-34369cd2fd4d.jpeg",
    gender: "Cái",
    age: "Trưởng thành",
    vaccinated: "Có",
  },
];

const PRESET_AMOUNTS = [50000, 100000, 200000, 500000];

// ============================================================
// DonatePage - VNPay Integration
// ============================================================
export default function DonatePage() {
  const [searchParams] = useSearchParams();
  const [amount, setAmount] = useState<number>(100000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Payment result from VNPay callback
  const status = searchParams.get("status");
  const ref = searchParams.get("ref");
  const code = searchParams.get("code");

  const handlePresetClick = (val: number) => {
    setAmount(val);
    setCustomAmount("");
    setError("");
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setCustomAmount(val);
    if (val) setAmount(Number(val));
    setError("");
  };

  const handleSubmit = async () => {
    const finalAmount = customAmount ? Number(customAmount) : amount;
    if (!finalAmount || finalAmount < 1000) {
      setError("Số tiền ủng hộ tối thiểu là 1,000 VND");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await donateApi.createPayment(finalAmount);
      window.location.href = res.data.paymentUrl;
    } catch {
      setError("Không thể tạo đơn hàng. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  return (
    <div className="font-sans text-gray-800">

      {/* ===== JUMBOTRON ===== */}
      <section
        className="relative flex items-center justify-center h-[450px] bg-cover bg-center"
        style={{ backgroundImage: "url('/images/jumbotron-support.jpeg')" }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white">
          <h1 className="text-5xl font-bold mb-4">Ủng hộ</h1>
          <nav className="text-sm">
            <ol className="flex items-center justify-center gap-2">
              <li><Link to="/" className="hover:underline">Trang chủ</Link></li>
              <li>/</li>
              <li className="text-yellow-300">Ủng hộ</li>
            </ol>
          </nav>
        </div>
      </section>

      {/* ===== MAIN CONTENT ===== */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="lg:w-2/3">
            <h2 className="text-2xl font-bold text-[#6272B6] uppercase mb-4">tôi muốn ủng hộ</h2>
            <hr className="border-[#6272B6] w-20 mb-6" />

            <div className="space-y-4 text-justify leading-relaxed text-gray-700">
              <p>
                Mọi hoạt động cứu hộ của Hanoi Pet Adoption hoàn toàn dựa trên các khoản quyên góp từ cộng đồng.
                Chi phí hàng tháng của nhóm bao gồm tiền thuê nhà, tiền viện phí, thức ăn, điện, nước, thuốc men và đồ dùng,
                bỉm tã, lương hỗ trợ các bạn tnv dọn dẹp... Nhóm rất cần sự giúp đỡ của các bạn để có thể duy trì nhà chung
                cũng như đội cứu hộ. Chỉ cần cố định <strong>50k - 100k hàng tháng</strong> là các bạn đã giúp đỡ được cho nhóm
                và cách bé rất nhiều!
              </p>
              <p>
                Chi phí sẽ được chia đều cho các bé khác còn nằm viện và gây dựng nhà chung. Ngoài ra Nhóm cũng tiếp nhận
                quyên góp bằng hiện vật như quần áo cũ (để lót chuồng), bỉm, găng tay y tế, thức ăn, cát vệ sinh v.v...
              </p>
              <p className="bg-yellow-50 border-l-4 border-yellow-400 px-4 py-3 text-sm font-medium text-yellow-800 rounded">
                <strong>*Lưu ý:</strong> Nhóm không dùng Zalo và <strong>KHÔNG BAO GIỜ</strong> yêu cầu Mạnh Thường Quân
                cung cấp thông tin thẻ hoặc mã OTP.
              </p>

              {/* ===== PAYMENT RESULT ===== */}
              {status === "success" && (
                <div className="bg-white rounded-2xl shadow-lg p-10 border border-gray-100 text-center">
                  <div className="text-7xl mb-6">🎉</div>
                  <h2 className="text-3xl font-bold text-green-600 mb-3">Cảm ơn bạn!</h2>
                  <p className="text-gray-600 mb-2">
                    Đóng góp của bạn đã được ghi nhận thành công.
                  </p>
                  <p className="text-sm text-gray-400 mb-6">
                    Mã giao dịch: <span className="font-mono font-medium text-gray-600">{ref}</span>
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8 text-sm text-green-700">
                    Cảm ơn bạn đã chung tay cứu hộ những bé cưng. Mọi đóng góp đều được ghi nhận!
                  </div>
                  <Link
                    to="/"
                    className="inline-block bg-[#6272B6] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#4a5ab3] transition"
                  >
                    Về trang chủ
                  </Link>
                </div>
              )}

              {status === "failed" && (
                <div className="bg-white rounded-2xl shadow-lg p-10 border border-gray-100 text-center">
                  <div className="text-7xl mb-6">❌</div>
                  <h2 className="text-3xl font-bold text-red-500 mb-3">Thanh toán thất bại</h2>
                  <p className="text-gray-600 mb-6">
                    Rất tiếc, thanh toán của bạn không thành công. Vui lòng thử lại.
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 text-sm text-red-700">
                    Mã lỗi: {code}
                  </div>
                  <button
                    onClick={() => window.location.href = '/donate'}
                    className="inline-block bg-[#6272B6] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#4a5ab3] transition"
                  >
                    Thử lại
                  </button>
                </div>
              )}

              {/* ===== DONATION FORM ===== */}
              {!status && (
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <h3 className="text-xl font-bold text-[#6272B6] mb-6 flex items-center gap-2">
                    <span className="text-2xl">💳</span> Ủng hộ qua VNPay
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {PRESET_AMOUNTS.map((val) => (
                      <button
                        key={val}
                        onClick={() => handlePresetClick(val)}
                        className={`py-3 px-4 rounded-xl font-semibold text-sm transition border-2 ${
                          amount === val && !customAmount
                            ? "bg-[#6272B6] text-white border-[#6272B6]"
                            : "bg-white text-[#6272B6] border-[#6272B6] hover:bg-[#6272B6] hover:text-white"
                        }`}
                      >
                        {val.toLocaleString("vi-VN")}đ
                      </button>
                    ))}
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Hoặc nhập số tiền tùy ý (VND)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={customAmount}
                        onChange={handleCustomChange}
                        placeholder="Nhập số tiền..."
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 text-lg focus:outline-none focus:border-[#6272B6] transition"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">VND</span>
                    </div>
                  </div>

                  <div className="bg-[#f0f4ff] rounded-xl p-4 mb-6 text-center">
                    <p className="text-sm text-gray-500 mb-1">Số tiền ủng hộ</p>
                    <p className="text-3xl font-bold text-[#6272B6]">
                      {(customAmount ? Number(customAmount) : amount).toLocaleString("vi-VN")}đ
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-4 text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-[#6272B6] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#4a5ab3] transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Đang chuyển đến VNPay...
                      </>
                    ) : (
                      <>💳 Thanh toán qua VNPay</>
                    )}
                  </button>

                  <p className="text-xs text-gray-400 text-center mt-3">
                    Thanh toán an toàn qua VNPay. Không thu phí giao dịch.
                  </p>
                </div>
              )}

              <p className="font-medium mt-8">
                <strong>*Danh sách mạnh thường quân quyên góp cho nhóm sẽ được cập nhật tại đây:</strong>
              </p>
              <ul className="space-y-1 list-disc list-inside text-gray-600">
                <li>2025: <a href="https://bit.ly/4hoWcDV" target="_blank" rel="noreferrer" className="text-[#018ae0] hover:underline">Xem tại đây</a></li>
                <li>2024: <a href="https://bit.ly/3ue49sw" target="_blank" rel="noreferrer" className="text-[#018ae0] hover:underline">Xem tại đây</a></li>
                <li>2023: <a href="https://docs.google.com/spreadsheets/d/19qFZMCHFJm-aJojLU7vLbrOrE1He5pgpzOfXD68f5-E/edit#gid=0" target="_blank" rel="noreferrer" className="text-[#018ae0] hover:underline">Xem tại đây</a></li>
                <li>2022: <a href="https://docs.google.com/spreadsheets/d/1hWbOzTdH0pjVnn46wUryfFdDClEOCWq_9LGC5CpO78o/edit#gid=584063500" target="_blank" rel="noreferrer" className="text-[#018ae0] hover:underline">Xem tại đây</a></li>
                <li>2021: <a href="https://docs.google.com/spreadsheets/d/18P-TD9wzwhxfLZcej_SZiaGgyXhqdyVMZ_cvKQCY3VI/edit#gid=372469675" target="_blank" rel="noreferrer" className="text-[#018ae0] hover:underline">Xem tại đây</a></li>
                <li>2020: <a href="https://docs.google.com/spreadsheets/d/1cjEAMUCIXGCWWiO9WN_oFVtoJtFOi44E2SyhzHvRmFw/edit#gid=799499538" target="_blank" rel="noreferrer" className="text-[#018ae0] hover:underline">Xem tại đây</a></li>
                <li>2019: <a href="https://docs.google.com/spreadsheets/d/17p2I0GjKV3RrJchyEKZz0TpZ2gCcXndDUSzqbpUPD0o/edit?fbclid=IwAR31pH4Bac48LlQcmYgySwelT-dlqqBJJff22iCqMqAIlhjC_3-VRanVYX4#gid=799499538" target="_blank" rel="noreferrer" className="text-[#018ae0] hover:underline">Xem tại đây</a></li>
                <li>2018: <a href="https://docs.google.com/spreadsheets/d/1BGPIGcl4yRxqIIVLtRFbnn8WXGPVFHzDkNPmOAbT-gk/edit#gid=0" target="_blank" rel="noreferrer" className="text-[#018ae0] hover:underline">Xem tại đây</a></li>
              </ul>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                <p className="mb-1">🗳️ <strong>Địa điểm đặt hòm quyên góp và nhận đồ ủng hộ:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Better World Hanoi — số 44 Quảng An, Hà Nội</li>
                  <li>Phòng khám Animal Care — nhà 20 ngõ 424 Thuỵ Khuê</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="lg:w-1/3">
            <img
              src="/images/hanoi-adoption-logo.png"
              alt="Tôi muốn ủng hộ"
              className="rounded-xl w-full"
              style={{ background: "#ddd", padding: "20px" }}
            />
          </div>
        </div>
      </section>

      {/* ===== NHÀ TÀI TRỢ CỐ ĐỊNH ===== */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#1446a0]">Nhà tài trợ cố định</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {SPONSORS.map((s) => (
              <div key={s.name} className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition flex flex-col items-center">
                <div className="w-28 h-28 rounded-full overflow-hidden mb-3 flex items-center justify-center bg-gray-100">
                  <img src={s.img} alt={s.name} className="w-full h-full object-contain" />
                </div>
                <p className="text-xs text-gray-600 mb-2">{s.desc}</p>
                <h5 className="font-semibold text-[#1446a0] uppercase text-sm">{s.name}</h5>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CÁC PHƯƠNG THỨC ỦNG HỘ KHÁC ===== */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-[#1446a0]">Các phương thức ủng hộ khác</h2>
        </div>
        <div className="flex flex-wrap justify-center gap-8 mb-10">
          {DONATE_ITEMS.map((item) => (
            <div key={item.name} className="flex flex-col items-center gap-3">
              <div className="w-28 h-28 rounded-full border-2 border-[#018ae0] flex items-center justify-center bg-white overflow-hidden">
                <img src={item.img} alt={item.name} className="w-full h-full object-contain" />
              </div>
              <h5 className="font-semibold text-[#1446a0] uppercase">{item.name}</h5>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link to="/contact" className="inline-block bg-[#018ae0] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#0170b5] transition">
            Liên hệ HPA
          </Link>
        </div>
      </section>

      {/* ===== DANH SÁCH MẠNH THƯỜNG QUÂN CTA ===== */}
      <section
        className="relative py-20 bg-cover bg-center text-white text-center"
        style={{ backgroundImage: "url('/images/danh-sach-manh-thuong-quan.jpg')" }}
      >
        <div className="absolute inset-0 bg-[#018ae0]/80" />
        <div className="relative z-10 container mx-auto px-4">
          <h4 className="text-3xl font-bold mb-4">Danh sách mạnh thường quân</h4>
          <a href="http://bit.ly/2RLgOgs" target="_blank" rel="noreferrer"
            className="inline-block bg-yellow-400 text-[#1446a0] px-8 py-3 rounded-lg font-bold hover:bg-yellow-300 transition">
            Xem thông tin
          </a>
        </div>
      </section>

      {/* ===== BÉ NGOAN TRONG TUẦN ===== */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-[#1446a0]">Bé ngoan trong tuần</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {PETS.map((pet) => (
            <div key={pet.name} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
              <Link to="/adopt" className="block">
                <div className="aspect-square overflow-hidden bg-gray-100 flex items-center justify-center p-2">
                  <img src={pet.img} alt={pet.name} className="w-full h-full object-cover rounded-lg" />
                </div>
                <div className="p-4">
                  <h5 className="font-bold text-[#1446a0] uppercase mb-2">{pet.name}</h5>
                  <hr className="mb-3" />
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li><strong>Giới tính:</strong> {pet.gender}</li>
                    <li><strong>Tuổi:</strong> {pet.age}</li>
                    <li><strong>Tiêm phòng:</strong> {pet.vaccinated}</li>
                  </ul>
                </div>
              </Link>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/adopt" className="inline-block bg-[#d61c62] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#b01550] transition">
            Nhận nuôi
          </Link>
        </div>
      </section>

      {/* ===== QUÁ TRÌNH TRƯỚC VÀ SAU ===== */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#1446a0]">Quá trình trước và sau</h2>
          </div>
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <a href="https://hanoipetadoption.com/vi/tin-tuc/cuu-ho-be-cun-ghe-bi-bo-roi-o-phu-tho-61" target="_blank" rel="noreferrer" className="block">
                <img
                  src="https://hanoipetadoption.com/admin/user-content/News/c5e1ad8d-6104-4d60-acb1-a95cae816527.jpg"
                  alt="Cứu hộ bé cún ghẻ bị bỏ rơi ở Phú Thọ"
                  className="w-full h-64 object-cover rounded-t-xl"
                />
                <div className="p-6">
                  <h5 className="font-bold text-[#1446a0] uppercase mb-2">
                    cứu hộ bé cún ghẻ bị bỏ rơi ở Phú Thọ
                  </h5>
                  <p className="text-gray-600 text-sm text-justify">
                    Ngày ý tưởng ko cứu được bé. Nửa đêm nhờ tnv chạy ô tô lên Phú Thọ bắt chó vì sợ nó lang thang ngoài...
                  </p>
                </div>
              </a>
            </div>
          </div>
          <div className="text-center mt-8">
            <a href="https://hanoipetadoption.com/vi/tin-tuc/chuyen-muc/qua-trinh-cuu-ho-23" target="_blank" rel="noreferrer"
              className="inline-block bg-[#d61c62] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#b01550] transition">
              Xem thêm
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
