export default function Supporters() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-[#6272B6] mb-6">
        Danh sách người ủng hộ
      </h1>

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Tên</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Số tiền</th>
              <th className="p-4 text-left">Lời nhắn</th>
              <th className="p-4 text-center">Hành động</th>
            </tr>
          </thead>

          <tbody>

            <tr className="border-t hover:bg-gray-50">

              <td className="p-4">
                Nguyễn Văn A
              </td>

              <td className="p-4">
                example@gmail.com
              </td>

              <td className="p-4 text-green-600 font-semibold">
                500.000đ
              </td>

              <td className="p-4 text-gray-600">
                Chúc các bé sớm có mái ấm ❤️
              </td>

              <td className="p-4 text-center">
                <button
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                >
                  Xóa
                </button>
              </td>

            </tr>

          </tbody>

        </table>

      </div>
    </div>
  )
}