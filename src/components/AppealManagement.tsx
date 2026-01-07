import React, { useState } from 'react';
import { User } from '../App';
import { Plus, Search, Filter, Eye, Edit, Trash2, FileText, Calendar, DollarSign, CheckCircle, Clock, XCircle, FileUp } from 'lucide-react';

interface AppealManagementProps {
  user: User;
}

interface Appeal {
  id: string;
  title: string;
  purpose: string;
  estimatedAmount: number;
  approvedAmount?: number;
  beneficiaryCategory: string;
  duration: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  createdBy: string;
  createdDate: string;
  documents: number;
}

const mockAppeals: Appeal[] = [
  {
    id: 'APP-2024-001',
    title: 'Education Support Program 2024',
    purpose: 'Providing educational materials and scholarships to underprivileged children in rural areas',
    estimatedAmount: 500000,
    approvedAmount: 500000,
    beneficiaryCategory: 'Education',
    duration: '12 months',
    status: 'approved',
    createdBy: 'Priya Sharma',
    createdDate: '2024-12-15',
    documents: 3,
  },
  {
    id: 'APP-2024-002',
    title: 'Healthcare Equipment Purchase',
    purpose: 'Medical equipment for community health center',
    estimatedAmount: 350000,
    beneficiaryCategory: 'Healthcare',
    duration: '6 months',
    status: 'submitted',
    createdBy: 'Amit Patel',
    createdDate: '2024-12-20',
    documents: 5,
  },
  {
    id: 'APP-2024-003',
    title: 'Clean Water Project',
    purpose: 'Installation of water purification systems in 5 villages',
    estimatedAmount: 450000,
    beneficiaryCategory: 'Infrastructure',
    duration: '9 months',
    status: 'submitted',
    createdBy: 'Rajesh Kumar',
    createdDate: '2024-12-22',
    documents: 4,
  },
  {
    id: 'APP-2024-004',
    title: 'Women Empowerment Initiative',
    purpose: 'Skill development and entrepreneurship training for women',
    estimatedAmount: 300000,
    beneficiaryCategory: 'Social Welfare',
    duration: '12 months',
    status: 'draft',
    createdBy: 'Priya Sharma',
    createdDate: '2024-12-25',
    documents: 2,
  },
  {
    id: 'APP-2024-005',
    title: 'Rural Infrastructure Development',
    purpose: 'Road and basic infrastructure improvement',
    estimatedAmount: 800000,
    approvedAmount: 750000,
    beneficiaryCategory: 'Infrastructure',
    duration: '18 months',
    status: 'approved',
    createdBy: 'Rajesh Kumar',
    createdDate: '2024-11-10',
    documents: 6,
  },
  {
    id: 'APP-2024-006',
    title: 'Emergency Relief Fund',
    purpose: 'Natural disaster relief and rehabilitation',
    estimatedAmount: 200000,
    beneficiaryCategory: 'Emergency',
    duration: '3 months',
    status: 'rejected',
    createdBy: 'Amit Patel',
    createdDate: '2024-12-01',
    documents: 2,
  },
];

export default function AppealManagement({ user }: AppealManagementProps) {
  const [appeals, setAppeals] = useState<Appeal[]>(mockAppeals);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const isReadOnly = user.role === 'viewer';
  const canCreate = user.role !== 'viewer';

  const statusConfig = {
    draft: { color: 'bg-gray-100 text-gray-700', icon: FileText },
    submitted: { color: 'bg-orange-100 text-orange-700', icon: Clock },
    approved: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
    rejected: { color: 'bg-red-100 text-red-700', icon: XCircle },
  };

  const filteredAppeals = appeals.filter(appeal => {
    const matchesStatus = filterStatus === 'all' || appeal.status === filterStatus;
    const matchesSearch = appeal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          appeal.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          appeal.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleViewDetails = (appeal: Appeal) => {
    setSelectedAppeal(appeal);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Appeal Management</h1>
          <p className="text-gray-600">Create and track donation appeals</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create New Appeal
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, purpose, or ID..."
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
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appeals Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-gray-600">Appeal ID</th>
                <th className="px-6 py-4 text-left text-gray-600">Title & Purpose</th>
                <th className="px-6 py-4 text-left text-gray-600">Category</th>
                <th className="px-6 py-4 text-left text-gray-600">Amount</th>
                <th className="px-6 py-4 text-left text-gray-600">Duration</th>
                <th className="px-6 py-4 text-left text-gray-600">Status</th>
                <th className="px-6 py-4 text-left text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppeals.map((appeal, index) => {
                const StatusIcon = statusConfig[appeal.status].icon;
                return (
                  <tr
                    key={appeal.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      index === filteredAppeals.length - 1 ? 'border-b-0' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{appeal.id}</div>
                      <div className="text-gray-500">{appeal.createdDate}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 max-w-xs">{appeal.title}</div>
                      <div className="text-gray-500 line-clamp-1">{appeal.purpose}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full inline-block">
                        {appeal.beneficiaryCategory}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">₹{(appeal.estimatedAmount / 1000).toFixed(0)}K</div>
                      {appeal.approvedAmount && (
                        <div className="text-green-600">Approved: ₹{(appeal.approvedAmount / 1000).toFixed(0)}K</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-600">{appeal.duration}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`px-3 py-1 rounded-full inline-flex items-center gap-2 ${statusConfig[appeal.status].color}`}>
                        <StatusIcon className="w-4 h-4" />
                        <span className="capitalize">{appeal.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(appeal)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!isReadOnly && appeal.status === 'draft' && (
                          <>
                            <button
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
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

      {/* Create Appeal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-gray-900">Create New Appeal</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-gray-700 mb-2">Appeal Title *</label>
                <input
                  type="text"
                  placeholder="e.g., Education Support Program 2024"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Purpose & Description *</label>
                <textarea
                  rows={4}
                  placeholder="Describe the purpose and impact of this appeal..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Estimated Amount (₹) *</label>
                  <input
                    type="number"
                    placeholder="500000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Duration *</label>
                  <input
                    type="text"
                    placeholder="e.g., 12 months"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Beneficiary Category *</label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">Select Category</option>
                  <option value="education">Education</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="social_welfare">Social Welfare</option>
                  <option value="emergency">Emergency Relief</option>
                  <option value="environment">Environment</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Supporting Documents</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors cursor-pointer">
                  <FileUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-1">Click to upload or drag and drop</p>
                  <p className="text-gray-500">PDF, DOC, or images (max 10MB)</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Submit for Approval
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appeal Detail Modal */}
      {showDetailModal && selectedAppeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-gray-900">{selectedAppeal.title}</h2>
                <p className="text-gray-500">{selectedAppeal.id}</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Workflow Stepper */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="text-gray-700 mb-4">Approval Workflow</div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      selectedAppeal.status !== 'draft' ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-gray-600 mt-2">Draft</div>
                  </div>
                  <div className={`flex-1 h-1 ${selectedAppeal.status !== 'draft' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      selectedAppeal.status === 'submitted' || selectedAppeal.status === 'approved' || selectedAppeal.status === 'rejected' 
                        ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-gray-600 mt-2">Submitted</div>
                  </div>
                  <div className={`flex-1 h-1 ${selectedAppeal.status === 'approved' || selectedAppeal.status === 'rejected' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      selectedAppeal.status === 'approved' ? 'bg-green-500' : selectedAppeal.status === 'rejected' ? 'bg-red-500' : 'bg-gray-300'
                    }`}>
                      {selectedAppeal.status === 'approved' ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : (
                        <XCircle className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="text-gray-600 mt-2">{selectedAppeal.status === 'rejected' ? 'Rejected' : 'Approved'}</div>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-gray-500 mb-1">Created By</div>
                  <div className="text-gray-900">{selectedAppeal.createdBy}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Created Date</div>
                  <div className="text-gray-900">{selectedAppeal.createdDate}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Beneficiary Category</div>
                  <div className="text-gray-900">{selectedAppeal.beneficiaryCategory}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Duration</div>
                  <div className="text-gray-900">{selectedAppeal.duration}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Estimated Amount</div>
                  <div className="text-gray-900">₹{selectedAppeal.estimatedAmount.toLocaleString()}</div>
                </div>
                {selectedAppeal.approvedAmount && (
                  <div>
                    <div className="text-gray-500 mb-1">Approved Amount</div>
                    <div className="text-green-600">₹{selectedAppeal.approvedAmount.toLocaleString()}</div>
                  </div>
                )}
              </div>

              <div>
                <div className="text-gray-700 mb-2">Purpose & Description</div>
                <p className="text-gray-600 leading-relaxed">{selectedAppeal.purpose}</p>
              </div>

              <div>
                <div className="text-gray-700 mb-3">Supporting Documents ({selectedAppeal.documents})</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <div className="text-gray-900">Project Proposal.pdf</div>
                      <div className="text-gray-500">2.4 MB</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <div className="text-gray-900">Budget Breakdown.xlsx</div>
                      <div className="text-gray-500">1.8 MB</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
