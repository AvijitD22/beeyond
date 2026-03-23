import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
export default function ProductsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || user.role !== "customer") {
      navigate("/auth");
      return;
    }

    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products", {
          withCredentials: true,
        });
        setProducts(res.data);
      } catch (err) {
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user, navigate]);

  const updateQuantity = (productId, delta) => {
    setCart((prev) => {
      const current = prev[productId] || 0;
      const newQty = Math.max(0, current + delta);
      if (newQty === 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: newQty };
    });
  };

  const getTotal = () => {
    return products.reduce((sum, p) => {
      const qty = cart[p._id] || 0;
      return sum + qty * p.price;
    }, 0);
  };

  const handlePlaceOrder = async () => {
    const items = Object.entries(cart)
      .filter(([_, qty]) => qty > 0)
      .map(([productId, quantity]) => ({ productId, quantity }));

    if (items.length === 0) return alert("Cart is empty");

    try {
      await axios.post(
        "http://localhost:5000/api/orders",
        { items, address: "Pune, Home" },
        { withCredentials: true },
      );
      alert("Order placed successfully!");
      setCart({});
    } catch (err) {
      alert(err.response?.data?.message || "Failed to place order");
    }
  };

  if (loading)
    return <div className="p-6 text-center">Loading products...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center mb-6">
        {/* Heading */}
        <h1 className="hidden md:block text-2xl md:text-3xl font-semibold flex-1">
          🛒 All Products
        </h1>

        {/* Right Section */}
        <div className="flex items-center justify-between w-full md:w-auto gap-2">
          <Link
            to="/customer/orders"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border bg-white text-gray-700 hover:bg-gray-100 transition"
          >
            📦 My Orders
          </Link>

          <div className="relative">
            <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center">
              🛍
            </div>

            {Object.values(cart).reduce((a, b) => a + b, 0) > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 rounded-full">
                {Object.values(cart).reduce((a, b) => a + b, 0)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
        {products.map((product) => {
          const qty = cart[product._id] || 0;

          return (
            <div
              key={product._id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-3 relative"
            >
              {/* Image */}
              <div className="w-full aspect-square overflow-hidden rounded-lg">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition duration-300"
                />
              </div>

              {/* Name */}
              <h3 className="mt-3 text-sm font-medium text-gray-800 line-clamp-2">
                {product.name}
              </h3>

              {/* Price */}
              <p className="text-base font-semibold mt-1">₹{product.price}</p>

              {/* Add / Quantity */}
              <div className="mt-3">
                {qty === 0 ? (
                  <button
                    onClick={() => updateQuantity(product._id, 1)}
                    className="w-full py-1.5 border border-black rounded-lg text-sm font-medium hover:bg-black hover:text-white transition"
                  >
                    Add
                  </button>
                ) : (
                  <div className="flex items-center justify-between border rounded-lg px-2 py-1">
                    <button
                      onClick={() => updateQuantity(product._id, -1)}
                      className="text-lg px-2"
                    >
                      -
                    </button>

                    <span className="font-medium">{qty}</span>

                    <button
                      onClick={() => updateQuantity(product._id, 1)}
                      className="text-lg px-2"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart Summary (Sticky Bottom) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] md:w-[600px] bg-black text-white rounded-xl shadow-lg px-5 py-3 flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-300">
            {Object.values(cart).reduce((a, b) => a + b, 0)} items
          </p>
          <p className="text-lg font-semibold">₹{getTotal().toFixed(2)}</p>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={getTotal() === 0}
          className={`px-5 py-2 rounded-lg font-medium transition 
      ${
        getTotal() > 0
          ? "bg-white text-black hover:bg-gray-200"
          : "bg-gray-400 cursor-not-allowed"
      }`}
        >
          Place Order →
        </button>
      </div>

      {/* Bottom spacing so content isn't hidden */}
      <div className="h-24"></div>
    </div>
  );
}
