import React, { useState, useEffect } from 'react';
import { User } from '../App';
import { Plus, Search, Filter, Eye, Edit, Trash2, FileText, Calendar, DollarSign, CheckCircle, Clock, XCircle, FileUp } from 'lucide-react';
import { appealAPI } from '../services/api';

interface AppealManagementProps {
  user: User;
}

interface Appeal {
  id: string;
  title: string;
  description?: string;
  purpose?: string;
  estimatedAmount?: number;
  approvedAmount?: number;
  category?: string;
  beneficiaryCategory?: string;
  duration?: string;
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'draft' | 'submitted' | 'approved' | 'rejected';
  createdBy?: string;
  createdDate?: string;
  createdAt?: string;
  documents?: number;
}

interface Document {
  id: number;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}

export default function AppealManagement({ user }: AppealManagementProps) {
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  const [appealDocuments, setAppealDocuments] = useState<Document[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [creating, setCreating] = useState(false);

  // Check if user can create appeals
  const canCreate = ['SUPER_ADMIN', 'ITC_ADMIN', 'MISSION_ADMIN'].includes(user.role);
  
  // Check if user is in read-only mode (VIEWER role)
  const isReadOnly = user.role === 'VIEWER';

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    estimatedAmount: '',
    duration: '',
    beneficiaryCategory: '',
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Fetch appeals from backend on mount
  useEffect(() => {
    fetchAppeals();
  }, []);

  const fetchAppeals = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await appealAPI.getAppeals({});
      console.log('Appeals fetched:', response.data);
      
      // Transform backend data to match frontend interface
      const transformedAppeals = response.data.map((appeal: any) => ({
        id: appeal.id?.toString() || '',
        title: appeal.title || '',
        description: appeal.description || '',
        purpose: appeal.description || '',
        estimatedAmount: appeal.estimatedAmount || 0,
        approvedAmount: appeal.approvedAmount,
        category: appeal.category || '',
        beneficiaryCategory: appeal.category || '',
        duration: appeal.duration || '',
        status: (appeal.status || 'PENDING').toLowerCase(),
        createdBy: appeal.createdBy?.name || 'Unknown',
        createdDate: appeal.createdAt ? new Date(appeal.createdAt).toISOString().split('T')[0] : '',
        documents: appeal.documents || 0,
      }));
      
      setAppeals(transformedAppeals);
    } catch (err: any) {
      console.error('Failed to fetch appeals:', err);
      setError('Failed to load appeals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAppeal = async (isDraft: boolean) => {
    if (!formData.title || !formData.description || !formData.estimatedAmount || !formData.beneficiaryCategory || !formData.duration) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setCreating(true);
      const payload = {
        title: formData.title,
        description: formData.description,
        estimatedAmount: parseFloat(formData.estimatedAmount),
        beneficiaryCategory: formData.beneficiaryCategory,
        duration: formData.duration,
      };

      const response = await appealAPI.createAppeal(payload);
      const appealId = response.data.id;
      console.log('Appeal created with ID:', appealId);
      
      // Upload files if any were selected
      if (uploadedFiles.length > 0 && appealId) {
        console.log('Starting document uploads, file count:', uploadedFiles.length);
        for (const file of uploadedFiles) {
          const formDataWithFile = new FormData();
          formDataWithFile.append('file', file);
          try {
            console.log('Uploading file:', file.name, 'to appeal:', appealId);
            const uploadResponse = await appealAPI.uploadDocument(appealId.toString(), formDataWithFile);
            console.log('File uploaded successfully:', file.name, 'Response:', uploadResponse);
          } catch (err) {
            console.error('Failed to upload document:', file.name, err);
          }
        }
      }
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        estimatedAmount: '',
        duration: '',
        beneficiaryCategory: '',
      });
      setUploadedFiles([]);
      
      setShowCreateModal(false);
      setError('');
      
      // Refetch appeals to show the new one
      await fetchAppeals();
    } catch (err: any) {
      console.error('Failed to create appeal:', err);
      setError(err.response?.data?.message || 'Failed to create appeal. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setUploadedFiles(prev => [...prev, ...Array.from(files)]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const statusConfig = {
    draft: { color: 'bg-gray-100 text-gray-700', icon: FileText },
    pending: { color: 'bg-gray-100 text-gray-700', icon: FileText },
    submitted: { color: 'bg-orange-100 text-orange-700', icon: Clock },
    approved: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
    rejected: { color: 'bg-red-100 text-red-700', icon: XCircle },
  };

  const filteredAppeals = appeals.filter(appeal => {
    const matchesStatus = filterStatus === 'all' || appeal.status === filterStatus;
    const matchesSearch = appeal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (appeal.purpose?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          appeal.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleViewDetails = async (appeal: Appeal) => {
    setSelectedAppeal(appeal);
    setShowDetailModal(true);
    
    // Fetch documents for this appeal
    setLoadingDocuments(true);
    try {
      console.log('Fetching documents for appeal ID:', appeal.id);
      
      // Use the proper API method to fetch documents
      const docsResponse = await appealAPI.getAppealDocuments(appeal.id);
      console.log('Full documents response:', docsResponse);
      console.log('Documents response data:', docsResponse.data);
      console.log('Documents data type:', typeof docsResponse.data);
      console.log('Documents data is array?', Array.isArray(docsResponse.data));
      
      // Handle both array and object responses
      let docs = [];
      if (Array.isArray(docsResponse.data)) {
        docs = docsResponse.data;
      } else if (docsResponse.data) {
        docs = docsResponse.data.documents || [];
      }
      
      console.log('Processed documents:', docs);
      console.log('Number of documents:', docs.length);
      
      setAppealDocuments(docs);
    } catch (err: any) {
      console.error('Failed to fetch documents - Error details:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url
      });
      setAppealDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

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
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
            <p className="text-gray-600">Loading appeals...</p>
          </div>
        ) : filteredAppeals.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No appeals found</p>
          </div>
        ) : (
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
                  const StatusIcon = statusConfig[appeal.status]?.icon || FileText;
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
                        <div className="text-gray-500 line-clamp-1">{appeal.purpose || appeal.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full inline-block">
                          {appeal.beneficiaryCategory || appeal.category || 'General'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900">₹{(appeal.estimatedAmount || 0 / 1000).toFixed(0)}</div>
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
        )}
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
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-gray-700 mb-2">Appeal Title *</label>
                <input
                  type="text"
                  placeholder="e.g., Education Support Program 2024"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Purpose & Description *</label>
                <textarea
                  rows={4}
                  placeholder="Describe the purpose and impact of this appeal..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Estimated Amount (₹) *</label>
                  <input
                    type="number"
                    placeholder="500000"
                    value={formData.estimatedAmount}
                    onChange={(e) => setFormData({...formData, estimatedAmount: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Duration *</label>
                  <input
                    type="text"
                    placeholder="e.g., 12 months"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Beneficiary Category *</label>
                <select 
                  value={formData.beneficiaryCategory}
                  onChange={(e) => setFormData({...formData, beneficiaryCategory: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Category</option>
                  <option value="Education">Education</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Social Welfare">Social Welfare</option>
                  <option value="Emergency">Emergency Relief</option>
                  <option value="Environment">Environment</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Supporting Documents</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors cursor-pointer">
                  <input
                    type="file"
                    id="fileUpload"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="fileUpload" className="cursor-pointer block">
                    <FileUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-1">Click to upload or drag and drop</p>
                    <p className="text-gray-500">PDF, DOC, or images (max 10MB)</p>
                  </label>
                </div>
                
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="text-gray-700 font-medium">Uploaded Files ({uploadedFiles.length})</div>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div className="flex-1 min-w-0">
                          <div className="text-gray-900 truncate">{file.name}</div>
                          <div className="text-gray-500 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ title: '', description: '', estimatedAmount: '', duration: '', beneficiaryCategory: '' });
                  }}
                  disabled={creating}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSubmitAppeal(true)}
                  disabled={creating}
                  className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Save as Draft'}
                </button>
                <button
                  onClick={() => handleSubmitAppeal(false)}
                  disabled={creating}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {creating ? 'Submitting...' : 'Submit for Approval'}
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
                <div className="text-gray-700 mb-3">Supporting Documents ({appealDocuments.length})</div>
                {loadingDocuments ? (
                  <div className="p-4 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    <p className="text-gray-600 mt-2">Loading documents...</p>
                  </div>
                ) : appealDocuments.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p>No documents uploaded</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {appealDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div className="flex-1 min-w-0">
                          <div className="text-gray-900 truncate">{doc.fileName}</div>
                          <div className="text-gray-500 text-sm">{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
