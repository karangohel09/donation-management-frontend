import React, { useState } from 'react';
import { User } from '../App';
import { Loader2 } from 'lucide-react';
import { authAPI } from '../services/api';

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
      const response = await authAPI.login(email, password);

      if (!response?.data?.token) {
        setError('Invalid email or password');
        return;
      }

      const token = response.data.token;
      localStorage.setItem('authToken', token);

      // TEMP user object (until /auth/me API is added)
      onLogin({
        id: '1',
        name: 'Admin',
        email,
        role: 'super_admin', // must match frontend role type
      } as User);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

        {/* LEFT */}
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold">Donation Management System</h1>
          <p className="text-gray-500">ITC × Anoopam Mission</p>
        </div>

        {/* RIGHT */}
        <div className="bg-white p-8 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border px-4 py-2 rounded"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border px-4 py-2 rounded"
            />

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded"
            >
              {loading ? (
                <Loader2 className="animate-spin mx-auto" />
              ) : (
                'Login'
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
