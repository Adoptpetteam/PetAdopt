import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  usePetDetail,
  useUpdatePet,
  useListCategory,
} from "../../hook/huyHook";

export default function EditPet() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<any>(null);

  if (!id) {
    return <p className="text-center mt-10">ID thú cưng không hợp lệ.</p>;
  }

  // ✅ React Query
  const { data: pet, isLoading } = usePetDetail({ id });
  const { data: categories } = useListCategory({ resource: "category" });
  const { mutate: updatePet, isPending } = useUpdatePet({ resource: "pets" });

  // ✅ đổ dữ liệu vào form
  useEffect(() => {
    if (pet) setForm(pet);
  }, [pet]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]:
        type === "checkbox"
          ? checked
          : name === "age"
          ? Number(value)
          : value,
    });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();

    updatePet(
      { id, values: form },
      {
        onSuccess: () => {
          navigate("/admin/pets");
        },
      }
    );
  };

  // ✅ loading đẹp hơn
  if (isLoading || !form) {
    return <p className="text-center mt-10">Đang tải dữ liệu...</p>;
  }

  return (
    <div className="max-w-[600px] mx-auto py-20 px-6">
      <h1 className="text-3xl font-bold text-center text-[#6272B6] mb-10">
        Sửa thú cưng
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-xl shadow"
      >
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="input"
        />

        <input
          name="age"
          type="number"
          value={form.age}
          onChange={handleChange}
          className="input"
        />

        <input
          name="gender"
          value={form.gender}
          onChange={handleChange}
          className="input"
        />

        {/* ✅ CATEGORY */}
        <select
          name="categoryId"
          value={form.categoryId || ""}
          onChange={handleChange}
          className="input"
        >
          <option value="">-- Chọn danh mục --</option>
          {categories?.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          name="color"
          value={form.color}
          onChange={handleChange}
          className="input"
        />

        <input
          name="image"
          value={form.image}
          onChange={handleChange}
          className="input"
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full h-24 bg-[#DDEDFF] rounded-2xl px-4 py-2 outline-none"
        />

        {/* checkbox */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="vaccinated"
            checked={form.vaccinated || false}
            onChange={handleChange}
          />
          Đã tiêm phòng
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="sterilized"
            checked={form.sterilized || false}
            onChange={handleChange}
          />
          Đã triệt sản
        </label>

        <button
          disabled={isPending}
          className="w-full bg-[#6272B6] text-white py-3 rounded-full"
        >
          {isPending ? "Đang cập nhật..." : "Cập nhật"}
        </button>
      </form>
    </div>
  );
}