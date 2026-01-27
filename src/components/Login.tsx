import React, { useState } from 'react';
import { User } from '../App';
import { Loader2 } from 'lucide-react';
import { authAPI } from '../services/api';
import { authService } from '../services/auth';

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
  setError("");
  setLoading(true);

  try {
    // 1️⃣ Clear any previous session first
    authService.clearAuth();

    // 2️⃣ Login → get token
    console.log("Attempting login with:", email);
    const loginRes = await authAPI.login(email, password);
    const token = loginRes.data.token;
    
    console.log("Login response received:", {
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 30) + '...' : 'NO TOKEN'
    });

    if (!token) throw new Error("No token received from server");

    // 3️⃣ Save token BEFORE making authenticated requests
    authService.setToken(token);
    console.log("Token saved to localStorage");

    // 4️⃣ Get REAL logged-in user from backend (requires valid token)
    let meRes;
    try {
      console.log("Fetching current user...");
      meRes = await authAPI.getCurrentUser();
      console.log("Current user fetched:", meRes.data);
    } catch (err) {
      console.error("Failed to fetch current user:", err);
      throw new Error("Failed to fetch user information");
    }

    if (!meRes.data.id || !meRes.data.email) {
      throw new Error("Invalid user data from server");
    }

    const user: User = {
      id: meRes.data.id,
      name: meRes.data.name || "",
      email: meRes.data.email,
      role: meRes.data.role as any
    };

    // 5️⃣ Save user to localStorage
    authService.setUser(user);

    onLogin(user);
  } catch (err: any) {
    authService.clearAuth();
    console.error("Login error:", err);
    setError(err.response?.data?.message || err.message || "Invalid email or password");
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
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
