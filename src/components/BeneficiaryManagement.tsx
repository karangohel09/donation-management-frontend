import React, { useState } from 'react';
import { User } from '../App';
import { Plus, Search, Users, Eye, MapPin, Phone, Mail, MessageSquare, Image as ImageIcon, Star } from 'lucide-react';

interface BeneficiaryManagementProps {
  user: User;
}

interface Beneficiary {
  id: string;
  name: string;
  category: string;
  location: string;
  phone: string;
  email: string;
  appealId: string;
  appealTitle: string;
  impactReceived: string;
  feedbackRating: number;
  feedbackText: string;
  hasImages: boolean;
  registeredDate: string;
  registeredBy: string;
}

const mockBeneficiaries: Beneficiary[] = [
  {
    id: 'BEN-2024-001',
    name: 'Ramesh Kumar',
    category: 'Education',
    location: 'Village Baghpat, District Meerut, UP',
    phone: '+91 98765 12345',
    email: 'ramesh.k@email.com',
    appealId: 'APP-2024-001',
    appealTitle: 'Education Support Program 2024',
    impactReceived: 'Received full scholarship and educational materials for son\'s higher education',
    feedbackRating: 5,
    feedbackText: 'This support has changed my son\'s future. We are extremely grateful for this opportunity.',
    hasImages: true,
    registeredDate: '2024-12-15',
    registeredBy: 'Priya Sharma',
  },
  {
    id: 'BEN-2024-002',
    name: 'Lakshmi Devi',
    category: 'Healthcare',
    location: 'Jharkhand Village, Ranchi District',
    phone: '+91 97654 32109',
    email: 'lakshmi.d@email.com',
    appealId: 'APP-2024-002',
    appealTitle: 'Healthcare Equipment Purchase',
    impactReceived: 'Access to medical equipment and free health checkup at community center',
    feedbackRating: 5,
    feedbackText: 'The medical facilities have improved greatly. My family can now get proper treatment locally.',
    hasImages: true,
    registeredDate: '2024-12-18',
    registeredBy: 'Amit Patel',
  },
  {
    id: 'BEN-2024-003',
    name: 'Vijay Patil',
    category: 'Infrastructure',
    location: 'Satara District, Maharashtra',
    phone: '+91 96543 21098',
    email: 'vijay.p@email.com',
    appealId: 'APP-2024-005',
    appealTitle: 'Rural Infrastructure Development',
    impactReceived: 'New road connectivity to village, improved transportation',
    feedbackRating: 4,
    feedbackText: 'The new road has made it much easier to transport our produce to the market. Business has improved.',
    hasImages: true,
    registeredDate: '2024-12-10',
    registeredBy: 'Rajesh Kumar',
  },
  {
    id: 'BEN-2024-004',
    name: 'Sunita Sharma',
    category: 'Social Welfare',
    location: 'Ajmer District, Rajasthan',
    phone: '+91 95432 10987',
    email: 'sunita.s@email.com',
    appealId: 'APP-2024-004',
    appealTitle: 'Women Empowerment Initiative',
    impactReceived: 'Skill training and micro-loan for starting tailoring business',
    feedbackRating: 5,
    feedbackText: 'I am now financially independent and supporting my family. Thank you for believing in us.',
    hasImages: false,
    registeredDate: '2024-12-25',
    registeredBy: 'Priya Sharma',
  },
];

export default function BeneficiaryManagement({ user }: BeneficiaryManagementProps) {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(mockBeneficiaries);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const isReadOnly = user.role === 'viewer';
  const canCreate = user.role !== 'viewer';

  const filteredBeneficiaries = beneficiaries.filter(ben => {
    const matchesCategory = filterCategory === 'all' || ben.category === filterCategory;
    const matchesSearch = 
      ben.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ben.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ben.appealTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ben.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const avgRating = beneficiaries.reduce((sum, b) => sum + b.feedbackRating, 0) / beneficiaries.length;

  const handleViewDetails = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Beneficiary Management</h1>
          <p className="text-gray-600">Track beneficiaries and collect impact feedback</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Beneficiary
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-green-600" />
            <span className="text-gray-600">Total Beneficiaries</span>
          </div>
          <div className="text-gray-900">{beneficiaries.length}</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-5 h-5 text-yellow-600" />
            <span className="text-gray-600">Avg. Satisfaction</span>
          </div>
          <div className="text-gray-900">{avgRating.toFixed(1)} / 5.0</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <span className="text-gray-600">Feedback Received</span>
          </div>
          <div className="text-gray-900">{beneficiaries.length}</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <ImageIcon className="w-5 h-5 text-purple-600" />
            <span className="text-gray-600">With Images</span>
          </div>
          <div className="text-gray-900">{beneficiaries.filter(b => b.hasImages).length}</div>
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
                placeholder="Search by name, location, or appeal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Categories</option>
              <option value="Education">Education</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Social Welfare">Social Welfare</option>
            </select>
          </div>
        </div>
      </div>

      {/* Beneficiaries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBeneficiaries.map((beneficiary) => (
          <div
            key={beneficiary.id}
            className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all cursor-pointer overflow-hidden"
            onClick={() => handleViewDetails(beneficiary)}
          >
            <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2"></div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className={`px-3 py-1 rounded-full ${
                  beneficiary.category === 'Education' ? 'bg-blue-100 text-blue-700' :
                  beneficiary.category === 'Healthcare' ? 'bg-red-100 text-red-700' :
                  beneficiary.category === 'Infrastructure' ? 'bg-purple-100 text-purple-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {beneficiary.category}
                </div>
              </div>

              <div className="text-gray-900 mb-1">{beneficiary.name}</div>
              <div className="text-gray-500 mb-4">{beneficiary.id}</div>

              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="line-clamp-1">{beneficiary.location}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{beneficiary.phone}</span>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="text-gray-500 mb-1">Associated Appeal</div>
                <div className="text-gray-900 line-clamp-2">{beneficiary.appealTitle}</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < beneficiary.feedbackRating
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                {beneficiary.hasImages && (
                  <div className="flex items-center gap-1 text-purple-600">
                    <ImageIcon className="w-4 h-4" />
                    <span>Photos</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Beneficiary Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-gray-900">Add Beneficiary Profile</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-blue-700">Create a profile for the beneficiary and collect their feedback and impact stories.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    placeholder="Beneficiary's full name"
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

                <div>
                  <label className="block text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-gray-700 mb-2">Location *</label>
                  <input
                    type="text"
                    placeholder="Village/Town, District, State"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Category *</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">Select category</option>
                    <option value="education">Education</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="social_welfare">Social Welfare</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Associated Appeal *</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">Select appeal</option>
                    <option value="APP-2024-001">Education Support Program 2024</option>
                    <option value="APP-2024-005">Rural Infrastructure Development</option>
                    <option value="APP-2024-002">Healthcare Equipment Purchase</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Impact Received *</label>
                <textarea
                  rows={3}
                  placeholder="Describe the impact or benefits received by the beneficiary..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Feedback Rating *</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Star className="w-8 h-8 text-gray-300 hover:text-yellow-500" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Feedback Text *</label>
                <textarea
                  rows={4}
                  placeholder="Beneficiary's feedback in their own words..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Upload Images (Optional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors cursor-pointer">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-1">Click to upload impact photos</p>
                  <p className="text-gray-500">JPG, PNG (max 5MB each)</p>
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
                  Add Beneficiary
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedBeneficiary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-xl">
              <h2 className="text-white mb-2">{selectedBeneficiary.name}</h2>
              <p className="text-green-100">{selectedBeneficiary.id}</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-gray-500 mb-1">Category</div>
                  <div className="text-gray-900">{selectedBeneficiary.category}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Registered Date</div>
                  <div className="text-gray-900">{selectedBeneficiary.registeredDate}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-gray-500 mb-1">Location</div>
                  <div className="text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {selectedBeneficiary.location}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Phone</div>
                  <div className="text-gray-900 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {selectedBeneficiary.phone}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Email</div>
                  <div className="text-gray-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {selectedBeneficiary.email}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="text-gray-700 mb-2">Associated Appeal</div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-gray-900 mb-1">{selectedBeneficiary.appealTitle}</div>
                  <div className="text-gray-600">{selectedBeneficiary.appealId}</div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="text-gray-700 mb-2">Impact Received</div>
                <p className="text-gray-600 leading-relaxed">{selectedBeneficiary.impactReceived}</p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="text-gray-700 mb-3">Feedback & Rating</div>
                <div className="flex items-center gap-2 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 ${
                        i < selectedBeneficiary.feedbackRating
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-gray-900 ml-2">{selectedBeneficiary.feedbackRating}.0 / 5.0</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-green-500">
                  <p className="text-gray-700 italic">"{selectedBeneficiary.feedbackText}"</p>
                </div>
              </div>

              {selectedBeneficiary.hasImages && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="text-gray-700 mb-3">Impact Images</div>
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
