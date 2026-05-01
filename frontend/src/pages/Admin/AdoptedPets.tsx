import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

export default function AdoptedPets() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [adoptionsRes, petsRes] = await Promise.all([
          axios.get("http://localhost:3000/adoptions"),
          axios.get("http://localhost:3000/pets")
        ])

        // ✅ Lọc những đơn đã được duyệt
        const approved = adoptionsRes.data.filter(
          (a: any) => a.status === "approved"
        )

        // ✅ Join dữ liệu
        const result = approved.map((a: any) => {
          const pet = petsRes.data.find(
            (p: any) => p.id == a.petId
          )

          return {
                    ...a,
                    petName: pet?.name,
                    petImage: pet?.image,
                    vaccinated: pet?.vaccinated,
                    sterilized: pet?.sterilized
                }
        })

        setData(result)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleUndo = async (id: string) => {
  try {
    await axios.patch(`http://localhost:3000/adoptions/${id}`, {
      status: "submitted"
    })

    // reload lại data
    window.location.reload()
  } catch (error) {
    console.error(error)
  }
}

  if (loading) {
    return <div className="text-center py-20">Đang tải...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#6272B6] mb-6">
        Danh sách thú cưng đã được nhận nuôi
      </h1>

      <div className="bg-white rounded-xl shadow overflow-auto">
        <table className="w-full text-sm">

          <thead className="bg-gray-100">
            <tr>
              <th className="p-4">Ảnh</th>
              <th className="p-4">Tên thú cưng</th>
              <th className="p-4">Người nhận</th>
              <th className="p-4">SĐT</th>
              <th className="p-4">Ngày nhận</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4">Tiêm chủng</th>
              <th className="p-4">Triệt sản</th>
              <th className="p-4">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="border-t text-center">

                <td className="p-4">
                  <img
                    src={item.petImage}
                    alt=""
                    className="w-16 h-16 object-cover rounded"
                  />
                </td>

                <td className="p-4 font-semibold">
                  {item.petName || "Không rõ"}
                </td>

                <td className="p-4">{item.name}</td>
                <td className="p-4">{item.phone}</td>

                <td className="p-4">
                  {new Date(item.createdAt).toLocaleDateString()}
                </td>

                <td className="p-4">
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-600">
                    Đã nhận nuôi
                  </span>
                </td>

                <td className="p-4">
                <span className={`px-2 py-1 rounded text-xs
                    ${item.vaccinated ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}
                `}>
                    {item.vaccinated ? "Đã tiêm" : "Chưa tiêm"}
                </span>
                </td>

                <td className="p-4">
                <span className={`px-2 py-1 rounded text-xs
                    ${item.sterilized ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}
                `}>
                    {item.sterilized ? "Đã triệt sản" : "Chưa"}
                </span>
                </td>

                <td className="p-4">
                <button
                    onClick={() => navigate(`/admin/pet/${item.petId}`)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                    Xem chi tiết
                </button>
                </td>       

                <td className="p-4">
                <button
                    onClick={() => handleUndo(item.id)}
                    className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600"
                >
                    Hoàn tác
                </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  )
}