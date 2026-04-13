import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

interface Contact {
  id: number
  name: string
  email: string
  message: string
  createdAt: string
}

export default function AdminContacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const navigate = useNavigate()

  const fetchData = () => {
    fetch("http://localhost:3000/contacts")
      .then(res => res.json())
      .then(data => setContacts(data))
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async (id: number) => {
    await fetch(`http://localhost:3000/contacts/${id}`, {
      method: "DELETE",
    })
    fetchData()
  }

  return (
    <div className="max-w-[1000px] mx-auto py-10 px-6">
      <h1 className="text-2xl font-bold text-[#6272B6] mb-6">
        Quản lý liên hệ
      </h1>

      <div className="space-y-4">
        {contacts.map((c) => (
          <div
            key={c.id}
            className="bg-white shadow rounded-xl p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{c.name}</p>
              <p className="text-sm text-gray-500">{c.email}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/admin/contacts/${c.id}`)}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Chi tiết
              </button>

              <button
                onClick={() => handleDelete(c.id)}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}