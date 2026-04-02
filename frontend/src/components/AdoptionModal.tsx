import { useState, useEffect } from "react";
import { adoptionApi, type AdoptionRequestData } from "../api/adoptionApi";

interface AdoptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  petId: string;
  petName: string;
  userData?: {
    name?: string;
    phone?: string;
    address?: string;
    _id?: string;
  } | null;
}

export default function AdoptionModal({
  isOpen,
  onClose,
  petId,
  petName,
  userData,
}: AdoptionModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<AdoptionRequestData>({
    fullName: "",
    phone: "",
    address: "",
    reason: "",
    experience: "none",
    experienceDetails: "",
    housingType: "house",
    hasYard: false,
    familyMembers: 1,
    hasChildren: false,
    childrenAges: "",
    hasOtherPets: false,
    otherPetsDetails: "",
    monthlyIncome: "5m_10m",
    commitment: false,
  });

  // Điền thông tin user nếu đã đăng nhập
  useEffect(() => {
    if (userData) {
      setFormData((prev) => ({
        ...prev,
        fullName: userData.name || prev.fullName,
        phone: userData.phone || prev.phone,
        address: userData.address || prev.address,
      }));
    }
  }, [userData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate
    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.address ||
      !formData.reason ||
      !formData.commitment
    ) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    setLoading(true);

    try {
      await adoptionApi.create({
        ...formData,
        pet: petId,
        user: userData?._id,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#6272B6] to-[#8b9fe8] text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Đăng ký nhận nuôi</h2>
              <p className="text-white/80 text-sm mt-1">
                Yêu cầu nhận nuôi bé: <span className="font-semibold">{petName}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-3xl leading-none"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-10">
              <div className="text-7xl mb-6">🎉</div>
              <h3 className="text-2xl font-bold text-[#6272B6] mb-3">
                Đơn đăng ký đã được gửi!
              </h3>
              <p className="text-gray-600 mb-6">
                Cảm ơn bạn đã quan tâm đến bé {petName}. <br />
                Tình nguyện viên HPA sẽ liên hệ với bạn trong thời gian sớm nhất.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-sm text-green-700">
                <strong>Lưu ý:</strong> Vui lòng giữ điện thoại để TNV có thể liên hệ phỏng vấn.
              </div>
              <button
                onClick={onClose}
                className="bg-[#6272B6] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#4a5ab3] transition"
              >
                Đóng
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              {/* Thông tin cá nhân */}
              <div>
                <h3 className="text-lg font-semibold text-[#6272B6] mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#6272B6] text-white rounded-full text-sm flex items-center justify-center">1</span>
                  Thông tin cá nhân
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#6272B6] focus:border-transparent"
                      placeholder="Nhập họ và tên của bạn"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#6272B6] focus:border-transparent"
                      placeholder="0xxx xxx xxx"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#6272B6] focus:border-transparent"
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  />
                </div>
              </div>

              {/* Lý do & Kinh nghiệm */}
              <div>
                <h3 className="text-lg font-semibold text-[#6272B6] mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#6272B6] text-white rounded-full text-sm flex items-center justify-center">2</span>
                  Lý do & Kinh nghiệm
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lý do muốn nhận nuôi <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#6272B6] focus:border-transparent resize-none"
                      placeholder="Chia sẻ lý do bạn muốn nhận nuôi bé..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kinh nghiệm nuôi thú cưng
                      </label>
                      <select
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#6272B6] focus:border-transparent"
                      >
                        <option value="none">Chưa có kinh nghiệm</option>
                        <option value="beginner">Ít kinh nghiệm (&lt; 1 năm)</option>
                        <option value="intermediate">Có kinh nghiệm (1-3 năm)</option>
                        <option value="expert">Nhiều kinh nghiệm (&gt; 3 năm)</option>
                      </select>
                    </div>
                    {formData.experience !== "none" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mô tả kinh nghiệm
                        </label>
                        <input
                          type="text"
                          name="experienceDetails"
                          value={formData.experienceDetails}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#6272B6] focus:border-transparent"
                          placeholder="VD: Từng nuôi mèo hoang 2 năm"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Điều kiện sống */}
              <div>
                <h3 className="text-lg font-semibold text-[#6272B6] mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#6272B6] text-white rounded-full text-sm flex items-center justify-center">3</span>
                  Điều kiện sống
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loại nhà ở <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="housingType"
                      value={formData.housingType}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#6272B6] focus:border-transparent"
                    >
                      <option value="apartment">Căn hộ chung cư</option>
                      <option value="house">Nhà riêng có sân</option>
                      <option value="farm">Nhà vườn / Farm</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thu nhập hàng tháng <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="monthlyIncome"
                      value={formData.monthlyIncome}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#6272B6] focus:border-transparent"
                    >
                      <option value="under_5m">Dưới 5 triệu</option>
                      <option value="5m_10m">5 - 10 triệu</option>
                      <option value="10m_20m">10 - 20 triệu</option>
                      <option value="over_20m">Trên 20 triệu</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="hasYard"
                      checked={formData.hasYard}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-gray-300 text-[#6272B6] focus:ring-[#6272B6]"
                    />
                    <span className="text-sm text-gray-700">Có sân vườn / không gian ngoài trời cho thú cưng</span>
                  </label>
                </div>
              </div>

              {/* Gia đình */}
              <div>
                <h3 className="text-lg font-semibold text-[#6272B6] mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#6272B6] text-white rounded-full text-sm flex items-center justify-center">4</span>
                  Gia đình
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số thành viên trong gia đình <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="familyMembers"
                      value={formData.familyMembers}
                      onChange={handleChange}
                      min={1}
                      max={20}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#6272B6] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-3 mt-7">
                      <input
                        type="checkbox"
                        name="hasChildren"
                        checked={formData.hasChildren}
                        onChange={handleChange}
                        className="w-5 h-5 rounded border-gray-300 text-[#6272B6] focus:ring-[#6272B6]"
                      />
                      <span className="text-sm text-gray-700">Có trẻ nhỏ trong gia đình</span>
                    </label>
                  </div>
                </div>
                {formData.hasChildren && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Độ tuổi trẻ nhỏ
                    </label>
                    <input
                      type="text"
                      name="childrenAges"
                      value={formData.childrenAges}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#6272B6] focus:border-transparent"
                      placeholder="VD: 5 tuổi và 8 tuổi"
                    />
                  </div>
                )}

                <div className="mt-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="hasOtherPets"
                      checked={formData.hasOtherPets}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-gray-300 text-[#6272B6] focus:ring-[#6272B6]"
                    />
                    <span className="text-sm text-gray-700">Hiện đang nuôi thú cưng khác</span>
                  </label>
                  {formData.hasOtherPets && (
                    <input
                      type="text"
                      name="otherPetsDetails"
                      value={formData.otherPetsDetails}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 mt-2 focus:outline-none focus:ring-2 focus:ring-[#6272B6] focus:border-transparent"
                      placeholder="VD: 1 chó Poodle 2 tuổi, 1 mèo Anh"
                    />
                  )}
                </div>
              </div>

              {/* Cam kết */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="commitment"
                    checked={formData.commitment}
                    onChange={handleChange}
                    required
                    className="w-5 h-5 mt-0.5 rounded border-gray-300 text-[#6272B6] focus:ring-[#6272B6]"
                  />
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold text-red-500">*</span> Tôi cam kết:
                    <ul className="mt-2 space-y-1 text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-500">✓</span>
                        Chăm sóc bé suốt đời, không bỏ rơi dưới bất kỳ hình thức nào
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-500">✓</span>
                        Đóng tiền vía và chi phí phát sinh (nếu có)
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-500">✓</span>
                        Cập nhật tình hình bé định kỳ cho HPA
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-500">✓</span>
                        Chấp nhận phỏng vấn từ Tình nguyện viên HPA
                      </li>
                    </ul>
                  </div>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border-2 border-gray-300 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#6272B6] text-white py-3 rounded-xl font-semibold hover:bg-[#4a5ab3] transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Đang gửi...
                    </>
                  ) : (
                    "Gửi đơn đăng ký"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
