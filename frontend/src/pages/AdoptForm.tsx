import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { pets } from "../data/pet";
import type { Pet } from "../data/pet";
import { listPets, type PetEntity } from "../api/petApi";
import { createAdoptionRequest } from "../api/adoptionApi";

export default function AdoptForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const pet: Pet | undefined = pets.find((p) => p.id === Number(id));
  if (!pet) return <div className="text-center py-20">Pet không tồn tại</div>;

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    reason: "",
    housingType: "apartment",
    familyMembers: 1,
    monthlyIncome: "under_5m",
    commitment: true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const nextValue =
      name === "familyMembers"
        ? Number(value)
        : e.target instanceof HTMLInputElement && e.target.type === "checkbox"
          ? e.target.checked
          : value;

    setForm((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const rawUser = localStorage.getItem("user");
      const user = rawUser ? JSON.parse(rawUser) : null;
      const userId: string | undefined = user?.id;

      if (!userId) {
        alert("Vui lòng đăng nhập để gửi đơn nhận nuôi.");
        navigate("/login");
        return;
      }

      const species = String(pet.type || "").toLowerCase();

      const res = await listPets({
        page: 1,
        limit: 50,
        species,
        status: "available",
        search: pet.name,
      });

      const petMatch: PetEntity | undefined =
        res.data.find(
          (p) =>
            p.name?.toLowerCase() === pet.name.toLowerCase() &&
            String(p.species || "").toLowerCase() === species
        ) ?? res.data[0];

      if (!petMatch?.id) {
        alert("Không tìm thấy thú cưng trên hệ thống để gửi đơn.");
        return;
      }

      await createAdoptionRequest({
        pet: petMatch.id,
        user: userId,
        fullName: form.name,
        phone: form.phone,
        address: form.address,
        reason: form.reason,
        housingType: form.housingType,
        familyMembers: form.familyMembers,
        monthlyIncome: form.monthlyIncome,
        commitment: form.commitment,
        // Các trường còn lại dùng mặc định an toàn
        experience: "none",
        experienceDetails: "",
        hasYard: false,
        hasChildren: false,
        childrenAges: "",
        hasOtherPets: false,
        otherPetsDetails: "",
      });

      navigate("/success");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gửi đơn nhận nuôi thất bại.");
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto py-20 px-6">
      <h1 className="text-3xl font-bold text-[#6272B6] text-center mb-10">Đăng ký nhận nuôi {pet.name}</h1>
      <div className="grid grid-cols-2 gap-10">
        <div className="bg-white rounded-2xl shadow p-6">
          <img src={pet.image} className="w-full h-[300px] object-cover rounded-xl mb-4" alt={pet.name} />
          <h2 className="text-xl font-semibold text-[#6272B6]">{pet.name}</h2>
          <p className="text-gray-600 mt-2">Tuổi: {pet.age} | Giới tính: {pet.gender}</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-8 space-y-6">
          <input name="name" placeholder="Họ và tên" value={form.name} onChange={handleChange} className="w-full h-12 bg-[#DDEDFF] rounded-full px-6 outline-none" required />
          <input name="phone" placeholder="Số điện thoại" value={form.phone} onChange={handleChange} className="w-full h-12 bg-[#DDEDFF] rounded-full px-6 outline-none" required />
          <input name="address" placeholder="Địa chỉ" value={form.address} onChange={handleChange} className="w-full h-12 bg-[#DDEDFF] rounded-full px-6 outline-none" required />
          <textarea name="reason" placeholder="Lý do nhận nuôi" value={form.reason} onChange={handleChange} className="w-full h-28 bg-[#DDEDFF] rounded-2xl px-6 py-3 outline-none" required />
          <div className="grid grid-cols-2 gap-4">
            <select
              name="housingType"
              value={form.housingType}
              onChange={handleChange}
              className="w-full h-12 bg-[#DDEDFF] rounded-full px-6 outline-none"
              required
            >
              <option value="apartment">Căn hộ</option>
              <option value="house">Nhà</option>
              <option value="farm">Trang trại</option>
              <option value="other">Khác</option>
            </select>

            <input
              type="number"
              name="familyMembers"
              min={1}
              value={form.familyMembers}
              onChange={handleChange}
              className="w-full h-12 bg-[#DDEDFF] rounded-full px-6 outline-none"
              required
            />
          </div>

          <select
            name="monthlyIncome"
            value={form.monthlyIncome}
            onChange={handleChange}
            className="w-full h-12 bg-[#DDEDFF] rounded-full px-6 outline-none"
            required
          >
            <option value="under_5m">Dưới 5 triệu</option>
            <option value="5m_10m">5-10 triệu</option>
            <option value="10m_20m">10-20 triệu</option>
            <option value="over_20m">Trên 20 triệu</option>
          </select>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="commitment"
              checked={form.commitment}
              onChange={handleChange}
              required
            />
            <span className="text-sm text-gray-700">
              Tôi đồng ý với cam kết nhận nuôi
            </span>
          </label>

          <button
            type="submit"
            className="w-full bg-[#6272B6] text-white py-3 rounded-full hover:bg-[#4e5fa8] transition"
          >
            Gửi đơn nhận nuôi
          </button>
        </form>
      </div>
    </div>
  );
}
