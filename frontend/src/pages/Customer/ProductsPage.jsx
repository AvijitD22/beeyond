import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProductsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({}); // { productId: quantity }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'customer') {
      navigate('/auth');
      return;
    }

    const fetchProducts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/products', {
          withCredentials: true,
        });
        setProducts(res.data);
      } catch (err) {
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [user, navigate]);

  const updateQuantity = (productId, delta) => {
    setCart(prev => {
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

    if (items.length === 0) {
      alert('Cart is empty');
      return;
    }

    try {
      await axios.post(
        'http://localhost:5000/api/orders',
        { items, address: 'Pune, Home' },
        { withCredentials: true }
      );
      alert('Order placed successfully!');
      setCart({});
      // Later: navigate to order tracking page
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place order');
    }
  };

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Products – Quick Commerce</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
        {products.map(product => {
          const qty = cart[product._id] || 0;
          return (
            <div
              key={product._id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center',
              }}
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '4px' }}
              />
              <h3>{product.name}</h3>
              <p>₹{product.price}</p>

              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', margin: '10px 0' }}>
                <button onClick={() => updateQuantity(product._id, -1)} disabled={qty === 0}>-</button>
                <span>{qty}</span>
                <button onClick={() => updateQuantity(product._id, 1)}>+</button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
        <h2>Cart Summary</h2>
        <p>Total: ₹{getTotal().toFixed(2)}</p>
        <button
          onClick={handlePlaceOrder}
          disabled={getTotal() === 0}
          style={{
            padding: '12px 24px',
            background: getTotal() > 0 ? '#28a745' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: getTotal() > 0 ? 'pointer' : 'not-allowed',
          }}
        >
          Place Order
        </button>
      </div>
    </div>
  );
}