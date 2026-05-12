import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useListCategory, useCreatePet } from "../../hook/huyHook";

export default function AddPet() {
  const navigate = useNavigate();

  const { data: categories } = useListCategory({ resource: "category" });
  const { mutate: addPet } = useCreatePet({ resource: "pets" });

  const [fileKey, setFileKey] = useState(0);

  const [form, setForm] = useState({
    name: "",
    species: "",
    breed: "",
    age: 0,
    gender: "",
    size: "",
    color: "",
    description: "",
    healthStatus: "",
    vaccinated: false,
    neutered: false,
    adoptionFee: 0,
    location: "",
    categoryId: "",
    images: [],
  });

  // HANDLE INPUT CHANGE
  const handleChange = (e:any) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "age" || name === "adoptionFee"
          ? Number(value)
          : value,
    }));
  };

  // HANDLE IMAGE UPLOAD
  const handleImageChange = (e:any) => {
    const files = e.target.files;
    if (!files) return;

    setForm((prev) => ({
      ...prev,
      images: Array.from(files),
    }));

    setFileKey((prev) => prev + 1);
  };

  const removeImage = (index:any) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // SUBMIT
  const handleSubmit = (e:any) => {
    e.preventDefault();

    const formData = new FormData();

formData.append("name", form.name);
formData.append("species", form.species);
formData.append("breed", form.breed);
formData.append("age", String(form.age));
formData.append("gender", form.gender);
formData.append("size", form.size);
formData.append("color", form.color);
formData.append("description", form.description);
formData.append("healthStatus", form.healthStatus);
formData.append("vaccinated", form.vaccinated ? "1" : "0");
formData.append("neutered", form.neutered ? "1" : "0");
formData.append("adoptionFee", String(form.adoptionFee));
formData.append("location", form.location);
formData.append("categoryId", String(form.categoryId));

    form.images.forEach((file) => {
      formData.append("images", file);
    });

    addPet(formData, {
      onSuccess: () => {
        navigate("/admin/pets");
      },
      // onError: (error) => {
      //   console.error(error);
      //   alert("Lỗi tạo pet!");
      // },
      onError: (error:any) => {
  console.log("FULL ERROR:", error);

  console.log("RESPONSE:", error.response);

  console.log("DATA:", error.response?.data);

  console.log("STATUS:", error.response?.status);

  alert(JSON.stringify(error.response?.data));
},
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
          {categories?.map((c:any) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input name="breed" placeholder="Giống" onChange={handleChange} className="input" />
        <input name="age" type="number" placeholder="Tuổi" onChange={handleChange} className="input" />

        {/* Gender */}
        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          className="input"
        >
          <option value="">-- Giới tính --</option>
          <option value="male">Đực</option>
          <option value="female">Cái</option>
        </select>

        {/* Size */}
        <select
          name="size"
          value={form.size}
          onChange={handleChange}
          className="input"
        >
          <option value="">-- Kích thước --</option>
          <option value="small">Nhỏ</option>
          <option value="medium">Trung bình</option>
          <option value="large">Lớn</option>
        </select>

        {/* IMAGES */}
        <div>
          <label className="block mb-2 font-medium">Ảnh thú cưng</label>

          <input
            key={fileKey}
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="input"
          />

          <div className="flex flex-wrap gap-2 mt-2">
            {form.images.map((file, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  className="w-20 h-20 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 rounded-full text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <input name="color" placeholder="Màu sắc" onChange={handleChange} className="input" />

        <textarea
          name="description"
          placeholder="Mô tả"
          onChange={handleChange}
          className="w-full h-24 bg-[#DDEDFF] rounded-2xl px-4 py-2 outline-none"
        />

            {/*Health Status*/}
                  <select
            name="healthStatus"
            value={form.healthStatus}
            onChange={handleChange}
            className="input"
          >
            <option value="">-- Tình trạng sức khỏe --</option>

            <option value="excellent">Rất tốt</option>

            <option value="good">Tốt</option>

            <option value="fair">Bình thường</option>

            <option value="needs_care">Cần chăm sóc</option>
          </select>

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
  );
}