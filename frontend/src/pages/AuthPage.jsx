// src/pages/AuthPage.jsx
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let userData;
      if (isLogin) {
        userData = await login(formData.email, formData.password);
      } else {
        userData = await register(formData);
      }

      // ── Role-based redirect ──
      let redirectPath = "/";

      if (userData.role === "customer") {
        redirectPath = "/customer/products"; // or '/dashboard' or '/'
      } else if (userData.role === "delivery") {
        redirectPath = "/delivery/available"; // pending orders list
      } else if (userData.role === "admin") {
        redirectPath = "/admin/orders"; // all orders overview
      }

      navigate(redirectPath);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <h2>{isLogin ? "Login" : "Register"}</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <>
            <div>
              <label>Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Phone (optional)</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </>
        )}

        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        {!isLogin && (
          <div>
            <label>Role</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="customer">Customer</option>
              <option value="delivery">Delivery Partner</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        )}

        <button type="submit" disabled={loading} style={{ marginTop: "16px" }}>
          {loading ? "Processing..." : isLogin ? "Login" : "Register"}
        </button>
      </form>

      <p style={{ marginTop: "16px" }}>
        {isLogin ? "Don't have an account?" : "Already have an account?"}
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          style={{
            background: "none",
            border: "none",
            color: "blue",
            cursor: "pointer",
          }}
        >
          {isLogin ? "Register" : "Login"}
        </button>
      </p>
    </div>
  );
}
