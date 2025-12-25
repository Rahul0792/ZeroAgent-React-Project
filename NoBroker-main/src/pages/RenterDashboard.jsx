import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Heart,
  MessageCircle,
  FileText,
  Calendar,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  LogOut,
  Eye,
  Filter,
  User,
  Edit,
  Save,
  X,
} from "lucide-react";

export default function RenterDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "Renter",
    email: "",
    role: "",
    id: null,
    phone: "",
  });

  const [properties, setProperties] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("browse");
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
  });

  const [saving, setSaving] = useState(false);

  // ----------------------------------
  // Fetch User & Initial Data
  // ----------------------------------
  useEffect(() => {
    const checkUserRoleAndFetchData = async () => {
      try {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
          navigate("/login");
          return;
        }

        const userData = JSON.parse(storedUser);

        if (userData.role !== "RENTER") {
          if (userData.role === "OWNER") navigate("/owner-dashboard");
          else navigate("/");
          return;
        }

        setUser(userData);
        setProfileForm({
          name: userData.name,
          phone: userData.phone || "",
        });

        await fetchProperties();
        await fetchFavorites(userData.id);
        await fetchUserInquiries(userData.id);
      } catch (err) {
        navigate("/login");
      }
    };

    checkUserRoleAndFetchData();
  }, []);

  // ----------------------------------
  // API Calls
  // ----------------------------------
  const fetchProperties = async () => {
    try {
      const resp = await fetch("http://localhost:8080/api/properties");
      const data = await resp.json();
      setProperties(data);
    } catch {
      setProperties([]);
    }
  };

  const fetchFavorites = async (userId) => {
    try {
      const resp = await fetch(
        `http://localhost:8080/api/favorites/user/${userId}`,
        {
          headers: { "User-Id": String(userId) },
        }
      );

      const data = await resp.json();

      if (Array.isArray(data)) {
        const validFavs = data.filter(
          (fav) => fav && fav.property && fav.property.id
        );
        setFavorites(validFavs);
      } else {
        setFavorites([]);
      }
    } catch {
      setFavorites([]);
    }
  };

  const fetchUserInquiries = async (userId) => {
    try {
      const resp = await fetch(
        `http://localhost:8080/api/inquiries/renter/${userId}`,
        {
          headers: { "User-Id": String(userId) },
        }
      );

      const data = await resp.json();
      setInquiries(data);
    } catch {
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------
  // FAVORITE TOGGLE
  // ----------------------------------
  const toggleFavorite = async (propertyId) => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return alert("Please login again");

      const userData = JSON.parse(storedUser);
      const isFav = favorites.some((f) => f.property.id === propertyId);

      if (isFav) {
        // DELETE favorite
        await fetch(
          `http://localhost:8080/api/favorites?propertyId=${propertyId}`,
          {
            method: "DELETE",
            headers: { "User-Id": String(userData.id) },
          }
        );

        setFavorites((prev) =>
          prev.filter((f) => f.property.id !== propertyId)
        );
      } else {
        // ADD favorite
        const resp = await fetch(
          `http://localhost:8080/api/favorites?propertyId=${propertyId}`,
          {
            method: "POST",
            headers: { "User-Id": String(userData.id) },
          }
        );

        if (resp.ok) {
          const newFav = await resp.json();
          setFavorites((prev) => [...prev, newFav]);
        }
      }
    } catch (err) {
      alert("Error updating favorite");
    }
  };

  // ----------------------------------
  // LOGOUT
  // ----------------------------------
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ----------------------------------
  // PROFILE EDIT
  // ----------------------------------
  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleProfileSave = async () => {
    try {
      setSaving(true);

      const storedUser = localStorage.getItem("user");
      const userData = JSON.parse(storedUser);

      const updateData = {
        name: profileForm.name,
        phone: profileForm.phone,
        email: userData.email,
        role: userData.role,
        password: userData.password,
      };

      const resp = await fetch(
        `http://localhost:8080/api/users/${userData.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        }
      );

      const updatedUser = await resp.json();

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditingProfile(false);
      alert("Profile updated successfully!");
    } catch {
      alert("Update failed");
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------------
  // FILTER PROPERTIES
  // ----------------------------------
  const filteredProperties = properties.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const favoriteIds = favorites.map((f) => f.property.id);

  // ----------------------------------
  // LOADING SCREEN
  // ----------------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  // ----------------------------------
  // UI START
  // ----------------------------------
  return (
    <div className="min-h-screen bg-gray-100">
      {/* NAVBAR */}
      <nav className="bg-white shadow-sm p-4 flex justify-between">
        <h1
          className="text-xl font-bold cursor-pointer text-red-600"
          onClick={() => navigate("/")}
        >
          HomeEase
        </h1>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-600"
        >
          <LogOut size={20} /> Logout
        </button>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        {/* HEADER */}
        <h2 className="text-4xl font-bold mb-2">Renter Dashboard</h2>
        <p className="text-gray-500 mb-6">Find your perfect home</p>

        {/* -------------------------------- */}
        {/* PROFILE SECTION */}
        {/* -------------------------------- */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="flex justify-between">
            <h3 className="text-2xl font-bold">Profile Information</h3>

            {!isEditingProfile && (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                <Edit size={16} /> Edit
              </button>
            )}
          </div>

          {/* EDIT MODE */}
          {isEditingProfile ? (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label>Name</label>
                <input
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label>Phone</label>
                <input
                  name="phone"
                  value={profileForm.phone}
                  onChange={handleProfileChange}
                  className="w-full border p-2 rounded"
                />
              </div>

              <div className="col-span-2 flex justify-end gap-3">
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>

                <button
                  onClick={handleProfileSave}
                  className="px-4 py-2 bg-red-600 text-white rounded"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <p>
                <strong>Name:</strong> {user.name}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Phone:</strong> {user.phone}
              </p>
              <p>
                <strong>Role:</strong> {user.role}
              </p>
            </div>
          )}
        </div>

        {/* -------------------------------- */}
        {/* TABS */}
        {/* -------------------------------- */}
        <div className="bg-white shadow rounded-lg">
          <div className="flex border-b">
            <button
              className={`p-4 flex-1 ${
                activeTab === "browse"
                  ? "border-b-2 border-red-600 font-bold"
                  : ""
              }`}
              onClick={() => setActiveTab("browse")}
            >
              Browse Properties
            </button>

            <button
              className={`p-4 flex-1 ${
                activeTab === "favorites"
                  ? "border-b-2 border-red-600 font-bold"
                  : ""
              }`}
              onClick={() => setActiveTab("favorites")}
            >
              Favorites ({favorites.length})
            </button>

            <button
              className={`p-4 flex-1 ${
                activeTab === "inquiries"
                  ? "border-b-2 border-red-600 font-bold"
                  : ""
              }`}
              onClick={() => setActiveTab("inquiries")}
            >
              My Inquiries ({inquiries.length})
            </button>
          </div>

          <div className="p-6">
            {/* ---------------------------- */}
            {/* BROWSE TAB */}
            {/* ---------------------------- */}
            {activeTab === "browse" && (
              <div>
                <input
                  type="text"
                  placeholder="Search by title or location..."
                  className="border p-3 w-full mb-6 rounded"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                <div className="grid grid-cols-3 gap-6">
                  {filteredProperties.map((property) => (
                    <div
                      key={property.id}
                      className="border rounded-lg overflow-hidden shadow hover:shadow-lg"
                    >
                      <div className="relative h-48 bg-gray-200">
                        {property.imageUrls?.length ? (
                          <img
                            src={property.imageUrls[0]}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <FileText size={32} />
                          </div>
                        )}

                        <button
                          className="absolute top-3 right-3 bg-white p-2 rounded-full shadow"
                          onClick={() => toggleFavorite(property.id)}
                        >
                          <Heart
                            size={18}
                            className={
                              favoriteIds.includes(property.id)
                                ? "text-red-600 fill-red-600"
                                : ""
                            }
                          />
                        </button>
                      </div>

                      <div className="p-4">
                        <h3 className="font-bold">{property.title}</h3>
                        <p className="text-gray-600">{property.location}</p>

                        <div className="flex gap-3 text-sm mt-2">
                          <span>{property.bhk} BHK</span>
                          <span>{property.bath} Bath</span>
                          <span>{property.size} sqft</span>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => navigate(`/property/${property.id}`)}
                            className="flex-1 bg-red-600 text-white p-2 rounded"
                          >
                            View Details
                          </button>

                          <button className="p-2 border rounded">
                            <MessageCircle size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredProperties.length === 0 && (
                  <p className="text-center py-10 text-gray-500">
                    No properties found
                  </p>
                )}
              </div>
            )}

            {/* ---------------------------- */}
            {/* FAVORITES TAB */}
            {/* ---------------------------- */}
            {activeTab === "favorites" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Your Favorites</h2>

                {favorites.length === 0 ? (
                  <p className="text-gray-500">No favorites added yet.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-6">
                    {favorites.map((fav) => {
                      if (!fav.property) return null;
                      const p = fav.property;

                      return (
                        <div
                          key={p.id}
                          className="border rounded-lg shadow overflow-hidden"
                        >
                          <div className="relative h-48 bg-gray-100">
                            {p.imageUrls?.length ? (
                              <img
                                src={p.imageUrls[0]}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <FileText size={32} />
                              </div>
                            )}

                            <button
                              className="absolute top-3 right-3 p-2 bg-white rounded-full"
                              onClick={() => toggleFavorite(p.id)}
                            >
                              <Heart
                                size={18}
                                className="text-red-600 fill-red-600"
                              />
                            </button>
                          </div>

                          <div className="p-4">
                            <h3 className="font-semibold">{p.title}</h3>
                            <p className="text-gray-600">{p.location}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ---------------------------- */}
            {/* INQUIRIES TAB */}
            {/* ---------------------------- */}
            {activeTab === "inquiries" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Your Inquiries</h2>

                {inquiries.length === 0 ? (
                  <p className="text-gray-500">No inquiries yet.</p>
                ) : (
                  <div className="space-y-4">
                    {inquiries.map((inq) => (
                      <div
                        key={inq.id}
                        className="p-4 border rounded-lg shadow"
                      >
                        <h3 className="font-bold">
                          Property: {inq.property?.title}
                        </h3>
                        <p>Message: {inq.message}</p>
                        <p>Status: {inq.status}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
