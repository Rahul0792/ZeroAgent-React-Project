// src/pages/ServicesScreen.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiHome,
  FiMessageCircle,
  FiFileText,
  FiArrowRight,
  FiSend,
  FiPlus,
} from "react-icons/fi";

export default function ServicesPage() {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  const handleNavigate = (route) => {
    localStorage.setItem("last_service_page", route);
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white shadow px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-red-600">HomeEase</h1>
        <button onClick={goBack}>
          <FiArrowLeft size={22} className="text-gray-700" />
        </button>
      </div>

      {/* Hero */}
      <div className="bg-red-50 px-4 py-10 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Home Services at Your Fingertips
        </h2>
        <p className="text-gray-500 mb-14">
          Professional contractors and service providers for all your home needs
        </p>
      </div>

      {/* Main Service Cards */}
      <div className="p-4">
        {/* 1 HOME SERVICES */}
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <FiHome size={22} className="text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Home Services
            </h3>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Available
            </span>
          </div>

          <p className="text-gray-500 mb-3">
            Best home cleaning and service professionals.
          </p>

          <button
            className="w-full bg-red-600 py-3 rounded-xl flex justify-center items-center text-white font-bold"
            onClick={() => handleNavigate("/book-service")}
          >
            Check Home Services
            <FiArrowRight size={18} className="ml-2 text-white" />
          </button>
        </div>

        {/* 2 CHAT SUPPORT */}
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <FiMessageCircle size={22} className="text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Chat Support (AI)
            </h3>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Available
            </span>
          </div>

          <p className="text-gray-500 mb-3">
            Ask questions & get instant support.
          </p>

          <button
            className="w-full bg-red-600 py-3 rounded-xl flex justify-center items-center text-white font-bold"
            onClick={() => handleNavigate("/chat")}
          >
            Open Chat Support
            <FiSend size={18} className="ml-2 text-white" />
          </button>
        </div>

        {/* 3 RENT AGREEMENT */}
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <FiFileText size={22} className="text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                Rent Agreement
              </h3>
            </div>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Available
            </span>
          </div>

          <p className="text-gray-500 mb-3">
            Generate legal rent agreements instantly.
          </p>

          <button
            className="w-full bg-red-600 py-3 rounded-xl flex justify-center items-center text-white font-bold"
            onClick={() => handleNavigate("/rent-agreement")}
          >
            Generate Rent Agreement
            <FiArrowRight size={18} className="ml-2 text-white" />
          </button>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-red-600 rounded-2xl p-8 m-4 mt-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Don’t see what you need?
        </h2>
        <p className="text-white/90 mb-4">
          Post your service request & get quotes from professionals
        </p>
        <button className="bg-white px-6 py-3 rounded-xl flex items-center gap-2 mx-auto">
          <FiPlus size={18} className="text-red-600" />
          <span className="font-bold text-red-600">Post a Request</span>
        </button>
      </div>
    </div>
  );
}
