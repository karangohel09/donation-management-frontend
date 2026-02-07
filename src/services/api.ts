import axios from 'axios';
import { authService } from './auth';
// API Base URL - Use environment variable or fall back to default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

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
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const token = authService.getToken();
    // Log all errors for debugging
    console.error("API Error:", {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      message: error.message,
      data: error.response?.data,
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'NO TOKEN',
      authHeader: error.config?.headers?.Authorization ? 'YES' : 'NO',
    });

    // Handle 401 Unauthorized (token expired or invalid)
    if (error.response?.status === 401) {
      console.warn("401 Unauthorized - Token expired or invalid");
      console.warn("Clearing auth and redirecting to login");
      authService.clearAuth();
      // Optionally redirect to login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    
    // Handle 403 Forbidden (insufficient permissions)
    if (error.response?.status === 403) {
      console.warn("403 Forbidden - Access denied (insufficient permissions)");
      console.warn("Response:", error.response?.data);
    }
    
    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.warn("404 Not Found - Endpoint does not exist", error.config?.url);
    }
    
    // Handle 500+ Server errors
    if (error.response?.status >= 500) {
      console.error("Server error:", error.response?.status);
    }
    
    // Handle network errors (no backend)
    if (error.message === "Network Error" && !error.response) {
      console.error("Network Error - Cannot reach backend. Make sure backend is running on", API_BASE_URL);
    }
    
    return Promise.reject(error);
  }
);

// ============================================
// AUTHENTICATION APIs
// ============================================


export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),

  getCurrentUser: () =>
    apiClient.get('/auth/me'),
};

// ============================================
// DASHBOARD APIs
// ============================================

export const dashboardAPI = {
  getStats: () => apiClient.get('/dashboard/stats'),
  getDonationTrend: (period = '6months') =>
    apiClient.get('/dashboard/donation-trend', { params: { period } }),
  getAppealStatus: () => apiClient.get('/dashboard/appeal-status'),
  getRecentActivity: (limit = 5) =>
    apiClient.get('/dashboard/recent-activity', { params: { limit } }),
  getPendingApprovals: () =>
    apiClient.get('/dashboard/pending-approvals'),
};

// ============================================
// APPEAL MANAGEMENT APIs
// ============================================

export const appealAPI = {
  getAppeals: (params: any) => apiClient.get('/appeals', { params }),
  getAppealById: (id: string) => apiClient.get(`/appeals/${id}`),
  createAppeal: (data: any) => apiClient.post('/appeals', data),
  updateAppeal: (id: string, data: any) => apiClient.put(`/appeals/${id}`, data),
  deleteAppeal: (id: string) => apiClient.delete(`/appeals/${id}`),
  submitAppeal: (id: string) => apiClient.post(`/appeals/${id}/submit`),
  uploadDocument: (id: string, formData: FormData) =>
    apiClient.post(`/appeals/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAppealDocuments: (id: string) => apiClient.get(`/appeals/${id}/documents`),
};

// ============================================
// APPROVAL WORKFLOW APIs
// ============================================
// APPROVAL WORKFLOW APIs
// ============================================

export const approvalAPI = {
  getPendingApprovals: () =>
    apiClient.get('/approvals/pending'),

  approveAppeal: (appealId: string, data: { approvedAmount: number; remarks?: string }) =>
    apiClient.post(`/approvals/${appealId}/approve`, data),

  rejectAppeal: (appealId: string, reason: string) =>
    apiClient.post(`/approvals/${appealId}/reject`, { reason }),

  getApprovalHistory: () =>
    apiClient.get('/approvals/history'),

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

  // GET /approvals/communications/auto-triggered - Get auto-triggered communications (approval, rejection, etc.)
  getAutoTriggeredCommunications: (params?: { triggerType?: string; page?: number; limit?: number }) =>
    apiClient.get('/approvals/communications/auto-triggered', { params }),

  // GET /approvals/communications/auto-triggered/stats - Get auto-triggered communication statistics
  getAutoTriggeredStats: () =>
    apiClient.get('/approvals/communications/auto-triggered/stats'),
};

// ============================================
// DONATION RECEIPT APIs
// ============================================

export const donationAPI = {
  // POST /donations - Create new donation
  // Body: { donorId, appealId, amount, paymentMode, transactionId?, notes? }
  createDonation: (data: any) =>
    apiClient.post('/donations', data),

  // GET /donations - Get all donations
  getDonations: (params?: any) =>
    apiClient.get('/donations', { params }),

  // GET /donations/:id - Get donation by ID
  getDonationById: (id: number | string) =>
    apiClient.get(`/donations/${id}`),

  // GET /donations/donor/:donorId - Get donations by donor
  getDonationsByDonor: (donorId: number) =>
    apiClient.get(`/donations/donor/${donorId}`),

  // GET /donations/appeal/:appealId - Get donations by appeal
  getDonationsByAppeal: (appealId: number) =>
    apiClient.get(`/donations/appeal/${appealId}`),

  // GET /donations/status/:status - Get donations by status (PENDING, CONFIRMED, FAILED)
  getDonationsByStatus: (status: string) =>
    apiClient.get(`/donations/status/${status}`),

  // POST /donations/:id/confirm - Confirm a donation
  confirmDonation: (id: number | string) =>
    apiClient.post(`/donations/${id}/confirm`),

  // POST /donations/:id/fail - Mark donation as failed
  failDonation: (id: number | string) =>
    apiClient.post(`/donations/${id}/fail`),

  // POST /donations/:id/generate-receipt - Generate receipt for donation
  generateReceipt: (id: number | string) =>
    apiClient.post(`/donations/${id}/generate-receipt`),

  // POST /donations/receipts/:receiptId/send-email - Send receipt via email
  sendReceiptEmail: (receiptId: number) =>
    apiClient.post(`/donations/receipts/${receiptId}/send-email`),

  // GET /donations/pending-receipt - Get donations pending receipt
  getDonationsPendingReceipt: () =>
    apiClient.get('/donations/pending-receipt'),

  // DELETE /donations/:id - Delete donation (only if PENDING)
  deleteDonation: (id: number | string) =>
    apiClient.delete(`/donations/${id}`),
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
// DONOR MANAGEMENT APIs
// ============================================

export const donorAPI = {
  // GET /donors
  getAllDonors: () =>
    apiClient.get('/donors'),

  // GET /donors/:id
  getDonorById: (id: number) =>
    apiClient.get(`/donors/${id}`),

  // POST /donors
  // Body: { name, email, phoneNumber }
  createDonor: (data: any) =>
    apiClient.post('/donors', data),

  // PUT /donors/:id
  updateDonor: (id: number, data: any) =>
    apiClient.put(`/donors/${id}`, data),

  // DELETE /donors/:id
  deleteDonor: (id: number) =>
    apiClient.delete(`/donors/${id}`),
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
