import { useState, useEffect } from "react";
import axios from "axios";
import { connectSocket } from "../../services/socket";

export default function AllOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAllOrders();

    const socket = connectSocket();

    socket.on("order-updated", (data) => {
      setOrders((prev) =>
        prev.map((o) =>
          o._id === data.orderId ? { ...o, status: data.status } : o,
        ),
      );
    });

    socket.on("new-order", (newOrder) => {
      // we'll emit this later when order placed
      setOrders((prev) => [newOrder, ...prev]);
    });

    return () => {
      socket.off("order-updated");
      socket.off("new-order");
    };
  }, []);

  const fetchAllOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/orders/all", {
        withCredentials: true,
      });
      setOrders(res.data);
      setError("");
    } catch (err) {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: "#ffc107", color: "black" },
      accepted: { bg: "#17a2b8", color: "white" },
      picked_up: { bg: "#fd7e14", color: "white" },
      on_the_way: { bg: "#007bff", color: "white" },
      delivered: { bg: "#28a745", color: "white" },
    };
    const s = styles[status] || { bg: "#6c757d", color: "white" };
    return (
      <span
        style={{
          padding: "6px 12px",
          background: s.bg,
          color: s.color,
          borderRadius: "16px",
          fontSize: "0.85rem",
          fontWeight: "bold",
        }}
      >
        {status.toUpperCase().replace("_", " ")}
      </span>
    );
  };

  if (loading) return <div>Loading all orders...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm">
        <h1 className="text-xl md:text-2xl font-semibold">
          📦 All Orders
          <span className="text-gray-500 text-base ml-2">
            ({orders.length})
          </span>
        </h1>

        <button
          onClick={fetchAllOrders}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Desktop Table */}
<div className="hidden md:block overflow-x-auto">
  <table className="w-full bg-white shadow rounded-xl">
    <thead className="bg-gray-200 text-left">
      <tr>
        <th className="p-3">Order ID</th>
        <th className="p-3">Customer</th>
        <th className="p-3">Delivery</th>
        <th className="p-3">Total</th>
        <th className="p-3">Status</th>
        <th className="p-3">Placed</th>
      </tr>
    </thead>

    <tbody>
      {orders.map((order) => (
        <tr key={order._id} className="border-b">
          <td className="p-3">{order._id.slice(-8).toUpperCase()}</td>
          <td className="p-3">
            {order.customer?.name || "—"}
            <br />
            <span className="text-xs text-gray-500">
              {order.customer?.phone}
            </span>
          </td>
          <td className="p-3">{order.deliveryPartner?.name || "—"}</td>
          <td className="p-3">₹{order.totalAmount.toFixed(2)}</td>
          <td className="p-3">{getStatusBadge(order.status)}</td>
          <td className="p-3">
            {new Date(order.createdAt).toLocaleString("en-IN")}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

{/* Mobile Cards */}
<div className="md:hidden flex flex-col gap-4">
  {orders.map((order) => (
    <div
      key={order._id}
      className="bg-white p-4 rounded-xl shadow space-y-2"
    >
      <div className="flex justify-between">
        <span className="font-semibold">
          #{order._id.slice(-6).toUpperCase()}
        </span>
        {getStatusBadge(order.status)}
      </div>

      <div className="text-sm">
        <p>
          <strong>Customer:</strong>{" "}
          {order.customer?.name || "—"}
        </p>
        <p className="text-gray-500">
          {order.customer?.phone}
        </p>
      </div>

      <p className="text-sm">
        <strong>Delivery:</strong>{" "}
        {order.deliveryPartner?.name || "—"}
      </p>

      <div className="flex justify-between text-sm">
        <span>₹{order.totalAmount.toFixed(2)}</span>
        <span className="text-gray-500">
          {new Date(order.createdAt).toLocaleString("en-IN")}
        </span>
      </div>
    </div>
  ))}
</div>
    </div>
  );
}

const thStyle = { padding: "12px", textAlign: "left", fontWeight: "bold" };
const tdStyle = { padding: "12px", textAlign: "left" };
