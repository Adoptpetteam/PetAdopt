import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { message, Card, Button, Input, Select, Checkbox, Steps, Progress, Tag, Divider } from "antd";
import { 
  UserOutlined, PhoneOutlined, HomeOutlined, HeartOutlined, 
  CheckCircleOutlined, FormOutlined, SafetyOutlined, SendOutlined,
  DollarOutlined, TeamOutlined, SmileOutlined
} from "@ant-design/icons";
import { getPetById } from "../api/petApi";
import { createAdoptionRequest } from "../api/adoptionApi";

const { TextArea } = Input;
const { Option } = Select;

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
      .then(res => setPet(res.data))
      .catch(() => {
        message.error("Không tìm thấy thú cưng");
        navigate("/adopt");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
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
      form.fullName, form.phone, form.address, form.housingType,
      form.familyMembers, form.monthlyIncome, form.reason, form.commitment
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
          <p className="text-gray-500">Đang tải thông tin thú cưng...</p>
        </div>
      </div>
    );
  }

  const imagePath = pet.image || pet.images?.[0];
  const petImage = imagePath
    ? (imagePath.startsWith('http') ? imagePath : `http://localhost:5000${imagePath}`)
    : "/images/Jack.png";

  const steps = [
    {
      title: 'Thông tin cá nhân',
      icon: <UserOutlined />
    },
    {
      title: 'Điều kiện sống',
      icon: <HomeOutlined />
    },
    {
      title: 'Cam kết',
      icon: <HeartOutlined />
    }
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
                placeholder="Nguyễn Văn A"
                value={form.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className="rounded-xl border-2 border-gray-200 hover:border-[#6272B6] focus:border-[#6272B6]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <PhoneOutlined className="mr-2 text-[#6272B6]" />
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <Input
                size="large"
                placeholder="0912345678"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="rounded-xl border-2 border-gray-200 hover:border-[#6272B6] focus:border-[#6272B6]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <HomeOutlined className="mr-2 text-[#6272B6]" />
                Địa chỉ <span className="text-red-500">*</span>
              </label>
              <TextArea
                rows={3}
                placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="rounded-xl border-2 border-gray-200 hover:border-[#6272B6] focus:border-[#6272B6]"
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <HomeOutlined className="mr-2 text-[#6272B6]" />
                Loại nhà ở <span className="text-red-500">*</span>
              </label>
              <Select
                size="large"
                placeholder="Chọn loại nhà ở"
                value={form.housingType}
                onChange={(value) => handleChange('housingType', value)}
                className="w-full"
              >
                <Option value="house">🏠 Nhà riêng</Option>
                <Option value="apartment">🏢 Căn hộ chung cư</Option>
                <Option value="dorm">🏫 Ký túc xá</Option>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <TeamOutlined className="mr-2 text-[#6272B6]" />
                  Số thành viên gia đình <span className="text-red-500">*</span>
                </label>
                <Input
                  size="large"
                  placeholder="Ví dụ: 4"
                  value={form.familyMembers}
                  onChange={(e) => handleChange('familyMembers', e.target.value)}
                  className="rounded-xl border-2 border-gray-200 hover:border-[#6272B6] focus:border-[#6272B6]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <DollarOutlined className="mr-2 text-[#6272B6]" />
                  Thu nhập hàng tháng <span className="text-red-500">*</span>
                </label>
                <Select
                  size="large"
                  placeholder="Chọn mức thu nhập"
                  value={form.monthlyIncome}
                  onChange={(value) => handleChange('monthlyIncome', value)}
                  className="w-full"
                >
                  <Option value="under_5m">💰 Dưới 5 triệu</Option>
                  <Option value="5m_10m">💰 5 - 10 triệu</Option>
                  <Option value="10m_20m">💰 10 - 20 triệu</Option>
                  <Option value="over_20m">💰 Trên 20 triệu</Option>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <Checkbox
                checked={form.hasYard}
                onChange={(e) => handleChange('hasYard', e.target.checked)}
                className="text-gray-700"
              >
                🌳 Có sân vườn/không gian rộng cho thú cưng vui chơi
              </Checkbox>

              <Checkbox
                checked={form.hasChildren}
                onChange={(e) => handleChange('hasChildren', e.target.checked)}
                className="text-gray-700"
              >
                👶 Có trẻ em trong gia đình
              </Checkbox>

              {form.hasChildren && (
                <Input
                  placeholder="Độ tuổi của trẻ (ví dụ: 5, 8 tuổi)"
                  value={form.childrenAges}
                  onChange={(e) => handleChange('childrenAges', e.target.value)}
                  className="ml-6 rounded-xl border-2 border-gray-200 hover:border-[#6272B6] focus:border-[#6272B6]"
                />
              )}

              <Checkbox
                checked={form.hasOtherPets}
                onChange={(e) => handleChange('hasOtherPets', e.target.checked)}
                className="text-gray-700"
              >
                🐾 Đã nuôi thú cưng khác
              </Checkbox>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FormOutlined className="mr-2 text-[#6272B6]" />
                Kinh nghiệm nuôi thú cưng
              </label>
              <Select
                size="large"
                placeholder="Chọn mức độ kinh nghiệm"
                value={form.experience}
                onChange={(value) => handleChange('experience', value)}
                className="w-full"
              >
                <Option value="none">🆕 Chưa có kinh nghiệm</Option>
                <Option value="basic">📚 Có kinh nghiệm cơ bản</Option>
                <Option value="experienced">⭐ Có nhiều kinh nghiệm</Option>
                <Option value="expert">🏆 Chuyên gia</Option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <HeartOutlined className="mr-2 text-[#6272B6]" />
                Lý do muốn nhận nuôi {pet?.name} <span className="text-red-500">*</span>
              </label>
              <TextArea
                rows={4}
                placeholder="Hãy chia sẻ lý do bạn muốn nhận nuôi bé này và cách bạn sẽ chăm sóc..."
                value={form.reason}
                onChange={(e) => handleChange('reason', e.target.value)}
                className="rounded-xl border-2 border-gray-200 hover:border-[#6272B6] focus:border-[#6272B6]"
              />
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl">
              <div className="flex items-start gap-3">
                <SafetyOutlined className="text-[#6272B6] text-xl mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Cam kết nhận nuôi có trách nhiệm</h4>
                  <ul className="text-sm text-gray-600 space-y-1 mb-4">
                    <li>• Chăm sóc thú cưng chu đáo, đầy đủ dinh dưỡng</li>
                    <li>• Đưa đi khám sức khỏe định kỳ, tiêm phòng đầy đủ</li>
                    <li>• Không bỏ rơi, tặng lại hoặc bán thú cưng</li>
                    <li>• Thông báo với trung tâm nếu có vấn đề phát sinh</li>
                  </ul>
                  <Checkbox
                    checked={form.commitment}
                    onChange={(e) => handleChange('commitment', e.target.checked)}
                    className="text-gray-700 font-medium"
                  >
                    <span className="text-red-500">*</span> Tôi đồng ý và cam kết thực hiện các điều khoản trên
                  </Checkbox>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6272B6] to-purple-600 mb-2">
              💝 Đăng Ký Nhận Nuôi
            </h1>
            <div className="absolute -inset-1 bg-gradient-to-r from-[#6272B6] to-purple-600 rounded-lg blur opacity-25"></div>
          </div>
          <p className="text-gray-600 text-lg mt-4">
            Cùng tạo nên một mái ấm yêu thương cho <span className="font-bold text-[#6272B6]">{pet?.name}</span>
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress 
            percent={getProgress()} 
            strokeColor={{
              '0%': '#6272B6',
              '100%': '#a78bfa',
            }}
            className="mb-4"
          />
          <p className="text-center text-sm text-gray-500">
            Hoàn thành {getProgress()}% thông tin
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pet Info */}
          <div className="lg:col-span-1">
            <Card 
              className="border-0 shadow-xl rounded-3xl overflow-hidden sticky top-8"
              cover={
                <div className="relative">
                  <img 
                    src={petImage} 
                    className="w-full h-[300px] object-cover" 
                    alt={pet?.name} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h2 className="text-2xl font-bold">{pet?.name}</h2>
                    <div className="flex gap-2 mt-2">
                      <Tag color="blue">{pet?.age} tuổi</Tag>
                      <Tag color={pet?.gender === 'Male' ? 'blue' : 'pink'}>
                        {pet?.gender === 'Male' ? '♂ Đực' : '♀ Cái'}
                      </Tag>
                    </div>
                  </div>
                </div>
              }
            >
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Thông tin thú cưng</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Loài:</span>
                    <span className="font-medium">{pet?.species || 'Không rõ'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Trạng thái:</span>
                    <Tag color="green">Sẵn sàng nhận nuôi</Tag>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
              <div className="p-8">
                {/* Steps */}
                <Steps
                  current={currentStep}
                  className="mb-8"
                  items={steps}
                />

                {/* Step Content */}
                <div className="min-h-[400px]">
                  {renderStepContent()}
                </div>

                <Divider />

                {/* Navigation */}
                <div className="flex justify-between">
                  <Button
                    size="large"
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                    className="rounded-full px-8"
                  >
                    Quay lại
                  </Button>

                  <div className="flex gap-3">
                    {currentStep < 2 ? (
                      <Button
                        type="primary"
                        size="large"
                        onClick={() => setCurrentStep(currentStep + 1)}
                        disabled={!validateStep(currentStep)}
                        className="bg-[#6272B6] border-0 rounded-full px-8"
                      >
                        Tiếp tục
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        size="large"
                        loading={submitting}
                        onClick={handleSubmit}
                        disabled={!validateStep(2)}
                        icon={<SendOutlined />}
                        className="bg-gradient-to-r from-[#6272B6] to-purple-600 border-0 rounded-full px-8 font-semibold"
                      >
                        {submitting ? "Đang gửi..." : "Gửi đơn nhận nuôi"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
