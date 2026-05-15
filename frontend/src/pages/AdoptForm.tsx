import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  message,
  Card,
  Button,
  Input,
  Select,
  Checkbox,
  Steps,
  Progress,
  Tag,
  Divider,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  HomeOutlined,
  HeartOutlined,
  FormOutlined,
  SafetyOutlined,
  SendOutlined,
  DollarOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { getPetById } from "../api/petApi";
import { createAdoptionRequest } from "../api/adoptionApi";

const { TextArea } = Input;
const { Option } = Select;

// Adopt form page
export default function AdoptForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    reason: "",
    experience: "none",
    housingType: "",
    hasYard: false,
    familyMembers: "",
    hasChildren: false,
    childrenAges: "",
    hasOtherPets: false,
    monthlyIncome: "",
    commitment: false,
  });

  useEffect(() => {
    if (!id) return;

    setLoading(true);

    getPetById(id)
      .then((res) => setPet(res.data))
      .catch(() => {
        message.error("Không tìm thấy thú cưng");
        navigate("/adopt");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 0:
        return form.fullName && form.phone && form.address;
      case 1:
        return form.housingType && form.familyMembers && form.monthlyIncome;
      case 2:
        return form.reason && form.commitment;
      default:
        return true;
    }
  };

  const getProgress = () => {
    const fields = [
      form.fullName,
      form.phone,
      form.address,
      form.housingType,
      form.familyMembers,
      form.monthlyIncome,
      form.reason,
      form.commitment,
    ];

    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) {
      message.warning("Vui lòng hoàn thành tất cả thông tin bắt buộc");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      message.warning("Vui lòng đăng nhập để gửi đơn nhận nuôi");
      navigate("/login");
      return;
    }

    setSubmitting(true);

    try {
      await createAdoptionRequest({
        pet: id || "",
        fullName: form.fullName,
        phone: form.phone,
        address: form.address,
        reason: form.reason,
        experience: form.experience,
        housingType: form.housingType,
        hasYard: form.hasYard,
        familyMembers: form.familyMembers,
        hasChildren: form.hasChildren,
        childrenAges: form.childrenAges,
        hasOtherPets: form.hasOtherPets,
        monthlyIncome: form.monthlyIncome,
        commitment: form.commitment,
      });

      message.success("Đơn nhận nuôi đã được gửi thành công!");
      navigate("/success");
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Gửi đơn thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[#6272B6] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải dữ liệu thú cưng...</p>
        </div>
      </div>
    );
  }

  const imagePath = pet.image || pet.images?.[0];
  const petImage = imagePath
    ? imagePath.startsWith("http")
      ? imagePath
      : `http://localhost:5000${imagePath}`
    : "/images/Jack.png";

  const steps = [
    {
      title: "Thông tin cá nhân",
      icon: <UserOutlined />,
    },
    {
      title: "Điều kiện sống",
      icon: <HomeOutlined />,
    },
    {
      title: "Cam kết",
      icon: <HeartOutlined />,
    },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <UserOutlined className="mr-2 text-[#6272B6]" />
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <Input
                size="large"
                placeholder="Nguyễn Trung Huy"
                value={form.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <PhoneOutlined className="mr-2 text-[#6272B6]" />
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <Input
                size="large"
                placeholder="09xxxxxxxx"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <HomeOutlined className="mr-2 text-[#6272B6]" />
                Địa chỉ <span className="text-red-500">*</span>
              </label>
              <TextArea
                rows={3}
                placeholder="Nhập địa chỉ đầy đủ của bạn"
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <p className="text-gray-500">Thông tin điều kiện sống của bạn.</p>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <p className="text-gray-500">
              Vui lòng xác nhận cam kết trước khi gửi đơn.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6272B6] to-purple-600 mb-2">
            💝 Đăng Ký Nhận Nuôi
          </h1>

          <p className="text-gray-600 text-lg mt-4">
            Cùng tạo nên một mái ấm yêu thương cho{" "}
            <span className="font-bold text-[#6272B6]">{pet?.name}</span>
          </p>
        </div>

        <div className="mb-8">
          <Progress
            percent={getProgress()}
            strokeColor={{
              "0%": "#6272B6",
              "100%": "#a78bfa",
            }}
            className="mb-4"
          />

          <p className="text-center text-sm text-gray-500">
            Hoàn thành {getProgress()}% thông tin
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
              <img
                src={petImage}
                className="w-full h-[300px] object-cover"
                alt={pet?.name}
              />
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
              <div className="p-8">
                <Steps current={currentStep} className="mb-8" items={steps} />

                <div className="min-h-[400px]">{renderStepContent()}</div>

                <Divider />

                <div className="flex justify-between">
                  <Button
                    size="large"
                    onClick={() =>
                      setCurrentStep(Math.max(0, currentStep - 1))
                    }
                    disabled={currentStep === 0}
                  >
                    Quay lại
                  </Button>

                  {currentStep < 2 ? (
                    <Button
                      type="primary"
                      size="large"
                      onClick={() => setCurrentStep(currentStep + 1)}
                      disabled={!validateStep(currentStep)}
                      className="bg-[#6272B6]"
                    >
                      Bước tiếp theo
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      size="large"
                      loading={submitting}
                      onClick={handleSubmit}
                      icon={<SendOutlined />}
                      className="bg-[#6272B6]"
                    >
                      {submitting ? "Đang gửi..." : "Gửi đơn nhận nuôi"}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}