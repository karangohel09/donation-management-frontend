import React, { useState } from 'react';
import { User } from '../App';
import { Plus, Search, Download, Receipt, CreditCard, Building2, CheckCircle, Clock, AlertCircle, Eye } from 'lucide-react';

interface DonationReceiptProps {
  user: User;
}

interface Donation {
  id: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  appealId: string;
  appealTitle: string;
  amount: number;
  mode: 'cheque' | 'bank_transfer';
  chequeNumber?: string;
  chequeDate?: string;
  transactionRef?: string;
  receivingEntity: 'itc' | 'mission';
  receivedDate: string;
  status: 'confirmed' | 'pending' | 'bounced';
  receivedBy: string;
}

const mockDonations: Donation[] = [
  {
    id: 'DON-2024-001',
    donorName: 'Rajesh Mehta',
    donorEmail: 'rajesh.mehta@email.com',
    donorPhone: '+91 98765 43210',
    appealId: 'APP-2024-001',
    appealTitle: 'Education Support Program 2024',
    amount: 50000,
    mode: 'bank_transfer',
    transactionRef: 'TXN987654321',
    receivingEntity: 'itc',
    receivedDate: '2024-12-27',
    status: 'confirmed',
    receivedBy: 'Amit Patel',
  },
  {
    id: 'DON-2024-002',
    donorName: 'Sunita Kapoor',
    donorEmail: 'sunita.k@email.com',
    donorPhone: '+91 98123 45678',
    appealId: 'APP-2024-001',
    appealTitle: 'Education Support Program 2024',
    amount: 75000,
    mode: 'cheque',
    chequeNumber: 'CHQ123456',
    chequeDate: '2024-12-25',
    receivingEntity: 'mission',
    receivedDate: '2024-12-26',
    status: 'pending',
    receivedBy: 'Priya Sharma',
  },
  {
    id: 'DON-2024-003',
    donorName: 'Anil Desai',
    donorEmail: 'anil.d@email.com',
    donorPhone: '+91 99887 76543',
    appealId: 'APP-2024-005',
    appealTitle: 'Rural Infrastructure Development',
    amount: 100000,
    mode: 'bank_transfer',
    transactionRef: 'TXN876543210',
    receivingEntity: 'itc',
    receivedDate: '2024-12-25',
    status: 'confirmed',
    receivedBy: 'Amit Patel',
  },
  {
    id: 'DON-2024-004',
    donorName: 'Meera Iyer',
    donorEmail: 'meera.iyer@email.com',
    donorPhone: '+91 98234 56789',
    appealId: 'APP-2024-002',
    appealTitle: 'Healthcare Equipment Purchase',
    amount: 35000,
    mode: 'cheque',
    chequeNumber: 'CHQ789012',
    chequeDate: '2024-12-20',
    receivingEntity: 'mission',
    receivedDate: '2024-12-24',
    status: 'confirmed',
    receivedBy: 'Priya Sharma',
  },
  {
    id: 'DON-2024-005',
    donorName: 'Vikram Singh',
    donorEmail: 'vikram.s@email.com',
    donorPhone: '+91 97654 32109',
    appealId: 'APP-2024-003',
    appealTitle: 'Clean Water Project',
    amount: 60000,
    mode: 'bank_transfer',
    transactionRef: 'TXN765432109',
    receivingEntity: 'itc',
    receivedDate: '2024-12-23',
    status: 'confirmed',
    receivedBy: 'Amit Patel',
  },
];

export default function DonationReceipt({ user }: DonationReceiptProps) {
  const [donations, setDonations] = useState<Donation[]>(mockDonations);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const isReadOnly = user.role === 'viewer';
  const canCreate = user.role !== 'viewer';

  const statusConfig = {
    confirmed: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
    pending: { color: 'bg-orange-100 text-orange-700', icon: Clock },
    bounced: { color: 'bg-red-100 text-red-700', icon: AlertCircle },
  };

  const filteredDonations = donations.filter(donation => {
    const matchesStatus = filterStatus === 'all' || donation.status === filterStatus;
    const matchesSearch = 
      donation.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.appealTitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalReceived = donations
    .filter(d => d.status === 'confirmed')
    .reduce((sum, d) => sum + d.amount, 0);

  const handleViewDetails = (donation: Donation) => {
    setSelectedDonation(donation);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Donation Receipt & Fund Tracking</h1>
          <p className="text-gray-600">Record and track all donations received</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Record New Donation
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Receipt className="w-5 h-5 text-green-600" />
            <span className="text-gray-600">Total Received</span>
          </div>
          <div className="text-gray-900">₹{(totalReceived / 100000).toFixed(2)}L</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <span className="text-gray-600">Confirmed</span>
          </div>
          <div className="text-gray-900">{donations.filter(d => d.status === 'confirmed').length} Donations</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <span className="text-gray-600">Pending</span>
          </div>
          <div className="text-gray-900">{donations.filter(d => d.status === 'pending').length} Donations</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="w-5 h-5 text-purple-600" />
            <span className="text-gray-600">Avg. Donation</span>
          </div>
          <div className="text-gray-900">₹{(totalReceived / donations.filter(d => d.status === 'confirmed').length).toFixed(0)}</div>
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
                placeholder="Search by donor name, ID, or appeal..."
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
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="bounced">Bounced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Donations Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-gray-600">Donation ID</th>
                <th className="px-6 py-4 text-left text-gray-600">Donor Details</th>
                <th className="px-6 py-4 text-left text-gray-600">Appeal</th>
                <th className="px-6 py-4 text-left text-gray-600">Amount</th>
                <th className="px-6 py-4 text-left text-gray-600">Mode</th>
                <th className="px-6 py-4 text-left text-gray-600">Receiving Entity</th>
                <th className="px-6 py-4 text-left text-gray-600">Status</th>
                <th className="px-6 py-4 text-left text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonations.map((donation, index) => {
                const StatusIcon = statusConfig[donation.status].icon;
                return (
                  <tr
                    key={donation.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      index === filteredDonations.length - 1 ? 'border-b-0' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{donation.id}</div>
                      <div className="text-gray-500">{donation.receivedDate}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{donation.donorName}</div>
                      <div className="text-gray-500">{donation.donorEmail}</div>
                      <div className="text-gray-500">{donation.donorPhone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{donation.appealTitle}</div>
                      <div className="text-gray-500">{donation.appealId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">₹{donation.amount.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {donation.mode === 'cheque' ? (
                          <Receipt className="w-4 h-4 text-blue-600" />
                        ) : (
                          <CreditCard className="w-4 h-4 text-green-600" />
                        )}
                        <span className="text-gray-600 capitalize">{donation.mode.replace('_', ' ')}</span>
                      </div>
                      {donation.chequeNumber && (
                        <div className="text-gray-500">#{donation.chequeNumber}</div>
                      )}
                      {donation.transactionRef && (
                        <div className="text-gray-500">{donation.transactionRef}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 uppercase">{donation.receivingEntity}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`px-3 py-1 rounded-full inline-flex items-center gap-2 ${statusConfig[donation.status].color}`}>
                        <StatusIcon className="w-4 h-4" />
                        <span className="capitalize">{donation.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(donation)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Download Receipt"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Donation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-gray-900">Record New Donation</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-blue-700">Enter donation details as received. All fields marked with * are required.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-gray-700 mb-2">Donor Name *</label>
                  <input
                    type="text"
                    placeholder="Full name of the donor"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    placeholder="donor@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Select Appeal *</label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">Choose an appeal</option>
                  <option value="APP-2024-001">Education Support Program 2024</option>
                  <option value="APP-2024-005">Rural Infrastructure Development</option>
                  <option value="APP-2024-002">Healthcare Equipment Purchase</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Donation Amount (₹) *</label>
                  <input
                    type="number"
                    placeholder="50000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Received Date *</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Payment Mode *</label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">Select payment mode</option>
                  <option value="cheque">Cheque</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Cheque/Transaction Number</label>
                  <input
                    type="text"
                    placeholder="CHQ123456 or TXN987654321"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Cheque Date (if applicable)</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Receiving Entity *</label>
                <div className="grid grid-cols-2 gap-4">
                  <button className="p-4 border-2 border-green-500 bg-green-50 rounded-lg">
                    <Building2 className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <div className="text-gray-900">ITC</div>
                  </button>
                  <button className="p-4 border-2 border-gray-200 hover:border-green-300 rounded-lg">
                    <Building2 className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <div className="text-gray-900">Anoopam Mission</div>
                  </button>
                </div>
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
                  Record Donation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedDonation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-xl">
              <h2 className="text-white mb-2">Donation Receipt</h2>
              <p className="text-green-100">{selectedDonation.id}</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-gray-500 mb-1">Donor Name</div>
                  <div className="text-gray-900">{selectedDonation.donorName}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Email</div>
                  <div className="text-gray-900">{selectedDonation.donorEmail}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Phone</div>
                  <div className="text-gray-900">{selectedDonation.donorPhone}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Received Date</div>
                  <div className="text-gray-900">{selectedDonation.receivedDate}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Appeal</div>
                  <div className="text-gray-900">{selectedDonation.appealTitle}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Amount</div>
                  <div className="text-gray-900">₹{selectedDonation.amount.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Payment Mode</div>
                  <div className="text-gray-900 capitalize">{selectedDonation.mode.replace('_', ' ')}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Reference</div>
                  <div className="text-gray-900">{selectedDonation.chequeNumber || selectedDonation.transactionRef}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Receiving Entity</div>
                  <div className="text-gray-900 uppercase">{selectedDonation.receivingEntity}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Status</div>
                  <div className={`px-3 py-1 rounded-full inline-flex items-center gap-2 ${statusConfig[selectedDonation.status].color}`}>
                    {React.createElement(statusConfig[selectedDonation.status].icon, { className: 'w-4 h-4' })}
                    <span className="capitalize">{selectedDonation.status}</span>
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
                <button className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  Download Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
