import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import jwtDecode from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // TODO: Backend Integration - API Configuration
  // Spring Boot backend URL - move to environment variables
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

  // TODO: Backend Integration - Logout
  // API Endpoint: POST /api/auth/logout
  // Headers: Authorization: Bearer {token}
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('EnrolledCourses')
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // TODO: Backend Integration - Token Validation
  // Validates JWT token and sets up user session
  // Backend should provide JWT with user info in payload
  const setupUserFromToken = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp > currentTime) {
          setUser(decoded);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
          logout();
        }
      } catch (err) {
        console.error("Invalid token:", err);
        logout();
      }
    }
  };

  useEffect(() => {
    setupUserFromToken();
    setLoading(false);
  }, []);

  // Login user
  const login = async (email, password) => {
    try {
      // Try to connect to backend first
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
        const { token, user } = response.data;

        if (!token) return { success: false, error: 'No token received from server' };

        localStorage.setItem('token', token);
        localStorage.setItem('userId', user.id);
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('name', user.name);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        const decoded = jwtDecode(token);
        setUser({ ...decoded, ...user });

        return { success: true };
      } catch (backendError) {
        // If backend is not available, use demo mode
        console.warn('Backend not available, using demo mode:', backendError.message);
        
        // Demo credentials
        const demoAccounts = {
          'admin@example.com': { password: 'admin123', name: 'Admin User', role: 'ADMIN' },
          'teacher@example.com': { password: 'teacher123', name: 'Teacher User', role: 'TEACHER' },
          'student@example.com': { password: 'student123', name: 'Student User', role: 'STUDENT' },
          'demo@example.com': { password: 'password123', name: 'Demo User', role: 'STUDENT' },
        };

        const account = demoAccounts[email];
        if (!account || account.password !== password) {
          return { success: false, error: 'Invalid email or password' };
        }

        // Create a mock token
        const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
        
        localStorage.setItem('token', mockToken);
        localStorage.setItem('userId', '1');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('name', account.name);
        axios.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`;

        setUser({
          id: '1',
          email: email,
          name: account.name,
          role: account.role,
          exp: 9999999999
        });

        return { success: true };
      }
    } catch (error) {
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  // Register user
  const register = async (formData) => {
    try {
      // Convert numeric fields to number
      const payload = {
        name: formData.name, // must match DTO
        email: formData.email,
        password: formData.password,
        secondarySchool: formData.secondarySchool,
        secondarySchoolPassingYear: Number(formData.secondarySchoolPassingYear),
        secondarySchoolPercentage: Number(formData.secondarySchoolPercentage),
        higherSecondarySchool: formData.higherSecondarySchool,
        higherSecondaryPassingYear: Number(formData.higherSecondaryPassingYear),
        higherSecondaryPercentage: Number(formData.higherSecondaryPercentage),
        universityName: formData.universityName,
        Major :formData.Major,
        universityPassingYear: Number(formData.universityPassingYear),
        universityPassingGPA: Number(formData.universityPassingGPA),
      };

      console.log("Register payload:", payload);

      const response = await axios.post(`${API_BASE_URL}/auth/register`, payload, {
        headers: { "Content-Type": "application/json" }
      });

      const { token,user} = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('name', user.name);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(user);
      return { success: true };
    } catch (error) {
      console.error("Registration error:", error.response?.data || error.message);
      return { success: false, error: error.response?.data?.message || "Registration failed" };
    }
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/users/profile`, profileData);
      setUser(prev => ({ ...prev, ...response.data }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Profile update failed' };
    }
  };

  const value = { user, loading, login, register, logout, updateProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
