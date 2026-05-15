import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPetById } from "../api/petApi";
import ReviewSection from "../components/ReviewSection";

export default function PetDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    setLoading(true);

    getPetById(id)
      .then((res) => {
        setPet(res.data);
        document.title = `${res.data.name} | Pet Detail`;
      })
      .catch(() => setPet(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-40">
        <div className="animate-spin w-12 h-12 border-4 border-[#6272B6] border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-500">Đang tải thông tin thú cưng...</p>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="text-center py-40">
        <p className="text-xl text-gray-500 mb-4">
          Không tìm thấy thú cưng
        </p>
        <button
          onClick={() => navigate("/adopt")}
          className="bg-[#6272B6] text-white px-6 py-2 rounded-full hover:bg-[#4e5fa8]"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const imagePath = pet.image || pet.images?.[0];

  const petImage = imagePath
    ? imagePath.startsWith("http")
      ? imagePath
      : `http://localhost:5000${imagePath}`
    : "/images/Jack.png";

  const petId = pet._id || id;

  return (
    <div className="max-w-[1200px] mx-auto py-20 px-6">
      {/* back */}
      <button
        onClick={() => navigate(-1)}
        className="mb-8 text-[#6272B6] hover:underline"
      >
        ← Quay lại
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
        {/* IMAGE */}
        <div className="bg-white rounded-[24px] overflow-hidden shadow-md hover:shadow-xl transition">
          <img
            src={petImage}
            alt={pet.name}
            className="w-full h-[500px] object-cover hover:scale-105 transition duration-300"
          />
        </div>

        {/* INFO */}
        <div>
          {/* Name */}
          <h1 className="text-4xl font-bold text-[#6272B6] mb-4">
            {pet.name}
          </h1>

          {/* status badge */}
          <div className="mb-6">
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                pet.status === "available"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {pet.status === "available"
                ? "Có thể nhận nuôi"
                : pet.status || "N/A"}
            </span>
          </div>

          {/* Basic info */}
          <div className="space-y-3 text-gray-700 text-lg mb-8">
            <p>
              <span className="font-semibold">Tuổi:</span>{" "}
              {pet.age || "N/A"}
            </p>

            <p>
              <span className="font-semibold">Giới tính:</span>{" "}
              {pet.gender || "N/A"}
            </p>

            <p>
              <span className="font-semibold">Loài:</span>{" "}
              {pet.species || pet.type || "N/A"}
            </p>

            <p>
              <span className="font-semibold">Giống:</span>{" "}
              {pet.breed || "N/A"}
            </p>

            <p>
              <span className="font-semibold">Màu sắc:</span>{" "}
              {pet.color || "N/A"}
            </p>

            <p>
              <span className="font-semibold">Triệt sản:</span>{" "}
              {pet.neutered
                ? "Đã triệt sản"
                : "Chưa triệt sản"}
            </p>

            <p>
              <span className="font-semibold">Tiêm phòng:</span>{" "}
              {pet.vaccinated
                ? "Đã tiêm"
                : "Chưa tiêm"}
            </p>

            {pet.description && (
              <p>
                <span className="font-semibold">Mô tả:</span>{" "}
                {pet.description}
              </p>
            )}
          </div>

          <button
            onClick={() =>
              navigate(`/adopt-form/${petId}`)
            }
            className="bg-[#6272B6] text-white px-8 py-3 rounded-full hover:bg-[#4e5fa8] transition shadow-md hover:shadow-lg"
          >
            Nhận nuôi ngay
          </button>
        </div>
      </div>

      {/* Review Section */}
      {petId && (
        <div className="mt-16">
          <ReviewSection
            type="pet"
            id={petId}
          />
        </div>
      )}
    </div>
  );
}