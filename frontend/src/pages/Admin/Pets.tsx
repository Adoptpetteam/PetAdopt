import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { Card, Button, Space, Popconfirm, message, Select, Input, Tag, Empty } from "antd"
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, BugOutlined } from "@ant-design/icons"
import { apiClient } from "../../api/http"

interface Pet {
  _id: string;
  name: string;
  age: number;
  gender: string;
  species: string;
  breed?: string;
  image?: string;
  images?: string[];
  categoryId?: {
    _id: string;
    name: string;
  };
  neutered: boolean;
  color: string;
  vaccinated: boolean;
  status: string;
  adoptionFee?: number;
}

interface Category {
  _id: string;
  name: string;
  type: string;
}

export default function Pets() {
  const navigate = useNavigate();
  const [pets, setPets] = useState<Pet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [petsRes, categoriesRes] = await Promise.all([
        apiClient.get("/pets?limit=100"),
        apiClient.get("/category", { params: { type: 'pet' } })
      ]);
      setPets(petsRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
    } catch (error) {
      message.error("Không thể tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/pets/${id}`);
      message.success("Xóa thành công!");
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể xóa thú cưng");
    }
  };

  const getImageUrl = (pet: Pet) => {
    const imagePath = pet.image || pet.images?.[0];
    if (!imagePath) return "https://placehold.co/200x200?text=No+Image";
    return imagePath.startsWith('http') ? imagePath : `http://localhost:5000${imagePath}`;
  };

  const statusConfig: Record<string, { color: string; label: string }> = {
    available: { color: "green", label: "Sẵn sàng" },
    adopted: { color: "blue", label: "Đã nhận nuôi" },
    pending: { color: "orange", label: "Chờ duyệt" },
    reserved: { color: "purple", label: "Đã đặt" },
  };

  const filteredPets = pets.filter((pet) => {
    const matchSearch = searchText === "" || 
      pet.name.toLowerCase().includes(searchText.toLowerCase()) ||
      pet.breed?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchCategory = selectedCategory === "all" || 
      (typeof pet.categoryId === 'object' && pet.categoryId?._id === selectedCategory);
    
    const matchStatus = selectedStatus === "all" || pet.status === selectedStatus;
    
    return matchSearch && matchCategory && matchStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[#6272B6] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6272B6] to-purple-600 flex items-center gap-2">
              {/* <BugOutlined /> Quản lý Thú cưng */}
              Quản lý thú cưng
            </h1>
            <p className="text-gray-500 mt-1">Quản lý danh sách thú cưng trong hệ thống</p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/admin/pets/add")}
            className="bg-gradient-to-r from-[#6272B6] to-purple-600 border-0 h-10 px-6 rounded-full"
            size="large"
          >
            Thêm thú cưng
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Tìm theo tên, giống..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              size="large"
            />
            <Select
              placeholder="Lọc theo danh mục"
              value={selectedCategory}
              onChange={setSelectedCategory}
              size="large"
              className="w-full"
            >
              <Select.Option value="all">Tất cả danh mục</Select.Option>
              {categories.map((cat) => (
                <Select.Option key={cat._id} value={cat._id}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
            <Select
              placeholder="Lọc theo trạng thái"
              value={selectedStatus}
              onChange={setSelectedStatus}
              size="large"
              className="w-full"
            >
              <Select.Option value="all">Tất cả trạng thái</Select.Option>
              <Select.Option value="available">Sẵn sàng</Select.Option>
              <Select.Option value="adopted">Đã nhận nuôi</Select.Option>
              <Select.Option value="pending">Chờ duyệt</Select.Option>
              <Select.Option value="reserved">Đã đặt</Select.Option>
            </Select>
            <div className="flex items-center text-gray-600">
              Hiển thị <strong className="mx-2">{filteredPets.length}</strong> / {pets.length}
            </div>
          </div>
        </Card>
      </div>

      {/* Pet Grid */}
      {filteredPets.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <Empty
            description={
              <div>
                <p className="text-gray-500 mb-4">Không tìm thấy thú cưng nào</p>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate("/admin/pets/add")}
                  className="bg-[#6272B6] border-0"
                >
                  Thêm thú cưng mới
                </Button>
              </div>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPets.map((pet) => (
            <Card
              key={pet._id}
              className="border-0 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              cover={
                <div className="relative">
                  <img
                    src={getImageUrl(pet)}
                    alt={pet.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/200x200?text=No+Image";
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    <Tag color={statusConfig[pet.status]?.color || "default"}>
                      {statusConfig[pet.status]?.label || pet.status}
                    </Tag>
                  </div>
                  {typeof pet.categoryId === 'object' && pet.categoryId?.name && (
                    <div className="absolute top-3 left-3">
                      <Tag color="blue">{pet.categoryId.name}</Tag>
                    </div>
                  )}
                </div>
              }
            >
              <div className="p-2">
                <h3 className="text-lg font-bold text-gray-800 mb-2 truncate">
                  {pet.name}
                </h3>
                
                <div className="space-y-1 text-sm text-gray-600 mb-4">
                  <div className="flex justify-between">
                    <span>Giống:</span>
                    <span className="font-medium">{pet.breed || "Không rõ"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tuổi:</span>
                    <span className="font-medium">{pet.age} tuổi</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Giới tính:</span>
                    <Tag color={pet.gender === 'male' ? 'blue' : 'pink'} className="m-0">
                      {pet.gender === 'male' ? '♂ Đực' : '♀ Cái'}
                    </Tag>
                  </div>
                  <div className="flex justify-between">
                    <span>Màu sắc:</span>
                    <span className="font-medium">{pet.color}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {pet.vaccinated && <Tag color="green">Đã tiêm</Tag>}
                    {pet.neutered && <Tag color="purple">Đã triệt sản</Tag>}
                  </div>
                  {pet.adoptionFee && (
                    <div className="flex justify-between pt-2 border-t">
                      <span>Phí nhận nuôi:</span>
                      <span className="font-bold text-[#6272B6]">
                        {pet.adoptionFee.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  )}
                </div>

                <Space className="w-full" orientation="vertical">
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => navigate(`/admin/pets/edit/${pet._id}`)}
                    className="w-full bg-[#6272B6] border-0"
                  >
                    Chỉnh sửa
                  </Button>
                  <Popconfirm
                    title="Xóa thú cưng?"
                    description="Bạn có chắc muốn xóa thú cưng này?"
                    onConfirm={() => handleDelete(pet._id)}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      className="w-full"
                    >
                      Xóa
                    </Button>
                  </Popconfirm>
                </Space>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
