import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPetById } from "../api/petApi";
import ReviewSection from "../components/ReviewSection";

export default function PetDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError("");

    getPetById(id)
      .then((res) => {
        setPet(res.data);

        const firstImage =
          res.data.image || res.data.images?.[0];

        const fullImage = firstImage
          ? firstImage.startsWith("http")
            ? firstImage
            : `http://localhost:5000${firstImage}`
          : "/images/Jack.png";

        setSelectedImage(fullImage);

        document.title = `${res.data.name} | Pet Detail`;
      })
      .catch(() => {
        setPet(null);
        setError("Không tìm thấy thú cưng");
      })
      .finally(() => setLoading(false));

    return () => {
      document.title = "Pet Adopt";
    };
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-40">
        <div className="animate-spin w-12 h-12 border-4 border-[#6272B6] border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-500">
          Đang tải thông tin thú cưng...
        </p>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="text-center py-40">
        <p className="text-xl text-gray-500 mb-4">
          {error}
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

  const petId = pet._id || id;

  const allImages = pet.images?.length
    ? pet.images.map((img: string) =>
        img.startsWith("http")
          ? img
          : `http://localhost:5000${img}`
      )
    : [selectedImage];

  const canAdopt = pet.status === "available";

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
        <div>
          <div className="bg-white rounded-[24px] overflow-hidden shadow-md hover:shadow-xl transition">
            <img
              src={selectedImage}
              alt={pet.name}
              className="w-full h-[500px] object-cover"
            />
          </div>

          {/* thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-3 mt-4 flex-wrap">
              {allImages.map(
                (img: string, index: number) => (
                  <img
                    key={index}
                    src={img}
                    alt={`pet-${index}`}
                    onClick={() =>
                      setSelectedImage(img)
                    }
                    className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 ${
                      selectedImage === img
                        ? "border-[#6272B6]"
                        : "border-transparent"
                    }`}
                  />
                )
              )}
            </div>
          )}
        </div>

        {/* INFO */}
        <div>
          <h1 className="text-4xl font-bold text-[#6272B6] mb-4">
            {pet.name}
          </h1>

          <div className="mb-6">
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                canAdopt
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {canAdopt
                ? "Có thể nhận nuôi"
                : "Đã được nhận nuôi"}
            </span>
          </div>

          <div className="space-y-3 text-gray-700 text-lg mb-8">
            <p>
              <span className="font-semibold">
                Tuổi:
              </span>{" "}
              {pet.age || "N/A"}
            </p>

            <p>
              <span className="font-semibold">
                Giới tính:
              </span>{" "}
              {pet.gender || "N/A"}
            </p>

            <p>
              <span className="font-semibold">
                Loài:
              </span>{" "}
              {pet.species ||
                pet.type ||
                "N/A"}
            </p>

            <p>
              <span className="font-semibold">
                Giống:
              </span>{" "}
              {pet.breed || "N/A"}
            </p>

            <p>
              <span className="font-semibold">
                Màu sắc:
              </span>{" "}
              {pet.color || "N/A"}
            </p>

            <p>
              <span className="font-semibold">
                Triệt sản:
              </span>{" "}
              {pet.neutered
                ? "Đã triệt sản"
                : "Chưa triệt sản"}
            </p>

            <p>
              <span className="font-semibold">
                Tiêm phòng:
              </span>{" "}
              {pet.vaccinated
                ? "Đã tiêm"
                : "Chưa tiêm"}
            </p>

            {pet.description && (
              <p>
                <span className="font-semibold">
                  Mô tả:
                </span>{" "}
                {pet.description}
              </p>
            )}
          </div>

          <button
            disabled={!canAdopt}
            onClick={() =>
              navigate(
                `/adopt-form/${petId}`
              )
            }
            className={`px-8 py-3 rounded-full transition shadow-md ${
              canAdopt
                ? "bg-[#6272B6] text-white hover:bg-[#4e5fa8]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {canAdopt
              ? "Nhận nuôi ngay"
              : "Không khả dụng"}
          </button>
        </div>
      </div>

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