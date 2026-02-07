import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Mail, Phone, User, Search } from 'lucide-react';
import { User as UserType } from '../App';
import { donorAPI } from '../services/api';

interface DonorManagementProps {
  user: UserType;
}

interface Donor {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
}

const DonorManagement: React.FC<DonorManagementProps> = ({ user }) => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Load donors
  useEffect(() => {
    loadDonors();
  }, []);

  const loadDonors = async () => {
    try {
      const response = await donorAPI.getAllDonors();
      setDonors(response.data);
    } catch (error) {
      console.error('Error loading donors:', error);
    }
  };

  const handleAddDonor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phoneNumber) {
      setMessage('All fields are required');
      return;
    }

    setLoading(true);
    try {
      await donorAPI.createDonor(formData);
      setMessage('✓ Donor added successfully');
      setFormData({ name: '', email: '', phoneNumber: '' });
      setShowAddForm(false);
      loadDonors();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error adding donor:', error);
      setMessage('✗ Failed to add donor');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDonor = async (id: number) => {
    if (!confirm('Are you sure you want to delete this donor?')) return;

    try {
      await donorAPI.deleteDonor(id);
      setMessage('✓ Donor deleted successfully');
      loadDonors();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting donor:', error);
      setMessage('✗ Failed to delete donor');
    }
  };

  const filteredDonors = donors.filter(
    (donor) =>
      donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Donor Management</h2>
          <p className="text-gray-600 mt-1">Add and manage donor contacts for communications</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <Plus size={20} />
          Add Donor
        </button>
      </div>

      {/* Status Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.includes('✓')
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {message}
        </div>
      )}

      {/* Add Donor Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          <h3 className="font-semibold text-lg">Add New Donor</h3>
          <form onSubmit={handleAddDonor} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Donor Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter donor name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                placeholder="Enter phone number"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Donor'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search donors by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Donors List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredDonors.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <User size={48} className="mx-auto mb-2 opacity-50" />
            <p>No donors found. Add your first donor to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Added On</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDonors.map((donor) => (
                  <tr key={donor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User size={16} className="text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-900">{donor.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail size={16} />
                        {donor.email}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone size={16} />
                        {donor.phoneNumber}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {new Date(donor.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => handleDeleteDonor(donor.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Delete donor"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800">
          <strong>Total Donors:</strong> {filteredDonors.length} 
          {filteredDonors.length > 0 && (
            <span className="ml-4">You can now use these donors when sending communications to appeals.</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default DonorManagement;
