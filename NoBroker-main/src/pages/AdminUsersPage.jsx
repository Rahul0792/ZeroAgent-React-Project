import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Shield, Edit, Trash2 } from "lucide-react";
import { adminUsersApi } from "../services/adminApi";

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    userId: null,
    userName: "",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await adminUsersApi.getAllUsers();

        if (response.success) {
          const transformedUsers = response.users.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role?.toLowerCase() || "user",
            status: "active",
            joinDate: user.createdAt
              ? new Date(user.createdAt).toISOString().split("T")[0]
              : "Unknown",
          }));

          setUsers(transformedUsers);
          setFilteredUsers(transformedUsers);
        } else {
          setError(response.message || "Failed to fetch users");
        }
      } catch (err) {
        setError(err.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleDeleteUser = async (userId) => {
    try {
      await adminUsersApi.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setFilteredUsers((prev) => prev.filter((u) => u.id !== userId));
      setDeleteConfirmation({ isOpen: false, userId: null, userName: "" });
    } catch (err) {
      setError(err.message || "Failed to delete user");
    }
  };

  const openDeleteConfirmation = (userId, userName) => {
    setDeleteConfirmation({ isOpen: true, userId, userName });
  };

  const closeDeleteConfirmation = () => {
    setDeleteConfirmation({ isOpen: false, userId: null, userName: "" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl font-semibold">Error</div>
          <p className="mt-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-2">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                {deleteConfirmation.userName}
              </span>
              ?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteConfirmation}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={() =>
                  deleteConfirmation.userId &&
                  handleDeleteUser(deleteConfirmation.userId)
                }
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="sticky top-0 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2">
            <ArrowLeft size={20} /> Back to Admin
          </Link>

          <Link to="/" className="text-2xl font-bold text-primary">
            HomeEase Admin
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-gray-500 mb-6">Manage and moderate user accounts</p>

        <div className="mb-6 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-lg"
          />
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Role</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Join Date</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">{user.name}</td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                        {user.role === "owner" && <Shield size={14} />}
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {user.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-gray-500">{user.joinDate}</td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg">
                          <Edit size={18} />
                        </button>

                        <button
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                          onClick={() =>
                            openDeleteConfirmation(user.id, user.name)
                          }
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search terms.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
