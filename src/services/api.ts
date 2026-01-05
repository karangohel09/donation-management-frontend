import axios from 'axios';

// API Base URL - Change this to your backend URL when ready
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTHENTICATION APIs
// ============================================

export const authAPI = {
  // POST /auth/login
  // Body: { email: string, password: string }
  // Response: { token: string, user: User }
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),

  // POST /auth/logout
  logout: () =>
    apiClient.post('/auth/logout'),

  // GET /auth/me
  // Response: { user: User }
  getCurrentUser: () =>
    apiClient.get('/auth/me'),
};

// ============================================
// DASHBOARD APIs
// ============================================

export const dashboardAPI = {
  // GET /dashboard/stats
  // Response: { totalApproved, totalUtilized, remainingBalance, activeAppeals, etc. }
  getStats: () =>
    apiClient.get('/dashboard/stats'),

  // GET /dashboard/donation-trend?period=6months
  getDonationTrend: (period = '6months') =>
    apiClient.get('/dashboard/donation-trend', { params: { period } }),

  // GET /dashboard/appeal-status
  getAppealStatus: () =>
    apiClient.get('/dashboard/appeal-status'),

  // GET /dashboard/recent-activity?limit=5
  getRecentActivity: (limit = 5) =>
    apiClient.get('/dashboard/recent-activity', { params: { limit } }),

  // GET /dashboard/pending-approvals
  getPendingApprovals: () =>
    apiClient.get('/dashboard/pending-approvals'),
};

// ============================================
// APPEAL MANAGEMENT APIs
// ============================================

export const appealAPI = {
  // GET /appeals?status=all&search=&page=1&limit=10
  getAppeals: (params: { status?: string; search?: string; page?: number; limit?: number }) =>
    apiClient.get('/appeals', { params }),

  // GET /appeals/:id
  getAppealById: (id: string) =>
    apiClient.get(`/appeals/${id}`),

  // POST /appeals
  // Body: { title, purpose, estimatedAmount, beneficiaryCategory, duration, documents }
  createAppeal: (data: any) =>
    apiClient.post('/appeals', data),

  // PUT /appeals/:id
  updateAppeal: (id: string, data: any) =>
    apiClient.put(`/appeals/${id}`, data),

  // DELETE /appeals/:id
  deleteAppeal: (id: string) =>
    apiClient.delete(`/appeals/${id}`),

  // POST /appeals/:id/submit
  submitAppeal: (id: string) =>
    apiClient.post(`/appeals/${id}/submit`),

  // POST /appeals/:id/documents
  // Body: FormData with file
  uploadDocument: (id: string, formData: FormData) =>
    apiClient.post(`/appeals/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// ============================================
// APPROVAL WORKFLOW APIs
// ============================================

export const approvalAPI = {
  // GET /approvals/pending
  getPendingApprovals: () =>
    apiClient.get('/approvals/pending'),

  // GET /approvals/history
  getApprovalHistory: () =>
    apiClient.get('/approvals/history'),

  // POST /approvals/:appealId/approve
  // Body: { approvedAmount, remarks, conditions }
  approveAppeal: (appealId: string, data: { approvedAmount: number; remarks?: string; conditions?: string }) =>
    apiClient.post(`/approvals/${appealId}/approve`, data),

  // POST /approvals/:appealId/reject
  // Body: { reason }
  rejectAppeal: (appealId: string, reason: string) =>
    apiClient.post(`/approvals/${appealId}/reject`, { reason }),

  // GET /approvals/stats
  getApprovalStats: () =>
    apiClient.get('/approvals/stats'),
};

// ============================================
// DONOR COMMUNICATION APIs
// ============================================

export const communicationAPI = {
  // GET /communications?page=1&limit=10
  getCommunications: (params: { page?: number; limit?: number }) =>
    apiClient.get('/communications', { params }),

  // POST /communications/send
  // Body: { appealId, channel, subject?, message, recipients }
  sendCommunication: (data: any) =>
    apiClient.post('/communications/send', data),

  // GET /communications/templates
  getTemplates: () =>
    apiClient.get('/communications/templates'),

  // GET /communications/stats
  getStats: () =>
    apiClient.get('/communications/stats'),
};

// ============================================
// DONATION RECEIPT APIs
// ============================================

export const donationAPI = {
  // GET /donations?status=all&search=&page=1&limit=10
  getDonations: (params: { status?: string; search?: string; page?: number; limit?: number }) =>
    apiClient.get('/donations', { params }),

  // GET /donations/:id
  getDonationById: (id: string) =>
    apiClient.get(`/donations/${id}`),

  // POST /donations
  // Body: { donorName, donorEmail, donorPhone, appealId, amount, mode, chequeNumber?, chequeDate?, transactionRef?, receivingEntity }
  recordDonation: (data: any) =>
    apiClient.post('/donations', data),

  // PUT /donations/:id
  updateDonation: (id: string, data: any) =>
    apiClient.put(`/donations/${id}`, data),

  // GET /donations/stats
  getStats: () =>
    apiClient.get('/donations/stats'),

  // GET /donations/:id/receipt
  // Response: PDF blob
  downloadReceipt: (id: string) =>
    apiClient.get(`/donations/${id}/receipt`, { responseType: 'blob' }),
};

// ============================================
// FUND UTILIZATION APIs
// ============================================

export const utilizationAPI = {
  // GET /utilizations?status=all&search=&page=1&limit=10
  getUtilizations: (params: { status?: string; search?: string; page?: number; limit?: number }) =>
    apiClient.get('/utilizations', { params }),

  // GET /utilizations/:id
  getUtilizationById: (id: string) =>
    apiClient.get(`/utilizations/${id}`),

  // POST /utilizations
  // Body: { appealId, utilizationDate, description, amountUtilized, vendorName, vendorDetails, invoiceNumber, poNumber, paymentStatus }
  recordUtilization: (data: any) =>
    apiClient.post('/utilizations', data),

  // PUT /utilizations/:id
  updateUtilization: (id: string, data: any) =>
    apiClient.put(`/utilizations/${id}`, data),

  // GET /utilizations/stats
  getStats: () =>
    apiClient.get('/utilizations/stats'),

  // GET /utilizations/appeal/:appealId/balance
  getAppealBalance: (appealId: string) =>
    apiClient.get(`/utilizations/appeal/${appealId}/balance`),
};

// ============================================
// ASSET REFERENCE APIs
// ============================================

export const assetAPI = {
  // GET /assets?search=&page=1&limit=10
  getAssetLinks: (params: { search?: string; page?: number; limit?: number }) =>
    apiClient.get('/assets', { params }),

  // GET /assets/:id
  getAssetLinkById: (id: string) =>
    apiClient.get(`/assets/${id}`),

  // POST /assets/link
  // Body: { utilizationId, assetRegistrationNumber, assetName, assetOwner, notes }
  linkAsset: (data: any) =>
    apiClient.post('/assets/link', data),

  // DELETE /assets/:id
  unlinkAsset: (id: string) =>
    apiClient.delete(`/assets/${id}`),

  // GET /assets/stats
  getStats: () =>
    apiClient.get('/assets/stats'),
};

// ============================================
// BENEFICIARY MANAGEMENT APIs
// ============================================

export const beneficiaryAPI = {
  // GET /beneficiaries?category=all&search=&page=1&limit=10
  getBeneficiaries: (params: { category?: string; search?: string; page?: number; limit?: number }) =>
    apiClient.get('/beneficiaries', { params }),

  // GET /beneficiaries/:id
  getBeneficiaryById: (id: string) =>
    apiClient.get(`/beneficiaries/${id}`),

  // POST /beneficiaries
  // Body: { name, phone, email, location, category, appealId, impactReceived, feedbackRating, feedbackText }
  addBeneficiary: (data: any) =>
    apiClient.post('/beneficiaries', data),

  // PUT /beneficiaries/:id
  updateBeneficiary: (id: string, data: any) =>
    apiClient.put(`/beneficiaries/${id}`, data),

  // POST /beneficiaries/:id/images
  // Body: FormData with images
  uploadImages: (id: string, formData: FormData) =>
    apiClient.post(`/beneficiaries/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // GET /beneficiaries/stats
  getStats: () =>
    apiClient.get('/beneficiaries/stats'),
};

// ============================================
// REPORTS & ANALYTICS APIs
// ============================================

export const reportsAPI = {
  // GET /reports/appeal-wise?from=&to=
  getAppealWiseReport: (params: { from: string; to: string }) =>
    apiClient.get('/reports/appeal-wise', { params }),

  // GET /reports/donation-utilization?from=&to=
  getDonationUtilizationReport: (params: { from: string; to: string }) =>
    apiClient.get('/reports/donation-utilization', { params }),

  // GET /reports/pending-balance?from=&to=
  getPendingBalanceReport: (params: { from: string; to: string }) =>
    apiClient.get('/reports/pending-balance', { params }),

  // GET /reports/asset-utilization?from=&to=
  getAssetUtilizationReport: (params: { from: string; to: string }) =>
    apiClient.get('/reports/asset-utilization', { params }),

  // GET /reports/beneficiary-impact?from=&to=
  getBeneficiaryImpactReport: (params: { from: string; to: string }) =>
    apiClient.get('/reports/beneficiary-impact', { params }),

  // GET /reports/audit?from=&to=
  getAuditReport: (params: { from: string; to: string }) =>
    apiClient.get('/reports/audit', { params }),

  // GET /reports/export/:type?format=pdf&from=&to=
  // Response: File blob
  exportReport: (type: string, format: string, params: { from: string; to: string }) =>
    apiClient.get(`/reports/export/${type}`, {
      params: { format, ...params },
      responseType: 'blob',
    }),

  // GET /reports/summary
  getSummary: () =>
    apiClient.get('/reports/summary'),
};

// ============================================
// SETTINGS & USER MANAGEMENT APIs
// ============================================

export const settingsAPI = {
  // GET /settings/users
  getUsers: () =>
    apiClient.get('/settings/users'),

  // POST /settings/users
  // Body: { name, email, role, password }
  addUser: (data: any) =>
    apiClient.post('/settings/users', data),

  // PUT /settings/users/:id
  updateUser: (id: string, data: any) =>
    apiClient.put(`/settings/users/${id}`, data),

  // DELETE /settings/users/:id
  deleteUser: (id: string) =>
    apiClient.delete(`/settings/users/${id}`),

  // PUT /settings/users/:id/password
  resetPassword: (id: string, newPassword: string) =>
    apiClient.put(`/settings/users/${id}/password`, { newPassword }),

  // GET /settings/roles
  getRolesAndPermissions: () =>
    apiClient.get('/settings/roles'),

  // GET /settings/general
  getGeneralSettings: () =>
    apiClient.get('/settings/general'),

  // PUT /settings/general
  updateGeneralSettings: (data: any) =>
    apiClient.put('/settings/general', data),

  // PUT /settings/notifications
  updateNotificationSettings: (data: any) =>
    apiClient.put('/settings/notifications', data),
};

export default apiClient;
