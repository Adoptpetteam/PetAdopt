import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { useListCategory, useUpdatePet, usePetDetail } from "../../hook/huyHook";


export default function EditPet() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { data: categories } = useListCategory({ resource: "category" });
  const { data: pet, isLoading, error } = usePetDetail({ resource: "pets", id: id! });
  const { mutate: updatePet } = useUpdatePet({ resource: "pets" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const [form, setForm] = useState({
    name: "",
    species: "",
    breed: "",
    age: 0,
    gender: "unknown",
    size: "medium",
    color: "",
    description: "",
    healthStatus: "good",
    vaccinated: false,
    neutered: false,
    adoptionFee: 0,
    location: "",
    categoryId: "",
  })
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

  useEffect(() => {
    if (pet) {
      setForm({
        name: pet.name || "",
        species: pet.species || "",
        breed: pet.breed || "",
        age: pet.age || 0,
        gender: pet.gender || "unknown",
        size: pet.size || "medium",
        color: pet.color || "",
        description: pet.description || "",
        healthStatus: pet.healthStatus || "good",
        vaccinated: pet.vaccinated || false,
        neutered: pet.neutered || false,
        adoptionFee: pet.adoptionFee || 0,
        location: pet.location || "",
        categoryId: pet.categoryId || "",
      })
      setExistingImages(pet.images || []);
      setNewImages([]);
    }
  }, [pet])

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

  const handleImageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setNewImages(Array.from(files));
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, String(value ?? ""));
    });
    formData.append('existingImages', JSON.stringify(existingImages));
    newImages.forEach((file) => formData.append('images', file));

    updatePet({ id: id!, values: formData }, {
      onSuccess: () => navigate("/admin/pets"),
      onError: (error: any) => {
        console.error("Error updating pet:", error);
        alert("Lỗi cập nhật pet: " + error.message);
      }
    });
  };

  if (isLoading) {
    return <p className="text-center mt-10">Đang tải dữ liệu...</p>;
  }

  if (error) {
    return <p className="text-center mt-10 text-red-500">Lỗi tải dữ liệu: {error.message}</p>;
  }

  if (!pet) {
    return <p className="text-center mt-10">Không tìm thấy thú cưng</p>;
  }

  return (
    <div className="max-w-150 mx-auto py-20 px-6">
      <h1 className="text-3xl font-bold text-center text-[#6272B6] mb-10">
        Chỉnh sửa thú cưng
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow">

        <input name="name" placeholder="Tên" value={form.name} onChange={handleChange} className="input" required />
        
        <select name="species" value={form.species} onChange={handleChange} className="input" required>
          <option value="">-- Chọn loài --</option>
          <option value="dog">Chó</option>
          <option value="cat">Mèo</option>
          <option value="bird">Chim</option>
          <option value="rabbit">Thỏ</option>
          <option value="hamster">Hamster</option>
          <option value="other">Khác</option>
        </select>

        <select name="categoryId" value={form.categoryId} onChange={handleChange} className="input">
          <option value="">-- Chọn danh mục --</option>
          {categories?.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        
        <input name="breed" placeholder="Giống" value={form.breed} onChange={handleChange} className="input" />
        
        <input name="age" type="number" placeholder="Tuổi" value={form.age} onChange={handleChange} className="input" />
        
        <select name="gender" value={form.gender} onChange={handleChange} className="input">
          <option value="unknown">-- Giới tính --</option>
          <option value="male">Đực</option>
          <option value="female">Cái</option>
        </select>
        
        <select name="size" value={form.size} onChange={handleChange} className="input">
          <option value="small">Nhỏ</option>
          <option value="medium">Trung bình</option>
          <option value="large">Lớn</option>
        </select>
        
        <div className="space-y-4">
          <label className="block text-sm font-medium">Hình ảnh</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageInput}
            className="input"
          />

          {existingImages.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Ảnh hiện tại</p>
              <div className="flex flex-wrap gap-3">
                {existingImages.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      // src={`http://localhost:5000/uploads/${img}`}
                      src={`http://localhost:5000${img}`}
                      alt={`Existing ${index + 1}`}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {newImages.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Ảnh mới</p>
              <div className="flex flex-wrap gap-3">
                {newImages.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`New ${index + 1}`}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <input name="color" placeholder="Màu sắc" value={form.color} onChange={handleChange} className="input" />
        
        <select name="healthStatus" value={form.healthStatus} onChange={handleChange} className="input">
          <option value="excellent">Xuất sắc</option>
          <option value="good">Tốt</option>
          <option value="fair">Bình thường</option>
          <option value="needs_care">Cần chăm sóc</option>
        </select>
        
        <input name="adoptionFee" type="number" placeholder="Phí nhận nuôi" value={form.adoptionFee} onChange={handleChange} className="input" />
        
        <input name="location" placeholder="Địa điểm" value={form.location} onChange={handleChange} className="input" />
        
        <textarea
        name="description"
        placeholder="Mô tả thú cưng"
        value={form.description}
        onChange={handleChange}
        className="w-full h-24 bg-[#DDEDFF] rounded-2xl px-4 py-2 outline-none"
        />

        {/* checkbox */}
        <label className="flex items-center gap-2">
          <input type="checkbox" name="vaccinated" checked={form.vaccinated} onChange={handleChange} />
          Đã tiêm phòng
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" name="neutered" checked={form.neutered} onChange={handleChange} />
          Đã triệt sản
        </label>

        <button className="w-full bg-[#6272B6] text-white py-3 rounded-full">
          Cập nhật
        </button>
      </form>
    </div>
  )
}