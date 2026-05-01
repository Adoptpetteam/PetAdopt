import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { useListAdoption } from "../../hook/huyHook";

export default function Adoptions() {
  const navigate = useNavigate();

  const { data: orders = [], isLoading, refetch } = useListAdoption({
    resource: "adoptions",
  });

  // STATUS COLOR
  const statusColor = (s: string) => {
    if (s === "approved") return "bg-green-100 text-green-600";
    if (s === "rejected") return "bg-red-100 text-red-600";
    if (s === "submitted") return "bg-yellow-100 text-yellow-600";
    return "bg-gray-100 text-gray-600";
  };

  // UPDATE STATUS
  const updateStatus = async (id: string, status: string, petId: string) => {
    try {
      await axios.patch(`http://localhost:3000/adoptions/${id}`, {
        status,
      });

      if (status === "approved") {
        await axios.patch(`http://localhost:3000/pets/${petId}`, {
          status: "Đã nhận",
        });
      }

      refetch();
    } catch (error) {
      console.error(error);
    }
  };

  // DELETE
  const deleteOrder = async (id: string) => {
    await axios.delete(`http://localhost:3000/adoptions/${id}`);
    refetch();
  };

  // SEND EMAIL
  const sendEmail = async (o: any) => {
    try {
      await axios.post("http://localhost:3000/send-email", {
        email: o.email,
        name: o.name,
        petId: o.petId,
      });

      alert("Đã gửi mail thành công!");
    } catch (error) {
      console.error(error);
      alert("Gửi mail thất bại!");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#6272B6] mb-6">
        Danh sách đơn nhận nuôi
      </h1>

      <div className="bg-white rounded-xl shadow overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Tên</th>
              <th className="p-4 text-left">Pet</th>
              <th className="p-4 text-left">SĐT</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Trạng thái</th>
              <th className="p-4 text-left">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o: any) => (
              <tr key={o.id} className="border-t">
                <td className="p-4">{o.name}</td>
                <td className="p-4">{o.petId}</td>
                <td className="p-4">{o.phone}</td>
                <td className="p-4">{o.email}</td>

                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${statusColor(o.status)}`}>
                    {o.status}
                  </span>
                </td>

                <td className="p-4 flex gap-2 flex-wrap">

                  <button
                    onClick={() => navigate(`/admin/pet/${o.petId}`)}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Xem
                  </button>

                  <button
                    onClick={() => updateStatus(o.id, "approved", o.petId)}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Duyệt
                  </button>

                  <button
                    onClick={() => updateStatus(o.id, "rejected", o.petId)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                  >
                    Từ chối
                  </button>

                  <button
                    onClick={() => deleteOrder(o.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Xóa
                  </button>

                  <button
                    onClick={() => sendEmail(o)}
                    disabled={o.status !== "approved"}
                    className="bg-purple-500 text-white px-3 py-1 rounded disabled:opacity-50"
                  >
                    Mail
                  </button>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}