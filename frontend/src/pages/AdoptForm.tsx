import { useParams, useNavigate } from "react-router-dom";
import { pets } from "../data/pet";
import { useState } from "react";
import type { Pet } from "../data/pet";

export default function AdoptForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const pet: Pet | undefined = pets.find((p) => p.id === Number(id));
  if (!pet) return <div className="text-center py-20">Pet không tồn tại</div>;

  const [form, setForm] = useState({ name: "", phone: "", address: "", reason: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const newOrder = {
      ...form,
      petId: pet.id,
      petName: pet.name,
      status: "pending_payment",
      createdAt: new Date().toISOString(),
    };
    orders.push(newOrder);
    localStorage.setItem("orders", JSON.stringify(orders));
    localStorage.setItem("currentOrderId", newOrder.createdAt);
    navigate(`/payment/method/${pet.id}`);
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
          <button type="submit" className="w-full bg-[#6272B6] text-white py-3 rounded-full hover:bg-[#4e5fa8] transition">Tiếp tục thanh toán</button>
        </form>
      </div>
    </div>
  );
}