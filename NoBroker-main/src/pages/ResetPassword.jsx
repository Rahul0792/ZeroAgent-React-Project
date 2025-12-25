import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Key, Lock, Eye, EyeOff } from "lucide-react";

export default function VerifyAndReset() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleVerifyOtp = async () => {
    setError("");
    setSuccess("");

    if (!otp || otp.length < 4) {
      setError("Enter the 4-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://172.20.10.5:8080/api/auth/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setIsOtpVerified(true);
        setSuccess("OTP Verified! Now reset your password.");
      } else {
        setError(data.message);
      }
    } catch {
      setError("Failed to verify OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://172.20.10.5:8080/api/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp, password, confirmPassword }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccess("Password changed successfully!");

        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        setError(data.message);
      }
    } catch {
      setError("Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-red-600 mb-6">HomeEase</h1>

        <h2 className="text-2xl font-bold">
          {isOtpVerified ? "Reset Password" : "Verify OTP"}
        </h2>
        <p className="text-gray-600 mt-1">{email}</p>

        <div className="bg-white rounded-2xl shadow p-6 mt-8 space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-300 text-green-700 px-3 py-2 rounded-lg">
              {success}
            </div>
          )}

          {/* OTP SECTION */}
          {!isOtpVerified && (
            <div>
              <label className="text-sm font-semibold">Enter OTP</label>
              <div className="relative mt-2">
                <Key
                  className="absolute left-3 top-3 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="1234"
                  className="w-full pl-10 pr-4 py-3 border rounded-lg bg-gray-50 tracking-widest"
                />
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full bg-red-600 mt-4 py-3 rounded-lg text-white font-semibold disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          )}

          {/* RESET PASSWORD SECTION */}
          {isOtpVerified && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold">New Password</label>
                <div className="relative mt-2">
                  <Lock
                    className="absolute left-3 top-3 text-gray-400"
                    size={20}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border rounded-lg bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold">
                  Confirm Password
                </label>
                <div className="relative mt-2">
                  <Lock
                    className="absolute left-3 top-3 text-gray-400"
                    size={20}
                  />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border rounded-lg bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full bg-red-600 py-3 rounded-lg text-white font-semibold disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-gray-600">
          Wrong email?{" "}
          <Link to="/forgot-password" className="text-red-600 font-semibold">
            Go Back
          </Link>
        </div>
      </div>
    </div>
  );
}
