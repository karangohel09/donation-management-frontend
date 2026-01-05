import React, { useState } from 'react';
import { User } from '../App';
import { Users, Shield, Eye, Edit, Plus, CheckCircle, XCircle, Key, Bell, Settings as SettingsIcon } from 'lucide-react';

interface SettingsProps {
  user: User;
}

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
}

const mockUsers: SystemUser[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    email: 'rajesh@itc.com',
    role: 'Super Admin',
    status: 'active',
    lastLogin: '2024-12-28 09:30 AM',
  },
  {
    id: '2',
    name: 'Priya Sharma',
    email: 'priya@itc.com',
    role: 'ITC Admin',
    status: 'active',
    lastLogin: '2024-12-28 08:15 AM',
  },
  {
    id: '3',
    name: 'Swami Anand',
    email: 'swami@anoopam.org',
    role: 'Mission Authority',
    status: 'active',
    lastLogin: '2024-12-27 05:45 PM',
  },
  {
    id: '4',
    name: 'Amit Patel',
    email: 'amit@accounts.com',
    role: 'Accounts User',
    status: 'active',
    lastLogin: '2024-12-28 10:00 AM',
  },
  {
    id: '5',
    name: 'Guest User',
    email: 'viewer@itc.com',
    role: 'Viewer',
    status: 'inactive',
    lastLogin: '2024-12-20 03:20 PM',
  },
];

const rolePermissions = {
  'Super Admin': {
    appeals: ['create', 'view', 'edit', 'delete'],
    approvals: ['approve', 'reject', 'view'],
    communication: ['send', 'view'],
    donations: ['record', 'view', 'edit'],
    utilization: ['record', 'view', 'edit'],
    assets: ['link', 'view'],
    beneficiaries: ['add', 'view', 'edit'],
    reports: ['generate', 'export', 'view'],
    settings: ['manage'],
  },
  'ITC Admin': {
    appeals: ['create', 'view', 'edit'],
    approvals: ['view'],
    communication: ['send', 'view'],
    donations: ['record', 'view'],
    utilization: ['record', 'view'],
    assets: ['link', 'view'],
    beneficiaries: ['add', 'view'],
    reports: ['generate', 'export', 'view'],
    settings: ['view'],
  },
  'Mission Authority': {
    appeals: ['view'],
    approvals: ['approve', 'reject', 'view'],
    communication: [],
    donations: [],
    utilization: [],
    assets: [],
    beneficiaries: [],
    reports: ['view'],
    settings: [],
  },
  'Accounts User': {
    appeals: [],
    approvals: [],
    communication: [],
    donations: ['record', 'view'],
    utilization: ['record', 'view'],
    assets: ['link', 'view'],
    beneficiaries: [],
    reports: ['view'],
    settings: [],
  },
  'Viewer': {
    appeals: ['view'],
    approvals: [],
    communication: [],
    donations: ['view'],
    utilization: ['view'],
    assets: ['view'],
    beneficiaries: ['view'],
    reports: ['view'],
    settings: [],
  },
};

export default function Settings({ user }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'general'>('users');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [users, setUsers] = useState<SystemUser[]>(mockUsers);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Settings & Access Control</h1>
          <p className="text-gray-600">Manage users, roles, and system settings</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'users'
                  ? 'bg-green-50 text-green-700 border-b-2 border-green-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users className="w-5 h-5" />
              User Management
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'roles'
                  ? 'bg-green-50 text-green-700 border-b-2 border-green-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Shield className="w-5 h-5" />
              Roles & Permissions
            </button>
            <button
              onClick={() => setActiveTab('general')}
              className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'general'
                  ? 'bg-green-50 text-green-700 border-b-2 border-green-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <SettingsIcon className="w-5 h-5" />
              General Settings
            </button>
          </div>
        </div>

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-gray-900 mb-1">System Users</h3>
                <p className="text-gray-600">Manage user accounts and access</p>
              </div>
              <button
                onClick={() => setShowAddUserModal(true)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add New User
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-gray-600">User</th>
                    <th className="px-6 py-3 text-left text-gray-600">Email</th>
                    <th className="px-6 py-3 text-left text-gray-600">Role</th>
                    <th className="px-6 py-3 text-left text-gray-600">Last Login</th>
                    <th className="px-6 py-3 text-left text-gray-600">Status</th>
                    <th className="px-6 py-3 text-left text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, index) => (
                    <tr
                      key={u.id}
                      className={`border-b border-gray-100 ${
                        index === users.length - 1 ? 'border-b-0' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white">
                            {u.name.charAt(0)}
                          </div>
                          <div className="text-gray-900">{u.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{u.email}</td>
                      <td className="px-6 py-4">
                        <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full inline-block">
                          {u.role}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{u.lastLogin}</td>
                      <td className="px-6 py-4">
                        {u.status === 'active' ? (
                          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full inline-flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Active
                          </div>
                        ) : (
                          <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full inline-flex items-center gap-2">
                            <XCircle className="w-4 h-4" />
                            Inactive
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                            <Key className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Roles & Permissions Tab */}
        {activeTab === 'roles' && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-gray-900 mb-1">Role-based Access Control</h3>
              <p className="text-gray-600">View and manage permissions for each role</p>
            </div>

            <div className="space-y-6">
              {Object.entries(rolePermissions).map(([role, permissions]) => (
                <div key={role} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-green-600" />
                        <span className="text-gray-900">{role}</span>
                      </div>
                      <span className="px-3 py-1 bg-white text-gray-600 rounded-full">
                        {users.filter(u => u.role === role).length} users
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(permissions).map(([module, perms]) => (
                        <div key={module} className="border border-gray-200 rounded-lg p-4">
                          <div className="text-gray-900 mb-2 capitalize">{module}</div>
                          {perms.length > 0 ? (
                            <div className="space-y-1">
                              {perms.map((perm) => (
                                <div key={perm} className="flex items-center gap-2 text-green-600">
                                  <CheckCircle className="w-4 h-4" />
                                  <span className="capitalize">{perm}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-gray-400">No access</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-gray-900 mb-4">Organization Details</h3>
              <div className="border border-gray-200 rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Organization Name</label>
                    <input
                      type="text"
                      value="ITC × Anoopam Mission"
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Financial Year</label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option>2024-2025</option>
                      <option>2023-2024</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-gray-900 mb-4">Notification Settings</h3>
              <div className="border border-gray-200 rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-gray-900">Email Notifications</div>
                      <div className="text-gray-500">Receive email alerts for important events</div>
                    </div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-green-600">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-gray-900">Approval Notifications</div>
                      <div className="text-gray-500">Get notified when approvals are pending</div>
                    </div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-green-600">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-gray-900">Weekly Reports</div>
                      <div className="text-gray-500">Receive weekly summary reports</div>
                    </div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-gray-900 mb-4">Security Settings</h3>
              <div className="border border-gray-200 rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-gray-900">Session Timeout</div>
                    <div className="text-gray-500">Auto logout after inactivity</div>
                  </div>
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>2 hours</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div>
                    <div className="text-gray-900">Password Policy</div>
                    <div className="text-gray-500">Minimum 8 characters, mixed case, numbers</div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Reset to Defaults
              </button>
              <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-gray-900">Add New User</h2>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    placeholder="user@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Role *</label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">Select a role</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="itc_admin">ITC Admin</option>
                  <option value="mission_authority">Mission Authority</option>
                  <option value="accounts_user">Accounts User</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Initial Password *</label>
                <input
                  type="password"
                  placeholder="Enter temporary password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-gray-500 mt-1">User will be required to change password on first login</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
