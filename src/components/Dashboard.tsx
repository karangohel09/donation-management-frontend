import React from 'react';
import { User } from '../App';
import { DollarSign, TrendingUp, Wallet, Activity, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  user: User;
}

const donationTrendData = [
  { month: 'Jan', donations: 450000, utilization: 380000 },
  { month: 'Feb', donations: 520000, utilization: 420000 },
  { month: 'Mar', donations: 680000, utilization: 550000 },
  { month: 'Apr', donations: 590000, utilization: 480000 },
  { month: 'May', donations: 750000, utilization: 620000 },
  { month: 'Jun', donations: 820000, utilization: 710000 },
];

const appealStatusData = [
  { name: 'Approved', value: 45, color: '#10b981' },
  { name: 'Pending', value: 12, color: '#f59e0b' },
  { name: 'Rejected', value: 3, color: '#ef4444' },
  { name: 'Draft', value: 8, color: '#6b7280' },
];

const recentActivities = [
  { id: 1, action: 'Donation received from Rajesh Mehta', amount: '₹50,000', time: '2 hours ago', type: 'donation' },
  { id: 2, action: 'Appeal "Education Support 2024" approved', amount: '₹500,000', time: '4 hours ago', type: 'approval' },
  { id: 3, action: 'Fund utilized for School Infrastructure', amount: '₹125,000', time: '5 hours ago', type: 'utilization' },
  { id: 4, action: 'New appeal created by ITC Admin', amount: '₹300,000', time: '1 day ago', type: 'appeal' },
  { id: 5, action: 'Communication sent to 45 donors', amount: '-', time: '1 day ago', type: 'communication' },
];

const pendingApprovals = [
  { id: 1, title: 'Healthcare Equipment Purchase', amount: 350000, requester: 'Amit Patel', date: '2024-12-27' },
  { id: 2, title: 'Rural Education Initiative', amount: 500000, requester: 'Priya Sharma', date: '2024-12-26' },
  { id: 3, title: 'Clean Water Project', amount: 450000, requester: 'Rajesh Kumar', date: '2024-12-25' },
];

export default function Dashboard({ user }: DashboardProps) {
  const isReadOnly = user.role === 'viewer';
  const canApprove = user.role === 'super_admin' || user.role === 'mission_authority';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user.name}! Here's your donation management overview.
          </p>
        </div>
        {!isReadOnly && (
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Export Summary
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span className="flex items-center gap-1 text-green-600">
              <ArrowUpRight className="w-4 h-4" />
              <span>+12.5%</span>
            </span>
          </div>
          <div className="text-gray-500 mb-1">Total Approved Donations</div>
          <div className="text-gray-900">₹42,50,000</div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <span className="flex items-center gap-1 text-blue-600">
              <ArrowUpRight className="w-4 h-4" />
              <span>+8.3%</span>
            </span>
          </div>
          <div className="text-gray-500 mb-1">Total Utilized Amount</div>
          <div className="text-gray-900">₹31,60,000</div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Wallet className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-gray-500">25.6%</span>
          </div>
          <div className="text-gray-500 mb-1">Remaining Balance</div>
          <div className="text-gray-900">₹10,90,000</div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-gray-500">68 Active</span>
          </div>
          <div className="text-gray-500 mb-1">Active Appeals</div>
          <div className="text-gray-900">45 Approved</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donation vs Utilization Trend */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
          <div className="mb-6">
            <h3 className="text-gray-900 mb-1">Donation vs Utilization Trend</h3>
            <p className="text-gray-500">Monthly comparison of donations received and funds utilized</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={donationTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                formatter={(value: number) => `₹${(value / 1000).toFixed(0)}K`}
              />
              <Legend />
              <Line type="monotone" dataKey="donations" stroke="#10b981" strokeWidth={2} name="Donations" />
              <Line type="monotone" dataKey="utilization" stroke="#3b82f6" strokeWidth={2} name="Utilization" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Appeal Status Distribution */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="mb-6">
            <h3 className="text-gray-900 mb-1">Appeal Status</h3>
            <p className="text-gray-500">Distribution by status</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={appealStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {appealStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {appealStatusData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Approvals & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        {canApprove && (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-gray-900 mb-1">Pending Approvals</h3>
                <p className="text-gray-500">Appeals awaiting your review</p>
              </div>
              <div className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full">
                {pendingApprovals.length}
              </div>
            </div>
            <div className="space-y-3">
              {pendingApprovals.map(approval => (
                <div key={approval.id} className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-gray-900">{approval.title}</div>
                    <Clock className="w-4 h-4 text-orange-500" />
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span>By {approval.requester}</span>
                    <span>₹{(approval.amount / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="text-gray-500 mt-1">{approval.date}</div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
              View All Approvals →
            </button>
          </div>
        )}

        {/* Recent Activity */}
        <div className={`bg-white rounded-xl p-6 border border-gray-200 ${!canApprove ? 'lg:col-span-2' : ''}`}>
          <div className="mb-6">
            <h3 className="text-gray-900 mb-1">Recent Activity</h3>
            <p className="text-gray-500">Latest updates and transactions</p>
          </div>
          <div className="space-y-4">
            {recentActivities.map(activity => {
              const iconMap = {
                donation: <DollarSign className="w-5 h-5 text-green-600" />,
                approval: <CheckCircle className="w-5 h-5 text-blue-600" />,
                utilization: <TrendingUp className="w-5 h-5 text-purple-600" />,
                appeal: <AlertCircle className="w-5 h-5 text-orange-600" />,
                communication: <Activity className="w-5 h-5 text-gray-600" />,
              };

              return (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className="p-2 bg-gray-50 rounded-lg mt-1">
                    {iconMap[activity.type as keyof typeof iconMap]}
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-900">{activity.action}</div>
                    <div className="flex items-center gap-4 text-gray-500 mt-1">
                      <span>{activity.time}</span>
                      {activity.amount !== '-' && (
                        <span className="text-gray-900">{activity.amount}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <div className="text-green-100 mb-1">Total Donors</div>
            <div className="text-white">1,245</div>
          </div>
          <div>
            <div className="text-green-100 mb-1">Beneficiaries Impacted</div>
            <div className="text-white">3,890</div>
          </div>
          <div>
            <div className="text-green-100 mb-1">Projects Completed</div>
            <div className="text-white">34</div>
          </div>
          <div>
            <div className="text-green-100 mb-1">Average Donation</div>
            <div className="text-white">₹34,135</div>
          </div>
        </div>
      </div>
    </div>
  );
}
