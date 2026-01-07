import React, { useState } from 'react';
import { User } from '../App';
import { CheckCircle, XCircle, Clock, FileText, Calendar, DollarSign, User as UserIcon, MessageSquare } from 'lucide-react';

interface ApprovalWorkflowProps {
  user: User;
}

interface PendingAppeal {
  id: string;
  title: string;
  purpose: string;
  requestedAmount: number;
  category: string;
  duration: string;
  submittedBy: string;
  submittedDate: string;
  documents: number;
  priority: 'high' | 'medium' | 'low';
}

const pendingAppeals: PendingAppeal[] = [
  {
    id: 'APP-2024-002',
    title: 'Healthcare Equipment Purchase',
    purpose: 'Medical equipment for community health center including X-ray machine, ultrasound, and diagnostic tools',
    requestedAmount: 350000,
    category: 'Healthcare',
    duration: '6 months',
    submittedBy: 'Amit Patel',
    submittedDate: '2024-12-20',
    documents: 5,
    priority: 'high',
  },
  {
    id: 'APP-2024-003',
    title: 'Clean Water Project',
    purpose: 'Installation of water purification systems in 5 villages benefiting approximately 2000 families',
    requestedAmount: 450000,
    category: 'Infrastructure',
    duration: '9 months',
    submittedBy: 'Rajesh Kumar',
    submittedDate: '2024-12-22',
    documents: 4,
    priority: 'high',
  },
  {
    id: 'APP-2024-007',
    title: 'Digital Literacy Program',
    purpose: 'Computer training and digital literacy workshops for youth in rural areas',
    requestedAmount: 180000,
    category: 'Education',
    duration: '6 months',
    submittedBy: 'Priya Sharma',
    submittedDate: '2024-12-24',
    documents: 3,
    priority: 'medium',
  },
  {
    id: 'APP-2024-008',
    title: 'Organic Farming Initiative',
    purpose: 'Training and resources for transitioning to organic farming methods',
    requestedAmount: 280000,
    category: 'Agriculture',
    duration: '12 months',
    submittedBy: 'Amit Patel',
    submittedDate: '2024-12-26',
    documents: 4,
    priority: 'medium',
  },
];

export default function ApprovalWorkflow({ user }: ApprovalWorkflowProps) {
  const [selectedAppeal, setSelectedAppeal] = useState<PendingAppeal | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [approvedAmount, setApprovedAmount] = useState('');
  const [remarks, setRemarks] = useState('');
  const [conditions, setConditions] = useState('');

  const handleReview = (appeal: PendingAppeal) => {
    setSelectedAppeal(appeal);
    setApprovedAmount(appeal.requestedAmount.toString());
    setRemarks('');
    setConditions('');
  };

  const handleApproval = (action: 'approve' | 'reject') => {
    setApprovalAction(action);
    setShowApprovalModal(true);
  };

  const handleConfirm = () => {
    setShowApprovalModal(false);
    setSelectedAppeal(null);
  };

  const priorityConfig = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-orange-100 text-orange-700',
    low: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Approval Workflow</h1>
          <p className="text-gray-600">Review and approve donation appeals</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg">
            {pendingAppeals.length} Pending Reviews
          </div>
        </div>
      </div>

      {/* Approval Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <span className="text-gray-600">Pending</span>
          </div>
          <div className="text-gray-900">4 Appeals</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-gray-600">Approved This Month</span>
          </div>
          <div className="text-gray-900">12 Appeals</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span className="text-gray-600">Total Amount</span>
          </div>
          <div className="text-gray-900">₹12.6L</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-purple-600" />
            <span className="text-gray-600">Avg. Review Time</span>
          </div>
          <div className="text-gray-900">2.3 days</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Appeals List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-gray-900 mb-4">Pending Appeals</div>
            <div className="space-y-3">
              {pendingAppeals.map((appeal) => (
                <div
                  key={appeal.id}
                  onClick={() => handleReview(appeal)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedAppeal?.id === appeal.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-gray-900 line-clamp-1">{appeal.title}</div>
                    <div className={`px-2 py-1 rounded text-xs ${priorityConfig[appeal.priority]}`}>
                      {appeal.priority}
                    </div>
                  </div>
                  <div className="text-gray-500 mb-2">{appeal.id}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">₹{(appeal.requestedAmount / 1000).toFixed(0)}K</span>
                    <span className="text-gray-500">{appeal.submittedDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Appeal Review Panel */}
        <div className="lg:col-span-2">
          {selectedAppeal ? (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
                <div className="text-white mb-2">{selectedAppeal.title}</div>
                <div className="flex items-center gap-4 text-green-100">
                  <span>{selectedAppeal.id}</span>
                  <span>•</span>
                  <span>{selectedAppeal.category}</span>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Requestor Info */}
                <div className="grid grid-cols-2 gap-6 pb-6 border-b border-gray-200">
                  <div>
                    <div className="text-gray-500 mb-1">Submitted By</div>
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{selectedAppeal.submittedBy}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Submitted Date</div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{selectedAppeal.submittedDate}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Duration</div>
                    <div className="text-gray-900">{selectedAppeal.duration}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Documents</div>
                    <div className="text-gray-900">{selectedAppeal.documents} files attached</div>
                  </div>
                </div>

                {/* Purpose */}
                <div>
                  <div className="text-gray-700 mb-2">Purpose & Description</div>
                  <p className="text-gray-600 leading-relaxed">{selectedAppeal.purpose}</p>
                </div>

                {/* Amount Requested */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-gray-700 mb-1">Requested Amount</div>
                  <div className="text-gray-900">₹{selectedAppeal.requestedAmount.toLocaleString()}</div>
                </div>

                {/* Approval Form */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-gray-700 mb-2">Approved Amount (₹) *</label>
                    <input
                      type="number"
                      value={approvedAmount}
                      onChange={(e) => setApprovedAmount(e.target.value)}
                      placeholder="Enter approved amount"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-gray-500 mt-1">You can approve a different amount than requested</p>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Approval Remarks</label>
                    <textarea
                      rows={3}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Enter your remarks or feedback..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Conditions (if any)</label>
                    <textarea
                      rows={2}
                      value={conditions}
                      onChange={(e) => setConditions(e.target.value)}
                      placeholder="Special conditions or requirements..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleApproval('reject')}
                    className="flex-1 px-6 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject Appeal
                  </button>
                  <button
                    onClick={() => handleApproval('approve')}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Approve Appeal
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 h-full flex items-center justify-center p-12">
              <div className="text-center">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <div className="text-gray-900 mb-2">No Appeal Selected</div>
                <p className="text-gray-500">Select an appeal from the list to review and approve</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
              approvalAction === 'approve' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {approvalAction === 'approve' ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600" />
              )}
            </div>
            
            <h3 className="text-gray-900 text-center mb-2">
              {approvalAction === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
            </h3>
            <p className="text-gray-600 text-center mb-6">
              {approvalAction === 'approve'
                ? `Are you sure you want to approve this appeal with an amount of ₹${parseInt(approvedAmount).toLocaleString()}?`
                : 'Are you sure you want to reject this appeal? This action cannot be undone.'}
            </p>

            {approvalAction === 'approve' && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Appeal ID:</span>
                  <span className="text-gray-900">{selectedAppeal?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Approved Amount:</span>
                  <span className="text-green-600">₹{parseInt(approvedAmount).toLocaleString()}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 px-6 py-3 rounded-lg transition-colors ${
                  approvalAction === 'approve'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {approvalAction === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
