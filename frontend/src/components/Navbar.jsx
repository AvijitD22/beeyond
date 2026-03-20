import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  return (
    <nav style={{ padding: '10px', background: '#f0f0f0' }}>
      {user && (
        <>
          <span>Welcome, {user.name} ({user.role})</span>
          <button onClick={logout} style={{ marginLeft: '20px' }}>Logout</button>
        </>
      )}
    </nav>
  );
};

export default Navbar;