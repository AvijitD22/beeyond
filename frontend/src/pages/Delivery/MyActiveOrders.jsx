import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function MyActiveOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'delivery') {
      navigate('/auth');
      return;
    }
    fetchMyActiveOrders();
  }, [user, navigate]);

  const fetchMyActiveOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/orders/my-active', {
        withCredentials: true,
      });
      setOrders(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (!window.confirm(`Mark as ${newStatus.replace('_', ' ')}?`)) return;

    setUpdatingId(orderId);
    try {
      await axios.patch(
        `http://localhost:5000/api/orders/${orderId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );

      // Optimistic update
      setOrders(prev =>
        prev.map(o =>
          o._id === orderId ? { ...o, status: newStatus } : o
        )
      );

      alert(`Order marked as ${newStatus.replace('_', ' ')}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getNextStatus = (current) => {
    const flow = ['accepted', 'picked_up', 'on_the_way', 'delivered'];
    const idx = flow.indexOf(current);
    return idx < flow.length - 1 ? flow[idx + 1] : null;
  };

  const getStatusColor = (status) => {
    const colors = {
      accepted: '#17a2b8',
      picked_up: '#fd7e14',
      on_the_way: '#007bff',
      delivered: '#28a745',
    };
    return colors[status] || '#6c757d';
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading your active orders...</div>;
  if (error) return <div style={{ padding: '40px', color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>My Active Orders</h1>
        <button
          onClick={fetchMyActiveOrders}
          style={{ padding: '8px 16px', background: '#6c757d', color: 'white', borderRadius: '6px' }}
        >
          Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: '#f8f9fa', borderRadius: '8px' }}>
          <h3>No active orders</h3>
          <p>Accept new orders from the Available page</p>
          <button
            onClick={() => navigate('/delivery/available')}
            style={{ padding: '12px 24px', background: '#007bff', color: 'white', border: 'none', borderRadius: '6px', marginTop: '16px' }}
          >
            View Available Orders
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map(order => {
            const nextStatus = getNextStatus(order.status);
            return (
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
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <strong>Order #{order._id.slice(-8).toUpperCase()}</strong>
                  <span
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      backgroundColor: getStatusColor(order.status),
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  >
                    {order.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div style={{ margin: '12px 0' }}>
                  <strong>Items:</strong>
                  <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                    {order.items.map((item, i) => (
                      <li key={i}>
                        {item.quantity} × {item.product?.name || 'Item'}
                        <span style={{ float: 'right' }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ color: '#555', marginBottom: '16px' }}>
                  Customer: {order.customer?.name} • {order.address}
                </div>

                <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>
                  Total: ₹{order.totalAmount.toFixed(2)}
                </div>

                {nextStatus && (
                  <button
                    onClick={() => handleUpdateStatus(order._id, nextStatus)}
                    disabled={updatingId === order._id}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: updatingId === order._id ? '#ccc' : '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '16px',
                      cursor: updatingId === order._id ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {updatingId === order._id
                      ? 'Updating...'
                      : `Mark as ${nextStatus.replace('_', ' ')}`}
                  </button>
                )}

                {order.status === 'delivered' && (
                  <div style={{ textAlign: 'center', color: '#28a745', fontWeight: 'bold', padding: '12px' }}>
                    Order Completed ✓
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}