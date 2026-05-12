import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAdoptionRequestById } from "../../api/adoptionApi";

export default function AdoptionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchRequest = async () => {
      try {
        const response = await getAdoptionRequestById(id);
        if (response.success) {
          setRequest(response.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id]);

  if (loading) {
    return <div className="text-center py-20">Đang tải...</div>;
  }

  if (!request) {
    return <div className="text-center py-20">Không tìm thấy đơn nhận nuôi</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#6272B6]">Chi tiết đơn nhận nuôi</h1>
          <p className="text-sm text-gray-500">Mã đơn: {request._id}</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
        >
          Quay lại
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-lg">Thông tin người nhận</h2>
          <p>Họ tên: {request.fullName}</p>
          <p>Số điện thoại: {request.phone}</p>
          <p>Email: {request.user?.email || "Không có"}</p>
          <p>Địa chỉ: {request.address}</p>
        </div>

        <div>
          <h2 className="font-semibold text-lg">Thông tin thú cưng</h2>
          <p>Tên: {request.pet?.name || "Không rõ"}</p>
          <p>Loài: {request.pet?.species || "Không rõ"}</p>
          <p>Trạng thái pet: {request.pet?.status || "Không rõ"}</p>
        </div>

        <div>
          <h2 className="font-semibold text-lg">Chi tiết đơn</h2>
          <p>Lý do: {request.reason}</p>
          <p>Kinh nghiệm: {request.experience || "Không có"}</p>
          <p>Loại nhà ở: {request.housingType}</p>
          <p>Số thành viên: {request.familyMembers}</p>
          <p>Thu nhập: {request.monthlyIncome}</p>
          <p>Trạng thái đơn: {request.status}</p>
          <p>Ghi chú admin: {request.adminNote || "Không có"}</p>
        </div>
      </div>
    </div>
  );
}
