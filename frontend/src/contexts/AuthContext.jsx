import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { connectSocket , disconnectSocket} from '../services/socket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if already logged in (cookie exists → backend can tell us who)
  const checkAuth = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/me', {
        withCredentials: true,
      });
      setUser(res.data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(
      'http://localhost:5000/api/auth/login',
      { email, password },
      { withCredentials: true }
    );
    setUser(res.data.user);
    connectSocket();
    return res.data.user;
  };

  const register = async (data) => {
    const res = await axios.post(
      'http://localhost:5000/api/auth/register',
      data,
      { withCredentials: true }
    );
    setUser(res.data.user);
    connectSocket();
    return res.data.user;
  };

  const logout = async () => {
    await axios.post('http://localhost:5000/api/auth/logout', {}, { withCredentials: true });
    setUser(null);
    disconnectSocket();
    window.location.href = '/auth';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);