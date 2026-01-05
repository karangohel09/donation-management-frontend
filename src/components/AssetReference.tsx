import React, { useState } from 'react';
import { User } from '../App';
import { Plus, Search, Package, Building2, Link2, AlertCircle, Eye } from 'lucide-react';

interface AssetReferenceProps {
  user: User;
}

interface AssetLink {
  id: string;
  utilizationId: string;
  appealTitle: string;
  assetRegistrationNumber: string;
  assetName: string;
  assetOwner: 'itc' | 'mission';
  linkedDate: string;
  linkedBy: string;
  notes: string;
}

const mockAssetLinks: AssetLink[] = [
  {
    id: 'AST-LINK-001',
    utilizationId: 'UTL-2024-001',
    appealTitle: 'Education Support Program 2024',
    assetRegistrationNumber: 'ITC-EDU-2024-001',
    assetName: 'Educational Books & Materials Package',
    assetOwner: 'itc',
    linkedDate: '2024-12-20',
    linkedBy: 'Amit Patel',
    notes: '100 textbook sets for primary education',
  },
  {
    id: 'AST-LINK-002',
    utilizationId: 'UTL-2024-003',
    appealTitle: 'Rural Infrastructure Development',
    assetRegistrationNumber: 'AM-INF-2024-015',
    assetName: 'Road Construction Equipment',
    assetOwner: 'mission',
    linkedDate: '2024-12-18',
    linkedBy: 'Rajesh Kumar',
    notes: 'Heavy machinery used for road development project',
  },
  {
    id: 'AST-LINK-003',
    utilizationId: 'UTL-2024-003',
    appealTitle: 'Rural Infrastructure Development',
    assetRegistrationNumber: 'ITC-INF-2024-008',
    assetName: 'Building Materials Inventory',
    assetOwner: 'itc',
    linkedDate: '2024-12-18',
    linkedBy: 'Rajesh Kumar',
    notes: 'Cement, steel, and aggregates',
  },
];

export default function AssetReference({ user }: AssetReferenceProps) {
  const [assetLinks, setAssetLinks] = useState<AssetLink[]>(mockAssetLinks);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAssetLink, setSelectedAssetLink] = useState<AssetLink | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const isReadOnly = user.role === 'viewer';
  const canCreate = user.role !== 'viewer';

  const filteredAssetLinks = assetLinks.filter(link => {
    const matchesSearch = 
      link.assetRegistrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.appealTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.utilizationId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleViewDetails = (link: AssetLink) => {
    setSelectedAssetLink(link);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Asset Utilization Reference</h1>
          <p className="text-gray-600">Link existing assets to fund utilization records</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowLinkModal(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Link2 className="w-5 h-5" />
            Link Asset Reference
          </button>
        )}
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <div className="text-blue-900 mb-1">Asset Reference Only</div>
          <p className="text-blue-700">
            This module is for referencing existing assets registered in external systems. 
            Asset lifecycle management (creation, depreciation, maintenance) is handled outside this system.
            You can only link existing asset registration numbers to utilization records.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Link2 className="w-5 h-5 text-purple-600" />
            <span className="text-gray-600">Total Links</span>
          </div>
          <div className="text-gray-900">{assetLinks.length}</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-5 h-5 text-green-600" />
            <span className="text-gray-600">ITC Assets</span>
          </div>
          <div className="text-gray-900">{assetLinks.filter(a => a.assetOwner === 'itc').length}</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span className="text-gray-600">Mission Assets</span>
          </div>
          <div className="text-gray-900">{assetLinks.filter(a => a.assetOwner === 'mission').length}</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-5 h-5 text-orange-600" />
            <span className="text-gray-600">Unique Assets</span>
          </div>
          <div className="text-gray-900">{new Set(assetLinks.map(a => a.assetRegistrationNumber)).size}</div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by asset number, name, or utilization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Asset Links Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-gray-600">Asset Reg. Number</th>
                <th className="px-6 py-4 text-left text-gray-600">Asset Name</th>
                <th className="px-6 py-4 text-left text-gray-600">Owner</th>
                <th className="px-6 py-4 text-left text-gray-600">Linked to Utilization</th>
                <th className="px-6 py-4 text-left text-gray-600">Appeal</th>
                <th className="px-6 py-4 text-left text-gray-600">Linked Date</th>
                <th className="px-6 py-4 text-left text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssetLinks.map((link, index) => (
                <tr
                  key={link.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    index === filteredAssetLinks.length - 1 ? 'border-b-0' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-purple-600" />
                      <span className="text-gray-900">{link.assetRegistrationNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900">{link.assetName}</div>
                    <div className="text-gray-500 line-clamp-1">{link.notes}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`px-3 py-1 rounded-full inline-flex items-center gap-2 ${
                      link.assetOwner === 'itc' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      <Building2 className="w-4 h-4" />
                      <span className="uppercase">{link.assetOwner}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900">{link.utilizationId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-600 max-w-xs line-clamp-2">{link.appealTitle}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-600">{link.linkedDate}</div>
                    <div className="text-gray-500">By {link.linkedBy}</div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleViewDetails(link)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Link Asset Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-gray-900">Link Asset Reference</h2>
              <button
                onClick={() => setShowLinkModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-amber-900 mb-1">Important Note</div>
                  <p className="text-amber-700">
                    Enter the registration number of an asset that already exists in your asset management system.
                    This system does NOT create or manage asset lifecycle.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Select Utilization Record *</label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">Choose a utilization record to link</option>
                  <option value="UTL-2024-001">UTL-2024-001 - Education Support Program 2024</option>
                  <option value="UTL-2024-003">UTL-2024-003 - Rural Infrastructure Development</option>
                  <option value="UTL-2024-002">UTL-2024-002 - Healthcare Equipment Purchase</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Asset Registration Number *</label>
                <input
                  type="text"
                  placeholder="e.g., ITC-EDU-2024-001 or AM-INF-2024-015"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-gray-500 mt-1">Enter the exact registration number from your asset management system</p>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Asset Name (Read-only Reference) *</label>
                <input
                  type="text"
                  placeholder="e.g., Educational Books & Materials Package"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-gray-500 mt-1">Descriptive name for reference purposes only</p>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Asset Owning Entity *</label>
                <div className="grid grid-cols-2 gap-4">
                  <button className="p-4 border-2 border-green-500 bg-green-50 rounded-lg transition-all">
                    <Building2 className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <div className="text-gray-900">ITC</div>
                  </button>
                  <button className="p-4 border-2 border-gray-200 hover:border-green-300 rounded-lg transition-all">
                    <Building2 className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <div className="text-gray-900">Anoopam Mission</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Additional notes about this asset reference..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-gray-700 mb-2">Multiple Assets?</div>
                <p className="text-gray-600">
                  If this utilization involves multiple assets, you can link additional asset numbers after creating this one.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowLinkModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowLinkModal(false)}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Link Asset Reference
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedAssetLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-xl">
              <h2 className="text-white mb-2">Asset Reference Details</h2>
              <p className="text-purple-100">{selectedAssetLink.assetRegistrationNumber}</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <div className="text-gray-500 mb-1">Asset Registration Number</div>
                  <div className="text-gray-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-purple-600" />
                    {selectedAssetLink.assetRegistrationNumber}
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="text-gray-500 mb-1">Asset Name</div>
                  <div className="text-gray-900">{selectedAssetLink.assetName}</div>
                </div>

                <div>
                  <div className="text-gray-500 mb-1">Owning Entity</div>
                  <div className={`px-3 py-1 rounded-full inline-flex items-center gap-2 ${
                    selectedAssetLink.assetOwner === 'itc' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    <Building2 className="w-4 h-4" />
                    <span className="uppercase">{selectedAssetLink.assetOwner}</span>
                  </div>
                </div>

                <div>
                  <div className="text-gray-500 mb-1">Linked Date</div>
                  <div className="text-gray-900">{selectedAssetLink.linkedDate}</div>
                </div>

                <div>
                  <div className="text-gray-500 mb-1">Linked to Utilization</div>
                  <div className="text-gray-900">{selectedAssetLink.utilizationId}</div>
                </div>

                <div>
                  <div className="text-gray-500 mb-1">Linked By</div>
                  <div className="text-gray-900">{selectedAssetLink.linkedBy}</div>
                </div>

                <div className="col-span-2">
                  <div className="text-gray-500 mb-1">Associated Appeal</div>
                  <div className="text-gray-900">{selectedAssetLink.appealTitle}</div>
                </div>

                <div className="col-span-2">
                  <div className="text-gray-500 mb-1">Notes</div>
                  <div className="text-gray-900">{selectedAssetLink.notes}</div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-blue-700">
                  For full asset details including purchase date, depreciation, and maintenance history, 
                  please refer to your external asset management system.
                </p>
              </div>

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
