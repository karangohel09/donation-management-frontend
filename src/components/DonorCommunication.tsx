import React, { useState, useEffect } from 'react';
import { User } from '../App';
import { Mail, MessageCircle, Send, History, FileText, Users, CheckCircle, Clock, XCircle, AlertCircle, TrendingUp, X, Check } from 'lucide-react';
import { communicationAPI, appealAPI, donorAPI } from '../services/api';

interface DonorCommunicationProps {
  user: User;
}

interface Appeal {
  id: number;
  title: string;
  description: string;
  estimatedAmount: number;
  approvedAmount?: number;
  status: string;
  createdAt: string;
}

interface Donor {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
}

interface AutoTriggeredCommunication {
  id: string;
  appealId: string;
  appealTitle: string;
  triggerType: 'approval' | 'rejection' | 'status_update';
  channels: string[];
  recipientCount: number;
  sentDate: string;
  status: 'sent' | 'pending' | 'failed';
  approverName?: string;
  approvedAmount?: number;
}

// Templates for quick composition
const templates = [
  {
    id: 1,
    name: 'Approval Notification',
    subject: 'Great News! Your Appeal is Approved',
    content: 'Dear Valued Donor,\n\nWe are delighted to inform you that your appeal has been officially approved.\n\nWe will now proceed with implementation and will keep you updated with regular progress reports.\n\nThank you for your generous support and trust in our mission.\n\nBest regards,\nITC × Anoopam Mission Team',
  },
  {
    id: 2,
    name: 'Impact Update',
    subject: 'Impact Report: Your Contribution at Work',
    content: 'Dear Valued Donor,\n\nWe are pleased to share the positive impact of your contribution:\n\n[Impact Details]\n\nYour generous support has made a meaningful difference in the lives of many.\n\nThank you for being part of our mission.\n\nWarm regards,\nITC × Anoopam Mission Team',
  },
];

export default function DonorCommunication({ user }: DonorCommunicationProps) {
  const [activeTab, setActiveTab] = useState<'compose' | 'history' | 'auto-triggered'>('compose');
  const [selectedAppeal, setSelectedAppeal] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<'whatsapp' | 'email' | 'postal'>('email');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [autoTriggeredComms, setAutoTriggeredComms] = useState<AutoTriggeredCommunication[]>([]);
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [selectedDonors, setSelectedDonors] = useState<number[]>([]);
  const [sendToAllDonors, setSendToAllDonors] = useState(false);
  const [showDonorSelector, setShowDonorSelector] = useState(false);
  const [donorSearchTerm, setDonorSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const isReadOnly = user.role === 'viewer' || user.role === 'DONOR';
  
  // Load appeals and communications on component mount
  useEffect(() => {
    loadAppeals();
    loadDonors();
    loadAutoTriggeredCommunications();
  }, []);

  const loadDonors = async () => {
    try {
      const response = await donorAPI.getAllDonors();
      setDonors(response.data || []);
    } catch (err: any) {
      console.error('Error loading donors:', err);
    }
  };
  
  const loadAppeals = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await appealAPI.getAppeals({ status: 'all', page: 1, limit: 100 });
      console.log('Loaded appeals:', response.data);
      setAppeals(response.data || []);
    } catch (err: any) {
      console.error('Error loading appeals:', err);
      setError('Failed to load appeals: ' + (err.response?.status || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Load auto-triggered communications
  useEffect(() => {
    if (activeTab === 'auto-triggered') {
      loadAutoTriggeredCommunications();
    }
  }, [activeTab]);

  const loadAutoTriggeredCommunications = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await communicationAPI.getAutoTriggeredCommunications();
      console.log('Auto-triggered communications loaded:', response.data);
      setAutoTriggeredComms(response.data || []);
    } catch (err: any) {
      console.error('Failed to load auto-triggered communications:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url
      });
      setError(`Failed to load auto-triggered communications: ${err.response?.status || err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendCommunication = async () => {
    if (!selectedAppeal) {
      setError('Please select an appeal');
      return;
    }
    
    if (!sendToAllDonors && selectedDonors.length === 0) {
      setError('Please select at least one donor or enable "Send to All Donors"');
      return;
    }
    
    if (!message.trim()) {
      setError('Please compose a message');
      return;
    }
    
    if (selectedChannel === 'email' && !subject.trim()) {
      setError('Please enter an email subject');
      return;
    }

    setLoading(true);
    setError('');
    
    // Map postal to POSTAL_MAIL for backend
    const channel = selectedChannel === 'postal' ? 'POSTAL_MAIL' : selectedChannel.toUpperCase();
    
    if (!['EMAIL', 'WHATSAPP', 'POSTAL_MAIL'].includes(channel)) {
      setError('Invalid channel selected');
      setLoading(false);
      return;
    }
    
    try {
      const response = await communicationAPI.sendCommunication({
        appealId: parseInt(selectedAppeal),
        channel: channel,
        subject: subject || 'Communication',
        message: message,
        recipientType: sendToAllDonors ? 'ALL_DONORS' : 'SELECTED_DONORS',
        donorIds: sendToAllDonors ? [] : selectedDonors.map(id => parseInt(id.toString())),
      });
      
      console.log('Communication sent successfully:', response.data);
      setSuccessMessage('Communication sent successfully!');
      setSelectedAppeal('');
      setSubject('');
      setMessage('');
      setSelectedTemplate('');
      setSelectedDonors([]);
      setSendToAllDonors(false);
      
      setTimeout(() => setSuccessMessage(''), 3000);
      loadAutoTriggeredCommunications();
    } catch (err: any) {
      console.error('Failed to send communication:', err);
      setError(err.response?.data?.message || 'Failed to send communication: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id.toString() === templateId);
    if (template) {
      setSubject(template.subject);
      setMessage(template.content);
      setSelectedTemplate(templateId);
    }
  };

  const channelIcons = {
    whatsapp: <MessageCircle className="w-5 h-5" />,
    email: <Mail className="w-5 h-5" />,
    postal: <Send className="w-5 h-5" />,
  };

  const statusConfig = {
    sent: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
    pending: { color: 'bg-orange-100 text-orange-700', icon: Clock },
    failed: { color: 'bg-red-100 text-red-700', icon: XCircle },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Donor Communication</h1>
          <p className="text-gray-600">Communicate with donors across multiple channels</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <span className="text-gray-600">Email Sent</span>
          </div>
          <div className="text-gray-900 text-2xl font-bold">
            {autoTriggeredComms.filter(c => c.channel === 'EMAIL').length}
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle className="w-5 h-5 text-green-600" />
            <span className="text-gray-600">WhatsApp Sent</span>
          </div>
          <div className="text-gray-900 text-2xl font-bold">
            {autoTriggeredComms.filter(c => c.channel === 'WHATSAPP').length}
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Send className="w-5 h-5 text-purple-600" />
            <span className="text-gray-600">Failed</span>
          </div>
          <div className="text-gray-900 text-2xl font-bold">
            {autoTriggeredComms.filter(c => c.status === 'failed').length}
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-orange-600" />
            <span className="text-gray-600">Total Recipients</span>
          </div>
          <div className="text-gray-900 text-2xl font-bold">
            {autoTriggeredComms.reduce((sum, c) => sum + (c.recipientCount || 0), 0)}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('compose')}
              className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'compose'
                  ? 'bg-green-50 text-green-700 border-b-2 border-green-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Send className="w-5 h-5" />
              Compose Message
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'history'
                  ? 'bg-green-50 text-green-700 border-b-2 border-green-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <History className="w-5 h-5" />
              Communication History
            </button>
            <button
              onClick={() => setActiveTab('auto-triggered')}
              className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'auto-triggered'
                  ? 'bg-green-50 text-green-700 border-b-2 border-green-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <AlertCircle className="w-5 h-5" />
              Auto-Triggered
            </button>
          </div>
        </div>

        {/* Compose Tab */}
        {activeTab === 'compose' && (
          <div className="p-6 space-y-6">
            {/* Appeal Selection */}
            <div>
              <label className="block text-gray-700 mb-2">Select Appeal *</label>
              <select
                value={selectedAppeal}
                onChange={(e) => setSelectedAppeal(e.target.value)}
                disabled={isReadOnly}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
              >
                <option value="">Choose an appeal</option>
                {appeals.map((appeal) => (
                  <option key={appeal.id} value={appeal.id}>
                    {appeal.title} (Status: {appeal.status})
                  </option>
                ))}
              </select>
              {selectedAppeal && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  {(() => {
                    const appeal = appeals.find(a => a.id.toString() === selectedAppeal);
                    return appeal ? (
                      <>
                        <p className="font-semibold text-blue-900">{appeal.title}</p>
                        <p className="text-sm text-blue-700 mt-1">{appeal.description}</p>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                          <div>
                            <span className="text-blue-600">Estimated:</span>
                            <span className="ml-2 font-semibold">₹{appeal.estimatedAmount?.toLocaleString() || 'N/A'}</span>
                          </div>
                          {appeal.approvedAmount && (
                            <div>
                              <span className="text-blue-600">Approved:</span>
                              <span className="ml-2 font-semibold">₹{appeal.approvedAmount.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </>
                    ) : null;
                  })()}
                </div>
              )}
            </div>

            {/* Channel Selection */}
            <div>
              <label className="block text-gray-700 mb-3">Communication Channel *</label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setSelectedChannel('email')}
                  disabled={isReadOnly}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedChannel === 'email'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Mail className={`w-8 h-8 mx-auto mb-2 ${selectedChannel === 'email' ? 'text-green-600' : 'text-gray-400'}`} />
                  <div className="text-gray-900">Email</div>
                  <div className="text-gray-500">Fast & Digital</div>
                </button>
                <button
                  onClick={() => setSelectedChannel('whatsapp')}
                  disabled={isReadOnly}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedChannel === 'whatsapp'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <MessageCircle className={`w-8 h-8 mx-auto mb-2 ${selectedChannel === 'whatsapp' ? 'text-green-600' : 'text-gray-400'}`} />
                  <div className="text-gray-900">WhatsApp</div>
                  <div className="text-gray-500">Personal Touch</div>
                </button>
                <button
                  onClick={() => setSelectedChannel('postal')}
                  disabled={isReadOnly}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedChannel === 'postal'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Send className={`w-8 h-8 mx-auto mb-2 ${selectedChannel === 'postal' ? 'text-green-600' : 'text-gray-400'}`} />
                  <div className="text-gray-900">Postal</div>
                  <div className="text-gray-500">Formal & Official</div>
                </button>
              </div>
            </div>

            {/* Template Selection */}
            <div>
              <label className="block text-gray-700 mb-2">Use Template (Optional)</label>
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                disabled={isReadOnly}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
              >
                <option value="">Choose a template or compose manually</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>{template.name}</option>
                ))}
              </select>
            </div>

            {/* Subject (Email only) */}
            {selectedChannel === 'email' && (
              <div>
                <label className="block text-gray-700 mb-2">Subject *</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={isReadOnly}
                  placeholder="Enter email subject"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                />
              </div>
            )}

            {/* Message */}
            <div>
              <label className="block text-gray-700 mb-2">Message *</label>
              <textarea
                rows={8}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isReadOnly}
                placeholder="Compose your message here..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-gray-500">Supports merge tags: [Donor Name], [Amount], [Appeal Title]</p>
                <span className="text-gray-500">{message.length} characters</span>
              </div>
            </div>

            {/* Recipient Selection */}
            <div className="border-t border-gray-200 pt-6">
              <label className="block text-gray-700 mb-3">Select Recipients *</label>
              
              {/* Toggle between all donors and specific selection */}
              <div className="flex gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={sendToAllDonors}
                    onChange={() => {
                      setSendToAllDonors(true);
                      setSelectedDonors([]);
                    }}
                    disabled={isReadOnly}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700">Send to All Donors ({donors.length} total)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!sendToAllDonors}
                    onChange={() => setSendToAllDonors(false)}
                    disabled={isReadOnly}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700">Select Specific Donors</span>
                </label>
              </div>

              {/* Donor Selection UI */}
              {!sendToAllDonors && (
                <div className="space-y-3">
                  {/* Open Donor Selector Button */}
                  <button
                    onClick={() => setShowDonorSelector(true)}
                    disabled={isReadOnly}
                    className="w-full px-4 py-3 border-2 border-dashed border-green-300 rounded-lg text-green-700 hover:bg-green-50 transition-colors disabled:opacity-50"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Users className="w-5 h-5" />
                      <span>
                        {selectedDonors.length === 0
                          ? 'Click to select donors'
                          : `${selectedDonors.length} donor${selectedDonors.length !== 1 ? 's' : ''} selected`}
                      </span>
                    </div>
                  </button>

                  {/* Selected Donors List */}
                  {selectedDonors.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-blue-900">Selected Recipients ({selectedDonors.length})</h4>
                        <button
                          onClick={() => setSelectedDonors([])}
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          Clear all
                        </button>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {selectedDonors.map((donorId) => {
                          const donor = donors.find(d => d.id === donorId);
                          return donor ? (
                            <div
                              key={donorId}
                              className="flex items-center justify-between bg-white p-2 rounded border border-blue-100"
                            >
                              <div className="text-sm">
                                <p className="font-medium text-gray-900">{donor.name}</p>
                                <p className="text-gray-600">{donor.email}</p>
                              </div>
                              <button
                                onClick={() => setSelectedDonors(prev => prev.filter(id => id !== donorId))}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Donor Selector Modal */}
              {showDonorSelector && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 flex flex-col">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Select Donors</h3>
                      <button
                        onClick={() => setShowDonorSelector(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Search */}
                    <div className="p-4 border-b border-gray-200">
                      <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={donorSearchTerm}
                        onChange={(e) => setDonorSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    {/* Donor List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                      {donors
                        .filter(
                          (donor) =>
                            donor.name.toLowerCase().includes(donorSearchTerm.toLowerCase()) ||
                            donor.email.toLowerCase().includes(donorSearchTerm.toLowerCase())
                        )
                        .map((donor) => (
                          <label
                            key={donor.id}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-100"
                          >
                            <input
                              type="checkbox"
                              checked={selectedDonors.includes(donor.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedDonors([...selectedDonors, donor.id]);
                                } else {
                                  setSelectedDonors(selectedDonors.filter(id => id !== donor.id));
                                }
                              }}
                              className="w-5 h-5 text-green-600 rounded"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{donor.name}</p>
                              <p className="text-sm text-gray-600">{donor.email}</p>
                              <p className="text-xs text-gray-500">{donor.phoneNumber}</p>
                            </div>
                            {selectedDonors.includes(donor.id) && (
                              <Check className="w-5 h-5 text-green-600" />
                            )}
                          </label>
                        ))}
                    </div>

                    {/* Modal Footer */}
                    <div className="flex gap-3 p-4 border-t border-gray-200">
                      <button
                        onClick={() => setShowDonorSelector(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setShowDonorSelector(false)}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Done ({selectedDonors.length} selected)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            {!isReadOnly && (
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => {
                    setMessage('');
                    setSubject('');
                    setSelectedAppeal('');
                    setSelectedDonors([]);
                    setSendToAllDonors(false);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Clear
                </button>
                <button 
                  onClick={handleSendCommunication}
                  disabled={loading || !selectedAppeal || !message.trim() || (!sendToAllDonors && selectedDonors.length === 0)}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  <Send className="w-5 h-5" />
                  {loading ? 'Sending...' : 'Send Communication'}
                </button>
              </div>
            )}
            
            {/* Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>{error}</div>
              </div>
            )}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>{successMessage}</div>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : autoTriggeredComms.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No communications sent yet</p>
                <p className="text-gray-400 text-sm mt-1">Compose a new message to send to donors</p>
              </div>
            ) : (
              <div className="space-y-4">
                {autoTriggeredComms.map((comm) => {
                  const StatusIcon = statusConfig[comm.status.toLowerCase() as keyof typeof statusConfig]?.icon || CheckCircle;
                  return (
                    <div key={comm.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{comm.appealTitle}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Sent to {comm.recipientCount} recipient{comm.recipientCount !== 1 ? 's' : ''} via {comm.channels?.join(', ') || 'Email'}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(comm.sentDate).toLocaleDateString()} at {new Date(comm.sentDate).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[comm.status.toLowerCase() as keyof typeof statusConfig]?.color || 'bg-gray-100 text-gray-700'}`}>
                            {comm.status.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Auto-Triggered Communications Tab */}
        {activeTab === 'auto-triggered' && (
          <div className="p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3 mb-6">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>{error}</div>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : autoTriggeredComms.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No auto-triggered communications yet</p>
                <p className="text-gray-400 text-sm mt-1">Communications will appear here when appeals are approved or rejected</p>
              </div>
            ) : (
              <div className="space-y-4">
                {autoTriggeredComms.map((comm) => {
                  const StatusIcon = statusConfig[comm.status].icon;
                  const triggerLabels: Record<string, { label: string; color: string }> = {
                    approval: { label: 'Approval Notification', color: 'bg-green-100 text-green-700' },
                    rejection: { label: 'Rejection Notification', color: 'bg-red-100 text-red-700' },
                    status_update: { label: 'Status Update', color: 'bg-blue-100 text-blue-700' },
                  };

                  const triggerInfo = triggerLabels[comm.triggerType];

                  return (
                    <div key={comm.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="text-gray-900 font-medium">{comm.appealTitle}</div>
                            <div className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                              {comm.appealId}
                            </div>
                            <div className={`px-2 py-1 rounded text-sm font-medium ${triggerInfo.color}`}>
                              {triggerInfo.label}
                            </div>
                          </div>
                          
                          {comm.triggerType === 'approval' && comm.approvedAmount && (
                            <div className="text-gray-600 text-sm mb-2">
                              Approved Amount: <span className="font-semibold text-green-600">₹{comm.approvedAmount.toLocaleString()}</span>
                              {comm.approverName && <span> by {comm.approverName}</span>}
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-gray-600 text-sm">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {comm.recipientCount} recipients
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              {comm.channels.length > 1 ? (
                                <>Multiple channels: {comm.channels.join(', ')}</>
                              ) : (
                                comm.channels[0] && channelIcons[comm.channels[0] as 'email' | 'whatsapp' | 'postal']
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`px-3 py-1 rounded-full inline-flex items-center gap-2 mb-2 ${statusConfig[comm.status].color}`}>
                            <StatusIcon className="w-4 h-4" />
                            <span className="capitalize">{comm.status}</span>
                          </div>
                          <div className="text-gray-500 text-sm">{comm.sentDate}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
