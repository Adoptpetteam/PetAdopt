import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { useListCategory, useCreatePet } from "../../hook/huyHook";


export default function AddPet() {
  const navigate = useNavigate()
  const { data: categories } = useListCategory({ resource: "category" });
  const { mutate: addPet } = useCreatePet({ resource: "pets" });
  // state preview
  const [preview, setPreview] = useState("")

const [form, setForm] = useState({
  name: "",
  age: 0,
  gender: "",
  image: "",
  type: "",
  sterilized: false,
  color: "",
  vaccinated: false,
  description: "",
  status: "Còn" // ✅ thêm dòng này
})

const handleImageChange = (e: any) => {
  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()

  reader.onloadend = () => {
    const base64String = reader.result as string

    // lưu vào form
    setForm({
      ...form,
      image: base64String
    })

    // hiển thị preview
    setPreview(base64String)
  }

  reader.readAsDataURL(file)
}

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target

    setForm({
      ...form,
      [name]:
        type === "checkbox"
          ? checked
          : name === "age"
          ? Number(value)
          : value,
    })
  }

const handleSubmit = (e: any) => {
  e.preventDefault();
  addPet(form, {
    onSuccess: () => navigate("/admin/pets"),
  });
};

  return (
    <div className="max-w-[600px] mx-auto py-20 px-6">
      <h1 className="text-3xl font-bold text-center text-[#6272B6] mb-10">
        Thêm thú cưng
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow">

        <input name="name" placeholder="Tên" onChange={handleChange} className="input" required />
        <input name="age" type="number" placeholder="Tuổi" onChange={handleChange} className="input" />
        <input name="gender" placeholder="Giới tính" onChange={handleChange} className="input" />
        <select name="categoryId" onChange={handleChange} className="input">
          <option value="">-- Chọn danh mục --</option>
          {categories?.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input name="color" placeholder="Màu sắc" onChange={handleChange} className="input" />
<div>
  <label className="block mb-2 font-medium">Ảnh thú cưng</label>

  {/* Nút chọn ảnh */}
  <label className="flex items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#6272B6] transition">
    <span className="text-gray-500">
      📷 Chọn ảnh từ máy
    </span>

    <input
      type="file"
      accept="image/*"
      onChange={handleImageChange}
      className="hidden"
    />
  </label>

  {/* Preview */}
  {preview && (
    <div className="mt-4 flex justify-center">
      <img
        src={preview}
        alt="preview"
        className="w-40 h-40 object-cover rounded-xl shadow"
      />
    </div>
  )}
</div>
        <textarea
        name="description"
        placeholder="Mô tả thú cưng"
        onChange={handleChange}
        className="w-full h-24 bg-[#DDEDFF] rounded-2xl px-4 py-2 outline-none"
        />

        {/* checkbox */}
        <label className="flex items-center gap-2">
          <input type="checkbox" name="vaccinated" onChange={handleChange} />
          Đã tiêm phòng
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" name="sterilized" onChange={handleChange} />
          Đã triệt sản
        </label>

        <button className="w-full bg-[#6272B6] text-white py-3 rounded-full">
          Thêm
        </button>
      </form>
    </div>
  )
}