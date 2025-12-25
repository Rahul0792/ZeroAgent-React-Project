import React, { useEffect, useState } from "react";
import { FiLogOut, FiEdit, FiUser } from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

export default function ProviderDashboard() {
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editMode, setEditMode] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
  });

  // Load provider
  useEffect(() => {
    const init = async () => {
      setLoading(true);

      const stored = localStorage.getItem("provider");
      if (!stored) return navigate("/provider-login");

      let data;
      try {
        data = JSON.parse(stored);
      } catch (e) {
        localStorage.removeItem("provider");
        return navigate("/provider-login");
      }

      if (!data?.id) {
        localStorage.removeItem("provider");
        return navigate("/provider-login");
      }

      setProvider(data);
      setProfileForm({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        city: data.city || "",
      });

      await fetchBookings(data.id);
      setLoading(false);
    };

    init();
  }, []);

  // Fetch bookings
  const fetchBookings = async (providerId) => {
    try {
      const resp = await fetch(
        `http://192.168.31.224:8080/api/bookings/provider/${providerId}`
      );
      if (!resp.ok) throw new Error("Failed to load bookings");
      const data = await resp.json();
      setBookings(data);
    } catch (err) {
      alert(err.message);
    }
  };

  // Logout
  const logout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("provider");
      navigate("/provider-login");
    }
  };

  // Mark booking completed
  const handleMarkCompleted = async (id) => {
    setUpdatingId(id);
    try {
      const resp = await fetch(
        `http://192.168.31.224:8080/api/bookings/${id}/status?status=COMPLETED`,
        { method: "PUT" }
      );

      if (!resp.ok) throw new Error("Failed to update booking");

      const updated = await resp.json();
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
    } catch (err) {
      alert(err.message);
    }
    setUpdatingId(null);
  };

  // Delete booking
  const handleDeleteBooking = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      const resp = await fetch(
        `http://192.168.31.224:8080/api/bookings/${id}`,
        { method: "DELETE" }
      );

      if (!resp.ok) throw new Error("Failed to delete booking");

      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  // Save profile
  const handleSaveProfile = async () => {
    try {
      const resp = await fetch(
        `http://192.168.31.224:8080/api/providers/${provider.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profileForm),
        }
      );

      if (!resp.ok) throw new Error("Failed to update profile");

      const updated = await resp.json();
      setProfileForm(updated);
      setProvider(updated);
      localStorage.setItem("provider", JSON.stringify(updated));

      setEditMode(false);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;
  const completedCount = bookings.filter(
    (b) => b.status === "COMPLETED"
  ).length;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* HEADER */}
      <div className="bg-white px-6 py-4 rounded-2xl shadow mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-red-600">Provider Dashboard</h2>

        <button
          onClick={logout}
          className="flex items-center gap-2 text-red-600 hover:text-red-800 font-semibold"
        >
          <FiLogOut size={20} />
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT SIDE — PROFILE */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow">
            {editMode ? (
              <>
                {["name", "email", "phone", "city"].map((field) => (
                  <div key={field} className="mb-3">
                    <p className="text-xs text-gray-500 capitalize">{field}</p>
                    <input
                      value={profileForm[field]}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          [field]: e.target.value,
                        })
                      }
                      className="w-full p-3 rounded-xl bg-gray-200 outline-none"
                    />
                  </div>
                ))}

                <button
                  onClick={handleSaveProfile}
                  className="w-full bg-red-600 text-white py-3 rounded-xl mb-2"
                >
                  Save
                </button>

                <button
                  onClick={() => setEditMode(false)}
                  className="w-full bg-gray-400 text-white py-3 rounded-xl"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                      <FiUser size={32} className="text-red-600" />
                    </div>

                    <div className="ml-3">
                      <p className="text-sm text-gray-500">Provider</p>
                      <p className="text-lg font-semibold">{provider.name}</p>
                    </div>
                  </div>

                  <button onClick={() => setEditMode(true)}>
                    <FiEdit
                      size={26}
                      className="text-red-600 hover:text-red-800"
                    />
                  </button>
                </div>

                <p className="text-gray-500 text-xs">Email</p>
                <p className="font-medium mb-3">{provider.email}</p>

                <p className="text-gray-500 text-xs">Phone</p>
                <p className="font-medium mb-3">{provider.phone || "-"}</p>

                <p className="text-gray-500 text-xs">City</p>
                <p className="font-medium">{provider.city || "-"}</p>
              </>
            )}
          </div>

          {/* STAT CARDS */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-white p-4 rounded-xl shadow text-center">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-xl font-bold">{bookings.length}</p>
            </div>

            <div className="bg-white p-4 rounded-xl shadow text-center">
              <p className="text-xs text-gray-500">Pending</p>
              <p className="text-xl font-bold text-yellow-600">
                {pendingCount}
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl shadow text-center">
              <p className="text-xs text-gray-500">Completed</p>
              <p className="text-xl font-bold text-green-600">
                {completedCount}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE — BOOKINGS */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-3">Service Inquiries</h2>

          {bookings.length === 0 ? (
            <p className="text-gray-500">No bookings found.</p>
          ) : (
            bookings.map((b, i) => (
              <div key={b.id} className="bg-white p-6 rounded-2xl shadow mb-4">
                <div className="flex justify-between mb-3">
                  <p className="font-semibold text-lg">
                    {i + 1}. {b.user?.name || "Unknown"}
                  </p>

                  <p
                    className={`font-semibold ${
                      b.status === "COMPLETED"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {b.status}
                  </p>
                </div>

                <p className="text-gray-600 flex items-center gap-1">
                  <FaRupeeSign size={12} /> {b.amount}
                </p>

                <p className="text-gray-500 text-sm mt-1">
                  Booking: {new Date(b.bookingDate).toLocaleString()}
                </p>

                <p className="text-gray-500 text-sm">
                  Schedule: {new Date(b.scheduleDate).toLocaleString()}
                </p>

                <p className="flex items-center gap-2 text-gray-600 mt-2 text-sm">
                  <IoLocationOutline size={16} />
                  {b.address}
                </p>

                {b.status === "PENDING" && (
                  <button
                    onClick={() => handleMarkCompleted(b.id)}
                    disabled={updatingId === b.id}
                    className="w-full bg-red-600 text-white py-3 rounded-xl mt-4 hover:bg-red-700"
                  >
                    {updatingId === b.id ? "Updating..." : "Mark Completed"}
                  </button>
                )}

                <button
                  onClick={() => handleDeleteBooking(b.id)}
                  className="w-full bg-gray-300 text-gray-900 py-3 rounded-xl mt-2 hover:bg-gray-400"
                >
                  Delete Booking
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
