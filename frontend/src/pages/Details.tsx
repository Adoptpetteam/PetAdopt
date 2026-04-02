// import Sydney from "../assets/images/Sydney.png"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getPetById, type PetEntity } from "../api/petApi"
import AdoptionModal from "../components/AdoptionModal"
import { getProfile } from "../api/authApi"

export default function PetDetail() {
    const { id } = useParams<{ id: string }>()
    const [pet, setPet] = useState<PetEntity | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [showAdoptionModal, setShowAdoptionModal] = useState(false)
    const [userData, setUserData] = useState<{ name?: string; phone?: string; address?: string; _id?: string } | null>(null)
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    // Kiểm tra đăng nhập và lấy thông tin user
    useEffect(() => {
        const token = localStorage.getItem("token")
        if (token) {
            setIsLoggedIn(true)
            getProfile()
                .then((res) => {
                    if (res.user) {
                        setUserData({
                            name: res.user.name,
                            phone: (res.user as any).phone,
                            address: (res.user as any).address,
                            _id: (res.user as any).id,
                        })
                    }
                })
                .catch(() => {
                    // Token hết hạn hoặc lỗi
                    localStorage.removeItem("token")
                    setIsLoggedIn(false)
                })
        }
    }, [])

    useEffect(() => {
        if (!id) {
            setError("Thiếu mã thú cưng.")
            setLoading(false)
            return
        }

        const fetchPet = async () => {
            try {
                const response = await getPetById(id)
                setPet(response.data)
            } catch (err) {
                console.error("Load pet detail failed:", err)
                setError("Không tìm thấy thú cưng.")
            } finally {
                setLoading(false)
            }
        }

        fetchPet()
    }, [id])

    if (loading) {
        return <div className="max-w-[1200px] mx-auto py-20 px-6">Đang tải dữ liệu...</div>
    }

    if (!pet || error) {
        return <div className="max-w-[1200px] mx-auto py-20 px-6">{error || "Pet not found"}</div>
    }

    // Kiểm tra pet có thể nhận nuôi không
    const canAdopt = pet.status === "available"

    return (
        <div className="max-w-[1200px] mx-auto py-20 px-6">
            <div className="grid grid-cols-2 gap-16 items-start">

                {/* IMAGE */}
                <div className="bg-white rounded-[24px] overflow-hidden shadow-md">
                    <img
                        src={pet.images?.[0] || "/images/Jack.png"}
                        className="w-full h-[500px] object-cover"
                    />
                </div>

                {/* INFO */}
                <div>
                    {/* Name */}
                    <h1 className="text-4xl font-bold text-[#6272B6] mb-6">
                        {pet.name}
                    </h1>

                    {/* Basic info */}
                    <div className="space-y-3 text-gray-700 text-lg mb-8">

                        <p>
                            <span className="font-semibold">Tuổi:</span> {pet.age}
                        </p>

                        <p>
                            <span className="font-semibold">Giới tính:</span> {pet.gender}
                        </p>

                        <p>
                            <span className="font-semibold">Loài:</span> {pet.species === 'dog' ? 'Chó' : pet.species === 'cat' ? 'Mèo' : 'Khác'}
                        </p>

                        {pet.breed && (
                            <p>
                                <span className="font-semibold">Giống:</span> {pet.breed}
                            </p>
                        )}

                        {pet.size && (
                            <p>
                                <span className="font-semibold">Kích thước:</span> {pet.size === 'small' ? 'Nhỏ' : pet.size === 'medium' ? 'Vừa' : 'Lớn'}
                            </p>
                        )}

                        <p>
                            <span className="font-semibold">Tiêm phòng:</span> {pet.vaccinated ? 'Có' : 'Chưa'}
                        </p>

                        <p>
                            <span className="font-semibold">Triệt sản:</span> {pet.neutered ? 'Có' : 'Chưa'}
                        </p>

                        <p>
                            <span className="font-semibold">Tình trạng:</span>
                            <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                                pet.status === 'available' ? 'bg-green-100 text-green-700' :
                                pet.status === 'adopted' ? 'bg-blue-100 text-blue-700' :
                                pet.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                            }`}>
                                {pet.status === 'available' ? 'Có thể nhận nuôi' :
                                pet.status === 'adopted' ? 'Đã có chủ' :
                                pet.status === 'pending' ? 'Đang chờ duyệt' :
                                pet.status === 'reserved' ? 'Đã đặt trước' : pet.status}
                            </span>
                        </p>

                        {pet.adoptionFee && pet.adoptionFee > 0 && (
                            <p>
                                <span className="font-semibold">Phí nhận nuôi:</span> {pet.adoptionFee.toLocaleString("vi-VN")} VND
                            </p>
                        )}

                        {pet.description && (
                            <div className="mt-4 pt-4 border-t">
                                <p className="font-semibold mb-2">Giới thiệu:</p>
                                <p className="text-gray-600 whitespace-pre-line">{pet.description}</p>
                            </div>
                        )}
                    </div>

                    {/* Nút đăng ký nhận nuôi */}
                    {canAdopt ? (
                        <div className="space-y-3">
                            <button
                                onClick={() => setShowAdoptionModal(true)}
                                className="w-full bg-[#6272B6] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#4a5ab3] transition flex items-center justify-center gap-2"
                            >
                                🏠 Đăng ký nhận nuôi
                            </button>
                            {!isLoggedIn && (
                                <p className="text-sm text-gray-500 text-center">
                                    Bạn có thể đăng ký mà không cần đăng nhập, nhưng đăng nhập sẽ giúp chúng tôi liên hệ nhanh hơn.
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="bg-gray-100 text-gray-500 py-4 rounded-xl text-center font-medium">
                            {pet.status === 'adopted' ? 'Bé này đã có chủ mới rồi' :
                             pet.status === 'reserved' ? 'Bé này đang được đặt trước' :
                             'Hiện không thể nhận nuôi bé này'}
                        </div>
                    )}
                </div>

            </div>

            {/* Modal đăng ký nhận nuôi */}
            <AdoptionModal
                isOpen={showAdoptionModal}
                onClose={() => setShowAdoptionModal(false)}
                petId={pet._id}
                petName={pet.name}
                userData={userData}
            />
        </div>
    )
}
