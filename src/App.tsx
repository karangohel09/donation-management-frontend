import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AppealManagement from './components/AppealManagement';
import ApprovalWorkflow from './components/ApprovalWorkflow';
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

export type UserRole = 'super_admin' | 'itc_admin' | 'mission_authority' | 'accounts_user' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for valid token on app load
  useEffect(() => {
  const restore = async () => {
    const token = authService.getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const me = await authAPI.getCurrentUser();
      const user = {
        id: me.data.id,
        name: me.data.name,
        email: me.data.email,
        role: me.data.role.toLowerCase()
      };

      authService.setUser(user);
      setCurrentUser(user);
      setIsAuthenticated(true);
    } catch {
      authService.clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  restore();
}, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setActivePage('dashboard');
  };

  const handlePageChange = (page: string) => {
    setActivePage(page);
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
    return <Login onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard user={currentUser!} />;
      case 'appeals':
        return <AppealManagement user={currentUser!} />;
      case 'approvals':
        return <ApprovalWorkflow user={currentUser!} />;
      case 'communication':
        return <DonorCommunication user={currentUser!} />;
      case 'donations':
        return <DonationReceipt user={currentUser!} />;
      case 'utilization':
        return <FundUtilization user={currentUser!} />;
      case 'assets':
        return <AssetReference user={currentUser!} />;
      case 'beneficiaries':
        return <BeneficiaryManagement user={currentUser!} />;
      case 'reports':
        return <Reports user={currentUser!} />;
      case 'settings':
        return <Settings user={currentUser!} />;
      default:
        return <Dashboard user={currentUser!} />;
    }
  };

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
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default App;

