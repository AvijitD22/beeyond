import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Link, Outlet, useLocation } from "react-router-dom";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user || user.role !== "admin") {
    navigate("/auth");
    return null;
  }

  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md hidden md:flex flex-col">
        <div className="p-6 font-semibold text-lg border-b">⚙️ Admin Panel</div>

        <nav className="flex flex-col p-4 gap-2">
          <Link
            to="/admin/orders"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition 
              ${
                isActive("/admin/orders")
                  ? "bg-black text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            📦 Orders
          </Link>

          <Link
            to="/admin/users"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition 
              ${
                isActive("/admin/users")
                  ? "bg-black text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            👥 Users
          </Link>
        </nav>
      </aside>

      {/* Main Section */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
          <h1 className="text-lg font-semibold">Dashboard</h1>
          {user?.name && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium">{user.name}</span>
            </div>
          )}
        </header>

        {/* Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
      {/* Bottom Navigation (Mobile Only) */}
<div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t shadow-md flex justify-around py-2 z-50">
  
  <Link
    to="/admin/orders"
    className={`flex flex-col items-center text-xs ${
      isActive("/admin/orders")
        ? "text-black font-semibold"
        : "text-gray-500"
    }`}
  >
    <span className="text-lg">📦</span>
    Orders
  </Link>

  <Link
    to="/admin/users"
    className={`flex flex-col items-center text-xs ${
      isActive("/admin/users")
        ? "text-black font-semibold"
        : "text-gray-500"
    }`}
  >
    <span className="text-lg">👥</span>
    Users
  </Link>

</div>
    </div>
  );
}
