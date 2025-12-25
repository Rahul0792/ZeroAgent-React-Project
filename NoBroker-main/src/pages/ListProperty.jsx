import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, Check } from "lucide-react";


export default function ListPropertyPage() {
  const [formStep, setFormStep] = useState(1);
  const [user, setUser] = useState(null);
  const [propertyData, setPropertyData] = useState({
    title: "",
    description: "",
    location: "",
    rent: "",
    bhk: "",
    bath: "",
    size: "",
    furnishing: "unfurnished",
    propertyType: "apartment",
    amenities: [],
    images: [],
  });

  const amenitiesList = [
    "Air Conditioning",
    "Parking",
    "Balcony",
    "Gym",
    "Swimming Pool",
    "Security",
    "Lift",
    "Intercom",
    "Garden",
    "WiFi",
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      if (userData.role !== "OWNER") {
        alert(`Only owners can list properties. Redirecting...`);
        window.location.href = "/dashboard";
      }
    } else {
      window.location.href = "/login";
    }
  }, []);

  const handleInputChange = (e) => {
    setPropertyData({
      ...propertyData,
      [e.target.name]: e.target.value,
    });
  };

  const toggleAmenity = (amenity) => {
    setPropertyData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (files) {
      if (propertyData.images.length + files.length > 10) {
        alert("Maximum 10 images allowed.");
        return;
      }
      const validFiles = Array.from(files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (!validFiles.length) return;

      const readFile = (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

      Promise.all(validFiles.map(readFile))
        .then((images) => {
          setPropertyData((prev) => ({
            ...prev,
            images: [...prev.images, ...images],
          }));
        })
        .catch(() => alert("Failed to read image files."));
    }
  };

  const removeImage = (index) => {
    setPropertyData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formStep < 4) {
      setFormStep(formStep + 1);
      return;
    }

    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        alert("You must login.");
        window.location.href = "/login";
        return;
      }

      const user = JSON.parse(storedUser);
      const response = await fetch("http://localhost:8080/api/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Id": user.id.toString(),
        },
        body: JSON.stringify({ ...propertyData, ownerId: user.id }),
      });

      if (!response.ok) throw new Error("Failed to list property.");

      alert("Property listed successfully!");
      setFormStep(1);
      setPropertyData({
        title: "",
        description: "",
        location: "",
        rent: "",
        bhk: "",
        bath: "",
        size: "",
        furnishing: "UNFURNISHED",
        propertyType: "APARTMENT",
        amenities: [],
        images: [],
      });
      window.location.href = "/owner-dashboard";
    } catch (err) {
      alert(err.message || "Failed to list property.");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="sticky top-0 bg-white shadow-md z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-red-600">
            HomeEase
          </Link>
          <Link
            to="/owner-dashboard"
            className="flex items-center gap-2 text-gray-700 hover:text-red-600"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </Link>
        </div>
      </nav>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">
          List Your Property
        </h1>
        <p className="mb-6 text-gray-600">
          Fill in details to list your property quickly.
        </p>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`flex-1 h-2 rounded-full transition-colors duration-300 ${
                step <= formStep ? "bg-red-600" : "bg-gray-300"
              }`}
            ></div>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 bg-white p-6 rounded-lg shadow-md"
        >
          {/* Step 1 */}
          {formStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                Basic Info
              </h2>
              <input
                className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-red-400"
                name="title"
                value={propertyData.title}
                onChange={handleInputChange}
                placeholder="Title"
                required
              />
              <textarea
                className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-red-400"
                name="description"
                value={propertyData.description}
                onChange={handleInputChange}
                placeholder="Description"
                required
              />
              <input
                className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-red-400"
                name="location"
                value={propertyData.location}
                onChange={handleInputChange}
                placeholder="Location"
                required
              />
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setFormStep(2)}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {formStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                Property Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-red-400"
                  type="number"
                  name="rent"
                  value={propertyData.rent}
                  onChange={handleInputChange}
                  placeholder="Monthly Rent"
                  required
                />
                <input
                  className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-red-400"
                  type="number"
                  name="size"
                  value={propertyData.size}
                  onChange={handleInputChange}
                  placeholder="Size (sq ft)"
                  required
                />
                <input
                  className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-red-400"
                  type="number"
                  name="bhk"
                  value={propertyData.bhk}
                  onChange={handleInputChange}
                  placeholder="Bedrooms"
                  required
                />
                <input
                  className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-red-400"
                  type="number"
                  name="bath"
                  value={propertyData.bath}
                  onChange={handleInputChange}
                  placeholder="Bathrooms"
                  required
                />
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <select
                  name="propertyType"
                  value={propertyData.propertyType}
                  onChange={handleInputChange}
                >
                  <option value="APARTMENT">Apartment</option>
                  <option value="VILLA">Villa</option>
                  <option value="STUDIO">Studio</option>
                  <option value="INDEPENDENT_HOUSE">Independent House</option>
                  <option value="PENTHOUSE">Penthouse</option>
                </select>
                <select
                  name="furnishing"
                  value={propertyData.furnishing}
                  onChange={handleInputChange}
                >
                  <option value="UNFURNISHED">Unfurnished</option>
                  <option value="SEMI_FURNISHED">Semi Furnished</option>
                  <option value="FURNISHED">Furnished</option>
                </select>
              </div>

              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={() => setFormStep(1)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setFormStep(3)}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {formStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                Amenities
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {amenitiesList.map((a) => (
                  <label
                    key={a}
                    className={`border rounded-md p-3 cursor-pointer flex items-center justify-between transition
                    ${
                      propertyData.amenities.includes(a)
                        ? "bg-red-100 border-red-400"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    {a}
                    {propertyData.amenities.includes(a) && (
                      <Check className="text-red-600" />
                    )}
                    <input
                      type="checkbox"
                      checked={propertyData.amenities.includes(a)}
                      onChange={() => toggleAmenity(a)}
                      className="hidden"
                    />
                  </label>
                ))}
              </div>

              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={() => setFormStep(2)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setFormStep(4)}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 4 */}
          {formStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                Upload Images
              </h2>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="border border-gray-300 rounded-md p-3 w-full"
              />
              <div className="grid grid-cols-3 gap-4 mt-4">
                {propertyData.images.map((img, i) => (
                  <div
                    key={i}
                    className="relative border rounded-md overflow-hidden"
                  >
                    <img
                      src={img}
                      alt={`Property ${i}`}
                      className="w-full h-32 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={() => setFormStep(3)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                >
                  Previous
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                >
                  Submit Property
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
