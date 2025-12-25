import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Heart,
  Menu,
  X,
  LogOut,
} from "lucide-react";

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Check if user is logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setIsLoggedIn(true);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Fetch all properties
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/properties");
        if (!response.ok) throw new Error("Failed to fetch properties");
        const data = await response.json();
        setAllProperties(data);
        setFeaturedProperties(data.slice(0, 3));
      } catch (err) {
        const fallbackData = [
          {
            id: 1,
            title: "Luxury 3BHK Apartment",
            location: "Bandra, Mumbai",
            rent: 85000,
            bhk: 3,
            bath: 3,
            size: 1800,
            image: "/placeholder.svg?key=prop1",
          },
          {
            id: 2,
            title: "Modern 2BHK Villa",
            location: "Whitefield, Bangalore",
            rent: 65000,
            bhk: 2,
            bath: 2,
            size: 1200,
            image: "/placeholder.svg?key=prop2",
          },
          {
            id: 3,
            title: "Cozy Studio Apartment",
            location: "Powai, Mumbai",
            rent: 35000,
            bhk: 1,
            bath: 1,
            size: 600,
            image: "/placeholder.svg?key=prop3",
          },
        ];
        setAllProperties(fallbackData);
        setFeaturedProperties(fallbackData);
      }
    };
    fetchProperties();
  }, []);

  // Filter properties based on search term
  const filteredProperties = allProperties.filter((property) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      property.title?.toLowerCase().includes(term) ||
      property.location?.toLowerCase().includes(term) ||
      property.propertyType?.toLowerCase().includes(term)
    );
  });

  const handleSearch = (e) => e.preventDefault();

  return (
    <div className="min-h-screen bg-red-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold text-red-600">
              HomeEase
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-800"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                to="/search"
                className="text-gray-800 hover:text-red-600 transition"
              >
                Search
              </Link>
              {user?.role === "OWNER" && (
                <Link
                  to="/list-property"
                  className="text-gray-800 hover:text-red-600 transition"
                >
                  List Property
                </Link>
              )}
              {user?.role === "ADMIN" && (
                <Link
                  to="/admin"
                  className="text-gray-800 hover:text-red-600 transition"
                >
                  Admin Dashboard
                </Link>
              )}
              <Link
                to="/services"
                className="text-gray-800 hover:text-red-600 transition"
              >
                Services
              </Link>

              {isLoggedIn ? (
                <button
                  onClick={() => {
                    localStorage.removeItem("user");
                    setIsLoggedIn(false);
                    window.location.href = "/";
                  }}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
                >
                  <LogOut size={18} /> Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              <Link
                to="/search"
                className="block text-gray-800 hover:text-red-600 transition"
              >
                Search
              </Link>

              {user?.role === "OWNER" && (
                <Link
                  to="/list-property"
                  className="block text-gray-800 hover:text-red-600 transition"
                >
                  List Property
                </Link>
              )}
              {user?.role === "ADMIN" && (
                <Link
                  to="/admin"
                  className="block text-gray-800 hover:text-red-600 transition"
                >
                  Admin Dashboard
                </Link>
              )}
              <Link
                to="/services"
                className="block text-gray-800 hover:text-red-600 transition"
              >
                Services
              </Link>
              <Link
                to="/login"
                className="block text-gray-800 hover:text-red-600 transition"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Find Your Perfect Home
        </h1>
        <p className="text-xl text-gray-500 mb-8 max-w-2xl mx-auto">
          Direct from owners, zero brokerage. Transparent, trusted, and simple
          property marketplace.
        </p>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto mb-8"
        >
          <input
            type="text"
            placeholder="Search by city, locality or landmark..."
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            type="submit"
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:opacity-90 transition font-semibold"
          >
            Search
          </button>
        </form>
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button className="px-4 py-2 bg-white border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition">
            Rent
          </button>
          <button className="px-4 py-2 bg-white border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition">
            Buy
          </button>
          {user && user.role === "OWNER" && (
            <button className="px-4 py-2 bg-white border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition">
              List Property
            </button>
          )}
          <Link
            href="/pay-rent"
            className="px-4 py-2 bg-white border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition"
          >
            Pay Rent
          </Link>
        </div>
      </div>

      {/* Featured Properties */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            {searchTerm
              ? `Search Results (${filteredProperties.length})`
              : "Featured Properties"}
          </h2>
          {filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredProperties.slice(0, 3).map((property) => (
                <Link key={property.id} to={`/property/${property.id}`}>
                  <div className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition cursor-pointer group">
                    <div className="relative overflow-hidden h-64">
                      <img
                        src={property.image || "/placeholder.svg"}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                      <button className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:bg-gray-100">
                        <Heart size={20} className="text-red-600" />
                      </button>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {property.title}
                      </h3>
                      <div className="flex items-center gap-1 text-gray-500 mb-4">
                        <MapPin size={16} />{" "}
                        <span className="text-sm">{property.location}</span>
                      </div>
                      <div className="text-2xl font-bold text-red-600 mb-2">
                        ₹{property.rent?.toLocaleString()}
                        <span className="text-sm text-gray-500">/mo</span>
                      </div>
                      <div className="flex gap-4 text-sm text-gray-500 border-t pt-4">
                        <div className="flex items-center gap-1">
                          <Bed size={16} /> {property.bhk} BHK
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath size={16} /> {property.bath} Bath
                        </div>
                        <div className="flex items-center gap-1">
                          <Maximize2 size={16} /> {property.size} sqft
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No properties found matching "{searchTerm}"
              </p>
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      </div>
        {/* Why Choose Us */}
            <div className="bg-secondary py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Why Choose HomeEase?</h2>
      
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-4">No Broker</div>
                    <p className="text-muted-foreground">Direct connection with property owners means no middleman fees.</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-4">Verified</div>
                    <p className="text-muted-foreground">All listings are verified and authentic for your peace of mind.</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-4">Secure</div>
                    <p className="text-muted-foreground">Integrated payments and digital agreements for safe transactions.</p>
                  </div>
                </div>
              </div>
            </div>
      
            {/* CTA Section */}
            <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-12">
              <div className="max-w-3xl mx-auto text-center px-4">
                <h2 className="text-3xl font-bold mb-4">Ready to Find Your Home?</h2>
                <p className="mb-8 text-lg opacity-90">
                  Join thousands of users finding their perfect home with zero brokerage.
                </p>
                <Link
                  href="/search"
                  className="inline-block bg-red-600 text-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                >
                  Browse Properties
                </Link>
              </div>
            </div>
    </div>
  );
}
