import { Link } from "react-router-dom"
import { Card, Tag, Button } from "antd"
import { HeartOutlined, EyeOutlined, CalendarOutlined, UserOutlined } from "@ant-design/icons"

type Props = {
  pet: any
}

export default function PetCard({ pet }: Props) {
  const petId = pet._id || pet.id
  const petName = pet.name || pet.pet?.name || "Unknown"
  const petAge = pet.age || pet.pet?.age || "-"
  const petGender = pet.gender || pet.pet?.gender || "-"
  const petSpecies = pet.species || pet.pet?.species || "unknown"
  const petStatus = pet.status || "available"
  
  const imagePath = pet.images?.[0] || pet.image || pet.pet?.images?.[0];
  // Kiểm tra nếu là URL đầy đủ (http/https) thì dùng trực tiếp, không thì thêm localhost
  const petImage = imagePath
    ? (imagePath.startsWith('http') ? imagePath : `http://localhost:5000${imagePath}`)
    : "https://via.placeholder.com/300";

  const getSpeciesIcon = (species: string) => {
    switch (species.toLowerCase()) {
      case 'dog': return '🐕';
      case 'cat': return '🐱';
      case 'bird': return '🐦';
      default: return '🐾';
    }
  };

  const getGenderColor = (gender: string) => {
    return gender.toLowerCase() === 'male' ? '#3b82f6' : '#ec4899';
  };

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return { color: 'green', text: 'Sẵn sàng nhận nuôi', icon: '💚' };
      case 'adopted':
        return { color: 'blue', text: 'Đã được nhận nuôi', icon: '🏠' };
      case 'pending':
        return { color: 'orange', text: 'Đang chờ duyệt', icon: '⏳' };
      default:
        return { color: 'default', text: 'Không rõ', icon: '❓' };
    }
  };

  const statusConfig = getStatusConfig(petStatus);

  return (
    <Card
      className="w-full max-w-[320px] border-0 shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50"
      cover={
        <div className="relative overflow-hidden">
          <img
            src={petImage}
            alt={petName}
            className="w-full h-[240px] object-cover transition-transform duration-500 hover:scale-110"
          />
          
          {/* Status badge */}
          <div className="absolute top-4 left-4">
            <Tag 
              color={statusConfig.color} 
              className="px-3 py-1 rounded-full font-semibold shadow-lg border-0"
            >
              {statusConfig.icon} {statusConfig.text}
            </Tag>
          </div>

          {/* Species badge */}
          <div className="absolute top-4 right-4">
            <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-xl shadow-lg backdrop-blur-sm">
              {getSpeciesIcon(petSpecies)}
            </div>
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
        </div>
      }
      actions={[
        <Link to={`/pet/${petId}`} key="view">
          <Button 
            type="primary" 
            icon={<EyeOutlined />}
            className="bg-[#6272B6] border-0 rounded-full w-full h-10 font-semibold"
            disabled={petStatus === 'adopted'}
          >
            {petStatus === 'adopted' ? 'Đã có chủ' : 'Xem chi tiết'}
          </Button>
        </Link>
      ]}
    >
      <div className="p-2">
        {/* Pet name */}
        <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">
          {petName}
        </h3>

        {/* Pet info */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarOutlined className="text-[#6272B6]" />
              <span className="text-sm text-gray-600">Tuổi</span>
            </div>
            <span className="font-semibold text-gray-800">{petAge} tuổi</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserOutlined className="text-[#6272B6]" />
              <span className="text-sm text-gray-600">Giới tính</span>
            </div>
            <Tag 
              color={getGenderColor(petGender)}
              className="rounded-full px-3 font-semibold border-0"
            >
              {petGender === 'Male' ? '♂ Đực' : '♀ Cái'}
            </Tag>
          </div>
        </div>

        {/* Love button */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <HeartOutlined className="text-red-400" />
            <span className="text-sm">Cần một mái ấm yêu thương</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
