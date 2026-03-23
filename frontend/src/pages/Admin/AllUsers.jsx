import { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../../config/api";


export default function AllUsers() {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState(""); // '' = all, 'customer', 'delivery', 'admin'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      const url = roleFilter ? `/api/users?role=${roleFilter}` : "/api/users";
      const res = await axios.get(`${API_BASE_URL}${url}`, {
        withCredentials: true,
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div>
      <h1>👥 All Users</h1>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-600">Role:</span>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">All</option>
            <option value="customer">Customers</option>
            <option value="delivery">Delivery</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        {/* Right Section */}
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full bg-white rounded-xl shadow">
          <thead className="bg-gray-200 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Role</th>
              <th className="p-3">Joined</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b">
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.phone || "—"}</td>
                <td className="p-3">
                  <span className="px-2 py-1 rounded text-white text-xs bg-black">
                    {user.role.toUpperCase()}
                  </span>
                </td>
                <td className="p-3">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-4">
        {users.map((user) => (
          <div
            key={user._id}
            className="bg-white p-4 rounded-xl shadow space-y-2"
          >
            <div className="flex justify-between">
              <span className="font-semibold">{user.name}</span>
              <span className="text-xs px-2 py-1 bg-black text-white rounded">
                {user.role.toUpperCase()}
              </span>
            </div>

            <p className="text-sm">{user.email}</p>

            <p className="text-sm text-gray-500">{user.phone || "No phone"}</p>

            <p className="text-xs text-gray-400">
              Joined: {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

const thStyle = { padding: "12px", textAlign: "left", fontWeight: "bold" };
const tdStyle = { padding: "12px", textAlign: "left" };
