import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Heart,
  Menu,
  X,
  SearchIcon,
  Sliders,
  ArrowUpDown,
} from "lucide-react";

export default function SearchPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    priceMin: "",
    priceMax: "",
    bhk: "",
    city: "",
    propertyType: "all",
    furnishing: "all",
    sortBy: "newest",
  });
  const [favorites, setFavorites] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Fetch user and properties
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    const fetchProperties = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://172.20.10.5:8080/api/properties");
        if (!res.ok) throw new Error("Failed to fetch properties");
        const data = await res.json();
        setProperties(data);
      } catch (err) {
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Fetch favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user || user.role !== "RENTER") return;
      try {
        const res = await fetch(
          `http://172.20.10.5:8080/api/favorites/user/${user.id}`,
          { headers: { "User-Id": user.id.toString() } }
        );
        if (!res.ok) throw new Error("Failed to fetch favorites");
        const data = await res.json();
        setFavorites(data.map((fav) => fav.property.id));
      } catch {}
    };

    fetchFavorites();
  }, [user]);

  const toggleFavorite = async (propertyId) => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      setShowLoginPrompt(true);
      return;
    }

    if (user.role !== "RENTER") {
      alert("Only renters can add favorites");
      return;
    }

    try {
      if (favorites.includes(propertyId)) {
        await fetch(
          `http://172.20.10.5:8080/api/favorites?propertyId=${propertyId}`,
          { method: "DELETE", headers: { "User-Id": user.id.toString() } }
        );
        setFavorites(favorites.filter((id) => id !== propertyId));
      } else {
        await fetch(
          `http://172.20.10.5:8080/api/favorites?propertyId=${propertyId}`,
          { method: "POST", headers: { "User-Id": user.id.toString() } }
        );
        setFavorites([...favorites, propertyId]);
      }
    } catch {
      alert("Failed to update favorite.");
    }
  };

  const handleLoginRedirect = () => {
    localStorage.setItem("redirectAfterLogin", "/search");
    window.location.href = "/login";
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredProperties = properties
    .filter((property) => {
      if (
        filters.search &&
        !property.location.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      if (filters.bhk && property.bhk.toString() !== filters.bhk) return false;
      if (
        filters.propertyType !== "all" &&
        property.propertyType.toLowerCase() !==
          filters.propertyType.toLowerCase()
      )
        return false;
      if (
        filters.furnishing !== "all" &&
        property.furnishing.toLowerCase() !== filters.furnishing.toLowerCase()
      )
        return false;
      if (filters.priceMin && property.rent < parseFloat(filters.priceMin))
        return false;
      if (filters.priceMax && property.rent > parseFloat(filters.priceMax))
        return false;
      return true;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case "price-low":
          return a.rent - b.rent;
        case "price-high":
          return b.rent - a.rent;
        case "size":
          return b.size - a.size;
        case "newest":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Login Prompt */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-2">Login Required</h3>
            <p className="mb-6">Please login to add properties to favorites.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="flex-1 border py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleLoginRedirect}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-red-600">
            HomeEase
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/search">Search</Link>
            {user && user.role === "OWNER" && (
              <Link to="/list-property">List Property</Link>
            )}
            <Link to="/services">Services</Link>
            <Link
              to="/login"
              className="bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Sign In
            </Link>
          </div>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-6">
        {/* Filters Sidebar */}
        <div
          className={`bg-white rounded-lg shadow-md p-6 w-64 ${
            isFiltersOpen ? "block" : "hidden md:block"
          }`}
        >
          <h2 className="font-bold mb-4">Filters</h2>
          {/* Filters inputs */}
          <input
            type="text"
            name="search"
            placeholder="City or locality"
            value={filters.search}
            onChange={handleFilterChange}
            className="w-full border px-3 py-2 rounded-lg mb-3"
          />
          <select
            name="propertyType"
            value={filters.propertyType}
            onChange={handleFilterChange}
            className="w-full border px-3 py-2 rounded-lg mb-3"
          >
            <option value="all">All Types</option>
            <option value="apartment">Apartment</option>
            <option value="villa">Villa</option>
            <option value="studio">Studio</option>
            <option value="independent_house">Independent House</option>
            <option value="penthouse">Penthouse</option>
          </select>
          <select
            name="furnishing"
            value={filters.furnishing}
            onChange={handleFilterChange}
            className="w-full border px-3 py-2 rounded-lg mb-3"
          >
            <option value="all">All Furnishing</option>
            <option value="fully_furnished">Fully Furnished</option>
            <option value="semi_furnished">Semi Furnished</option>
            <option value="unfurnished">Unfurnished</option>
          </select>
          <select
            name="bhk"
            value={filters.bhk}
            onChange={handleFilterChange}
            className="w-full border px-3 py-2 rounded-lg mb-3"
          >
            <option value="">Any</option>
            <option value="1">1 BHK</option>
            <option value="2">2 BHK</option>
            <option value="3">3 BHK</option>
            <option value="4">4+ BHK</option>
          </select>
          <div className="flex gap-2 mb-3">
            <input
              type="number"
              name="priceMin"
              placeholder="Min"
              value={filters.priceMin}
              onChange={handleFilterChange}
              className="w-1/2 border px-3 py-2 rounded-lg"
            />
            <input
              type="number"
              name="priceMax"
              placeholder="Max"
              value={filters.priceMax}
              onChange={handleFilterChange}
              className="w-1/2 border px-3 py-2 rounded-lg"
            />
          </div>
          <button className="w-full bg-red-600 text-white py-2 rounded-lg">
            Apply Filters
          </button>
        </div>

        {/* Properties Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.length > 0 ? (
            filteredProperties.map((property) => (
              <div
                key={property.id}
                className="border rounded-lg overflow-hidden hover:shadow-md transition"
              >
                <div className="relative">
                  <img
                    src={
                      property.imageUrls && property.imageUrls.length > 0
                        ? property.imageUrls[0]
                        : "/placeholder.svg"
                    }
                    alt={property.title}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => toggleFavorite(property.id)}
                    className="absolute top-3 right-3 p-2 bg-white/80 rounded-full"
                  >
                    <Heart
                      size={18}
                      className={
                        favorites.includes(property.id)
                          ? "text-red-600 fill-red-600"
                          : "text-gray-800"
                      }
                    />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1">{property.title}</h3>
                  <div className="flex items-center gap-1 text-sm mb-2">
                    <MapPin size={16} />
                    <span>{property.location}</span>
                  </div>
                  <div className="flex gap-2 text-sm mb-3">
                    <div className="flex items-center gap-1">
                      <Bed size={16} /> {property.bhk} BHK
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath size={16} /> {property.bath} Bath
                    </div>
                    <div className="flex items-center gap-1">
                      <Maximize2 size={16} /> {property.size} sq ft
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="font-bold">
                      ₹{property.rent?.toLocaleString()}
                    </div>
                    <div className="text-sm">/month</div>
                  </div>
                  <Link
                    to={`/property/${property.id}`}
                    className="block mt-4 text-center text-white bg-red-600 py-2 rounded-lg"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p>No properties found.</p>
              <button
                onClick={() =>
                  setFilters({
                    search: "",
                    priceMin: "",
                    priceMax: "",
                    bhk: "",
                    city: "",
                    propertyType: "all",
                    furnishing: "all",
                    sortBy: "newest",
                  })
                }
                className="bg-red-600 text-white px-4 py-2 rounded-lg mt-3"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
