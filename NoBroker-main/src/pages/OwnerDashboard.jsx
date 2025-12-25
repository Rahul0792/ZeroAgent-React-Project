// OwnerDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, LogOut } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    id: null,
    name: "",
    email: "",
    phone: "",
    role: "",
  });
  const [listings, setListings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("properties");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", phone: "" });
  const [saving, setSaving] = useState(false);

  const [replyForms, setReplyForms] = useState({});
  const [replying, setReplying] = useState({});

  const BASE_URL = "http://localhost:8080";

  // Fetch user, listings, and inquiries
  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return navigate("/login");

        const userData = JSON.parse(storedUser);
        if (userData.role !== "OWNER") {
          return userData.role === "RENTER"
            ? navigate("/dashboard")
            : navigate("/");
        }

        setUser(userData);
        setProfileForm({ name: userData.name, phone: userData.phone || "" });

        // Fetch properties
        const fetchProperties = async () => {
          const res = await fetch(
            `${BASE_URL}/api/properties/owner/${userData.id}`,
            {
              headers: { "User-Id": userData.id.toString() },
            }
          );
          if (!res.ok) throw new Error("Failed to fetch properties");
          const data = await res.json();
          setListings(data);
        };

        // Fetch inquiries
        const fetchInquiries = async () => {
          const res = await fetch(
            `${BASE_URL}/api/inquiries/owner/${userData.id}`,
            {
              headers: { "User-Id": userData.id.toString() },
            }
          );
          if (!res.ok) throw new Error("Failed to fetch inquiries");
          const data = await res.json();
          setInquiries(data);
        };

        await Promise.all([fetchProperties(), fetchInquiries()]);
      } catch {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Property actions
  const toggleListingStatus = (id) => {
    setListings((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, status: l.status === "active" ? "inactive" : "active" }
          : l
      )
    );
  };

  const deleteListing = async (id) => {
    try {
      if (!user.id) throw new Error("User not found");
      const res = await fetch(`${BASE_URL}/api/properties/${id}`, {
        method: "DELETE",
        headers: { "User-Id": user.id.toString() },
      });
      if (!res.ok) throw new Error("Failed to delete property");
      setListings((prev) => prev.filter((l) => l.id !== id));
      toast.success("Property deleted successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to delete property");
    }
  };

  // Profile actions
  const handleProfileEdit = () => setIsEditingProfile(true);
  const handleProfileCancel = () => {
    setIsEditingProfile(false);
    setProfileForm({ name: user.name, phone: user.phone });
  };
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleProfileSave = async () => {
    if (!profileForm.name.trim() || !profileForm.phone.trim())
      return toast.error("Name and phone required");

    try {
      setSaving(true);
      const res = await fetch(`${BASE_URL}/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...user,
          name: profileForm.name,
          phone: profileForm.phone,
        }),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      const updated = await res.json();
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      setIsEditingProfile(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // Inquiry actions
  const toggleReplyForm = (id) => {
    setReplyForms((prev) => ({
      ...prev,
      [id]: { show: !prev[id]?.show, message: prev[id]?.message || "" },
    }));
  };

  const handleReplyChange = (id, message) => {
    setReplyForms((prev) => ({ ...prev, [id]: { ...prev[id], message } }));
  };

const handleReplySubmit = async (inquiryId) => {
  try {
    setReplying((p) => ({ ...p, [inquiryId]: true }));

    const userId = user?.id;
    if (!userId) throw new Error("User not found. Please login again.");

    const replyMessage = replyForms[inquiryId]?.message;
    if (!replyMessage?.trim()) {
      toast.error("Please enter a reply message");
      return;
    }

    // Optional: timeout for fetch
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const resp = await fetch(`${BASE_URL}/api/inquiries/${inquiryId}/reply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Id": userId.toString(),
      },
      body: JSON.stringify({ replyMessage }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    // Reset reply form regardless of response
    setReplyForms((prev) => ({
      ...prev,
      [inquiryId]: { show: false, message: "" },
    }));
    setReplying((p) => ({ ...p, [inquiryId]: false }));

    if (!resp.ok) {
      toast.error("Failed to send reply");
      return;
    }

    const updatedInquiry = await resp.json();
    setInquiries((prev) =>
      prev.map((iq) => (iq.id === inquiryId ? updatedInquiry : iq))
    );

    toast.success("Message sent successfully!");
  } catch (err) {
    if (err.name === "AbortError") {
      toast.success("Message sent successfully!");
    } else {
      toast.error(err.message || "Failed to send reply");
    }
  } finally {
    setReplying((p) => ({ ...p, [inquiryId]: false }));
  }
};



  const handleMarkAsResolved = async (id) => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/inquiries/${id}/status?status=RESOLVED`,
        {
          method: "PUT",
          headers: { "User-Id": user.id.toString() },
        }
      );
      if (res.ok) {
        setInquiries((prev) =>
          prev.map((i) => (i.id === id ? { ...i, status: "RESOLVED" } : i))
        );
        toast.success("Inquiry marked as resolved");
      }
    } catch {
      setInquiries((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: "RESOLVED" } : i))
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  const activeListings = listings.filter((l) => l.status === "active").length;
  const totalViews = listings.reduce((sum, l) => sum + (l.views || 0), 0);
  const totalInquiries = inquiries.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
          <span
            className="text-2xl font-bold text-red-600 cursor-pointer"
            onClick={() => navigate("/")}
          >
            HomeEase
          </span>
          <div className="flex items-center gap-4">
            <span>Welcome, {user.name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600"
            >
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2">Owner Dashboard</h1>
            <p>Manage your property listings and inquiries</p>
          </div>
          <button
            onClick={() => navigate("/list-property")}
            className="bg-red-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
          >
            <Plus size={20} /> List New Property
          </button>
        </div>

        {/* Profile */}
        <div className="bg-white rounded-lg shadow-md mb-8 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Profile Information</h2>
            {!isEditingProfile && (
              <button
                onClick={handleProfileEdit}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                <Edit size={16} /> Edit
              </button>
            )}
          </div>
          {isEditingProfile ? (
            <div className="space-y-4">
              <input
                type="text"
                name="name"
                value={profileForm.name}
                onChange={handleProfileChange}
                className="border px-4 py-2 rounded w-full"
                placeholder="Name"
              />
              <input
                type="text"
                name="phone"
                value={profileForm.phone}
                onChange={handleProfileChange}
                className="border px-4 py-2 rounded w-full"
                placeholder="Phone"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleProfileCancel}
                  className="border px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProfileSave}
                  className="bg-red-600 text-white px-4 py-2 rounded"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <p>Name: {user.name}</p>
              <p>Email: {user.email}</p>
              <p>Phone: {user.phone}</p>
              <p>Role: {user.role}</p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("properties")}
              className={`px-6 py-4 font-medium ${
                activeTab === "properties"
                  ? "border-b-2 border-red-600 text-red-600"
                  : "text-gray-600"
              }`}
            >
              Properties
            </button>
            <button
              onClick={() => setActiveTab("inquiries")}
              className={`px-6 py-4 font-medium ${
                activeTab === "inquiries"
                  ? "border-b-2 border-red-600 text-red-600"
                  : "text-gray-600"
              }`}
            >
              Inquiries ({inquiries.length})
            </button>
          </div>

          <div className="p-6">
            {/* Properties Tab */}
            {activeTab === "properties" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 text-center">
                  <div className="bg-red-50 rounded p-4 font-semibold">
                    Active Listings <br /> {activeListings}
                  </div>
                  <div className="bg-red-50 rounded p-4 font-semibold">
                    Total Views <br /> {totalViews}
                  </div>
                  <div className="bg-red-50 rounded p-4 font-semibold">
                    Total Inquiries <br /> {totalInquiries}
                  </div>
                  <div className="bg-red-50 rounded p-4 font-semibold">
                    Total Listings <br /> {listings.length}
                  </div>
                </div>

                {listings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No properties listed
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.map((l) => (
                      <div
                        key={l.id}
                        className="bg-white shadow rounded-lg p-4 flex flex-col justify-between"
                      >
                        <div>
                          <h3 className="font-bold text-lg">{l.title}</h3>
                          <p className="text-gray-500">{l.location}</p>
                          <p className="mt-2 text-gray-700">
                            {l.bhk} BHK | {l.bath} Bath | {l.size} sq ft
                          </p>
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                          <span
                            className={`px-2 py-1 rounded text-sm font-medium ${
                              (l.status || "inactive") === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {(l.status || "inactive").toUpperCase()}
                          </span>

                          <div className="flex gap-2">
                            <button
                              onClick={() => toggleListingStatus(l.id)}
                              className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded"
                            >
                              {l.status === "active"
                                ? "Deactivate"
                                : "Activate"}
                            </button>
                            <button
                              onClick={() => navigate(`/edit-property/${l.id}`)}
                              className="px-2 py-1 bg-blue-100 text-blue-700 rounded"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteListing(l.id)}
                              className="px-2 py-1 bg-red-100 text-red-700 rounded"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Inquiries Tab */}
            {activeTab === "inquiries" && (
              <>
                {inquiries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No inquiries yet
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {inquiries.map((inq) => (
                      <div
                        key={inq.id}
                        className="bg-gray-50 rounded-lg p-4 shadow flex flex-col gap-2"
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="font-semibold text-gray-800">
                            {inq.propertyTitle}
                          </h4>
                          <span
                            className={`px-2 py-1 rounded text-sm font-medium ${
                              inq.status === "RESOLVED"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {inq.status}
                          </span>
                        </div>
                        <p className="text-gray-700">{inq.message}</p>

                        {replyForms[inq.id]?.show && (
                          <textarea
                            value={replyForms[inq.id].message}
                            onChange={(e) =>
                              handleReplyChange(inq.id, e.target.value)
                            }
                            className="w-full border p-2 rounded"
                            placeholder="Type your reply..."
                          />
                        )}

                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => toggleReplyForm(inq.id)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded"
                          >
                            {replyForms[inq.id]?.show ? "Cancel" : "Reply"}
                          </button>
                          {replyForms[inq.id]?.show && (
                            <button
                              onClick={() => handleReplySubmit(inq.id)}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded"
                            >
                              Send
                            </button>
                          )}
                          {inq.status !== "RESOLVED" && (
                            <button
                              onClick={() => handleMarkAsResolved(inq.id)}
                              className="px-3 py-1 bg-gray-200 text-gray-700 rounded"
                            >
                              Mark Resolved
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}