import React, { useState, useEffect } from "react";
import {
  FiMenu,
  FiX,
  FiHome,
  FiTool,
  FiEdit3,
  FiDroplet,
  FiPlus,
  FiArrowRight,
  FiZap,
  FiShield,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function BookService(){
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Icon mapping
  const iconMap = {
    Menu: FiMenu,
    X: FiX,
    Zap: FiZap,
    Home: FiHome,
    Shield: FiShield,
    Wrench: FiTool,
    Paintbrush: FiEdit3,
    Droplet: FiDroplet,
    Plus: FiPlus,
    ArrowRight: FiArrowRight,
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          "http://172.20.10.5:8080/api/categories"
        );
        if (!response.ok) throw new Error("Failed to load categories");

        const data = await response.json();
        setCategories(data);
      } catch (err) {
        setError(err.message || "Error loading categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* NAVBAR */}
      <div className="w-full bg-white shadow px-5 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-red-600">HomeEase</h1>

        <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
        </button>
      </div>

      {/* SCROLL AREA */}
      <div className="flex-1 overflow-y-auto">
        {/* HERO */}
        <div className="bg-red-50 py-12 px-5 text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Home Services at Your Fingertips
          </h2>
          <p className="text-lg text-gray-600 mt-3 max-w-md mx-auto">
            Professional contractors & service providers for all your home
            needs.
          </p>
        </div>

        <div className="px-5 py-10">
          {/* LOADING */}
          {loading && (
            <div className="text-center py-10">
              <div className="loader border-4 border-blue-200 border-t-blue-600 rounded-full w-12 h-12 mx-auto animate-spin"></div>
              <p className="text-gray-500 mt-3">Loading services...</p>
            </div>
          )}

          {/* ERROR */}
          {error && <p className="text-center text-red-500">{error}</p>}

          {/* CATEGORY GRID */}
          {!loading && !error && (
            <div>
              {categories.map((category) => {
                const Icon = iconMap[category.icon] || FiHome;

                return (
                  <div
                    key={category.id}
                    className="bg-white shadow rounded-xl p-6 mb-6"
                  >
                    {/* ICON + STATUS */}
                    <div className="flex items-center mb-4">
                      <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
                        <Icon size={28} color="red" />
                      </div>

                      <div className="ml-3 bg-green-100 px-3 py-1 rounded-full">
                        <p className="text-green-800 text-xs font-bold">
                          Available
                        </p>
                      </div>
                    </div>

                    {/* CATEGORY TITLE */}
                    <h3 className="text-xl font-bold text-gray-900">
                      {category.title}
                    </h3>

                    <p className="text-black font-semibold mt-1">
                      ₹ {category.price}
                    </p>

                    {/* BUTTON */}
                    <button
                      onClick={() =>
                        navigate(`/service-providers/${category.id}`, {
                          state: { categoryTitle: category.title },
                        })
                      }
                      className="w-full bg-red-600 rounded-lg py-3 mt-4 text-white font-bold flex items-center justify-center"
                    >
                      View Providers
                      <FiArrowRight className="ml-2" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* PROVIDER CTA */}
          <div className="bg-red-600 rounded-xl p-8 mt-8 text-center">
            <h2 className="text-white text-2xl font-bold">
              Are you a service professional?
            </h2>
            <p className="text-white/90 mt-2 mb-6">
              Create your provider account & receive bookings.
            </p>

            {/* Register */}
            <button
              onClick={() => navigate("/provider/register")}
              className="bg-white py-3 rounded-lg w-full flex items-center justify-center font-semibold text-red-600 mb-3"
            >
              <FiPlus className="mr-2" /> Register as Provider
            </button>

            {/* Login */}
            <button
              onClick={() => navigate("/provider/login")}
              className="border border-white py-3 rounded-lg w-full text-white font-semibold"
            >
              Provider Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
