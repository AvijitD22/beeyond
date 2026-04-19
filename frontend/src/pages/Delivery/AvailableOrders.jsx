// src/pages/Delivery/AvailableOrders.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { connectSocket } from "../../services/socket";
import API_BASE_URL from "../../config/api";



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

    const handleNewOrder = (newOrder) => {
      setOrders((prev) => {
        // Prevent duplicate orders
        if (prev.some((o) => o._id === newOrder._id)) return prev;
        return [newOrder, ...prev];
      });
    };

    socket.on("order-accepted", handleOrderAccepted);
    socket.on("new-order", handleNewOrder);

    // ✅ Cleanup (VERY IMPORTANT)
    return () => {
      socket.off("order-accepted", handleOrderAccepted);
      socket.off("new-order", handleNewOrder);
    };
  }, [user, navigate]);

  const fetchAvailableOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/orders/available`,
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
        `${API_BASE_URL}/api/orders/${orderId}/accept`,
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
<div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
  {/* Heading */}
  <h1 className="text-xl md:text-3xl font-semibold">
    🚚 Available Orders
  </h1>

  {/* Actions */}
  <div className="flex items-center justify-between w-full md:w-auto gap-3">
    <Link
      to="/delivery/my-orders"
      className="flex-1 md:flex-none text-center px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition"
    >
      My Active Orders
    </Link>

    <button
      onClick={fetchAvailableOrders}
      className="flex-1 md:flex-none px-4 py-2 bg-white border rounded-lg text-sm hover:bg-gray-100 transition"
    >
      Refresh
    </button>
  </div>
</div>

        {/* Empty State */}
        {orders.length === 0 ? (
          <div className="text-center bg-white rounded-xl shadow-sm p-10">
            <div className="text-5xl mb-3">📭</div>
            <h3 className="text-lg font-medium">No orders available</h3>
            <p className="text-gray-500 mt-2">
              New orders will appear here automatically
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-5"
              >
                {/* Header */}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">
                      Order #{order._id.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleTimeString("en-IN")}
                    </p>
                  </div>

                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium">
                    Pending
                  </span>
                </div>

                {/* Customer + Address */}
                <div className="mt-4 bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium">
                    👤 {order.customer?.name || "Customer"}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    📍 {order.address}
                  </p>
                </div>

                {/* Items */}
                <div className="mt-4 space-y-2 text-sm">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>
                        {item.quantity} × {item.product?.name || "Item"}
                      </span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-4 border-t pt-3 flex justify-between items-center">
                  <p className="text-gray-500 text-sm">Total</p>
                  <p className="text-lg font-semibold text-green-600">
                    ₹{order.totalAmount.toFixed(2)}
                  </p>
                </div>

                {/* Accept Button */}
                <button
                  onClick={() => handleAccept(order._id)}
                  disabled={acceptingId === order._id}
                  className={`w-full mt-4 py-2.5 rounded-lg font-medium transition 
                ${
                  acceptingId === order._id
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
                >
                  {acceptingId === order._id ? "Accepting..." : "Accept Order"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
