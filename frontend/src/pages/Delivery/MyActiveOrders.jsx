import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function MyActiveOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "delivery") {
      navigate("/auth");
      return;
    }
    fetchMyActiveOrders();
  }, [user, navigate]);

  const fetchMyActiveOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:5000/api/orders/my-active",
        {
          withCredentials: true,
        },
      );
      setOrders(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load your orders");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (!window.confirm(`Mark as ${newStatus.replace("_", " ")}?`)) return;

    setUpdatingId(orderId);
    try {
      await axios.patch(
        `http://localhost:5000/api/orders/${orderId}/status`,
        { status: newStatus },
        { withCredentials: true },
      );

      // Optimistic update
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)),
      );

      alert(`Order marked as ${newStatus.replace("_", " ")}`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const getNextStatus = (current) => {
    const flow = ["accepted", "picked_up", "on_the_way", "delivered"];
    const idx = flow.indexOf(current);
    return idx < flow.length - 1 ? flow[idx + 1] : null;
  };

  const getStatusColor = (status) => {
    const colors = {
      accepted: "#17a2b8",
      picked_up: "#fd7e14",
      on_the_way: "#007bff",
      delivered: "#28a745",
    };
    return colors[status] || "#6c757d";
  };

  if (loading)
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        Loading your active orders...
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
            🚚 My Active Orders
          </h1>

          {/* Actions */}
          <div className="flex items-center justify-between w-full md:w-auto gap-3">
            <Link
              to="/delivery/available"
              className="flex-1 md:flex-none text-center px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition"
            >
              Available Orders
            </Link>

            <button
              onClick={fetchMyActiveOrders}
              className="flex-1 md:flex-none px-4 py-2 bg-white border rounded-lg text-sm hover:bg-gray-100 transition"
            >
              Refresh
            </button>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center bg-white rounded-xl shadow-sm p-10">
            <div className="text-5xl mb-3">📭</div>
            <h3 className="text-lg font-medium">No active orders</h3>
            <p className="text-gray-500 mt-2">
              Accept new orders to start delivering
            </p>

            <button
              onClick={() => navigate("/delivery/available")}
              className="mt-5 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
            >
              View Available Orders
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => {
              const nextStatus = getNextStatus(order.status);

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-5"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">
                        Order #{order._id.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleTimeString("en-IN")}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles(order.status)}`}
                    >
                      {order.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Progress Tracker */}
                  <div className="flex items-center gap-2 mt-4">
                    {["accepted", "picked_up", "on_the_way", "delivered"].map(
                      (step, i) => {
                        const active =
                          [
                            "accepted",
                            "picked_up",
                            "on_the_way",
                            "delivered",
                          ].indexOf(order.status) >= i;

                        return (
                          <div key={i} className="flex items-center flex-1">
                            <div
                              className={`w-3 h-3 rounded-full ${active ? "bg-black" : "bg-gray-300"}`}
                            />
                            {i < 3 && (
                              <div
                                className={`flex-1 h-[2px] mx-1 ${active ? "bg-black" : "bg-gray-300"}`}
                              />
                            )}
                          </div>
                        );
                      },
                    )}
                  </div>

                  {/* Customer Info */}
                  <div className="mt-4 bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium">
                      👤 {order.customer?.name}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      📍 {order.address}
                    </p>
                  </div>

                  {/* Items */}
                  <div className="mt-4 space-y-2 text-sm">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between">
                        <span>
                          {item.quantity} × {item.product?.name}
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

                  {/* Action Button */}
                  {nextStatus ? (
                    <button
                      onClick={() => handleUpdateStatus(order._id, nextStatus)}
                      disabled={updatingId === order._id}
                      className={`w-full mt-4 py-2.5 rounded-lg font-medium transition 
                    ${
                      updatingId === order._id
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                    >
                      {updatingId === order._id
                        ? "Updating..."
                        : `Mark as ${nextStatus.replace("_", " ")}`}
                    </button>
                  ) : (
                    <div className="mt-4 text-center text-green-600 font-semibold">
                      ✅ Order Completed
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const getStatusStyles = (status) => {
  const styles = {
    accepted: "bg-blue-100 text-blue-700",
    picked_up: "bg-orange-100 text-orange-700",
    on_the_way: "bg-indigo-100 text-indigo-700",
    delivered: "bg-green-100 text-green-700",
  };
  return styles[status] || "bg-gray-100 text-gray-700";
};
