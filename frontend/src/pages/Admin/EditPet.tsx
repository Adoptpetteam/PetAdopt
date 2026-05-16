import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Form, Input, Select, InputNumber, Checkbox, Button, Upload, message, Spin } from "antd";
import { UploadOutlined, PlusOutlined } from "@ant-design/icons";
import { apiClient } from "../../api/http";

export default function EditPet() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [petRes, categoriesRes] = await Promise.all([
        apiClient.get(`/pets/${id}`),
        apiClient.get("/category", { params: { type: 'pet' } })
      ]);

      const pet = petRes.data.data;
      setCategories(categoriesRes.data.data || []);
      
      // Set existing images
      const images = pet.images || [];
      setExistingImages(images);
      
      console.log('[EditPet] Pet data:', pet);
      console.log('[EditPet] Images:', images);

      form.setFieldsValue({
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        age: pet.age,
        gender: pet.gender,
        size: pet.size,
        color: pet.color,
        description: pet.description,
        healthStatus: pet.healthStatus,
        adoptionFee: pet.adoptionFee,
        location: pet.location,
        categoryId: typeof pet.categoryId === 'object' ? pet.categoryId?._id : pet.categoryId,
        vaccinated: pet.vaccinated,
        neutered: pet.neutered,
        status: pet.status
      });
    } catch (error: any) {
      console.error('[EditPet] Error:', error);
      message.error(error.response?.data?.message || "Không thể tải dữ liệu");
      navigate("/admin/pets");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      
      // Append all form fields
      Object.keys(values).forEach(key => {
        if (values[key] !== undefined && values[key] !== null && key !== 'images') {
          formData.append(key, values[key]);
        }
      });

      // Append existing images
      formData.append('existingImages', JSON.stringify(existingImages));

      // Append new images
      fileList.forEach(file => {
        if (file.originFileObj) {
          formData.append('images', file.originFileObj);
        }
      });

      await apiClient.put(`/pets/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      message.success("Cập nhật thú cưng thành công!");
      navigate("/admin/pets");
    } catch (error: any) {
      message.error(error.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "https://placehold.co/100x100?text=No+Image";
    if (imagePath.startsWith('http')) return imagePath;
    // Đảm bảo path bắt đầu với /
    const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `http://localhost:5000${path}`;
  };

  const uploadProps = {
    fileList,
    onChange: ({ fileList: newFileList }: any) => setFileList(newFileList),
    beforeUpload: () => false,
    listType: "picture-card" as const,
    multiple: true,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 min-h-screen">
      <Card className="max-w-3xl mx-auto border-0 shadow-lg rounded-2xl">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6272B6] to-purple-600 mb-6">
          ✏️ Chỉnh sửa thú cưng
        </h1>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="name"
              label="Tên thú cưng"
              rules={[{ required: true, message: "Vui lòng nhập tên" }]}
            >
              <Input size="large" placeholder="Ví dụ: Lucky" />
            </Form.Item>

            <Form.Item
              name="species"
              label="Loài"
              rules={[{ required: true, message: "Vui lòng chọn loài" }]}
            >
              <Select size="large" placeholder="Chọn loài">
                <Select.Option value="dog">🐕 Chó</Select.Option>
                <Select.Option value="cat">🐱 Mèo</Select.Option>
                <Select.Option value="bird">🐦 Chim</Select.Option>
                <Select.Option value="rabbit">🐰 Thỏ</Select.Option>
                <Select.Option value="hamster">🐹 Hamster</Select.Option>
                <Select.Option value="other">🐾 Khác</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="categoryId" label="Danh mục">
              <Select size="large" placeholder="Chọn danh mục" allowClear>
                {categories.map((cat) => (
                  <Select.Option key={cat._id} value={cat._id}>
                    {cat.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="breed" label="Giống">
              <Input size="large" placeholder="Ví dụ: Golden Retriever" />
            </Form.Item>

            <Form.Item name="age" label="Tuổi">
              <InputNumber size="large" min={0} className="w-full" placeholder="0" />
            </Form.Item>

            <Form.Item name="gender" label="Giới tính">
              <Select size="large">
                <Select.Option value="male">♂ Đực</Select.Option>
                <Select.Option value="female">♀ Cái</Select.Option>
                <Select.Option value="unknown">❓ Không rõ</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="size" label="Kích thước">
              <Select size="large">
                <Select.Option value="small">Nhỏ</Select.Option>
                <Select.Option value="medium">Trung bình</Select.Option>
                <Select.Option value="large">Lớn</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="color" label="Màu sắc">
              <Input size="large" placeholder="Ví dụ: Vàng" />
            </Form.Item>

            <Form.Item name="healthStatus" label="Tình trạng sức khỏe">
              <Select size="large">
                <Select.Option value="excellent">Xuất sắc</Select.Option>
                <Select.Option value="good">Tốt</Select.Option>
                <Select.Option value="fair">Bình thường</Select.Option>
                <Select.Option value="needs_care">Cần chăm sóc</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="adoptionFee" label="Phí nhận nuôi (VNĐ)">
              <InputNumber size="large" min={0} className="w-full" placeholder="0" />
            </Form.Item>

            <Form.Item name="location" label="Địa điểm">
              <Input size="large" placeholder="Ví dụ: Hà Nội" />
            </Form.Item>

            <Form.Item name="status" label="Trạng thái">
              <Select size="large">
                <Select.Option value="available">Sẵn sàng nhận nuôi</Select.Option>
                <Select.Option value="pending">Chờ duyệt</Select.Option>
                <Select.Option value="reserved">Đã đặt</Select.Option>
                <Select.Option value="adopted">Đã nhận nuôi</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={4} placeholder="Mô tả về thú cưng..." />
          </Form.Item>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3 text-gray-700">
                📷 Ảnh hiện tại ({existingImages.length})
              </label>
              <div className="flex flex-wrap gap-3">
                {existingImages.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={getImageUrl(img)}
                      alt={`Ảnh ${index + 1}`}
                      className="w-28 h-28 object-cover rounded-xl border-2 border-gray-300 shadow-sm hover:shadow-md transition-all"
                      onError={(e) => {
                        console.error('[EditPet] Image load error:', img);
                        (e.target as HTMLImageElement).src = "https://placehold.co/100x100?text=Error";
                      }}
                      onLoad={() => {
                        console.log('[EditPet] Image loaded successfully:', img);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                      title="Xóa ảnh"
                    >
                      ×
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center py-1 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity">
                      Ảnh {index + 1}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Click vào dấu × để xóa ảnh không muốn giữ lại
              </p>
            </div>
          )}

          {/* New Images Upload */}
          <Form.Item label="➕ Thêm ảnh mới">
            <Upload {...uploadProps}>
              <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#6272B6] transition-colors">
                <PlusOutlined className="text-2xl text-gray-400" />
                <div className="mt-2 text-sm text-gray-600">Click để upload</div>
                <div className="text-xs text-gray-400">PNG, JPG, GIF (Max 5MB)</div>
              </div>
            </Upload>
            <p className="text-xs text-gray-500 mt-2">
              📌 Có thể upload nhiều ảnh cùng lúc
            </p>
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="vaccinated" valuePropName="checked">
              <Checkbox>💉 Đã tiêm phòng</Checkbox>
            </Form.Item>

            <Form.Item name="neutered" valuePropName="checked">
              <Checkbox>✂️ Đã triệt sản</Checkbox>
            </Form.Item>
          </div>

          <div className="flex gap-4 mt-6">
            <Button
              type="default"
              size="large"
              onClick={() => navigate("/admin/pets")}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={submitting}
              className="flex-1 bg-gradient-to-r from-[#6272B6] to-purple-600 border-0"
            >
              Cập nhật
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}