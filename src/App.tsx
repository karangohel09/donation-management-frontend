import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AppealManagement from './components/AppealManagement';
import ApprovalWorkflow from './components/ApprovalWorkflow';
import DonorManagement from './components/DonorManagement';
import DonorCommunication from './components/DonorCommunication';
import DonationReceipt from './components/DonationReceipt';
import FundUtilization from './components/FundUtilization';
import AssetReference from './components/AssetReference';
import BeneficiaryManagement from './components/BeneficiaryManagement';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Navigation from './components/Navigation';
import { authAPI } from './services/api';
import { authService } from './services/auth';

export type UserRole = 'SUPER_ADMIN' | 'ITC_ADMIN' | 'MISSION_ADMIN' | 'FINANCE_ADMIN' | 'VIEWER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Map URL path to page ID
  const getPageIdFromPath = () => {
    const path = location.pathname.replace('/', '');
    if (!path || path === '') return 'dashboard';
    return path;
  };

  const activePage = getPageIdFromPath();

  // Check for valid token on app load
  useEffect(() => {
    const restore = async () => {
      const token = authService.getToken();
      const storedUser = authService.getUser();

      // If we have a stored user and valid token, use it without verifying
      if (storedUser && token && authService.isTokenValid()) {
        setCurrentUser(storedUser);
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }

      // If no token, user is not authenticated
      if (!token) {
        setIsLoading(false);
        return;
      }

      // If token exists but is invalid, clear it
      if (!authService.isTokenValid()) {
        console.warn("Token is expired or invalid");
        authService.clearAuth();
        setCurrentUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Try to verify with backend as a fallback
      try {
        const me = await authAPI.getCurrentUser();
        
        if (!me.data.id || !me.data.email) {
          throw new Error("Invalid user data");
        }

        const user = {
          id: me.data.id,
          name: me.data.name || "",
          email: me.data.email,
          role: (me.data.role || "VIEWER") as any
        };

        authService.setUser(user);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error: any) {
        console.error("Failed to verify session with backend:", error?.response?.status, error?.message);
        // If backend verification fails, still use stored user if available (graceful degradation)
        if (storedUser) {
          setCurrentUser(storedUser);
          setIsAuthenticated(true);
        } else {
          authService.clearAuth();
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    restore();
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  const handlePageChange = (page: string) => {
    navigate(`/${page}`);
    setIsMobileMenuOpen(false); // Close mobile menu on page change
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Routes>
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        user={currentUser!}
        activePage={activePage}
        onPageChange={handlePageChange}
        onLogout={handleLogout}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/dashboard" element={<Dashboard user={currentUser!} />} />
            <Route path="/appeals" element={<AppealManagement user={currentUser!} />} />
            <Route path="/approvals" element={<ApprovalWorkflow user={currentUser!} />} />
            <Route path="/donors" element={<DonorManagement user={currentUser!} />} />
            <Route path="/communication" element={<DonorCommunication user={currentUser!} />} />
            <Route path="/donations" element={<DonationReceipt user={currentUser!} />} />
            <Route path="/utilization" element={<FundUtilization user={currentUser!} />} />
            <Route path="/assets" element={<AssetReference user={currentUser!} />} />
            <Route path="/beneficiaries" element={<BeneficiaryManagement user={currentUser!} />} />
            <Route path="/reports" element={<Reports user={currentUser!} />} />
            <Route path="/settings" element={<Settings user={currentUser!} />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;

