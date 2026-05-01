import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { useListCategory } from "../../hook/huyHook";


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
          : name === "age" || name === "adoptionFee"
          ? Number(value)
          : value,
    })
  }

  const [fileKey, setFileKey] = useState(0);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      console.log('Selected files:', files);
      setForm({
        ...form,
        images: Array.from(files),
      });
      setFileKey(prev => prev + 1); // Force re-render of input
    }
  };

  const removeImage = (index: number) => {
    const newImages = form.images.filter((_, i) => i !== index);
    setForm({
      ...form,
      images: newImages,
    });
  };

const handleSubmit = (e: any) => {
  e.preventDefault();
  
  const formData = new FormData();
  formData.append('name', form.name);
  formData.append('species', form.species);
  formData.append('breed', form.breed);
  formData.append('age', form.age.toString());
  formData.append('gender', form.gender);
  formData.append('size', form.size);
  formData.append('color', form.color);
  formData.append('description', form.description);
  formData.append('healthStatus', form.healthStatus);
  formData.append('vaccinated', form.vaccinated.toString());
  formData.append('neutered', form.neutered.toString());
  formData.append('adoptionFee', form.adoptionFee.toString());
  formData.append('location', form.location);
  formData.append('categoryId', form.categoryId);

  form.images.forEach((file) => {
    formData.append('images', file);
  });

  // Instead of using addPet, use axios directly
  import("../../api/http").then(({ apiClient }) => {
    apiClient.post('/pets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(() => {
      navigate("/admin/pets");
    }).catch((error: any) => {
      console.error("Error creating pet:", error);
      alert("Lỗi tạo pet: " + error.message);
    });
  });
};

  return (
    <div className="max-w-[600px] mx-auto py-20 px-6">
      <h1 className="text-3xl font-bold text-center text-[#6272B6] mb-10">
        Thêm thú cưng
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow">

        <input name="name" placeholder="Tên" onChange={handleChange} className="input" required />
        
        <select name="species" onChange={handleChange} className="input" required>
          <option value="">-- Chọn loài --</option>
          <option value="dog">Chó</option>
          <option value="cat">Mèo</option>
          <option value="bird">Chim</option>
          <option value="rabbit">Thỏ</option>
          <option value="hamster">Hamster</option>
          <option value="other">Khác</option>
        </select>

        <select name="categoryId" onChange={handleChange} className="input">
          <option value="">-- Chọn danh mục --</option>
          {categories?.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        
        <input name="breed" placeholder="Giống" onChange={handleChange} className="input" />
        
        <input name="age" type="number" placeholder="Tuổi" onChange={handleChange} className="input" />
        
        <select name="gender" onChange={handleChange} className="input">
          <option value="unknown">-- Giới tính --</option>
          <option value="male">Đực</option>
          <option value="female">Cái</option>
        </select>
        
        <select name="size" onChange={handleChange} className="input">
          <option value="small">Nhỏ</option>
          <option value="medium">Trung bình</option>
          <option value="large">Lớn</option>
        </select>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium">Hình ảnh</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            key={fileKey}
            className="input"
          />
          {form.images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {form.images.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
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
          <input type="checkbox" name="neutered" onChange={handleChange} />
          Đã triệt sản
        </label>

        <button className="w-full bg-[#6272B6] text-white py-3 rounded-full">
          Thêm
        </button>
      </form>
    </div>
  )
}