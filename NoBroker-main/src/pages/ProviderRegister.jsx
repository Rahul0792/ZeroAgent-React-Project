import React, { useState } from "react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function ProviderRegister() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    experience: "",
    basePrice: "",
    serviceType: "",
    password: "",
    confirmPassword: "",
  });

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    setLoading(true);

    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.city ||
      !formData.experience ||
      !formData.basePrice ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      alert("Please fill all fields");
      setLoading(false);
      return;
    }

    if (!formData.email.includes("@")) {
      alert("Invalid email");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!agreedToTerms) {
      alert("Please accept terms & conditions");
      setLoading(false);
      return;
    }

    const providerData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      city: formData.city,
      experience: Number(formData.experience),
      basePrice: Number(formData.basePrice),
      serviceType: formData.serviceType,
      password: formData.password,
    };

    try {
      const res = await fetch("http://172.20.10.5:8080/api/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(providerData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Registration failed");
      }

      alert("Account created successfully!");
      navigate("/provider-login");
    } catch (error) {
      alert(error.message);
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center bg-gray-100 min-h-screen p-6">
      <div className="bg-white w-full max-w-lg p-8 rounded-2xl shadow-lg">
        {/* Header */}
        <h1 className="text-3xl font-bold text-red-600">HomeEase</h1>
        <p className="text-xl font-semibold mt-3 text-gray-900">
          Provider Registration
        </p>
        <p className="text-gray-500 mb-6">
          Create your provider account and start receiving jobs.
        </p>

        {/* Form */}
        <div className="space-y-5">
          {/* Input Field Component */}
          <div>
            <label className="font-semibold text-gray-700">Full Name</label>
            <div className="flex items-center border p-3 rounded-xl mt-1">
              <FiUser size={20} className="text-gray-500" />
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="flex-1 ml-3 outline-none"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="font-semibold text-gray-700">Email</label>
            <div className="flex items-center border p-3 rounded-xl mt-1">
              <FiMail size={20} className="text-gray-500" />
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                type="email"
                className="flex-1 ml-3 outline-none"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="font-semibold text-gray-700">Phone</label>
            <div className="flex items-center border p-3 rounded-xl mt-1">
              <FiPhone size={20} className="text-gray-500" />
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className="flex-1 ml-3 outline-none"
              />
            </div>
          </div>

          {/* City */}
          <div>
            <label className="font-semibold text-gray-700">City</label>
            <input
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Pune, Mumbai..."
              className="w-full border p-3 rounded-xl"
            />
          </div>

          {/* Experience & Base Price */}
          <div className="flex gap-3">
            <div className="w-1/2">
              <label className="font-semibold text-gray-700">
                Experience (years)
              </label>
              <input
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                placeholder="3"
                type="number"
                className="w-full border p-3 rounded-xl"
              />
            </div>

            <div className="w-1/2">
              <label className="font-semibold text-gray-700">
                Base Price (₹)
              </label>
              <input
                name="basePrice"
                value={formData.basePrice}
                onChange={handleChange}
                placeholder="500"
                type="number"
                className="w-full border p-3 rounded-xl"
              />
            </div>
          </div>

          {/* Service Type */}
          <div>
            <label className="font-semibold text-gray-700">Service Type</label>
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              className="w-full border p-3 rounded-xl"
            >
              <option value="">Select Service</option>
              <option value="Electrician">Electrician</option>
              <option value="Cleaner">Cleaner</option>
              <option value="Painter">Painter</option>
              <option value="Plumber">Plumber</option>
              <option value="Carpenter">Carpenter</option>
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="font-semibold text-gray-700">Password</label>
            <div className="flex items-center border p-3 rounded-xl mt-1">
              <FiLock size={20} className="text-gray-500" />
              <input
                name="password"
                value={formData.password}
                onChange={handleChange}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="flex-1 ml-3 outline-none"
              />
              <button onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="font-semibold text-gray-700">
              Confirm Password
            </label>
            <div className="flex items-center border p-3 rounded-xl mt-1">
              <FiLock size={20} className="text-gray-500" />
              <input
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className="flex-1 ml-3 outline-none"
              />
              <button
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <FiEyeOff size={20} />
                ) : (
                  <FiEye size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={() => setAgreedToTerms(!agreedToTerms)}
              className="mr-2"
            />
            <p className="text-gray-600">I agree to Terms & Privacy Policy</p>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl mt-2 font-semibold"
          >
            {loading ? "Creating..." : "Create Provider Account"}
          </button>
        </div>

        {/* Login Link */}
        <p className="text-center text-gray-600 mt-4">
          Already a provider?{" "}
          <span
            onClick={() => navigate("/provider/login")}
            className="text-red-600 font-semibold cursor-pointer"
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
}
