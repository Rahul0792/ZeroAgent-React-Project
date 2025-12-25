import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  IoArrowBack,
  IoLocationOutline,
  IoAdd,
  IoClose,
  IoSave,
} from "react-icons/io5";

export default function EditProperty() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newAmenity, setNewAmenity] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    rent: "",
    bhk: "",
    bath: "",
    size: "",
    propertyType: "apartment",
    furnishing: "unfurnished",
    amenities: [],
    imageUrls: [],
  });

  // 🔐 GET AUTH USER (FIXED)
  const getUser = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.token) return null;
      return user;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const fetchProperty = async () => {
      const user = getUser();
      if (!user) {
        localStorage.setItem("redirectAfterLogin", `/edit-property/${id}`);
        alert("Please login first");
        navigate("/login");
        return;
      }

      try {
        const res = await fetch(`http://172.20.10.5:8080/api/properties/${id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "User-Id": user.id.toString(),
          },
        });

        if (!res.ok) throw new Error("Failed to load property");

        const data = await res.json();

        setFormData({
          title: data.title || "",
          description: data.description || "",
          location: data.location || "",
          rent: data.rent?.toString() || "",
          bhk: data.bhk?.toString() || "",
          bath: data.bath?.toString() || "",
          size: data.size?.toString() || "",
          propertyType: data.propertyType?.toLowerCase() || "apartment",
          furnishing: data.furnishing?.toLowerCase() || "unfurnished",
          amenities: data.amenities || [],
          imageUrls: data.imageUrls || [],
        });
      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, navigate]);

  const handleChange = (name, value) =>
    setFormData((p) => ({ ...p, [name]: value }));

  const addAmenity = () => {
    const val = newAmenity.trim();
    if (val && !formData.amenities.includes(val)) {
      setFormData((p) => ({
        ...p,
        amenities: [...p.amenities, val],
      }));
      setNewAmenity("");
    }
  };

  const removeAmenity = (item) =>
    setFormData((p) => ({
      ...p,
      amenities: p.amenities.filter((a) => a !== item),
    }));

  const handleSubmit = async () => {
    const user = getUser();
    if (!user) {
      alert("Session expired. Please login again.");
      navigate("/login");
      return;
    }

    try {
      setSaving(true);

      const updatedData = {
        ...formData,
        rent: Number(formData.rent),
        bhk: Number(formData.bhk),
        bath: Number(formData.bath),
        size: Number(formData.size),
        propertyType: formData.propertyType.toUpperCase(),
        furnishing: formData.furnishing.toUpperCase(),
        ownerId: user.id,
      };

      const res = await fetch(`http://172.20.10.5:8080/api/properties/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
          "User-Id": user.id.toString(),
        },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) throw new Error("Update failed");

      alert("Property updated successfully");
      navigate("/owner-dashboard");
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading property...</p>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto p-5">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)}>
          <IoArrowBack size={24} className="text-red-600" />
        </button>
        <h1 className="text-2xl font-bold ml-4">Edit Property</h1>
      </div>

      {["title", "description", "rent", "size", "bhk", "bath"].map((f) => (
        <input
          key={f}
          value={formData[f]}
          onChange={(e) => handleChange(f, e.target.value)}
          placeholder={f.toUpperCase()}
          className="w-full border p-3 rounded mb-3"
        />
      ))}

      <div className="flex items-center border p-3 rounded mb-3">
        <IoLocationOutline />
        <input
          className="ml-2 flex-1"
          value={formData.location}
          onChange={(e) => handleChange("location", e.target.value)}
          placeholder="Location"
        />
      </div>

      <div className="flex gap-2 mb-3">
        <input
          className="flex-1 border p-3 rounded"
          value={newAmenity}
          onChange={(e) => setNewAmenity(e.target.value)}
        />
        <button
          onClick={addAmenity}
          className="bg-red-600 p-3 rounded text-white"
        >
          <IoAdd />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {formData.amenities.map((a, i) => (
          <span key={i} className="bg-gray-100 px-3 py-1 rounded-full flex">
            {a}
            <button onClick={() => removeAmenity(a)}>
              <IoClose />
            </button>
          </span>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={saving}
        className="bg-red-600 text-white px-6 py-3 rounded flex items-center gap-2"
      >
        <IoSave /> Update Property
      </button>
    </div>
  );
}
