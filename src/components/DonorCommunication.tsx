import React, { useState } from 'react';
import { User } from '../App';
import { Mail, MessageCircle, Send, History, FileText, Users, CheckCircle, Clock, XCircle } from 'lucide-react';

interface DonorCommunicationProps {
  user: User;
}

interface CommunicationHistory {
  id: string;
  appealId: string;
  appealTitle: string;
  channel: 'whatsapp' | 'email' | 'postal';
  recipients: number;
  status: 'sent' | 'pending' | 'failed';
  sentBy: string;
  sentDate: string;
  message: string;
}

const communicationHistory: CommunicationHistory[] = [
  {
    id: 'COM-001',
    appealId: 'APP-2024-001',
    appealTitle: 'Education Support Program 2024',
    channel: 'email',
    recipients: 145,
    status: 'sent',
    sentBy: 'Priya Sharma',
    sentDate: '2024-12-27 10:30 AM',
    message: 'Thank you for your generous support...',
  },
  {
    id: 'COM-002',
    appealId: 'APP-2024-005',
    appealTitle: 'Rural Infrastructure Development',
    channel: 'whatsapp',
    recipients: 89,
    status: 'sent',
    sentBy: 'Rajesh Kumar',
    sentDate: '2024-12-26 02:15 PM',
    message: 'We are pleased to inform you...',
  },
  {
    id: 'COM-003',
    appealId: 'APP-2024-001',
    appealTitle: 'Education Support Program 2024',
    channel: 'postal',
    recipients: 23,
    status: 'pending',
    sentBy: 'Priya Sharma',
    sentDate: '2024-12-25 09:00 AM',
    message: 'Official acknowledgment letter...',
  },
];

const templates = [
  {
    id: 1,
    name: 'Donation Thank You',
    subject: 'Thank You for Your Generous Donation',
    content: 'Dear [Donor Name],\n\nWe are deeply grateful for your generous donation of ₹[Amount] to support [Appeal Title].\n\nYour contribution will make a significant difference in the lives of [Beneficiaries].\n\nWith gratitude,\nITC × Anoopam Mission Team',
  },
  {
    id: 2,
    name: 'Appeal Announcement',
    subject: 'New Appeal: [Appeal Title]',
    content: 'Dear [Donor Name],\n\nWe are excited to share a new initiative: [Appeal Title].\n\n[Appeal Description]\n\nWe invite you to be part of this meaningful journey.\n\nBest regards,\nITC × Anoopam Mission Team',
  },
  {
    id: 3,
    name: 'Impact Update',
    subject: 'Impact Report: Your Donation at Work',
    content: 'Dear [Donor Name],\n\nWe are pleased to share the impact of your donation:\n\n[Impact Details]\n\nThank you for making this possible.\n\nWarm regards,\nITC × Anoopam Mission Team',
  },
];

export default function DonorCommunication({ user }: DonorCommunicationProps) {
  const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');
  const [selectedAppeal, setSelectedAppeal] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<'whatsapp' | 'email' | 'postal'>('email');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const isReadOnly = user.role === 'viewer';

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
          <div className="text-gray-900">145</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle className="w-5 h-5 text-green-600" />
            <span className="text-gray-600">WhatsApp Sent</span>
          </div>
          <div className="text-gray-900">89</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Send className="w-5 h-5 text-purple-600" />
            <span className="text-gray-600">Postal Mail</span>
          </div>
          <div className="text-gray-900">23</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-orange-600" />
            <span className="text-gray-600">Total Recipients</span>
          </div>
          <div className="text-gray-900">257</div>
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
                <option value="APP-2024-001">Education Support Program 2024</option>
                <option value="APP-2024-005">Rural Infrastructure Development</option>
                <option value="APP-2024-002">Healthcare Equipment Purchase</option>
              </select>
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

            {/* Recipient Preview */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <Users className="w-5 h-5" />
                <span>Recipient Preview</span>
              </div>
              <p className="text-blue-600">
                This message will be sent to all donors associated with the selected appeal (estimated 45 recipients)
              </p>
            </div>

            {/* Actions */}
            {!isReadOnly && (
              <div className="flex gap-3 pt-4">
                <button className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Save as Draft
                </button>
                <button className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                  <Send className="w-5 h-5" />
                  Send Communication
                </button>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="p-6">
            <div className="space-y-4">
              {communicationHistory.map((comm) => {
                const StatusIcon = statusConfig[comm.status].icon;
                return (
                  <div key={comm.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-gray-900">{comm.appealTitle}</div>
                          <div className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                            {comm.appealId}
                          </div>
                        </div>
                        <div className="text-gray-500 mb-2">{comm.message}</div>
                        <div className="flex items-center gap-4 text-gray-600">
                          <span className="flex items-center gap-1">
                            {channelIcons[comm.channel]}
                            <span className="capitalize">{comm.channel}</span>
                          </span>
                          <span>•</span>
                          <span>{comm.recipients} recipients</span>
                          <span>•</span>
                          <span>By {comm.sentBy}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`px-3 py-1 rounded-full inline-flex items-center gap-2 mb-2 ${statusConfig[comm.status].color}`}>
                          <StatusIcon className="w-4 h-4" />
                          <span className="capitalize">{comm.status}</span>
                        </div>
                        <div className="text-gray-500">{comm.sentDate}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
