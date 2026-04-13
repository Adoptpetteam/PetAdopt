import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreatePet, useListCategory } from "../../hook/huyHook";

export default function AddPet() {
  const navigate = useNavigate();
  const { mutate, isPending } = useCreatePet({ resource: "pets" });
  const { data: categories = [] } = useListCategory({ resource: "category" });

  const [form, setForm] = useState({
    name: "",
    age: 0,
    gender: "unknown",
    image: "",
    category: "",
    sterilized: false,
    vaccinated: false,
    color: "",
    description: "",
    status: "available",
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : name === "age" ? Number(value) : value,
    });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();

    mutate(form, {
      onSuccess: () => {
        alert("Thêm thành công!");
        navigate("/admin/pets");
      },
    });
  };

  return (
    <div className="max-w-[600px] mx-auto py-20 px-6">
      <h1 className="text-3xl font-bold text-center text-[#6272B6] mb-10">
        Thêm thú cưng
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow">
        <input
          name="name"
          placeholder="Tên"
          onChange={handleChange}
          className="input"
          required
        />

        <input
          name="age"
          type="number"
          placeholder="Tuổi"
          onChange={handleChange}
          className="input"
        />

        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          className="input"
        >
          <option value="unknown">Không rõ</option>
          <option value="male">Đực</option>
          <option value="female">Cái</option>
        </select>

        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="input"
          required
        >
          <option value="">Chọn danh mục</option>
          {categories.map((cat: any) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <input
          name="color"
          placeholder="Màu sắc"
          onChange={handleChange}
          className="input"
        />

        <input
          name="image"
          placeholder="Link ảnh"
          onChange={handleChange}
          className="input"
        />

        <textarea
          name="description"
          placeholder="Mô tả thú cưng"
          onChange={handleChange}
          className="w-full h-24 bg-[#DDEDFF] rounded-2xl px-4 py-2 outline-none"
        />

        <label className="flex items-center gap-2">
          <input type="checkbox" name="vaccinated" onChange={handleChange} />
          Đã tiêm phòng
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" name="sterilized" onChange={handleChange} />
          Đã triệt sản
        </label>

        <button
          disabled={isPending}
          className="w-full bg-[#6272B6] text-white py-3 rounded-full disabled:opacity-60"
        >
          {isPending ? "Đang lưu..." : "Thêm"}
        </button>
      </form>
    </div>
  );
}