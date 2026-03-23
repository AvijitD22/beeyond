import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { connectSocket } from "../../services/socket";
import { Link } from "react-router-dom";

const STATUS_FLOW = [
  "pending",
  "accepted",
  "picked_up",
  "on_the_way",
  "delivered",
];

export default function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [socket, setSocket] = useState(null);
  const [filter, setFilter] = useState("all");
  const [highlighted, setHighlighted] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "customer") {
      navigate("/auth");
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/orders/my", {
          withCredentials: true,
        });
        setOrders(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  useEffect(() => {
    const s = connectSocket();
    setSocket(s);

    s.on("order-updated", (data) => {
      setOrders((prev) =>
        prev.map((o) =>
          o._id === data.orderId ? { ...o, status: data.status } : o,
        ),
      );

      // highlight updated order
      setHighlighted(data.orderId);
      setTimeout(() => setHighlighted(null), 2000);
    });

    return () => {};
  }, []);

  useEffect(() => {
    if (!socket) return;

    orders.forEach((order) => {
      socket.emit("join-order", order._id);
    });
  }, [orders, socket]);

  const getFilteredOrders = () => {
    if (filter === "active") {
      return orders.filter((o) =>
        ["pending", "accepted", "picked_up", "on_the_way"].includes(o.status),
      );
    }
    if (filter === "delivered") {
      return orders.filter((o) => o.status === "delivered");
    }
    return orders;
  };

  if (loading)
    return (
      <div className="p-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    );

  if (error) return <div className="p-8 text-red-500 text-center">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold">📦 My Orders</h1>

          <Link
            to="/customer/products"
            className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition"
          >
            Browse Products
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {["all", "active", "delivered"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm capitalize transition 
                ${
                  filter === f
                    ? "bg-black text-white"
                    : "bg-white border text-gray-600"
                }`}
            >
              {f}
            </button>
          ))}
        </div>

        {getFilteredOrders().length === 0 ? (
          <div className="text-center bg-white rounded-xl shadow-sm p-10">
            <div className="text-5xl mb-3">🛒</div>
            <h3 className="text-lg font-medium">No orders found</h3>
            <p className="text-gray-500 mt-2">
              Start shopping to see your orders here
            </p>

            <button
              onClick={() => navigate("/customer/products")}
              className="mt-5 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {getFilteredOrders().map((order) => (
              <div
                key={order._id}
                className={`bg-white rounded-xl shadow-sm p-5 transition 
                  ${
                    highlighted === order._id
                      ? "bg-green-50 border border-green-200"
                      : ""
                  }`}
              >
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">
                      Order #{order._id.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(order.createdAt).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium 
                      ${getStatusStyles(order.status)}`}
                  >
                    {order.status.replace("_", " ")}
                  </span>
                </div>

                {/* Progress Tracker */}
                <div className="flex items-center gap-2 mt-4">
                  {STATUS_FLOW.map((step, i) => {
                    const isActive = STATUS_FLOW.indexOf(order.status) >= i;

                    return (
                      <div key={i} className="flex items-center flex-1">
                        <div
                          className={`w-3 h-3 rounded-full 
                            ${isActive ? "bg-black" : "bg-gray-300"}`}
                        />
                        {i < STATUS_FLOW.length - 1 && (
                          <div
                            className={`flex-1 h-[2px] mx-1 
                              ${isActive ? "bg-black" : "bg-gray-300"}`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Items */}
                <div className="mt-4 space-y-2 text-sm">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>
                        {item.quantity} × {item.product?.name || "Product"}
                      </span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-4 border-t pt-3 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500">Deliver to</p>
                    <p className="text-sm font-medium">{order.address}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="font-semibold">
                      ₹{order.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const getStatusStyles = (status) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-700",
    accepted: "bg-blue-100 text-blue-700",
    picked_up: "bg-orange-100 text-orange-700",
    on_the_way: "bg-indigo-100 text-indigo-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return styles[status] || "bg-gray-100 text-gray-700";
};
