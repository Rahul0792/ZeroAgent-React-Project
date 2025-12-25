import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, ArrowRight } from "lucide-react";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setIsLoading(true);
    setMessage("");
    setError("");

    if (!email) {
      setError("Please enter your email address");
      setIsLoading(false);
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);

        setTimeout(() => {
          navigate("/reset-password", { state: { email } });
        }, 2000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to process request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-red-600 mb-4">HomeEase</h1>
          <h2 className="text-2xl font-bold">Forgot Password</h2>
          <p className="text-gray-500 mt-1">
            Enter your email and we'll send a 4-digit OTP to reset your
            password.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          {message && (
            <div className="bg-green-100 border border-green-300 text-green-700 px-3 py-2 rounded-lg text-sm">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Email Address
            </label>
            <div className="relative mt-2">
              <Mail size={20} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-red-600 py-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? "Sending..." : "Send OTP"}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-gray-600">
          Remember your password?{" "}
          <Link to="/login" className="text-red-600 font-semibold">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
