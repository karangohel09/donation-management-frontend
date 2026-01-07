// Mock data generator - Remove this file once backend is ready
// This provides realistic API responses for development

export const mockUsers = [
  { id: '1', name: 'Rajesh Kumar', email: 'rajesh@itc.com', role: 'super_admin', password: 'demo' },
  { id: '2', name: 'Priya Sharma', email: 'priya@itc.com', role: 'itc_admin', password: 'demo' },
  { id: '3', name: 'Swami Anand', email: 'swami@anoopam.org', role: 'mission_authority', password: 'demo' },
  { id: '4', name: 'Amit Patel', email: 'amit@accounts.com', role: 'accounts_user', password: 'demo' },
  { id: '5', name: 'Guest User', email: 'viewer@itc.com', role: 'viewer', password: 'demo' },
];

export const mockAppeals = [
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
];

export const mockDonations = [
  {
    id: 'DON-2024-001',
    donorName: 'Rajesh Mehta',
    donorEmail: 'rajesh.mehta@email.com',
    donorPhone: '+91 98765 43210',
    appealId: 'APP-2024-001',
    appealTitle: 'Education Support Program 2024',
    amount: 50000,
    mode: 'bank_transfer',
    transactionRef: 'TXN987654321',
    receivingEntity: 'itc',
    receivedDate: '2024-12-27',
    status: 'confirmed',
    receivedBy: 'Amit Patel',
  },
];

export const mockUtilizations = [
  {
    id: 'UTL-2024-001',
    appealId: 'APP-2024-001',
    appealTitle: 'Education Support Program 2024',
    utilizationDate: '2024-12-20',
    description: 'Purchase of textbooks and educational materials for 100 students',
    amountUtilized: 125000,
    vendorName: 'Scholastic Books Pvt Ltd',
    vendorDetails: 'GST: 29AAACC1234D1Z5, Mumbai',
    invoiceNumber: 'INV-SB-2024-456',
    poNumber: 'PO-2024-001',
    paymentStatus: 'paid',
    createdBy: 'Amit Patel',
    approvedAmount: 500000,
    remainingBalance: 375000,
  },
];

export const mockBeneficiaries = [
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
];

// Simulate API delay
export const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API response wrapper
export const mockAPIResponse = async <T,>(data: T, delayMs: number = 500): Promise<{ data: T }> => {
  await delay(delayMs);
  return { data };
};
