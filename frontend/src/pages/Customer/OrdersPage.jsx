// src/pages/Customer/OrdersPage.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'customer') {
      navigate('/auth');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/orders/my', {
          withCredentials: true,
        });
        setOrders(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load orders');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',      // yellow
      accepted: '#17a2b8',     // cyan
      picked_up: '#fd7e14',    // orange
      on_the_way: '#007bff',   // blue
      delivered: '#28a745',    // green
      cancelled: '#dc3545',    // red
    };
    return colors[status] || '#6c757d';
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading your orders...</div>;
  if (error) return <div style={{ padding: '40px', color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      <h1>My Orders</h1>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8f9fa', borderRadius: '8px' }}>
          <h3>No orders yet</h3>
          <p>Start shopping now!</p>
          <button
            onClick={() => navigate('/customer/products')}
            style={{
              padding: '12px 28px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
              marginTop: '16px',
            }}
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((order) => (
            <div
              key={order._id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                background: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <strong>Order #{order._id.slice(-8).toUpperCase()}</strong>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '4px' }}>
                    {new Date(order.createdAt).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </div>
                </div>
                <span
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    backgroundColor: getStatusColor(order.status),
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                  }}
                >
                  {order.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div style={{ margin: '16px 0' }}>
                <strong>Items:</strong>
                <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                  {order.items.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: '6px' }}>
                      {item.quantity} × {item.product?.name || 'Product'} 
                      <span style={{ float: 'right' }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ borderTop: '1px solid #eee', paddingTop: '12px', marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span>Total Amount:</span>
                  <span>₹{order.totalAmount.toFixed(2)}</span>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#555', marginTop: '4px' }}>
                  Delivery to: {order.address}
                </div>
              </div>

              {/* Later: add Track button that opens real-time status view */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}