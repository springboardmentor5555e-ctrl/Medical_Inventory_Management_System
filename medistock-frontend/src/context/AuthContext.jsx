import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../services/axiosInstance';
import { toast } from 'sonner';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Load and verify token on startup
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const response = await axiosInstance.get('/api/auth/me');
          setUser(response.data);
        } catch (error) {
          console.error("Token verification failed:", error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/api/auth/login', { email, password });
      const { token: jwt, email: userEmail, name, role } = response.data;
      
      localStorage.setItem('token', jwt);
      setToken(jwt);
      setUser({ email: userEmail, name, role });
      
      toast.success(`Welcome back, ${name}!`);
      return { role };
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Login failed. Please check credentials.';
      toast.error(errMsg);
      throw error;
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const response = await axiosInstance.post('/api/auth/register', { name, email, password, role });
      const { token: jwt, email: userEmail, name: registeredName, role: userRole } = response.data;
      
      localStorage.setItem('token', jwt);
      setToken(jwt);
      setUser({ email: userEmail, name: registeredName, role: userRole });
      
      toast.success('Registration successful!');
      return { role: userRole };
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Registration failed. Try again.';
      toast.error(errMsg);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.info('Logged out successfully.');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
