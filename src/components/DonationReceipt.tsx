import React, { useState, useEffect } from 'react';
import { User } from '../App';
import { Plus, Search, Download, Receipt, CreditCard, Building2, CheckCircle, Clock, AlertCircle, Eye, Loader } from 'lucide-react';
import { donationAPI } from '../services/api';
import { donorAPI } from '../services/api';
import { appealAPI } from '../services/api';

interface DonationReceiptProps {
  user: User;
}

interface Donation {
  id: number;
  donorId: number;
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  appealId: number;
  appealTitle: string;
  amount: number;
  paymentMode: 'ONLINE' | 'CHEQUE' | 'CASH' | 'BANK_TRANSFER';
  transactionId?: string;
  paymentDate?: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  receiptSent: boolean;
  receiptSentDate?: string;
  notes?: string;
  recordedByName?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface FormState {
  donorId: string;
  appealId: string;
  amount: string;
  paymentMode: string;
  transactionId: string;
  notes: string;
}

const mockDonations: Donation[] = [
  {
    id: 1,
    donorId: 1,
    donorName: 'Rajesh Mehta',
    donorEmail: 'rajesh.mehta@email.com',
    donorPhone: '+91 98765 43210',
    appealId: 1,
    appealTitle: 'Education Support Program 2024',
    amount: 50000,
    paymentMode: 'BANK_TRANSFER',
    transactionId: 'TXN987654321',
    paymentDate: '2024-12-27',
    status: 'CONFIRMED',
    receiptSent: true,
    receiptSentDate: '2024-12-27',
    notes: 'Online donation',
    recordedByName: 'Amit Patel',
  },
  {
    id: 2,
    donorId: 2,
    donorName: 'Sunita Kapoor',
    donorEmail: 'sunita.k@email.com',
    donorPhone: '+91 98123 45678',
    appealId: 1,
    appealTitle: 'Education Support Program 2024',
    amount: 75000,
    paymentMode: 'CHEQUE',
    transactionId: 'CHQ123456',
    paymentDate: '2024-12-25',
    status: 'PENDING',
    receiptSent: false,
    notes: 'Cheque donation',
    recordedByName: 'Priya Sharma',
  },
];

export default function DonationReceipt({ user }: DonationReceiptProps) {
  const [donations, setDonations] = useState<Donation[]>(mockDonations);
  const [donors, setDonors] = useState<any[]>([]);
  const [appeals, setAppeals] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string>('');
  
  const [formState, setFormState] = useState<FormState>({
    donorId: '',
    appealId: '',
    amount: '',
    paymentMode: 'ONLINE',
    transactionId: '',
    notes: '',
  });

  // Load donations, donors, and appeals on mount
  useEffect(() => {
    loadDonations();
    loadDonors();
    loadAppeals();
  }, []);

  const loadDonations = async () => {
    try {
      setLoading(true);
      setLoadingMessage('Loading donations...');
      const response = await donationAPI.getDonations();
      if (response.data?.data) {
        setDonations(response.data.data);
      }
      setError('');
    } catch (err: any) {
      console.error('Failed to load donations:', err);
      // Keep showing mock data on error
      setDonations(mockDonations);
      setError('Using mock data - Backend may not be running');
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const loadDonors = async () => {
    try {
      const response = await donorAPI.getAllDonors();
      console.log('Raw Donor API Response:', response);
      
      // Handle different response formats
      let donorList = [];
      if (response.data?.data && Array.isArray(response.data.data)) {
        donorList = response.data.data;
      } else if (Array.isArray(response.data)) {
        donorList = response.data;
      } else if (response?.data?.content && Array.isArray(response.data.content)) {
        donorList = response.data.content;
      }
      
      if (donorList.length > 0) {
        console.log('First donor object:', JSON.stringify(donorList[0], null, 2));
        console.log('Donor keys:', Object.keys(donorList[0] || {}));
        console.log('Full donor list:', JSON.stringify(donorList, null, 2));
        setDonors(donorList);
        console.log('Loaded donors:', donorList.length);
      } else {
        console.warn('No donors found in response');
      }
    } catch (err: any) {
      console.error('Failed to load donors:', err.message, err.response?.data);
    }
  };

  const loadAppeals = async () => {
    try {
      const response = await appealAPI.getAppeals({});
      console.log('Appeal API Response:', response);
      
      // Handle different response formats
      let appealList = [];
      if (response.data?.data && Array.isArray(response.data.data)) {
        appealList = response.data.data;
      } else if (Array.isArray(response.data)) {
        appealList = response.data;
      } else if (response?.data?.content && Array.isArray(response.data.content)) {
        appealList = response.data.content;
      }
      
      if (appealList.length > 0) {
        console.log('First appeal object:', JSON.stringify(appealList[0], null, 2));
        console.log('Appeal keys:', Object.keys(appealList[0] || {}));
        console.log('Full appeal list:', JSON.stringify(appealList, null, 2));
        setAppeals(appealList);
        console.log('Loaded appeals:', appealList.length);
      } else {
        console.warn('No appeals found in response');
      }
    } catch (err: any) {
      console.error('Failed to load appeals:', err.message, err.response?.data);
    }
  };

  const isReadOnly = user.role === 'VIEWER';
  const canCreate = user.role !== 'VIEWER';

  const statusConfig = {
    PENDING: { color: 'bg-orange-100 text-orange-700', icon: Clock },
    CONFIRMED: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
    FAILED: { color: 'bg-red-100 text-red-700', icon: AlertCircle },
  };

  const paymentModeLabels = {
    ONLINE: 'Online',
    CHEQUE: 'Cheque',
    CASH: 'Cash',
    BANK_TRANSFER: 'Bank Transfer',
  };

  const filteredDonations = donations.filter(donation => {
    const matchesStatus = filterStatus === 'all' || donation.status === filterStatus.toUpperCase();
    const matchesSearch = 
      donation.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.id.toString().includes(searchTerm) ||
      donation.appealTitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalReceived = donations
    .filter(d => d.status === 'CONFIRMED')
    .reduce((sum, d) => sum + d.amount, 0);

  const handleViewDetails = (donation: Donation) => {
    setSelectedDonation(donation);
    setShowDetailModal(true);
  };

  const handleCreateDonation = async () => {
    try {
      if (!formState.donorId || !formState.appealId || !formState.amount) {
        alert('Please fill in all required fields');
        return;
      }

      setLoading(true);
      setLoadingMessage('Recording donation...');

      const donationData = {
        donorId: parseInt(formState.donorId),
        appealId: parseInt(formState.appealId),
        amount: parseFloat(formState.amount),
        paymentMode: formState.paymentMode,
        transactionId: formState.transactionId || undefined,
        notes: formState.notes || undefined,
      };

      console.log('Sending donation data:', donationData);
      const response = await donationAPI.createDonation(donationData);
      console.log('Donation response:', response);
      
      if (response.data?.success) {
        alert('Donation recorded successfully!');
        setShowCreateModal(false);
        setFormState({
          donorId: '',
          appealId: '',
          amount: '',
          paymentMode: 'ONLINE',
          transactionId: '',
          notes: '',
        });
        loadDonations(); // Refresh the list
      }
    } catch (err: any) {
      console.error('Full donation error:', err);
      alert(`Failed to record donation: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleConfirmDonation = async (donationId: number) => {
    try {
      setLoading(true);
      setLoadingMessage('Confirming donation...');
      
      const response = await donationAPI.confirmDonation(donationId);
      if (response.data?.success) {
        alert('Donation confirmed successfully!');
        loadDonations();
        setShowDetailModal(false);
      }
    } catch (err: any) {
      alert(`Failed to confirm donation: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleGenerateReceipt = async (donationId: number) => {
    try {
      setLoading(true);
      setLoadingMessage('Generating receipt...');
      
      const response = await donationAPI.generateReceipt(donationId);
      if (response.data?.success) {
        alert('Receipt generated successfully!');
        const receiptId = response.data?.data?.id;
        if (receiptId) {
          // Auto-send email
          await handleSendReceiptEmail(receiptId);
        }
        loadDonations();
      }
    } catch (err: any) {
      alert(`Failed to generate receipt: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleSendReceiptEmail = async (receiptId: number) => {
    try {
      setLoading(true);
      setLoadingMessage('Sending receipt email...');
      
      const response = await donationAPI.sendReceiptEmail(receiptId);
      if (response.data?.success) {
        alert('Receipt email sent successfully!');
        loadDonations();
      }
    } catch (err: any) {
      alert(`Failed to send receipt email: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-700">{error}</p>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-3">
            <Loader className="w-8 h-8 animate-spin text-green-600" />
            <p className="text-gray-700">{loadingMessage}</p>
          </div>
        </div>
      )}

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
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-gray-600">Confirmed</span>
          </div>
          <div className="text-gray-900">{donations.filter(d => d.status === 'CONFIRMED').length} Donations</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <span className="text-gray-600">Pending</span>
          </div>
          <div className="text-gray-900">{donations.filter(d => d.status === 'PENDING').length} Donations</div>
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
              <option value="CONFIRMED">Confirmed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
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
                <th className="px-6 py-4 text-left text-gray-600">Payment Mode</th>
                <th className="px-6 py-4 text-left text-gray-600">Status</th>
                <th className="px-6 py-4 text-left text-gray-600">Receipt</th>
                <th className="px-6 py-4 text-left text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonations.map((donation, index) => {
                const StatusIcon = statusConfig[donation.status as keyof typeof statusConfig].icon;
                return (
                  <tr
                    key={donation.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      index === filteredDonations.length - 1 ? 'border-b-0' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="text-gray-900">#{donation.id}</div>
                      <div className="text-gray-500">{new Date(donation.createdAt || '').toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{donation.donorName}</div>
                      <div className="text-gray-500 text-sm">{donation.donorEmail}</div>
                      <div className="text-gray-500 text-sm">{donation.donorPhone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{donation.appealTitle}</div>
                      <div className="text-gray-500">ID: {donation.appealId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 font-semibold">₹{donation.amount.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {donation.paymentMode === 'CHEQUE' ? (
                          <Receipt className="w-4 h-4 text-blue-600" />
                        ) : (
                          <CreditCard className="w-4 h-4 text-green-600" />
                        )}
                        <span className="text-gray-600 text-sm">{paymentModeLabels[donation.paymentMode]}</span>
                      </div>
                      {donation.transactionId && (
                        <div className="text-gray-500 text-sm">{donation.transactionId}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`px-3 py-1 rounded-full inline-flex items-center gap-2 text-sm ${statusConfig[donation.status].color}`}>
                        {React.createElement(StatusIcon, { className: 'w-4 h-4' })}
                        <span className="capitalize">{donation.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {donation.receiptSent ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            Sent
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-orange-600">
                            <Clock className="w-4 h-4" />
                            Pending
                          </div>
                        )}
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
                        {donation.status === 'CONFIRMED' && !donation.receiptSent && (
                          <button
                            onClick={() => handleGenerateReceipt(donation.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Generate Receipt"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
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

              <div>
                <label className="block text-gray-700 mb-2">Select Donor *</label>
                <select 
                  value={formState.donorId}
                  onChange={(e) => {
                    console.log('Donor selected:', e.target.value);
                    setFormState({...formState, donorId: e.target.value});
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Choose a donor</option>
                  {donors.map((donor: any) => {
                    const donorId = donor.id || donor.donorId;
                    const donorName = donor.name || donor.donorName || donor.firstName;
                    const donorEmail = donor.email || donor.emailAddress;
                    console.log('Mapping donor:', { donor, donorId, donorName, donorEmail });
                    return (
                      <option key={donorId} value={donorId?.toString() || ''}>
                        {donorName} ({donorEmail})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Select Appeal *</label>
                <select 
                  value={formState.appealId}
                  onChange={(e) => {
                    console.log('Appeal selected:', e.target.value);
                    setFormState({...formState, appealId: e.target.value});
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Choose an appeal</option>
                  {appeals.map((appeal: any) => {
                    const appealId = appeal.id || appeal.appealId;
                    const appealTitle = appeal.title || appeal.name || appeal.appealTitle;
                    return (
                      <option key={appealId} value={appealId?.toString() || ''}>
                        {appealTitle}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Donation Amount (₹) *</label>
                  <input
                    type="number"
                    placeholder="50000"
                    value={formState.amount}
                    onChange={(e) => setFormState({...formState, amount: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Payment Mode *</label>
                  <select 
                    value={formState.paymentMode}
                    onChange={(e) => setFormState({...formState, paymentMode: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select payment mode</option>
                    <option value="ONLINE">Online</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="CASH">Cash</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Transaction/Cheque Number {formState.paymentMode !== 'CASH' && '*'}</label>
                <input
                  type="text"
                  placeholder="CHQ123456 or TXN987654321"
                  value={formState.transactionId}
                  onChange={(e) => setFormState({...formState, transactionId: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Additional Notes</label>
                <textarea
                  placeholder="Any other details about the donation..."
                  value={formState.notes}
                  onChange={(e) => setFormState({...formState, notes: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateDonation}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && <Loader className="w-4 h-4 animate-spin" />}
                  {loading ? 'Recording...' : 'Record Donation'}
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
              <p className="text-green-100">Donation ID: {selectedDonation.id}</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-gray-500 mb-1">Donor Name</div>
                  <div className="text-gray-900">{selectedDonation.donorName}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Email</div>
                  <div className="text-gray-900">{selectedDonation.donorEmail || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Phone</div>
                  <div className="text-gray-900">{selectedDonation.donorPhone || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Received Date</div>
                  <div className="text-gray-900">{selectedDonation.createdAt ? new Date(selectedDonation.createdAt).toLocaleDateString() : 'N/A'}</div>
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
                  <div className="text-gray-900">{paymentModeLabels[selectedDonation.paymentMode] || selectedDonation.paymentMode}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Transaction ID</div>
                  <div className="text-gray-900">{selectedDonation.transactionId || 'N/A'}</div>
                </div>
                {selectedDonation.notes && (
                  <div className="col-span-2">
                    <div className="text-gray-500 mb-1">Notes</div>
                    <div className="text-gray-900">{selectedDonation.notes}</div>
                  </div>
                )}
                <div>
                  <div className="text-gray-500 mb-1">Status</div>
                  <div className={`px-3 py-1 rounded-full inline-flex items-center gap-2 ${statusConfig[selectedDonation.status].color}`}>
                    {React.createElement(statusConfig[selectedDonation.status].icon, { className: 'w-4 h-4' })}
                    <span>{selectedDonation.status}</span>
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Receipt Status</div>
                  <div className={`px-3 py-1 rounded-full text-sm ${selectedDonation.receiptSent ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {selectedDonation.receiptSent ? `✓ Sent (${selectedDonation.receiptSentDate ? new Date(selectedDonation.receiptSentDate).toLocaleDateString() : ''})` : 'Pending'}
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
                {selectedDonation.status === 'CONFIRMED' && (
                  <>
                    {selectedDonation.receiptSent ? (
                      <button 
                        onClick={() => handleSendReceiptEmail(selectedDonation.id)}
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
                      >
                        {loading && <Loader className="w-4 h-4 animate-spin" />}
                        Resend Receipt
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleGenerateReceipt(selectedDonation.id)}
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
                      >
                        {loading && <Loader className="w-4 h-4 animate-spin" />}
                        Generate & Send Receipt
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
