export default function Dashboard() {
  let orders: any[] = []

  try {
    const data = localStorage.getItem("orders")
    orders = data ? JSON.parse(data) : []
  } catch (error) {
    console.log("Lỗi parse orders:", error)
    orders = []
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#6272B6] mb-6">
        Trang Quản Lý
      </h1>

      <div className="grid grid-cols-3 gap-6">

        {/* Tổng đơn */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Tổng đơn nhận nuôi</h2>
          <p className="text-3xl font-bold">{orders.length}</p>
        </div>

        {/* Pending */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Đơn pending</h2>
          <p className="text-3xl font-bold">
            {orders.filter((o: any) => o?.status === "pending").length}
          </p>
        </div>

      </div>
    </div>
  )
}