import React, { useState } from 'react';
import { User } from '../App';
import { Building2, Heart, Loader2 } from 'lucide-react';
import { authAPI } from '../services/api';
import { mockUsers, delay } from '../services/mockData';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await authAPI.login(email, password);
      // const { token, user } = response.data;
      
      // Mock API call simulation
      await delay(800);
      const user = mockUsers.find(u => u.email === email && u.password === password);
      
      if (user) {
        // Store token in localStorage
        localStorage.setItem('authToken', 'mock-jwt-token-' + user.id);
        
        onLogin({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as any,
        });
      } else {
        setError('Invalid email or password');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (user: typeof mockUsers[0]) => {
    setLoading(true);
    try {
      await delay(500);
      localStorage.setItem('authToken', 'mock-jwt-token-' + user.id);
      
      onLogin({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as any,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="text-center lg:text-left space-y-6 px-4">
          <div className="flex items-center justify-center lg:justify-start gap-3">
            <div className="bg-green-600 p-3 rounded-xl">
              <Building2 className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
            </div>
            <span className="text-gray-400">×</span>
            <div className="bg-blue-600 p-3 rounded-xl">
              <Heart className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
            </div>
          </div>
          
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 mb-2">
              Donation Management System
            </h1>
            <p className="text-base sm:text-lg text-gray-600">
              ITC × Anoopam Mission
            </p>
          </div>

          <p className="text-sm sm:text-base text-gray-500">
            A comprehensive platform for transparent donation tracking, fund utilization, and impact measurement. 
            Built for CSR excellence and audit compliance.
          </p>

          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-3 text-sm sm:text-base text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
              <span>Transparent Fund Tracking</span>
            </div>
            <div className="flex items-center gap-3 text-sm sm:text-base text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
              <span>Audit-Ready Reports</span>
            </div>
            <div className="flex items-center gap-3 text-sm sm:text-base text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
              <span>Impact Measurement</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-sm sm:text-base text-gray-500">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
            <p className="text-xs sm:text-sm text-gray-500 mb-4">Quick Login (Demo)</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {mockUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleQuickLogin(user)}
                  disabled={loading}
                  className="w-full text-left px-3 sm:px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
                    <div className="text-xs text-gray-500 truncate">{user.role.replace('_', ' ')}</div>
                  </div>
                  <div className="text-green-600 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                    →
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
