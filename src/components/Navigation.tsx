import React from 'react';
import { User } from '../App';
import { 
  LayoutDashboard, 
  FileText, 
  CheckCircle, 
  MessageSquare, 
  Receipt, 
  TrendingUp, 
  Package, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Building2,
  Heart,
  Menu,
  X
} from 'lucide-react';

interface NavigationProps {
  user: User;
  activePage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['super_admin', 'itc_admin', 'mission_authority', 'accounts_user', 'viewer'] },
  { id: 'appeals', label: 'Appeal Management', icon: FileText, roles: ['super_admin', 'itc_admin', 'mission_authority', 'viewer'] },
  { id: 'approvals', label: 'Approval Workflow', icon: CheckCircle, roles: ['super_admin', 'mission_authority'] },
  { id: 'communication', label: 'Donor Communication', icon: MessageSquare, roles: ['super_admin', 'itc_admin', 'viewer'] },
  { id: 'donations', label: 'Donation Receipt', icon: Receipt, roles: ['super_admin', 'itc_admin', 'accounts_user', 'viewer'] },
  { id: 'utilization', label: 'Fund Utilization', icon: TrendingUp, roles: ['super_admin', 'itc_admin', 'accounts_user', 'viewer'] },
  { id: 'assets', label: 'Asset Reference', icon: Package, roles: ['super_admin', 'itc_admin', 'accounts_user', 'viewer'] },
  { id: 'beneficiaries', label: 'Beneficiary Management', icon: Users, roles: ['super_admin', 'itc_admin', 'viewer'] },
  { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, roles: ['super_admin', 'itc_admin', 'mission_authority', 'accounts_user', 'viewer'] },
  { id: 'settings', label: 'Settings', icon: Settings, roles: ['super_admin', 'itc_admin'] },
];

const roleLabels = {
  super_admin: 'Super Admin',
  itc_admin: 'ITC Admin',
  mission_authority: 'Mission Authority',
  accounts_user: 'Accounts User',
  viewer: 'Viewer',
};

export default function Navigation({ user, activePage, onPageChange, onLogout, isMobileMenuOpen, setIsMobileMenuOpen }: NavigationProps) {
  const accessibleItems = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="bg-green-600 p-2 rounded-lg">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-gray-400">×</span>
            <div className="bg-blue-600 p-2 rounded-lg">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <div className="ml-2">
              <div className="text-sm font-medium text-gray-900">Donation Portal</div>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav className={`
        fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-50
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo & Branding - Desktop only */}
        <div className="hidden lg:block p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-green-600 p-2 rounded-lg">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-gray-400">×</span>
            <div className="bg-blue-600 p-2 rounded-lg">
              <Heart className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-base font-medium text-gray-900">Donation Portal</div>
          <p className="text-sm text-gray-500">ITC × Anoopam</p>
        </div>

        {/* Mobile top spacing */}
        <div className="lg:hidden h-16" />

        {/* User Info */}
        <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
              <span className="text-sm font-medium">{user.name.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
              <div className="text-xs text-gray-500 truncate">{roleLabels[user.role]}</div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-4">
          {accessibleItems.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full px-4 sm:px-6 py-3 flex items-center gap-3 transition-colors ${
                  isActive
                    ? 'bg-green-50 text-green-700 border-r-2 border-green-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="w-full px-4 py-3 flex items-center gap-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </nav>
    </>
  );
}
