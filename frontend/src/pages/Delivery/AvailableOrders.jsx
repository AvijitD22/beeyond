// src/pages/Delivery/AvailableOrders.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { connectSocket } from "../../services/socket";

export default function AvailableOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acceptingId, setAcceptingId] = useState(null); // to show loading per button

  useEffect(() => {
    // ✅ Auth check FIRST
    if (!user || user.role !== "delivery") {
      navigate("/auth");
      return;
    }

    // ✅ Fetch initial data
    fetchAvailableOrders();

    // ✅ Connect socket
    const socket = connectSocket();

    // ✅ Listen event
    const handleOrderAccepted = ({ orderId }) => {
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
    };

    socket.on("order-accepted", handleOrderAccepted);

    // ✅ Cleanup (VERY IMPORTANT)
    return () => {
      socket.off("order-accepted", handleOrderAccepted);
    };
  }, [user, navigate]);

  const fetchAvailableOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:5000/api/orders/available",
        {
          withCredentials: true,
        },
      );
      setOrders(res.data);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load available orders",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (orderId) => {
    if (!window.confirm("Accept this order?")) return;

    setAcceptingId(orderId);
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/orders/${orderId}/accept`,
        {},
        { withCredentials: true },
      );
      alert("Order accepted!");

      // Remove from list immediately (optimistic update)
      setOrders((prev) => prev.filter((o) => o._id !== orderId));

      // Optional: navigate to my active orders or refresh
      // navigate('/delivery/my-orders');
    } catch (err) {
      alert(err.response?.data?.message || "Failed to accept order");
      // If failed because already taken → refresh list
      if (err.response?.status === 400) {
        fetchAvailableOrders();
      }
    } finally {
      setAcceptingId(null);
    }
  };

  if (loading)
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        Loading available orders...
      </div>
    );
  if (error)
    return <div style={{ padding: "40px", color: "red" }}>{error}</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "1100px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h1>Available Orders</h1>
        <button
          onClick={fetchAvailableOrders}
          style={{
            padding: "8px 16px",
            background: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "80px 20px",
            background: "#f8f9fa",
            borderRadius: "8px",
          }}
        >
          <h3>No pending orders right now</h3>
          <p>
            New orders will appear here automatically (refresh or wait for
            real-time later)
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {orders.map((order) => (
            <div
              key={order._id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "20px",
                background: "#fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <strong>Order #{order._id.slice(-8).toUpperCase()}</strong>
                <span style={{ color: "#ffc107", fontWeight: "bold" }}>
                  PENDING
                </span>
              </div>

              <div style={{ margin: "12px 0" }}>
                <strong>Items:</strong>
                <ul style={{ paddingLeft: "20px", margin: "8px 0" }}>
                  {order.items.map((item, idx) => (
                    <li key={idx}>
                      {item.quantity} × {item.product?.name || "Item"}
                      <span style={{ float: "right" }}>
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ margin: "12px 0", color: "#555" }}>
                Customer: {order.customer?.name || "Customer"} • {order.address}
              </div>

              <div
                style={{
                  borderTop: "1px solid #eee",
                  paddingTop: "16px",
                  marginTop: "16px",
                  fontWeight: "bold",
                }}
              >
                Total: ₹{order.totalAmount.toFixed(2)}
              </div>

              <button
                onClick={() => handleAccept(order._id)}
                disabled={acceptingId === order._id}
                style={{
                  marginTop: "16px",
                  padding: "12px 28px",
                  background: acceptingId === order._id ? "#ccc" : "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "16px",
                  cursor: acceptingId === order._id ? "not-allowed" : "pointer",
                  width: "100%",
                }}
              >
                {acceptingId === order._id ? "Accepting..." : "Accept Order"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
