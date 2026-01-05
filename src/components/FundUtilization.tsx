import React, { useState } from 'react';
import { User } from '../App';
import { Plus, Search, TrendingDown, FileText, Building2, CheckCircle, Clock, Eye, DollarSign } from 'lucide-react';

interface FundUtilizationProps {
  user: User;
}

interface Utilization {
  id: string;
  appealId: string;
  appealTitle: string;
  utilizationDate: string;
  description: string;
  amountUtilized: number;
  vendorName: string;
  vendorDetails: string;
  invoiceNumber: string;
  poNumber: string;
  paymentStatus: 'paid' | 'pending' | 'processing';
  createdBy: string;
  approvedAmount: number;
  remainingBalance: number;
}

const mockUtilizations: Utilization[] = [
  {
    id: 'UTL-2024-001',
    appealId: 'APP-2024-001',
    appealTitle: 'Education Support Program 2024',
    utilizationDate: '2024-12-20',
    description: 'Purchase of textbooks and educational materials for 100 students',
    amountUtilized: 125000,
    vendorName: 'Scholastic Books Pvt Ltd',
    vendorDetails: 'GST: 29AAACC1234D1Z5, Mumbai',
    invoiceNumber: 'INV-SB-2024-456',
    poNumber: 'PO-2024-001',
    paymentStatus: 'paid',
    createdBy: 'Amit Patel',
    approvedAmount: 500000,
    remainingBalance: 375000,
  },
  {
    id: 'UTL-2024-002',
    appealId: 'APP-2024-001',
    appealTitle: 'Education Support Program 2024',
    utilizationDate: '2024-12-22',
    description: 'Scholarship disbursement for 25 underprivileged students',
    amountUtilized: 150000,
    vendorName: 'Direct Transfer',
    vendorDetails: 'Student Bank Accounts',
    invoiceNumber: 'N/A',
    poNumber: 'PO-2024-002',
    paymentStatus: 'processing',
    createdBy: 'Priya Sharma',
    approvedAmount: 500000,
    remainingBalance: 225000,
  },
  {
    id: 'UTL-2024-003',
    appealId: 'APP-2024-005',
    appealTitle: 'Rural Infrastructure Development',
    utilizationDate: '2024-12-18',
    description: 'Road construction materials - cement, steel, and aggregates',
    amountUtilized: 280000,
    vendorName: 'BuildPro Construction Materials',
    vendorDetails: 'GST: 27AAABC5678E1Z9, Pune',
    invoiceNumber: 'INV-BP-2024-789',
    poNumber: 'PO-2024-003',
    paymentStatus: 'paid',
    createdBy: 'Rajesh Kumar',
    approvedAmount: 750000,
    remainingBalance: 470000,
  },
  {
    id: 'UTL-2024-004',
    appealId: 'APP-2024-005',
    appealTitle: 'Rural Infrastructure Development',
    utilizationDate: '2024-12-25',
    description: 'Labour payment for infrastructure development work',
    amountUtilized: 180000,
    vendorName: 'Skilled Workers Cooperative',
    vendorDetails: 'Reg: SWC-MH-2019-456, Maharashtra',
    invoiceNumber: 'INV-SWC-2024-123',
    poNumber: 'PO-2024-004',
    paymentStatus: 'pending',
    createdBy: 'Rajesh Kumar',
    approvedAmount: 750000,
    remainingBalance: 290000,
  },
];

export default function FundUtilization({ user }: FundUtilizationProps) {
  const [utilizations, setUtilizations] = useState<Utilization[]>(mockUtilizations);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUtilization, setSelectedUtilization] = useState<Utilization | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const isReadOnly = user.role === 'viewer';
  const canCreate = user.role !== 'viewer';

  const statusConfig = {
    paid: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
    processing: { color: 'bg-blue-100 text-blue-700', icon: Clock },
    pending: { color: 'bg-orange-100 text-orange-700', icon: Clock },
  };

  const filteredUtilizations = utilizations.filter(util => {
    const matchesStatus = filterStatus === 'all' || util.paymentStatus === filterStatus;
    const matchesSearch = 
      util.appealTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      util.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      util.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      util.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalUtilized = utilizations.reduce((sum, util) => sum + util.amountUtilized, 0);

  const handleViewDetails = (utilization: Utilization) => {
    setSelectedUtilization(utilization);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Fund Utilization Tracking</h1>
          <p className="text-gray-600">Track how approved funds are being utilized</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Record Utilization
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="w-5 h-5 text-purple-600" />
            <span className="text-gray-600">Total Utilized</span>
          </div>
          <div className="text-gray-900">₹{(totalUtilized / 100000).toFixed(2)}L</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-gray-600">Paid</span>
          </div>
          <div className="text-gray-900">{utilizations.filter(u => u.paymentStatus === 'paid').length} Transactions</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <span className="text-gray-600">Pending Payment</span>
          </div>
          <div className="text-gray-900">{utilizations.filter(u => u.paymentStatus === 'pending').length} Transactions</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="text-gray-600">Total Records</span>
          </div>
          <div className="text-gray-900">{utilizations.length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by appeal, description, or vendor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="processing">Processing</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Utilization Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-gray-600">Utilization ID</th>
                <th className="px-6 py-4 text-left text-gray-600">Appeal & Description</th>
                <th className="px-6 py-4 text-left text-gray-600">Vendor</th>
                <th className="px-6 py-4 text-left text-gray-600">Invoice/PO</th>
                <th className="px-6 py-4 text-left text-gray-600">Amount</th>
                <th className="px-6 py-4 text-left text-gray-600">Balance</th>
                <th className="px-6 py-4 text-left text-gray-600">Payment Status</th>
                <th className="px-6 py-4 text-left text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUtilizations.map((util, index) => {
                const StatusIcon = statusConfig[util.paymentStatus].icon;
                return (
                  <tr
                    key={util.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      index === filteredUtilizations.length - 1 ? 'border-b-0' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{util.id}</div>
                      <div className="text-gray-500">{util.utilizationDate}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{util.appealTitle}</div>
                      <div className="text-gray-500 line-clamp-2 max-w-xs">{util.description}</div>
                      <div className="text-gray-500">{util.appealId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{util.vendorName}</div>
                      <div className="text-gray-500 line-clamp-1">{util.vendorDetails}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-600">INV: {util.invoiceNumber}</div>
                      <div className="text-gray-600">PO: {util.poNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">₹{util.amountUtilized.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-green-600">₹{util.remainingBalance.toLocaleString()}</div>
                      <div className="text-gray-500">
                        {((util.remainingBalance / util.approvedAmount) * 100).toFixed(1)}% left
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`px-3 py-1 rounded-full inline-flex items-center gap-2 ${statusConfig[util.paymentStatus].color}`}>
                        <StatusIcon className="w-4 h-4" />
                        <span className="capitalize">{util.paymentStatus}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(util)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Utilization Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-gray-900">Record Fund Utilization</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-blue-700">Record how approved funds are being utilized. Link to the appeal and provide complete vendor & payment details.</p>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Select Appeal *</label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">Choose an approved appeal</option>
                  <option value="APP-2024-001">Education Support Program 2024 (Balance: ₹2,25,000)</option>
                  <option value="APP-2024-005">Rural Infrastructure Development (Balance: ₹2,90,000)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Utilization Date *</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Amount Utilized (₹) *</label>
                  <input
                    type="number"
                    placeholder="125000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Description *</label>
                <textarea
                  rows={3}
                  placeholder="Describe what this utilization is for..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-gray-900 mb-4">Vendor Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Vendor Name *</label>
                    <input
                      type="text"
                      placeholder="e.g., ABC Supplies Pvt Ltd"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Vendor GST/Registration</label>
                    <input
                      type="text"
                      placeholder="GST: 29AAACC1234D1Z5"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-gray-900 mb-4">Invoice & Payment Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Invoice Number *</label>
                    <input
                      type="text"
                      placeholder="INV-2024-001"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">PO Number *</label>
                    <input
                      type="text"
                      placeholder="PO-2024-001"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Payment Status *</label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">Select payment status</option>
                  <option value="paid">Paid</option>
                  <option value="processing">Processing</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Record Utilization
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedUtilization && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-xl">
              <h2 className="text-white mb-2">Utilization Details</h2>
              <p className="text-purple-100">{selectedUtilization.id}</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 bg-blue-50 rounded-lg p-4">
                  <div className="text-gray-700 mb-1">Appeal</div>
                  <div className="text-gray-900">{selectedUtilization.appealTitle}</div>
                  <div className="text-gray-600">{selectedUtilization.appealId}</div>
                </div>

                <div>
                  <div className="text-gray-500 mb-1">Utilization Date</div>
                  <div className="text-gray-900">{selectedUtilization.utilizationDate}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Amount Utilized</div>
                  <div className="text-gray-900">₹{selectedUtilization.amountUtilized.toLocaleString()}</div>
                </div>

                <div className="col-span-2">
                  <div className="text-gray-500 mb-1">Description</div>
                  <div className="text-gray-900">{selectedUtilization.description}</div>
                </div>

                <div>
                  <div className="text-gray-500 mb-1">Vendor Name</div>
                  <div className="text-gray-900">{selectedUtilization.vendorName}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Vendor Details</div>
                  <div className="text-gray-900">{selectedUtilization.vendorDetails}</div>
                </div>

                <div>
                  <div className="text-gray-500 mb-1">Invoice Number</div>
                  <div className="text-gray-900">{selectedUtilization.invoiceNumber}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">PO Number</div>
                  <div className="text-gray-900">{selectedUtilization.poNumber}</div>
                </div>

                <div>
                  <div className="text-gray-500 mb-1">Payment Status</div>
                  <div className={`px-3 py-1 rounded-full inline-flex items-center gap-2 ${statusConfig[selectedUtilization.paymentStatus].color}`}>
                    {React.createElement(statusConfig[selectedUtilization.paymentStatus].icon, { className: 'w-4 h-4' })}
                    <span className="capitalize">{selectedUtilization.paymentStatus}</span>
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Recorded By</div>
                  <div className="text-gray-900">{selectedUtilization.createdBy}</div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-gray-900 mb-4">Balance Information</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-green-600 mb-1">Approved Amount</div>
                    <div className="text-gray-900">₹{selectedUtilization.approvedAmount.toLocaleString()}</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-purple-600 mb-1">Utilized</div>
                    <div className="text-gray-900">₹{selectedUtilization.amountUtilized.toLocaleString()}</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-blue-600 mb-1">Remaining Balance</div>
                    <div className="text-gray-900">₹{selectedUtilization.remainingBalance.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
