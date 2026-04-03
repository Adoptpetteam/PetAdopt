import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { message } from "antd";
import { getPetById } from "../api/petApi";
import { createAdoptionRequest } from "../api/adoptionApi";

export default function AdoptForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    reason: "",
    experience: "none",
    housingType: "",
    hasYard: false,
    familyMembers: "",
    hasChildren: false,
    childrenAges: "",
    hasOtherPets: false,
    monthlyIncome: "",
    commitment: false,
  });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getPetById(id)
      .then(res => setPet(res.data))
      .catch(() => {
        message.error("Không tìm thấy thú cưng");
        navigate("/adopt");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target;
    const value = target.type === "checkbox" ? (target as HTMLInputElement).checked : target.value;
    setForm(prev => ({ ...prev, [target.name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName || !form.phone || !form.address || !form.reason || !form.housingType || !form.familyMembers || !form.monthlyIncome) {
      message.warning("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    if (!form.commitment) {
      message.warning("Bạn phải đồng ý với cam kết nhận nuôi");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      message.warning("Vui lòng đăng nhập để gửi đơn nhận nuôi");
      navigate("/login");
      return;
    }

    setSubmitting(true);
    try {
      await createAdoptionRequest({
        pet: id || "",
        fullName: form.fullName,
        phone: form.phone,
        address: form.address,
        reason: form.reason,
        experience: form.experience,
        housingType: form.housingType,
        hasYard: form.hasYard,
        familyMembers: form.familyMembers,
        hasChildren: form.hasChildren,
        childrenAges: form.childrenAges,
        hasOtherPets: form.hasOtherPets,
        monthlyIncome: form.monthlyIncome,
        commitment: form.commitment,
      });
      message.success("Đơn nhận nuôi đã được gửi thành công!");
      navigate("/success");
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Gửi đơn thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-40">Đang tải...</div>;

  const petImage = pet?.image || (pet?.images?.[0]) || "/images/Jack.png";

  return (
    <div className="max-w-[1000px] mx-auto py-20 px-6">
      <h1 className="text-3xl font-bold text-[#6272B6] text-center mb-10">
        Đăng ký nhận nuôi {pet?.name}
      </h1>
      <div className="grid grid-cols-2 gap-10">
        <div className="bg-white rounded-2xl shadow p-6">
          <img src={petImage} className="w-full h-[300px] object-cover rounded-xl mb-4" alt={pet?.name} />
          <h2 className="text-xl font-semibold text-[#6272B6]">{pet?.name}</h2>
          <p className="text-gray-600 mt-2">
            Tuổi: {pet?.age || "N/A"} | Giới tính: {pet?.gender || "N/A"}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-8 space-y-4">
          <input name="fullName" placeholder="Họ và tên *" value={form.fullName} onChange={handleChange} className="w-full h-12 bg-[#DDEDFF] rounded-full px-6 outline-none" required />
          <input name="phone" placeholder="Số điện thoại *" value={form.phone} onChange={handleChange} className="w-full h-12 bg-[#DDEDFF] rounded-full px-6 outline-none" required />
          <input name="address" placeholder="Địa chỉ *" value={form.address} onChange={handleChange} className="w-full h-12 bg-[#DDEDFF] rounded-full px-6 outline-none" required />
          <select name="housingType" value={form.housingType} onChange={handleChange} className="w-full h-12 bg-[#DDEDFF] rounded-full px-6 outline-none">
            <option value="">Loại nhà ở *</option>
            <option value="house">Nhà riêng</option>
            <option value="apartment">Căn hộ</option>
            <option value="dorm">Ký túc xá</option>
          </select>
          <input name="familyMembers" placeholder="Số thành viên trong gia đình *" value={form.familyMembers} onChange={handleChange} className="w-full h-12 bg-[#DDEDFF] rounded-full px-6 outline-none" required />
          <select name="monthlyIncome" value={form.monthlyIncome} onChange={handleChange} className="w-full h-12 bg-[#DDEDFF] rounded-full px-6 outline-none">
            <option value="">Thu nhập hàng tháng *</option>
            <option value="<5tr">Dưới 5 triệu</option>
            <option value="5-10tr">5 - 10 triệu</option>
            <option value="10-20tr">10 - 20 triệu</option>
            <option value=">20tr">Trên 20 triệu</option>
          </select>
          <textarea name="reason" placeholder="Lý do nhận nuôi *" value={form.reason} onChange={handleChange} className="w-full h-28 bg-[#DDEDFF] rounded-2xl px-6 py-3 outline-none" required />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="commitment" name="commitment" checked={form.commitment} onChange={handleChange} />
            <label htmlFor="commitment" className="text-sm text-gray-600">Tôi cam kết nuôi thú cưng có trách nhiệm *</label>
          </div>
          <button type="submit" disabled={submitting} className="w-full bg-[#6272B6] text-white py-3 rounded-full hover:bg-[#4e5fa8] transition disabled:opacity-60">
            {submitting ? "Đang gửi..." : "Gửi đơn nhận nuôi"}
          </button>
        </form>
      </div>
    </div>
  );
}
