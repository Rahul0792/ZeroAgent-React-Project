import axios from "axios";

const API_BASE = "http://172.20.10.5:8080/api/admin"; // change as needed

export const adminUsersApi = {
  // Fetch all users
  getAllUsers: async () => {
    const res = await axios.get(`${API_BASE}/users`);
    return res.data; // your component uses response.success & response.users
  },

  // Delete a user
  deleteUser: async (id) => {
    const res = await axios.delete(`${API_BASE}/users/${id}`);
    return res.data;
  },
};
