import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ChatProvider } from './contexts/ChatContext';
import { CourseGroupProvider } from './contexts/CourseGroupContext';
import { useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import DemoLogin from './components/DemoLogin';
import Dashboard from './components/dashboard/Dashboard';
import Profile from './components/profile/Profile';
import Navbar from './components/common/Navbar';
import { CoursesProvider } from './contexts/CoursesContext';
import ForgotPassword from './components/ForgotPassword/ForgotPassword';
import ChatPage from './components/chat/ChatPage';
import MessagingWidget from './components/chat/MessagingWidget';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" /> : children;
};

// Main App Content with Router
function AppContent() {
  const location = useLocation();
  const isChatPage = location.pathname.startsWith("/chat/");
  const isLoginPage=location.pathname.startsWith("/login");
  const isRegister=location.pathname.startsWith("/register");
  const isForgetpassword=location.pathname.startsWith("/forgot-password")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Container for global popups */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />

      <Routes>
        <Route 
          path="/demo-login" 
          element={
            <PublicRoute>
              <DemoLogin />
            </PublicRoute>
          } 
        />
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Navbar />
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Navbar />
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chat/:groupId" 
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>

      {/* Only show MessagingWidget when not on chat page */}
      {!isChatPage &&!isForgetpassword && !isRegister && !isLoginPage && <MessagingWidget />}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CourseGroupProvider>
          <ChatProvider>
            <CoursesProvider>
              <Router>
                <AppContent />
              </Router>
            </CoursesProvider>
          </ChatProvider>
        </CourseGroupProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
