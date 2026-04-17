import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "../../api/http";
import { useUpdatePet, useListCategory } from "../../hook/huyHook";




export default function EditPet() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { mutate, isPending } = useUpdatePet({ resource: "pets" });
  const { data: categories = [] } = useListCategory({ resource: "category" });
  const [form, setForm] = useState<any>(null);


  useEffect(() => {
    if (!id) return;

    apiClient.get(`/pets/${id}`).then((res) => {
      const pet = res.data?.data ?? res.data;

      setForm({
        ...pet,
        category:
          typeof pet.category === "object" && pet.category !== null
            ? pet.category.id
            : pet.category || "",
      });
    });
  }, [id]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : name === "age" ? Number(value) : value,
    });
  };
  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!id) return;

    mutate(
      { id, values: form },
      {
        onSuccess: () => {
          alert("Cập nhật thành công!");
          navigate("/admin/pets");
        },
      }
    );
  };
  if (!form) return null;

  return (
    <div className="max-w-[600px] mx-auto py-20 px-6">
      <h1 className="text-3xl font-bold text-center text-[#6272B6] mb-10">
        Sửa thú cưng
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow">
        <input name="name" value={form.name} onChange={handleChange} className="input" />
        <input name="age" type="number" value={form.age} onChange={handleChange} className="input" />

        <select name="gender" value={form.gender || "unknown"} onChange={handleChange} className="input">
          <option value="unknown">Không rõ</option>
          <option value="male">Đực</option>
          <option value="female">Cái</option>
        </select>

        <select
          name="category"
          value={form.category || ""}
          onChange={handleChange}
          className="input"
        >
          <option value="">Chọn danh mục</option>
          {categories.map((cat: any) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <input name="color" value={form.color || ""} onChange={handleChange} className="input" />
        <input name="image" value={form.image || ""} onChange={handleChange} className="input" />
        <textarea
          name="description"
          value={form.description || ""}
          onChange={handleChange}
          className="w-full h-24 bg-[#DDEDFF] rounded-2xl px-4 py-2 outline-none"
        />
 <label className="flex items-center gap-2">
          <input type="checkbox" name="vaccinated" checked={!!form.vaccinated} onChange={handleChange} />
          Đã tiêm phòng
        </label>
        
        <label className="flex items-center gap-2">
          <input type="checkbox" name="sterilized" checked={!!form.sterilized} onChange={handleChange} />
          Đã triệt sản
        </label>

        <button disabled={isPending} className="w-full bg-[#6272B6] text-white py-3 rounded-full disabled:opacity-60">
          {isPending ? "Đang lưu..." : "Cập nhật"}
        </button>
      </form>
    </div>
  );
}