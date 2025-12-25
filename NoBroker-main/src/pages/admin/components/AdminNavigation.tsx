import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { BarChart3, Users, Home, AlertCircle, LogOut } from "lucide-react";

export default function AdminNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const handleLogout = () => {
    // Remove user data from localStorage
    localStorage.removeItem("user");
    // Redirect to login page
    navigate("/login");
  };

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: BarChart3,
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      name: "Properties",
      href: "/admin/properties",
      icon: Home,
    },
    {
      name: "Moderation",
      href: "/admin/moderation",
      icon: AlertCircle,
    },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <NavLink to="/admin" className="text-2xl font-bold text-blue-600">
            HomeEase Admin
          </NavLink>

          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-1 py-2 text-sm font-medium transition ${
                    isActive
                      ? "text-blue-600 border-b-2 border-blue-600 -mb-[2px]"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.name}
                </NavLink>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-gray-800">Admin User</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 hover:opacity-80 transition"
            >
              <LogOut size={20} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
