import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Form, Input, Select, InputNumber, Checkbox, Button, Upload, message } from "antd";
import { UploadOutlined, PlusOutlined } from "@ant-design/icons";
import { apiClient } from "../../api/http";

export default function AddPet() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get("/category", { params: { type: 'pet' } });
      setCategories(res.data.data || []);
    } catch (error) {
      message.error("Không thể tải danh mục");
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      console.log('[AddPet] Form values:', values);
      console.log('[AddPet] File list:', fileList);
      
      const formData = new FormData();
      
      // Append all form fields
      Object.keys(values).forEach(key => {
        if (values[key] !== undefined && values[key] !== null && key !== 'images') {
          formData.append(key, values[key]);
        }
      });

      // Append images
      if (fileList.length === 0) {
        message.warning("Vui lòng thêm ít nhất 1 ảnh cho thú cưng");
        setLoading(false);
        return;
      }

      fileList.forEach(file => {
        if (file.originFileObj) {
          formData.append('images', file.originFileObj);
        }
      });

      console.log('[AddPet] Submitting form data...');
      const response = await apiClient.post("/pets", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('[AddPet] Response:', response.data);
      message.success("Thêm thú cưng thành công!");
      navigate("/admin/pets");
    } catch (error: any) {
      console.error('[AddPet] Error:', error);
      console.error('[AddPet] Error response:', error.response?.data);
      message.error(error.response?.data?.message || "Thêm thú cưng thất bại");
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    fileList,
    onChange: ({ fileList: newFileList }: any) => setFileList(newFileList),
    beforeUpload: () => false,
    listType: "picture-card" as const,
    multiple: true,
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 min-h-screen">
      <Card className="max-w-3xl mx-auto border-0 shadow-lg rounded-2xl">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6272B6] to-purple-600 mb-6">
          ➕ Thêm thú cưng mới
        </h1>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            gender: "male",
            size: "medium",
            healthStatus: "good",
            vaccinated: false,
            neutered: false,
            status: "available"
          }}
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

          <Form.Item label="📷 Hình ảnh" required>
            <Upload {...uploadProps}>
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#6272B6] transition-colors cursor-pointer">
                <PlusOutlined className="text-3xl text-gray-400" />
                <div className="mt-2 text-base text-gray-600 font-medium">Click để upload ảnh</div>
                <div className="text-sm text-gray-400 mt-1">PNG, JPG, GIF (Max 5MB mỗi ảnh)</div>
                <div className="text-xs text-gray-500 mt-2">📌 Có thể chọn nhiều ảnh cùng lúc</div>
              </div>
            </Upload>
            {fileList.length > 0 && (
              <div className="mt-2 text-sm text-green-600">
                ✅ Đã chọn {fileList.length} ảnh
              </div>
            )}
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
              loading={loading}
              className="flex-1 bg-gradient-to-r from-[#6272B6] to-purple-600 border-0"
            >
              Thêm thú cưng
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}