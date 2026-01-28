import React, { useState, useEffect } from 'react';
import { User } from '../App';
import { CheckCircle, XCircle, Clock, FileText, Calendar, DollarSign, User as UserIcon, MessageSquare, AlertCircle } from 'lucide-react';
import { approvalAPI } from '../services/api';

interface ApprovalWorkflowProps {
  user: User;
}

interface PendingAppeal {
  id: number;
  title: string;
  description: string;
  estimatedAmount: number;
  beneficiaryCategory: string;
  duration: string;
  status: string;
  createdAt: string;
  createdBy?: {
    id: number;
    name: string;
    email: string;
  };
  documents: number;
  rejectionReason?: string;
}

export default function ApprovalWorkflow({ user }: ApprovalWorkflowProps) {
  const [appeals, setAppeals] = useState<PendingAppeal[]>([]);
  const [selectedAppeal, setSelectedAppeal] = useState<PendingAppeal | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [approvedAmount, setApprovedAmount] = useState('');
  const [remarks, setRemarks] = useState('');
  const [conditions, setConditions] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch pending appeals on mount
  useEffect(() => {
    fetchPendingAppeals();
  }, []);

  const fetchPendingAppeals = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await approvalAPI.getPendingApprovals();
      console.log('Pending appeals:', response.data);
      setAppeals(response.data);
    } catch (err: any) {
      console.error('Failed to fetch pending appeals:', err);
      setError('Failed to load pending appeals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (appeal: PendingAppeal) => {
    setSelectedAppeal(appeal);
    setApprovedAmount(appeal.estimatedAmount.toString());
    setRemarks('');
    setConditions('');
    setRejectionReason('');
  };

  const handleApproval = (action: 'approve' | 'reject') => {
    // If clicking the same action button that's already active, validate and show modal
    if (approvalAction === action) {
      if (action === 'approve' && (!approvedAmount || parseFloat(approvedAmount) <= 0)) {
        setError('Please enter a valid approved amount');
        return;
      } else if (action === 'reject' && !rejectionReason.trim()) {
        setError('Please enter a rejection reason');
        return;
      }
      // All validations passed, show modal
      setError('');
      setShowApprovalModal(true);
    } else {
      // First time clicking this action, just set the action state to show the form
      setApprovalAction(action);
      setError('');
    }
  };

  const handleConfirm = async () => {
    if (!selectedAppeal) return;

    try {
      setSubmitting(true);
      setError('');

      if (approvalAction === 'approve') {
        console.log('Approving appeal:', selectedAppeal.id, 'Amount:', approvedAmount);
        await approvalAPI.approveAppeal(selectedAppeal.id.toString(), {
          approvedAmount: parseFloat(approvedAmount),
          remarks,
        });
        console.log('Appeal approved successfully');
      } else if (approvalAction === 'reject') {
        console.log('Rejecting appeal:', selectedAppeal.id, 'Reason:', rejectionReason);
        await approvalAPI.rejectAppeal(selectedAppeal.id.toString(), rejectionReason);
        console.log('Appeal rejected successfully');
      }

      // Refresh the list
      await fetchPendingAppeals();
      
      setShowApprovalModal(false);
      setSelectedAppeal(null);
      setApprovalAction('approve');
      setApprovedAmount('');
      setRemarks('');
      setRejectionReason('');
    } catch (err: any) {
      console.error('Failed to process approval:', err);
      setError(err.response?.data?.message || 'Failed to process request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Approval Workflow</h1>
          <p className="text-gray-600">Review and approve donation appeals</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg">
            {appeals.length} Pending Reviews
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
          <div className="text-gray-900">{appeals.length} Appeals</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-gray-600">Total Requested</span>
          </div>
          <div className="text-gray-900">₹{(appeals.reduce((sum, a) => sum + a.estimatedAmount, 0) / 100000).toFixed(1)}L</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span className="text-gray-600">Avg Amount</span>
          </div>
          <div className="text-gray-900">₹{(appeals.length > 0 ? appeals.reduce((sum, a) => sum + a.estimatedAmount, 0) / appeals.length : 0).toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-purple-600" />
            <span className="text-gray-600">Total Documents</span>
          </div>
          <div className="text-gray-900">{appeals.reduce((sum, a) => sum + a.documents, 0)} files</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Appeals List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-gray-900 mb-4">Pending Appeals</div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : appeals.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No pending appeals</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appeals.map((appeal) => (
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
                      <div className="text-gray-900 line-clamp-1 text-sm">{appeal.title}</div>
                    </div>
                    <div className="text-gray-500 text-xs mb-2">#{appeal.id}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">₹{(appeal.estimatedAmount / 1000).toFixed(0)}K</span>
                      <span className="text-gray-500 text-xs">{new Date(appeal.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                  <span>#{selectedAppeal.id}</span>
                  <span>•</span>
                  <span>{selectedAppeal.beneficiaryCategory}</span>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Requestor Info */}
                <div className="grid grid-cols-2 gap-6 pb-6 border-b border-gray-200">
                  <div>
                    <div className="text-gray-500 mb-1">Submitted By</div>
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{selectedAppeal.createdBy?.name || 'Unknown'}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Submitted Date</div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{new Date(selectedAppeal.createdAt).toLocaleDateString()}</span>
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
                  <p className="text-gray-600 leading-relaxed">{selectedAppeal.description}</p>
                </div>

                {/* Amount Requested */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-gray-700 mb-1">Requested Amount</div>
                  <div className="text-gray-900">₹{selectedAppeal.estimatedAmount.toLocaleString()}</div>
                </div>

                {/* Rejection Reason - Show if appeal is rejected */}
                {selectedAppeal.status === 'REJECTED' && selectedAppeal.rejectionReason && (
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div className="text-red-700 mb-2 font-medium">Rejection Reason</div>
                    <div className="text-gray-700">{selectedAppeal.rejectionReason}</div>
                  </div>
                )}

                {/* Approval Form */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  {/* Always show rejection reason if action is reject */}
                  {approvalAction === 'reject' && (
                    <div>
                      <label className="block text-gray-700 mb-2">Rejection Reason *</label>
                      <textarea
                        rows={4}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Please provide a reason for rejection..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <p className="text-gray-500 mt-1 text-sm">This reason will be communicated to the applicant</p>
                    </div>
                  )}

                  {/* Approve form fields */}
                  {approvalAction === 'approve' && (
                    <>
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
                    </>
                  )}
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
                  <span className="text-gray-900">#{selectedAppeal?.id}</span>
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
                disabled={submitting}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={submitting}
                className={`flex-1 px-6 py-3 rounded-lg transition-colors disabled:opacity-50 ${
                  approvalAction === 'approve'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {submitting ? 'Processing...' : approvalAction === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
