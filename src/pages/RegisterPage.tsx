export default function RegisterPage() {
  return (
    <div className="bg-white py-20">

      {/* ===== TOP ===== */}
      <div className="flex flex-col items-center mb-16">
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
        <h2 className="text-3xl font-bold text-[#6272B6] pt-20">
          ĐĂNG KÝ TÀI KHOẢN
        </h2>
      </div>


      {/* ===== MIDDLE ===== */}
      <div className="w-[980px] mx-auto flex flex-col gap-10">

        {/* Họ và tên */}
        <div className="flex flex-col">
          <label className="text-[#6272B6] font-medium mb-3">
            Họ và tên
          </label>
          <input
            type="text"
            className="w-full h-[80px] bg-[#DDEDFF] rounded-[40px] px-6 outline-none"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <label className="text-[#6272B6] font-medium mb-3">
            Email
          </label>
          <input
            type="email"
            className="w-full h-[80px] bg-[#DDEDFF] rounded-[40px] px-6 outline-none"
          />
        </div>

        {/* Mật khẩu */}
        <div className="flex flex-col">
          <label className="text-[#6272B6] font-medium mb-3">
            Mật khẩu
          </label>
          <input
            type="password"
            className="w-full h-[80px] bg-[#DDEDFF] rounded-[40px] px-6 outline-none"
          />
        </div>

        {/* Nhập lại mật khẩu */}
        <div className="flex flex-col">
          <label className="text-[#6272B6] font-medium mb-3">
            Nhập lại mật khẩu
          </label>
          <input
            type="password"
            className="w-full h-[80px] bg-[#DDEDFF] rounded-[40px] px-6 outline-none"
          />
        </div>

        {/* Dòng đăng nhập */}
        <div className="text-right">
          <span className="text-gray-600">
            Bạn đã có tài khoản?{" "}
            <a
              href="/login"
              className="text-[#6272B6] font-medium hover:underline"
            >
              Đăng nhập
            </a>
          </span>
        </div>
      </div>


      {/* ===== BOTTOM ===== */}
      <div className="w-[980px] mx-auto mt-16 text-center">
        <button className="w-full bg-[#6272B6] text-white py-4 rounded-full font-medium transition duration-300 hover:bg-[#4e5fa8]">
          Đăng ký
        </button>
      </div>

    </div>
  );
}