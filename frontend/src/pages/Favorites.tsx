import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface FavoritePet {
  id: string;
  name: string;
  species: string;
  image: string;
  age: number;
  gender: string;
}

export default function Favorites() {
  const [favorites, setFavorites] = useState<FavoritePet[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const stored = localStorage.getItem("favorites");
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch {
        setFavorites([]);
      }
    }
  }, [navigate]);

  const removeFavorite = (id: string) => {
    const updated = favorites.filter((pet) => pet.id !== id);
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  if (favorites.length === 0) {
    return (
      <div className="max-w-[1000px] mx-auto py-20 px-6 text-center">
        <h1 className="text-3xl font-bold text-[#6272B6] mb-10">Yêu thích</h1>
        <p className="text-gray-500">Chưa có thú cưng yêu thích nào.</p>
        <Link to="/adopt" className="text-[#6272B6] underline mt-4 inline-block">
          Khám phá thú cưng
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto py-20 px-6">
      <h1 className="text-3xl font-bold text-[#6272B6] mb-10 text-center">
        Yêu thích
      </h1>
      <div className="grid grid-cols-3 gap-6">
        {favorites.map((pet) => (
          <div
            key={pet.id}
            className="bg-white rounded-2xl shadow p-4 hover:scale-105 transition cursor-pointer"
            onClick={() => navigate(`/pet/${pet.id}`)}
          >
            <img src={pet.image} className="w-full h-40 object-cover rounded-xl mb-4" />
            <h2 className="font-semibold">{pet.name}</h2>
            <p className="text-sm text-gray-500">{pet.species} | {pet.age} tuổi | {pet.gender}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeFavorite(pet.id);
              }}
              className="mt-2 text-red-500 text-sm hover:underline"
            >
              Bỏ yêu thích
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
