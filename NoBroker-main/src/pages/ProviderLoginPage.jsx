import React, { useState, useEffect } from "react";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function ProviderLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem("providerRegisteredEmail");
    if (storedEmail) {
      setEmail(storedEmail);
      localStorage.removeItem("providerRegisteredEmail");
    }
  }, []);

  const handleSubmit = async () => {
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      alert("Enter a valid email");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://172.20.10.5:8080/api/providers/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Invalid email or password");
      }

      localStorage.setItem(
        "provider",
        JSON.stringify({ ...data.provider, token: data.token })
      );

      navigate("/providers");
    } catch (error) {
      alert(error.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-red-600">HomeEase</h1>
          <h2 className="text-2xl font-bold mt-3 text-gray-900">
            Provider Login
          </h2>
          <p className="text-gray-500">
            Sign in to manage bookings and your services.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl px-6 py-10 shadow">
          {/* Email */}
          <div className="mb-5">
            <label className="font-semibold text-gray-700 mb-1 block">
              Email
            </label>
            <div className="flex items-center border border-gray-300 rounded-xl px-3">
              <FiMail size={20} className="text-gray-500" />
              <input
                type="email"
                placeholder="email@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 p-3 outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="font-semibold text-gray-700 mb-1 block">
              Password
            </label>
            <div className="flex items-center border border-gray-300 rounded-xl px-3">
              <FiLock size={20} className="text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 p-3 outline-none"
              />
              <button onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-red-600 w-full py-3 rounded-xl text-white font-semibold text-lg"
          >
            {loading ? "Loading..." : "Login as Provider"}
          </button>
        </div>

        {/* Register Link */}
        <p className="text-center text-gray-600 mt-6">
          New provider?{" "}
          <span
            onClick={() => navigate("/provider-register")}
            className="text-red-600 font-semibold cursor-pointer"
          >
            Create account
          </span>
        </p>
      </div>
    </div>
  );
}
