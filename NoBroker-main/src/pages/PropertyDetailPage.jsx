import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  ArrowLeft,
  Heart,
  MessageCircle,
  Calendar,
  User,
  Phone,
  Mail,
  FileText,
} from "lucide-react";

export default function PropertyDetailPage() {
  const { id } = useParams(); // property id
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({ message: "" });
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [error, setError] = useState("");
  const [showOwnerContact, setShowOwnerContact] = useState(false);
  const [ownerInfo, setOwnerInfo] = useState(null);
  const [loadingOwnerInfo, setLoadingOwnerInfo] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const response = await fetch(
          `http://localhost:8080/api/properties/${id}`
        );

        if (!response.ok) throw new Error("Failed to fetch property");

        const propertyData = await response.json();
        setProperty(propertyData);

        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);

          if (userData.role !== "RENTER") {
            navigate("/");
            return;
          }

          await checkIfFavorited(userData.id, id);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  // ------ FAVORITES -------
  const checkIfFavorited = async (userId, propertyId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/favorites/check?propertyId=${propertyId}`,
        {
          headers: { "User-Id": userId.toString() },
        }
      );

      if (response.ok) {
        const fav = await response.json();
        setIsFavorite(fav);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleFavorite = async () => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      const userData = JSON.parse(storedUser);

      const method = isFavorite ? "DELETE" : "POST";

      await fetch(`http://localhost:8080/api/favorites?propertyId=${id}`, {
        method,
        headers: { "User-Id": userData.id.toString() },
      });

      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error(err);
    }
  };

  // ------ INQUIRY -------
  const handleInquiryChange = (e) => {
    setInquiryForm({ ...inquiryForm, [e.target.name]: e.target.value });
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      const userData = JSON.parse(storedUser);

      if (!inquiryForm.message.trim())
        throw new Error("Please enter a message");

      const response = await fetch(
        `http://localhost:8080/api/inquiries?propertyId=${id}&message=${encodeURIComponent(
          inquiryForm.message
        )}`,
        { method: "POST", headers: { "User-Id": userData.id.toString() } }
      );

      if (!response.ok) throw new Error("Inquiry failed");

      alert("Inquiry submitted!");
      setShowInquiryForm(false);
      setInquiryForm({ message: "" });
    } catch (err) {
      alert(err.message);
    }
  };

  // ------ OWNER CONTACT INFO -------
  const fetchOwnerInfo = async (ownerId) => {
    setLoadingOwnerInfo(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/users/${ownerId}`
      );

      if (!response.ok) throw new Error("Failed to fetch owner");

      const data = await response.json();
      setOwnerInfo(data);
    } catch (err) {
      alert("Failed to load owner info");
    } finally {
      setLoadingOwnerInfo(false);
    }
  };

  const handleShowContactInfo = async () => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      setShowLoginPrompt(true);
      return;
    }

    const ownerId =
      property?.ownerId || property?.owner?.id || property?.owner_id;

    if (!ownerId) {
      alert("Owner not found");
      return;
    }

    await fetchOwnerInfo(ownerId);
    setShowOwnerContact(true);
  };

  const handleHideContactInfo = () => {
    setShowOwnerContact(false);
    setOwnerInfo(null);
  };

  // ------ LOGIN REDIRECT -------
  const handleLoginRedirect = () => {
    localStorage.setItem("redirectAfterLogin", `/property/${id}`);
    navigate("/login");
  };


   const handlePayRent = () => {
     const storedUser = localStorage.getItem("user");
     if (!storedUser) {
       setShowLoginPrompt(true);
       return;
     }
     navigate(`/pay-rent?propertyId=${id}`);
   };
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <h2 className="text-red-500 text-2xl mb-2">Error</h2>
        <p>{error}</p>
        <Link to="/" className="text-red-500 mt-3">
          Go Home
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      {/* LOGIN PROMPT MODAL */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
            <h3 className="text-xl font-bold mb-2">Login Required</h3>
            <p className="text-gray-600 mb-4">
              Please login to use this feature.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="flex-1 border py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleLoginRedirect}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NAVIGATION */}
      <nav className="sticky top-0 bg-white shadow-sm p-4 flex justify-between">
        <Link to="/" className="text-2xl font-bold text-red-600">
          HomeEase
        </Link>

        <Link to="/" className="flex gap-2 items-center text-gray-700">
          <ArrowLeft size={20} />
          Back to Home
        </Link>
      </nav>

      {/* ---------- CONTENT ---------- */}
      <div className="max-w-6xl mx-auto p-6">
        {/* PROPERTY HEADER */}
        {property && (
          <>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold">{property.title}</h1>
                <div className="flex items-center gap-1 text-gray-600">
                  <MapPin size={18} />
                  {property.location}
                </div>
              </div>

              <button
                onClick={toggleFavorite}
                className="p-3 border rounded-full"
              >
                <Heart
                  size={24}
                  className={isFavorite ? "text-red-500 fill-red-500" : ""}
                />
              </button>
            </div>

            {/* IMAGE */}
            <div className="bg-gray-200 h-80 rounded-xl overflow-hidden">
              <img
                src={property.imageUrls?.[0] || "/placeholder.svg"}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* DETAILS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              {/* LEFT (DESCRIPTION + AMENITIES) */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-xl shadow">
                  <h2 className="text-xl font-bold mb-3">Description</h2>
                  <p className="text-gray-700">
                    {property.description || "No description available."}
                  </p>
                </div>

                {property.amenities?.length > 0 && (
                  <div className="bg-white p-6 rounded-xl shadow">
                    <h2 className="text-xl font-bold mb-3">Amenities</h2>
                    <ul className="grid grid-cols-2 gap-2">
                      {property.amenities.map((a, i) => (
                        <li key={i} className="text-gray-700">
                          • {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* RIGHT SIDEBAR */}
              <div className="space-y-6">
                {/* Owner Info */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    Property Owner
                  </h2>
                  {showOwnerContact ? (
                    <div>
                      {loadingOwnerInfo ? (
                        <div className="flex justify-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                      ) : ownerInfo ? (
                        <div>
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                              <User
                                size={24}
                                className="text-primary-foreground"
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">
                                {ownerInfo.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Verified Owner
                              </p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                              <Phone
                                size={20}
                                className="text-muted-foreground"
                              />
                              <span className="text-foreground">
                                {ownerInfo.phone}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                              <Mail
                                size={20}
                                className="text-muted-foreground"
                              />
                              <span className="text-foreground">
                                {ownerInfo.email}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={handleHideContactInfo}
                            className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition"
                          >
                            Hide Contact Information
                          </button>
                        </div>
                      ) : (
                        <div>
                          <p className="text-muted-foreground mb-4">
                            Failed to load owner information
                          </p>
                          <button
                            onClick={handleHideContactInfo}
                            className="w-full text-sm text-muted-foreground hover:text-foreground transition"
                          >
                            Try Again
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                          <User size={24} className="text-primary-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            Property Owner
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Verified Owner
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <button
                          onClick={handleShowContactInfo}
                          className="w-full flex items-center  bg-red-600 text-white justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition"
                        >
                          <Phone size={20} />
                          <span>Show Phone Number</span>
                        </button>
                        <button
                          onClick={handleShowContactInfo}
                          className="w-full flex items-center justify-center gap-2 border border-border py-3 rounded-lg hover:bg-secondary transition"
                        >
                          <Mail size={20} />
                          <span>Send Email</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* INQUIRY */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    Interested in this property?
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Contact the owner directly for more information or to
                    schedule a viewing.
                  </p>

                  <div className="space-y-3 mb-4">
                    <button
                      onClick={handlePayRent}
                      className="w-full flex bg-red-600 text-white items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition"
                    >
                      <span>Pay From Here</span>
                    </button>
                  </div>

                  {!showInquiryForm ? (
                    <button
                      onClick={() => {
                        if (!localStorage.getItem("user")) {
                          setShowLoginPrompt(true);
                          return;
                        }
                        setShowInquiryForm(true);
                      }}
                      className="w-full border py-3 rounded-lg"
                    >
                      Send Inquiry
                    </button>
                  ) : (
                    <form onSubmit={handleInquirySubmit} className="space-y-3">
                      <textarea
                        name="message"
                        value={inquiryForm.message}
                        onChange={handleInquiryChange}
                        placeholder="Your message..."
                        className="w-full border p-3 rounded-lg"
                        rows={4}
                        required
                      />

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setShowInquiryForm(false)}
                          className="flex-1 border py-3 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-red-600 text-white py-3 rounded-lg"
                        >
                          Send
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
