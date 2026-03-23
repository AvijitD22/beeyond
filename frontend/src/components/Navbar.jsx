import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <div className="text-xl font-semibold text-gray-800">
          Beeyond
        </div>

        {/* Desktop Menu */}
        {user && (
          <div className="hidden md:flex items-center gap-6">
            {/* <span className="text-gray-700 text-sm">
              Welcome, <span className="font-medium">{user.name}</span>
              <span className="ml-1 text-gray-500">({user.role})</span>
            </span> */}

            <button
              onClick={logout}
              className="bg-black text-white px-4 py-1.5 rounded-lg text-sm hover:bg-gray-800 transition"
            >
              Logout
            </button>
          </div>
        )}

        {/* Mobile Menu Button */}
        {user && (
          <button
            className="md:hidden text-gray-700"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
        )}
      </div>

      {/* Mobile Menu */}
      {menuOpen && user && (
        <div className="md:hidden mt-3 px-2 pb-3 space-y-3 border-t">
          {/* <div className="text-gray-700 text-sm">
            Welcome, <span className="font-medium">{user.name}</span>
            <span className="ml-1 text-gray-500">({user.role})</span>
          </div> */}

          <button
            onClick={logout}
            className="w-full bg-black text-white py-2 rounded-lg text-sm hover:bg-gray-800 transition"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;