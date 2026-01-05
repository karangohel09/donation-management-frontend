import React, { useState } from 'react';
import { User } from '../App';
import { FileText, Download, Calendar, TrendingUp, DollarSign, Package, Users, BarChart3, CheckCircle } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ReportsProps {
  user: User;
}

const appealWiseData = [
  { name: 'Education Support', approved: 500000, utilized: 375000, remaining: 125000 },
  { name: 'Rural Infrastructure', approved: 750000, utilized: 460000, remaining: 290000 },
  { name: 'Healthcare Equipment', approved: 350000, utilized: 0, remaining: 350000 },
  { name: 'Clean Water Project', approved: 450000, utilized: 0, remaining: 450000 },
];

const monthlyData = [
  { month: 'Jan', received: 450000, utilized: 380000 },
  { month: 'Feb', received: 520000, utilized: 420000 },
  { month: 'Mar', received: 680000, utilized: 550000 },
  { month: 'Apr', received: 590000, utilized: 480000 },
  { month: 'May', received: 750000, utilized: 620000 },
  { month: 'Jun', received: 820000, utilized: 710000 },
];

const categoryData = [
  { name: 'Education', value: 875000, color: '#3b82f6' },
  { name: 'Healthcare', value: 350000, color: '#ef4444' },
  { name: 'Infrastructure', value: 1200000, color: '#8b5cf6' },
  { name: 'Social Welfare', value: 300000, color: '#f59e0b' },
];

const reportTypes = [
  {
    id: 'appeal-wise',
    title: 'Appeal-wise Utilization Report',
    description: 'Detailed breakdown of funds for each appeal',
    icon: FileText,
    color: 'blue',
  },
  {
    id: 'donation-received',
    title: 'Donation Received vs Utilized',
    description: 'Comparative analysis of donations and utilization',
    icon: TrendingUp,
    color: 'green',
  },
  {
    id: 'pending-balance',
    title: 'Pending Balance Report',
    description: 'Appeals with remaining unutilized funds',
    icon: DollarSign,
    color: 'purple',
  },
  {
    id: 'asset-utilization',
    title: 'Asset Utilization Reference',
    description: 'Assets linked to fund utilization',
    icon: Package,
    color: 'orange',
  },
  {
    id: 'beneficiary-impact',
    title: 'Beneficiary Impact Report',
    description: 'Impact stories and feedback summary',
    icon: Users,
    color: 'pink',
  },
  {
    id: 'audit-report',
    title: 'Complete Audit Report',
    description: 'Comprehensive report for compliance and audit',
    icon: BarChart3,
    color: 'indigo',
  },
];

export default function Reports({ user }: ReportsProps) {
  const [selectedReport, setSelectedReport] = useState('appeal-wise');
  const [dateRange, setDateRange] = useState({ from: '2024-01-01', to: '2024-12-31' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Reports & Analytics</h1>
          <p className="text-gray-600">Generate comprehensive reports for analysis and audit</p>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-gray-400" />
          <div className="text-gray-700">Report Period:</div>
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button className="ml-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export All Reports
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          const colorMap: Record<string, { bg: string; text: string; border: string }> = {
            blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
            green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
            purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
            orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
            pink: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200' },
            indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
          };
          const colors = colorMap[report.color];

          return (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                selectedReport === report.id
                  ? `${colors.bg} ${colors.border} shadow-md`
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`p-3 ${colors.bg} rounded-lg inline-block mb-3`}>
                <Icon className={`w-6 h-6 ${colors.text}`} />
              </div>
              <div className="text-gray-900 mb-1">{report.title}</div>
              <p className="text-gray-500">{report.description}</p>
            </button>
          );
        })}
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-white mb-1">
              {reportTypes.find(r => r.id === selectedReport)?.title}
            </h2>
            <p className="text-green-100">
              Period: {dateRange.from} to {dateRange.to}
            </p>
          </div>
          <button className="px-6 py-3 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export PDF
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <div className="text-green-600 mb-1">Total Approved</div>
              <div className="text-gray-900">₹42.5L</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="text-blue-600 mb-1">Total Utilized</div>
              <div className="text-gray-900">₹31.6L</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
              <div className="text-purple-600 mb-1">Remaining Balance</div>
              <div className="text-gray-900">₹10.9L</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
              <div className="text-orange-600 mb-1">Utilization Rate</div>
              <div className="text-gray-900">74.4%</div>
            </div>
          </div>

          {/* Appeal-wise Utilization Chart */}
          {selectedReport === 'appeal-wise' && (
            <>
              <div>
                <h3 className="text-gray-900 mb-4">Appeal-wise Fund Status</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={appealWiseData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      formatter={(value: number) => `₹${(value / 1000).toFixed(0)}K`}
                    />
                    <Legend />
                    <Bar dataKey="approved" fill="#10b981" name="Approved" />
                    <Bar dataKey="utilized" fill="#3b82f6" name="Utilized" />
                    <Bar dataKey="remaining" fill="#f59e0b" name="Remaining" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Detailed Table */}
              <div>
                <h3 className="text-gray-900 mb-4">Detailed Breakdown</h3>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-gray-600">Appeal Name</th>
                        <th className="px-6 py-3 text-left text-gray-600">Approved Amount</th>
                        <th className="px-6 py-3 text-left text-gray-600">Utilized Amount</th>
                        <th className="px-6 py-3 text-left text-gray-600">Remaining Balance</th>
                        <th className="px-6 py-3 text-left text-gray-600">Utilization %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appealWiseData.map((appeal, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="px-6 py-4 text-gray-900">{appeal.name}</td>
                          <td className="px-6 py-4 text-gray-900">₹{appeal.approved.toLocaleString()}</td>
                          <td className="px-6 py-4 text-blue-600">₹{appeal.utilized.toLocaleString()}</td>
                          <td className="px-6 py-4 text-orange-600">₹{appeal.remaining.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                                <div
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ width: `${(appeal.utilized / appeal.approved) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-gray-600">
                                {((appeal.utilized / appeal.approved) * 100).toFixed(1)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Monthly Trend */}
          {selectedReport === 'donation-received' && (
            <>
              <div>
                <h3 className="text-gray-900 mb-4">Monthly Donation vs Utilization Trend</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      formatter={(value: number) => `₹${(value / 1000).toFixed(0)}K`}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="received" stroke="#10b981" strokeWidth={3} name="Received" />
                    <Line type="monotone" dataKey="utilized" stroke="#3b82f6" strokeWidth={3} name="Utilized" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="text-gray-700 mb-4">Cumulative Summary</div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Received:</span>
                      <span className="text-green-600">₹38.1L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Utilized:</span>
                      <span className="text-blue-600">₹31.6L</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-gray-200">
                      <span className="text-gray-900">Net Balance:</span>
                      <span className="text-gray-900">₹6.5L</span>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="text-gray-700 mb-4">Efficiency Metrics</div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Utilization Rate:</span>
                      <span className="text-gray-900">82.9%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg. Monthly Received:</span>
                      <span className="text-gray-900">₹6.35L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg. Monthly Utilized:</span>
                      <span className="text-gray-900">₹5.27L</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Category Distribution */}
          {selectedReport === 'pending-balance' && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-gray-900 mb-4">Balance by Category</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={2}
                        dataKey="value"
                        label={(entry) => entry.name}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `₹${(value / 1000).toFixed(0)}K`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="text-gray-900 mb-4">Pending Balances</h3>
                  <div className="space-y-3">
                    {appealWiseData.filter(a => a.remaining > 0).map((appeal, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="text-gray-900">{appeal.name}</div>
                          <div className="text-orange-600">₹{appeal.remaining.toLocaleString()}</div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full"
                            style={{ width: `${(appeal.remaining / appeal.approved) * 100}%` }}
                          ></div>
                        </div>
                        <div className="text-gray-500 mt-1">
                          {((appeal.remaining / appeal.approved) * 100).toFixed(1)}% remaining
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {selectedReport === 'asset-utilization' && (
            <div>
              <h3 className="text-gray-900 mb-4">Asset Utilization Reference Report</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-gray-600">Asset Reg. Number</th>
                      <th className="px-6 py-3 text-left text-gray-600">Asset Name</th>
                      <th className="px-6 py-3 text-left text-gray-600">Owner</th>
                      <th className="px-6 py-3 text-left text-gray-600">Linked Appeal</th>
                      <th className="px-6 py-3 text-left text-gray-600">Linked Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="px-6 py-4 text-gray-900">ITC-EDU-2024-001</td>
                      <td className="px-6 py-4 text-gray-900">Educational Books Package</td>
                      <td className="px-6 py-4 text-green-600">ITC</td>
                      <td className="px-6 py-4 text-gray-600">Education Support 2024</td>
                      <td className="px-6 py-4 text-gray-600">2024-12-20</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="px-6 py-4 text-gray-900">AM-INF-2024-015</td>
                      <td className="px-6 py-4 text-gray-900">Road Construction Equipment</td>
                      <td className="px-6 py-4 text-blue-600">Mission</td>
                      <td className="px-6 py-4 text-gray-600">Rural Infrastructure Dev</td>
                      <td className="px-6 py-4 text-gray-600">2024-12-18</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-gray-900">ITC-INF-2024-008</td>
                      <td className="px-6 py-4 text-gray-900">Building Materials Inventory</td>
                      <td className="px-6 py-4 text-green-600">ITC</td>
                      <td className="px-6 py-4 text-gray-600">Rural Infrastructure Dev</td>
                      <td className="px-6 py-4 text-gray-600">2024-12-18</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedReport === 'beneficiary-impact' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="border border-gray-200 rounded-lg p-6 text-center">
                  <div className="text-gray-600 mb-2">Total Beneficiaries</div>
                  <div className="text-gray-900">3,890</div>
                </div>
                <div className="border border-gray-200 rounded-lg p-6 text-center">
                  <div className="text-gray-600 mb-2">Avg. Satisfaction</div>
                  <div className="text-gray-900">4.6 / 5.0</div>
                </div>
                <div className="border border-gray-200 rounded-lg p-6 text-center">
                  <div className="text-gray-600 mb-2">Feedback Collected</div>
                  <div className="text-gray-900">1,245</div>
                </div>
              </div>

              <div>
                <h3 className="text-gray-900 mb-4">Recent Impact Stories</h3>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4 bg-green-50">
                    <div className="text-gray-900 mb-2">Education - Ramesh Kumar</div>
                    <p className="text-gray-600 italic mb-2">
                      "This support has changed my son's future. We are extremely grateful for this opportunity."
                    </p>
                    <div className="text-gray-500">Rating: ⭐⭐⭐⭐⭐</div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                    <div className="text-gray-900 mb-2">Healthcare - Lakshmi Devi</div>
                    <p className="text-gray-600 italic mb-2">
                      "The medical facilities have improved greatly. My family can now get proper treatment locally."
                    </p>
                    <div className="text-gray-500">Rating: ⭐⭐⭐⭐⭐</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedReport === 'audit-report' && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-green-900 mb-1">Audit Compliance Status: ✓ Compliant</div>
                <p className="text-green-700">All records are complete and audit-ready. No discrepancies found.</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-gray-900 mb-4">Financial Summary</h3>
                  <div className="border border-gray-200 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Appeals Approved:</span>
                      <span className="text-gray-900">45</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Donations Received:</span>
                      <span className="text-gray-900">257</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Utilization Records:</span>
                      <span className="text-gray-900">132</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="text-gray-900">Approved Funds:</span>
                      <span className="text-green-600">₹42.5L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-900">Utilized Funds:</span>
                      <span className="text-blue-600">₹31.6L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-900">Remaining Balance:</span>
                      <span className="text-orange-600">₹10.9L</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-gray-900 mb-4">Compliance Checklist</h3>
                  <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span>All appeals have approval records</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span>Donation receipts properly documented</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span>Utilization records with invoice/PO</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span>Asset references properly linked</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span>Beneficiary feedback collected</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
