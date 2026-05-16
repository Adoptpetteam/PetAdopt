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
  CheckCircleOutlined,
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

  // Add animation styles
  const animationStyles = `
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .animate-fadeIn {
      animation: fadeIn 0.5s ease-out;
    }
  `;

  useEffect(() => {
    // Inject animation styles
    const styleSheet = document.createElement("style");
    styleSheet.textContent = animationStyles;
    document.head.appendChild(styleSheet);
    
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

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
          <div className="space-y-6 animate-fadeIn">
            <div className="transform transition-all duration-300 hover:scale-[1.02]">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <UserOutlined className="mr-2 text-[#6272B6]" />
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <Input
                size="large"
                placeholder="Nguyễn Trung Huy"
                value={form.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                className="rounded-xl border-2 hover:border-[#6272B6] focus:border-[#6272B6] transition-all"
                prefix={<UserOutlined className="text-gray-400" />}
              />
            </div>

            <div className="transform transition-all duration-300 hover:scale-[1.02]">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <PhoneOutlined className="mr-2 text-[#6272B6]" />
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <Input
                size="large"
                placeholder="09xxxxxxxx"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="rounded-xl border-2 hover:border-[#6272B6] focus:border-[#6272B6] transition-all"
                prefix={<PhoneOutlined className="text-gray-400" />}
              />
            </div>

            <div className="transform transition-all duration-300 hover:scale-[1.02]">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <HomeOutlined className="mr-2 text-[#6272B6]" />
                Địa chỉ <span className="text-red-500">*</span>
              </label>
              <TextArea
                rows={3}
                placeholder="Nhập địa chỉ đầy đủ của bạn"
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="rounded-xl border-2 hover:border-[#6272B6] focus:border-[#6272B6] transition-all"
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="transform transition-all duration-300 hover:scale-[1.02]">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <HomeOutlined className="mr-2 text-[#6272B6]" />
                  Loại nhà ở <span className="text-red-500">*</span>
                </label>
                <Select
                  size="large"
                  placeholder="Chọn loại nhà ở"
                  value={form.housingType}
                  onChange={(value) => handleChange("housingType", value)}
                  className="w-full rounded-xl"
                >
                  <Option value="apartment">🏢 Chung cư</Option>
                  <Option value="house">🏠 Nhà riêng</Option>
                  <Option value="farm">🌾 Trang trại</Option>
                  <Option value="other">🏘️ Khác</Option>
                </Select>
              </div>

              <div className="transform transition-all duration-300 hover:scale-[1.02]">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <TeamOutlined className="mr-2 text-[#6272B6]" />
                  Số thành viên gia đình <span className="text-red-500">*</span>
                </label>
                <Input
                  size="large"
                  type="number"
                  placeholder="VD: 4"
                  value={form.familyMembers}
                  onChange={(e) => handleChange("familyMembers", e.target.value)}
                  className="rounded-xl border-2 hover:border-[#6272B6] focus:border-[#6272B6] transition-all"
                  prefix={<TeamOutlined className="text-gray-400" />}
                />
              </div>
            </div>

            <div className="transform transition-all duration-300 hover:scale-[1.02]">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <DollarOutlined className="mr-2 text-[#6272B6]" />
                Thu nhập hàng tháng <span className="text-red-500">*</span>
              </label>
              <Select
                size="large"
                placeholder="Chọn mức thu nhập"
                value={form.monthlyIncome}
                onChange={(value) => handleChange("monthlyIncome", value)}
                className="w-full rounded-xl"
              >
                <Option value="under_5m">💰 Dưới 5 triệu</Option>
                <Option value="5m_10m">💵 5-10 triệu</Option>
                <Option value="10m_20m">💸 10-20 triệu</Option>
                <Option value="over_20m">💎 Trên 20 triệu</Option>
              </Select>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border-2 border-blue-100 space-y-4">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                <HomeOutlined className="mr-2 text-[#6272B6]" />
                Thông tin thêm
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all">
                  <Checkbox
                    checked={form.hasYard}
                    onChange={(e) => handleChange("hasYard", e.target.checked)}
                    className="text-base"
                  >
                    <span className="font-medium">🌳 Có sân vườn</span>
                  </Checkbox>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all">
                  <Checkbox
                    checked={form.hasChildren}
                    onChange={(e) => handleChange("hasChildren", e.target.checked)}
                    className="text-base"
                  >
                    <span className="font-medium">👶 Có trẻ em trong nhà</span>
                  </Checkbox>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all">
                  <Checkbox
                    checked={form.hasOtherPets}
                    onChange={(e) => handleChange("hasOtherPets", e.target.checked)}
                    className="text-base"
                  >
                    <span className="font-medium">🐾 Đã nuôi thú cưng khác</span>
                  </Checkbox>
                </div>
              </div>

              {form.hasChildren && (
                <div className="mt-4 animate-fadeIn">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Độ tuổi trẻ em
                  </label>
                  <Input
                    size="large"
                    placeholder="VD: 5, 8 tuổi"
                    value={form.childrenAges}
                    onChange={(e) => handleChange("childrenAges", e.target.value)}
                    className="rounded-xl border-2 hover:border-[#6272B6] focus:border-[#6272B6] transition-all"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="transform transition-all duration-300 hover:scale-[1.02]">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FormOutlined className="mr-2 text-[#6272B6]" />
                Lý do muốn nhận nuôi <span className="text-red-500">*</span>
              </label>
              <TextArea
                rows={5}
                placeholder="Chia sẻ lý do bạn muốn nhận nuôi thú cưng này... Hãy cho chúng tôi biết tại sao bạn nghĩ mình phù hợp để chăm sóc bé ❤️"
                value={form.reason}
                onChange={(e) => handleChange("reason", e.target.value)}
                className="rounded-xl border-2 hover:border-[#6272B6] focus:border-[#6272B6] transition-all"
                showCount
                maxLength={1000}
              />
            </div>

            <div className="transform transition-all duration-300 hover:scale-[1.02]">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <SafetyOutlined className="mr-2 text-[#6272B6]" />
                Kinh nghiệm nuôi thú cưng
              </label>
              <Select
                size="large"
                placeholder="Chọn mức độ kinh nghiệm"
                value={form.experience}
                onChange={(value) => handleChange("experience", value)}
                className="w-full rounded-xl"
              >
                <Option value="none">🌱 Chưa có kinh nghiệm</Option>
                <Option value="basic">🌿 Mới bắt đầu (dưới 1 năm)</Option>
                <Option value="experienced">🌳 Trung bình (1-3 năm)</Option>
                <Option value="expert">🏆 Có kinh nghiệm (trên 3 năm)</Option>
              </Select>
            </div>

            <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-8 rounded-3xl border-4 border-pink-200 shadow-xl">
              <Checkbox
                checked={form.commitment}
                onChange={(e) => handleChange("commitment", e.target.checked)}
                className="items-start"
              >
                <div className="ml-2">
                  <p className="font-bold text-xl text-gray-800 mb-4 flex items-center">
                    <HeartOutlined className="mr-3 text-red-500 text-2xl animate-pulse" />
                    Cam kết nhận nuôi <span className="text-red-500 ml-2">*</span>
                  </p>
                  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl">
                    <p className="text-sm text-gray-600 mb-4 italic">
                      Bằng việc đánh dấu vào ô này, tôi cam kết:
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start text-sm text-gray-700">
                        <span className="text-green-500 mr-3 text-lg">✓</span>
                        <span><strong>Chăm sóc chu đáo:</strong> Đảm bảo thú cưng được chăm sóc đầy đủ về sức khỏe, dinh dưỡng và tinh thần</span>
                      </li>
                      <li className="flex items-start text-sm text-gray-700">
                        <span className="text-green-500 mr-3 text-lg">✓</span>
                        <span><strong>Y tế định kỳ:</strong> Đưa thú cưng đi khám sức khỏe, tiêm phòng và điều trị khi cần thiết</span>
                      </li>
                      <li className="flex items-start text-sm text-gray-700">
                        <span className="text-green-500 mr-3 text-lg">✓</span>
                        <span><strong>Không bỏ rơi:</strong> Cam kết không bỏ rơi, ngược đãi hoặc chuyển nhượng thú cưng cho người khác</span>
                      </li>
                      <li className="flex items-start text-sm text-gray-700">
                        <span className="text-green-500 mr-3 text-lg">✓</span>
                        <span><strong>Thông báo kịp thời:</strong> Liên hệ với trung tâm nếu có vấn đề phát sinh hoặc không thể tiếp tục nuôi</span>
                      </li>
                      <li className="flex items-start text-sm text-gray-700">
                        <span className="text-green-500 mr-3 text-lg">✓</span>
                        <span><strong>Yêu thương trọn đời:</strong> Coi thú cưng như thành viên gia đình và yêu thương suốt đời</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Checkbox>
            </div>

            {form.commitment && (
              <div className="bg-green-50 border-2 border-green-200 p-4 rounded-2xl animate-fadeIn">
                <p className="text-green-700 text-center font-medium flex items-center justify-center">
                  <CheckCircleOutlined className="mr-2 text-xl" />
                  Cảm ơn bạn đã cam kết! Chúng tôi tin tưởng bạn sẽ là người chủ tuyệt vời 💚
                </p>
              </div>
            )}
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
            <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden sticky top-24 transform hover:scale-105 transition-all duration-300">
              <div className="relative">
                <img
                  src={petImage}
                  className="w-full h-[350px] object-cover"
                  alt={pet?.name}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <h3 className="text-white text-2xl font-bold mb-2">{pet?.name}</h3>
                  <div className="flex gap-2">
                    <Tag color="blue" className="text-sm">{pet?.species}</Tag>
                    <Tag color="green" className="text-sm">{pet?.age}</Tag>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
                <p className="text-gray-700 text-center italic">
                  "Tôi đang chờ đợi một mái ấm yêu thương... 🐾"
                </p>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
              <div className="p-8">
                <Steps current={currentStep} className="mb-8" items={steps} />

                <div className="min-h-[400px]">{renderStepContent()}</div>

                <Divider />

                <div className="flex justify-between items-center">
                  <Button
                    size="large"
                    onClick={() =>
                      setCurrentStep(Math.max(0, currentStep - 1))
                    }
                    disabled={currentStep === 0}
                    className="rounded-full px-8 hover:scale-105 transition-transform"
                  >
                    ← Quay lại
                  </Button>

                  {currentStep < 2 ? (
                    <Button
                      type="primary"
                      size="large"
                      onClick={() => setCurrentStep(currentStep + 1)}
                      disabled={!validateStep(currentStep)}
                      className="bg-gradient-to-r from-[#6272B6] to-purple-600 border-0 rounded-full px-8 hover:scale-105 transition-transform shadow-lg"
                    >
                      Bước tiếp theo →
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      size="large"
                      loading={submitting}
                      onClick={handleSubmit}
                      icon={<SendOutlined />}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 border-0 rounded-full px-8 hover:scale-105 transition-transform shadow-lg"
                    >
                      {submitting ? "Đang gửi..." : "🎉 Gửi đơn nhận nuôi"}
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