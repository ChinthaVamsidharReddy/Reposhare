import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // TODO: Remove demo accounts when backend is integrated
  // These are for frontend development only
  const demoAccounts = [
    { email: 'student@example.com', password: 'student123', label: 'Student Demo' },
    { email: 'teacher@example.com', password: 'teacher123', label: 'Teacher Demo' },
    { email: 'admin@example.com', password: 'admin123', label: 'Admin Demo' },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const useDemoAccount = (account) => {
    setFormData({ email: account.email, password: account.password });
    setError('');
  };

  // TODO: Backend Integration - Login Handler
  // This calls the login function from AuthContext
  // Backend API: POST /api/auth/login
  // Request Body: {email, password}
  // Response: {token, user}
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      if (!result.success) setError(result.error);
      else navigate('/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-dark-bg px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-dark-card p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-dark-border">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
            Sign in to your account
          </h2>
          <p className="text-center text-gray-600 dark:text-dark-textSecondary">
            Welcome back! Enter your credentials to access your account.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700/50 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-input text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-dark-textSecondary transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-input text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-dark-textSecondary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 dark:text-dark-textSecondary hover:text-gray-600 dark:hover:text-white"
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-dark-accent dark:hover:opacity-80 transition"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-dark-textSecondary">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
            Sign up here
          </Link>
        </p>

        {/* Demo Accounts Section */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-dark-border">
          <p className="text-center text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase mb-3">
            🧪 Demo Accounts (for testing)
          </p>
          <div className="grid grid-cols-3 gap-2">
            {demoAccounts.map((account, index) => (
              <button
                key={index}
                type="button"
                onClick={() => useDemoAccount(account)}
                className="w-full text-left px-3 py-2 text-sm bg-white dark:bg-dark-input border border-blue-200 dark:border-blue-700/50 rounded hover:bg-blue-50 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-300 transition-colors"
              >
                {account.label}
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 dark:text-dark-textSecondary mt-2">
            Click a demo account to auto-fill credentials, then click Sign in
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
