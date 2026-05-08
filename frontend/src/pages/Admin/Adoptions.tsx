import { useListAdoption, useDeleteAdoption } from "../../hook/huyHook";
import { useNavigate } from "react-router-dom";

interface Adoption {
  id: string;
  name: string;
  petId: string;
  phone: string;
  email: string;
  address: string;
  reason: string;
  donationType: string;
  certificateType: string;
  status: string;
}

export default function Adoptions() {
  const navigate = useNavigate();

  const { data: orders = [], isLoading } = useListAdoption({
    resource: "adoptions",
  });

  const { mutate: deleteOrder } = useDeleteAdoption({
    resource: "adoptions",
  });

  // DELETE
  const handleDelete = (id: string) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc muốn xóa đơn nhận nuôi này?"
    );

    if (confirmDelete) {
      deleteOrder(id);
    }
  };

  // STATUS COLOR
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-600";

      case "rejected":
        return "bg-red-100 text-red-600";

      default:
        return "bg-yellow-100 text-yellow-600";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[300px] text-lg font-semibold text-[#6272B6]">
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div>

      {/* TITLE */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#6272B6]">
          Danh sách đơn nhận nuôi
        </h1>

        <span className="bg-[#6272B6] text-white px-4 py-2 rounded-lg text-sm">
          Tổng đơn: {orders.length}
        </span>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-lg overflow-auto">

        <table className="w-full text-sm">

          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-4 text-left">Tên</th>
              <th className="p-4 text-left">Pet ID</th>
              <th className="p-4 text-left">SĐT</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Địa chỉ</th>
              <th className="p-4 text-left">Lý do</th>
              <th className="p-4 text-left">Quyên góp</th>
              <th className="p-4 text-left">Chứng nhận</th>
              <th className="p-4 text-left">Trạng thái</th>
              <th className="p-4 text-left">Hành động</th>
            </tr>
          </thead>

          <tbody>

            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="text-center py-10 text-gray-500"
                >
                  Chưa có đơn nhận nuôi nào
                </td>
              </tr>
            ) : (
              orders.map((o: Adoption) => (
                <tr
                  key={o.id}
                  className="border-t hover:bg-gray-50 duration-200"
                >
                  <td className="p-4 font-medium">{o.name}</td>

                  <td className="p-4">{o.petId}</td>

                  <td className="p-4">{o.phone}</td>

                  <td className="p-4">{o.email}</td>

                  <td className="p-4">{o.address}</td>

                  <td className="p-4 max-w-[200px] truncate">
                    {o.reason}
                  </td>

                  <td className="p-4">
                    {o.donationType === "monthly"
                      ? "Hàng tháng"
                      : "Cả năm"}
                  </td>

                  <td className="p-4">
                    {o.certificateType === "digital"
                      ? "Điện tử"
                      : "Bản cứng"}
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                        o.status
                      )}`}
                    >
                      {o.status}
                    </span>
                  </td>

                  <td className="p-4 flex gap-2">

                    {/* VIEW PET */}
                    <button
                      onClick={() => navigate(`/admin/pet/${o.petId}`)}
                      className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 duration-200"
                    >
                      Xem thú cưng
                    </button>

                    {/* DELETE */}
                    <button
                      onClick={() => handleDelete(o.id)}
                      className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 duration-200"
                    >
                      Xóa
                    </button>

                  </td>
                </tr>
              ))
            )}

          </tbody>
        </table>
      </div>
    </div>
  );
}