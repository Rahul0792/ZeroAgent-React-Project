import React, { useEffect, useState } from "react";
import { FaMapMarkerAlt, FaArrowLeft, FaShieldAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";

const BASE_URL = "http://loacalhost:8080";

export default function ProvidersClientPage({ categoryId, categoryTitle }) {
  const [providers, setProviders] = useState([]);
  const [categoryName, setCategoryName] = useState(categoryTitle || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [city, setCity] = useState("");
  const [showCityModal, setShowCityModal] = useState(true);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);

  const [bookingData, setBookingData] = useState({
    userId: 1,
    providerId: null,
    categoryId: null,
    scheduledDate: "",
    address: "",
    amount: "",
    transactionId: "",
  });

  const [datePickerValue, setDatePickerValue] = useState(null);

  useEffect(() => {
    if (!categoryId || !city) return;

    const fetchProviders = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${BASE_URL}/api/providers/category/${categoryId}?city=${city}`
        );
        if (!res.ok) throw new Error("Unable to fetch providers");

        const data = await res.json();
        setProviders(data);
        setCategoryName(data[0]?.categoryTitle || categoryTitle);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [categoryId, city]);

  const handleCitySelect = (c) => {
    setCity(c);
    setShowCityModal(false);
  };

  const createRazorpayOrder = async (amount) => {
    const res = await fetch(
      `${BASE_URL}/api/razorpay/create-order?amount=${amount}&currency=INR`,
      { method: "POST" }
    );

    return res.json();
  };

  const sendBooking = async () => {
    const res = await fetch(`${BASE_URL}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData),
    });

    return res.json();
  };

  const payAndBook = async () => {
    if (
      !bookingData.address ||
      !bookingData.amount ||
      !bookingData.scheduledDate
    ) {
      alert("All booking fields are required!");
      return;
    }

    try {
      const order = await createRazorpayOrder(bookingData.amount);

      const options = {
        key: "rzp_test_RUUsLf5ulwr2cW",
        amount: order.amount,
        currency: "INR",
        name: "Home Service",
        description: "Service Payment",
        order_id: order.orderId,
        handler: async function (response) {
          setBookingData((prev) => ({
            ...prev,
            transactionId: response.razorpay_payment_id,
          }));

          await sendBooking();

          alert("Payment Successful & Booking Confirmed!");
          setShowBookingModal(false);
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert("Payment Failed!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 shadow bg-white">
        <FaArrowLeft className="text-gray-800 text-xl cursor-pointer" />
        <h1 className="text-xl font-bold">{categoryName}</h1>
      </div>

      {/* Hero */}
      <div className="bg-red-50 py-10 text-center px-4">
        <h2 className="text-2xl font-bold">Find a Pro for {categoryName}</h2>
        <p className="text-gray-600 mt-2">
          Browse verified professionals ready to help you.
        </p>

        <button
          className="mt-4 bg-white px-4 py-2 border rounded-lg flex items-center mx-auto"
          onClick={() => setShowCityModal(true)}
        >
          <FaMapMarkerAlt className="text-red-500 text-lg" />
          <span className="ml-2">{city || "Choose City"}</span>
        </button>
      </div>

      {/* Providers */}
      <div className="p-4">
        {loading && <p className="text-center mt-4">Loading...</p>}

        {error && <p className="text-center text-red-600 mt-3">{error}</p>}

        {!loading && providers.length === 0 && (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="font-semibold">No Providers Found</p>
            <p className="text-gray-500 mt-2">
              No providers available in this city.
            </p>
          </div>
        )}

        {providers.map((provider) => (
          <div
            key={provider.id}
            className="bg-white p-4 rounded-xl shadow flex justify-between items-center mt-4"
          >
            <div>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">{provider.name}</h3>
                <div className="flex items-center bg-green-100 px-2 py-1 rounded">
                  <FaShieldAlt className="text-green-600 text-sm" />
                  <span className="ml-1 text-sm text-green-700">Verified</span>
                </div>
              </div>

              <p className="text-gray-600">
                {provider.categoryTitle || provider.serviceType}
              </p>

              <p className="text-gray-600 flex items-center gap-1 mt-1">
                <FaMapMarkerAlt className="text-red-500" />
                {provider.city} • {provider.experience} yrs
              </p>

              <p className="text-red-600 font-bold mt-1">
                ₹ {provider.basePrice}
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedProvider(provider);
                setBookingData({
                  ...bookingData,
                  providerId: provider.id,
                  categoryId: provider.categoryId,
                  amount: provider.basePrice,
                });
                setShowBookingModal(true);
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Book Now
            </button>
          </div>
        ))}
      </div>

      {/* City Modal */}
      {showCityModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-end">
          <div className="bg-white p-6 w-full max-w-md rounded-t-2xl">
            <h3 className="text-xl font-semibold mb-3">Choose Your City</h3>
            {["Pune", "Mumbai", "Delhi", "Bangalore"].map((c) => (
              <p
                key={c}
                className="py-2 border-b cursor-pointer"
                onClick={() => handleCitySelect(c)}
              >
                {c}
              </p>
            ))}
            <button
              className="mt-4 bg-gray-200 py-2 rounded-lg w-full"
              onClick={() => setShowCityModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-end">
          <div className="bg-white p-6 w-full max-w-md rounded-t-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-center">
              Book Service with {selectedProvider?.name}
            </h3>

            <div className="mt-3">
              <label className="text-gray-600">Select Date & Time</label>
              <DatePicker
                selected={datePickerValue}
                onChange={(date) => {
                  setDatePickerValue(date);
                  setBookingData({
                    ...bookingData,
                    scheduledDate: dayjs(date).format("YYYY-MM-DDTHH:mm:ss"),
                  });
                }}
                showTimeSelect
                className="w-full border p-2 rounded mt-1"
              />
            </div>

            <input
              type="text"
              placeholder="Address"
              className="w-full border p-2 rounded mt-3"
              value={bookingData.address}
              onChange={(e) =>
                setBookingData({ ...bookingData, address: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Amount"
              className="w-full border p-2 rounded mt-3"
              value={bookingData.amount}
              onChange={(e) =>
                setBookingData({ ...bookingData, amount: e.target.value })
              }
            />

            <button
              className="w-full bg-red-600 text-white py-3 rounded-lg mt-4"
              onClick={payAndBook}
            >
              Pay & Confirm Booking
            </button>

            <button
              className="w-full bg-gray-200 py-3 rounded-lg mt-2"
              onClick={() => setShowBookingModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
