import React, { useState } from 'react';
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

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setActivePage('dashboard');
    localStorage.removeItem('authToken');
  };

  const handlePageChange = (page: string) => {
    setActivePage(page);
    setIsMobileMenuOpen(false); // Close mobile menu on page change
  };

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
