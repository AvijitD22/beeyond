import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import AuthPage from "./pages/AuthPage";
import Navbar from "./components/Navbar";
import ProductsPage from "./pages/Customer/ProductsPage";
import OrdersPage from "./pages/Customer/OrdersPage";
import AvailableOrders from "./pages/Delivery/AvailableOrders";
import MyActiveOrders from "./pages/Delivery/MyActiveOrders";

// Placeholder pages (we'll build real ones later)
const CustomerDashboard = () => <h1>Customer Orders Dashboard</h1>;
const DeliveryAvailable = () => <h1>Available Orders for Delivery Partners</h1>;
const AdminOrders = () => <h1>Admin - All Orders Overview</h1>;

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

function App() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <Routes>
      {/* Public */}
      <Route path="/auth" element={user ? <Navigate to="/" /> : <AuthPage />} />
      {/* Role-based protected routes */}
      <Route
        path="/customer/*"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <Routes>
              // Inside customer protected routes
              <Route path="orders" element={<OrdersPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="*" element={<Navigate to="orders" replace />} />
            </Routes>
          </ProtectedRoute>
        }
      />

      <Route
        path="/delivery/*"
        element={
          <ProtectedRoute allowedRoles={["delivery"]}>
            <Routes>
              {/* <Route path="available" element={<DeliveryAvailable />} /> */}
              <Route path="available" element={<AvailableOrders />} />
              <Route path="my-orders" element={<MyActiveOrders />} />
              <Route path="*" element={<Navigate to="available" replace />} />
            </Routes>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Routes>
              <Route path="orders" element={<AdminOrders />} />
              <Route path="*" element={<Navigate to="orders" replace />} />
            </Routes>
          </ProtectedRoute>
        }
      />
      {/* Root - fallback after login if no specific path */}
      <Route
        path="/"
        element={
          user ? (
            // Auto-redirect based on role if someone hits root directly
            (() => {
              if (user.role === "customer")
                return <Navigate to="/customer/products" replace />;
              if (user.role === "delivery")
                return <Navigate to="/delivery/available" replace />;
              if (user.role === "admin")
                return <Navigate to="/admin/orders" replace />;
              return <div>Welcome! (unknown role)</div>;
            })()
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />
      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
