# Donation Management System - API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication
All API requests (except login) require JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. AUTHENTICATION ENDPOINTS

### POST /auth/login
Login with email and password
```json
Request:
{
  "email": "user@email.com",
  "password": "password123"
}

Response (200):
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user-uuid",
      "name": "Rajesh Kumar",
      "email": "rajesh@itc.com",
      "role": "super_admin"
    }
  }
}
```

### POST /auth/logout
Logout current user
```json
Response (200):
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET /auth/me
Get current logged-in user details
```json
Response (200):
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "name": "Rajesh Kumar",
      "email": "rajesh@itc.com",
      "role": "super_admin"
    }
  }
}
```

---

## 2. DASHBOARD ENDPOINTS

### GET /dashboard/stats
Get dashboard statistics
```json
Response (200):
{
  "success": true,
  "data": {
    "totalApproved": 4250000,
    "totalUtilized": 3160000,
    "remainingBalance": 1090000,
    "activeAppeals": 45,
    "totalDonors": 1245,
    "beneficiariesImpacted": 3890,
    "projectsCompleted": 34,
    "averageDonation": 34135
  }
}
```

### GET /dashboard/donation-trend
Get donation vs utilization trend data
```json
Query Params:
?period=6months (options: 3months, 6months, 1year)

Response (200):
{
  "success": true,
  "data": [
    { "month": "Jan", "donations": 450000, "utilization": 380000 },
    { "month": "Feb", "donations": 520000, "utilization": 420000 }
  ]
}
```

### GET /dashboard/appeal-status
Get appeal status distribution
```json
Response (200):
{
  "success": true,
  "data": [
    { "name": "Approved", "value": 45, "color": "#10b981" },
    { "name": "Pending", "value": 12, "color": "#f59e0b" },
    { "name": "Rejected", "value": 3, "color": "#ef4444" },
    { "name": "Draft", "value": 8, "color": "#6b7280" }
  ]
}
```

### GET /dashboard/recent-activity
Get recent activities
```json
Query Params:
?limit=5

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "activity-1",
      "action": "Donation received from Rajesh Mehta",
      "amount": "₹50,000",
      "time": "2 hours ago",
      "type": "donation"
    }
  ]
}
```

### GET /dashboard/pending-approvals
Get pending approvals for dashboard
```json
Response (200):
{
  "success": true,
  "data": [
    {
      "id": "APP-2024-002",
      "title": "Healthcare Equipment Purchase",
      "amount": 350000,
      "requester": "Amit Patel",
      "date": "2024-12-27"
    }
  ]
}
```

---

## 3. APPEAL MANAGEMENT ENDPOINTS

### GET /appeals
Get all appeals with filters
```json
Query Params:
?status=all (options: all, draft, submitted, approved, rejected)
&search=education
&page=1
&limit=10

Response (200):
{
  "success": true,
  "data": {
    "appeals": [
      {
        "id": "APP-2024-001",
        "title": "Education Support Program 2024",
        "purpose": "Providing educational materials...",
        "estimatedAmount": 500000,
        "approvedAmount": 500000,
        "beneficiaryCategory": "Education",
        "duration": "12 months",
        "status": "approved",
        "createdBy": "Priya Sharma",
        "createdDate": "2024-12-15",
        "documents": 3
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 45,
      "itemsPerPage": 10
    }
  }
}
```

### GET /appeals/:id
Get single appeal by ID
```json
Response (200):
{
  "success": true,
  "data": {
    "id": "APP-2024-001",
    "title": "Education Support Program 2024",
    "purpose": "Providing educational materials...",
    "estimatedAmount": 500000,
    "approvedAmount": 500000,
    "beneficiaryCategory": "Education",
    "duration": "12 months",
    "status": "approved",
    "createdBy": "Priya Sharma",
    "createdDate": "2024-12-15",
    "documents": [
      {
        "id": "doc-1",
        "name": "Project Proposal.pdf",
        "size": "2.4 MB",
        "url": "/uploads/documents/..."
      }
    ]
  }
}
```

### POST /appeals
Create new appeal
```json
Request:
{
  "title": "Education Support Program 2024",
  "purpose": "Providing educational materials...",
  "estimatedAmount": 500000,
  "beneficiaryCategory": "Education",
  "duration": "12 months"
}

Response (201):
{
  "success": true,
  "data": {
    "id": "APP-2024-001",
    "title": "Education Support Program 2024",
    "status": "draft"
  },
  "message": "Appeal created successfully"
}
```

### PUT /appeals/:id
Update appeal
```json
Request:
{
  "title": "Updated title",
  "purpose": "Updated purpose"
}

Response (200):
{
  "success": true,
  "data": { /* updated appeal */ },
  "message": "Appeal updated successfully"
}
```

### DELETE /appeals/:id
Delete appeal (only drafts)
```json
Response (200):
{
  "success": true,
  "message": "Appeal deleted successfully"
}
```

### POST /appeals/:id/submit
Submit appeal for approval
```json
Response (200):
{
  "success": true,
  "data": { /* updated appeal with status=submitted */ },
  "message": "Appeal submitted for approval"
}
```

### POST /appeals/:id/documents
Upload documents for appeal
```json
Request: multipart/form-data
{
  "file": <file-object>
}

Response (200):
{
  "success": true,
  "data": {
    "documentId": "doc-123",
    "fileName": "proposal.pdf",
    "fileUrl": "/uploads/documents/..."
  }
}
```

---

## 4. APPROVAL WORKFLOW ENDPOINTS

### GET /approvals/pending
Get all pending approvals
```json
Response (200):
{
  "success": true,
  "data": [
    {
      "id": "APP-2024-002",
      "title": "Healthcare Equipment Purchase",
      "purpose": "Medical equipment...",
      "requestedAmount": 350000,
      "category": "Healthcare",
      "duration": "6 months",
      "submittedBy": "Amit Patel",
      "submittedDate": "2024-12-20",
      "documents": 5,
      "priority": "high"
    }
  ]
}
```

### GET /approvals/history
Get approval history
```json
Response (200):
{
  "success": true,
  "data": [
    {
      "id": "APPR-001",
      "appealId": "APP-2024-001",
      "appealTitle": "Education Support",
      "action": "approved",
      "approvedAmount": 500000,
      "approvedBy": "Swami Anand",
      "approvedDate": "2024-12-15",
      "remarks": "Approved with conditions"
    }
  ]
}
```

### POST /approvals/:appealId/approve
Approve an appeal
```json
Request:
{
  "approvedAmount": 500000,
  "remarks": "Approved for Q1 2024",
  "conditions": "Monthly progress reports required"
}

Response (200):
{
  "success": true,
  "data": { /* updated appeal with approved status */ },
  "message": "Appeal approved successfully"
}
```

### POST /approvals/:appealId/reject
Reject an appeal
```json
Request:
{
  "reason": "Insufficient documentation"
}

Response (200):
{
  "success": true,
  "data": { /* updated appeal with rejected status */ },
  "message": "Appeal rejected"
}
```

### GET /approvals/stats
Get approval statistics
```json
Response (200):
{
  "success": true,
  "data": {
    "pending": 4,
    "approvedThisMonth": 12,
    "totalAmount": 1260000,
    "avgReviewTime": 2.3
  }
}
```

---

## 5. DONOR COMMUNICATION ENDPOINTS

### GET /communications
Get communication history
```json
Query Params:
?page=1&limit=10

Response (200):
{
  "success": true,
  "data": {
    "communications": [
      {
        "id": "COM-001",
        "appealId": "APP-2024-001",
        "appealTitle": "Education Support",
        "channel": "email",
        "recipients": 145,
        "status": "sent",
        "sentBy": "Priya Sharma",
        "sentDate": "2024-12-27 10:30 AM",
        "message": "Thank you for your support..."
      }
    ],
    "pagination": { /* pagination info */ }
  }
}
```

### POST /communications/send
Send communication to donors
```json
Request:
{
  "appealId": "APP-2024-001",
  "channel": "email",
  "subject": "Thank you for your donation",
  "message": "Dear [Donor Name]...",
  "recipients": "all" // or array of donor IDs
}

Response (200):
{
  "success": true,
  "data": {
    "communicationId": "COM-002",
    "recipientCount": 45,
    "status": "sent"
  },
  "message": "Communication sent successfully"
}
```

### GET /communications/templates
Get message templates
```json
Response (200):
{
  "success": true,
  "data": [
    {
      "id": "template-1",
      "name": "Donation Thank You",
      "subject": "Thank You for Your Generous Donation",
      "content": "Dear [Donor Name]..."
    }
  ]
}
```

### GET /communications/stats
Get communication statistics
```json
Response (200):
{
  "success": true,
  "data": {
    "emailSent": 145,
    "whatsappSent": 89,
    "postalSent": 23,
    "totalRecipients": 257
  }
}
```

---

## 6. DONATION RECEIPT ENDPOINTS

### GET /donations
Get all donations
```json
Query Params:
?status=all (options: all, confirmed, pending, bounced)
&search=
&page=1
&limit=10

Response (200):
{
  "success": true,
  "data": {
    "donations": [
      {
        "id": "DON-2024-001",
        "donorName": "Rajesh Mehta",
        "donorEmail": "rajesh@email.com",
        "donorPhone": "+91 98765 43210",
        "appealId": "APP-2024-001",
        "appealTitle": "Education Support",
        "amount": 50000,
        "mode": "bank_transfer",
        "transactionRef": "TXN987654321",
        "receivingEntity": "itc",
        "receivedDate": "2024-12-27",
        "status": "confirmed",
        "receivedBy": "Amit Patel"
      }
    ],
    "pagination": { /* pagination info */ }
  }
}
```

### GET /donations/:id
Get single donation
```json
Response (200):
{
  "success": true,
  "data": { /* donation object */ }
}
```

### POST /donations
Record new donation
```json
Request:
{
  "donorName": "Rajesh Mehta",
  "donorEmail": "rajesh@email.com",
  "donorPhone": "+91 98765 43210",
  "appealId": "APP-2024-001",
  "amount": 50000,
  "mode": "bank_transfer",
  "transactionRef": "TXN987654321",
  "receivingEntity": "itc",
  "receivedDate": "2024-12-27"
}

Response (201):
{
  "success": true,
  "data": { /* created donation */ },
  "message": "Donation recorded successfully"
}
```

### PUT /donations/:id
Update donation
```json
Request:
{
  "status": "confirmed"
}

Response (200):
{
  "success": true,
  "data": { /* updated donation */ },
  "message": "Donation updated successfully"
}
```

### GET /donations/stats
Get donation statistics
```json
Response (200):
{
  "success": true,
  "data": {
    "totalReceived": 2750000,
    "confirmed": 240,
    "pending": 15,
    "avgDonation": 64705
  }
}
```

### GET /donations/:id/receipt
Download donation receipt PDF
```json
Response (200): PDF Blob
Content-Type: application/pdf
Content-Disposition: attachment; filename="receipt-DON-2024-001.pdf"
```

---

## 7. FUND UTILIZATION ENDPOINTS

### GET /utilizations
Get all utilization records
```json
Query Params:
?status=all (options: all, paid, processing, pending)
&search=
&page=1
&limit=10

Response (200):
{
  "success": true,
  "data": {
    "utilizations": [
      {
        "id": "UTL-2024-001",
        "appealId": "APP-2024-001",
        "appealTitle": "Education Support",
        "utilizationDate": "2024-12-20",
        "description": "Purchase of textbooks...",
        "amountUtilized": 125000,
        "vendorName": "Scholastic Books",
        "vendorDetails": "GST: 29AAACC1234D1Z5",
        "invoiceNumber": "INV-SB-2024-456",
        "poNumber": "PO-2024-001",
        "paymentStatus": "paid",
        "createdBy": "Amit Patel",
        "approvedAmount": 500000,
        "remainingBalance": 375000
      }
    ],
    "pagination": { /* pagination info */ }
  }
}
```

### GET /utilizations/:id
Get single utilization record

### POST /utilizations
Record fund utilization
```json
Request:
{
  "appealId": "APP-2024-001",
  "utilizationDate": "2024-12-20",
  "description": "Purchase of textbooks",
  "amountUtilized": 125000,
  "vendorName": "Scholastic Books",
  "vendorDetails": "GST: 29AAACC1234D1Z5",
  "invoiceNumber": "INV-SB-2024-456",
  "poNumber": "PO-2024-001",
  "paymentStatus": "paid"
}

Response (201):
{
  "success": true,
  "data": { /* created utilization */ },
  "message": "Utilization recorded successfully"
}
```

### PUT /utilizations/:id
Update utilization record

### GET /utilizations/stats
Get utilization statistics
```json
Response (200):
{
  "success": true,
  "data": {
    "totalUtilized": 7350000,
    "paid": 89,
    "pending": 12,
    "totalRecords": 132
  }
}
```

### GET /utilizations/appeal/:appealId/balance
Get remaining balance for an appeal
```json
Response (200):
{
  "success": true,
  "data": {
    "appealId": "APP-2024-001",
    "approvedAmount": 500000,
    "utilizedAmount": 125000,
    "remainingBalance": 375000,
    "utilizationPercentage": 25
  }
}
```

---

## 8. ASSET REFERENCE ENDPOINTS

### GET /assets
Get all asset links
```json
Query Params:
?search=&page=1&limit=10

Response (200):
{
  "success": true,
  "data": {
    "assetLinks": [
      {
        "id": "AST-LINK-001",
        "utilizationId": "UTL-2024-001",
        "appealTitle": "Education Support",
        "assetRegistrationNumber": "ITC-EDU-2024-001",
        "assetName": "Educational Books Package",
        "assetOwner": "itc",
        "linkedDate": "2024-12-20",
        "linkedBy": "Amit Patel",
        "notes": "100 textbook sets"
      }
    ],
    "pagination": { /* pagination info */ }
  }
}
```

### GET /assets/:id
Get single asset link

### POST /assets/link
Link asset to utilization
```json
Request:
{
  "utilizationId": "UTL-2024-001",
  "assetRegistrationNumber": "ITC-EDU-2024-001",
  "assetName": "Educational Books Package",
  "assetOwner": "itc",
  "notes": "100 textbook sets for primary education"
}

Response (201):
{
  "success": true,
  "data": { /* created asset link */ },
  "message": "Asset linked successfully"
}
```

### DELETE /assets/:id
Unlink asset reference

### GET /assets/stats
Get asset statistics
```json
Response (200):
{
  "success": true,
  "data": {
    "totalLinks": 48,
    "itcAssets": 28,
    "missionAssets": 20,
    "uniqueAssets": 35
  }
}
```

---

## 9. BENEFICIARY MANAGEMENT ENDPOINTS

### GET /beneficiaries
Get all beneficiaries
```json
Query Params:
?category=all (options: all, Education, Healthcare, Infrastructure, Social Welfare)
&search=
&page=1
&limit=10

Response (200):
{
  "success": true,
  "data": {
    "beneficiaries": [
      {
        "id": "BEN-2024-001",
        "name": "Ramesh Kumar",
        "category": "Education",
        "location": "Village Baghpat, UP",
        "phone": "+91 98765 12345",
        "email": "ramesh@email.com",
        "appealId": "APP-2024-001",
        "appealTitle": "Education Support",
        "impactReceived": "Received full scholarship...",
        "feedbackRating": 5,
        "feedbackText": "This support has changed...",
        "hasImages": true,
        "registeredDate": "2024-12-15",
        "registeredBy": "Priya Sharma"
      }
    ],
    "pagination": { /* pagination info */ }
  }
}
```

### GET /beneficiaries/:id
Get single beneficiary

### POST /beneficiaries
Add new beneficiary
```json
Request:
{
  "name": "Ramesh Kumar",
  "phone": "+91 98765 12345",
  "email": "ramesh@email.com",
  "location": "Village Baghpat, UP",
  "category": "Education",
  "appealId": "APP-2024-001",
  "impactReceived": "Received scholarship",
  "feedbackRating": 5,
  "feedbackText": "Very grateful..."
}

Response (201):
{
  "success": true,
  "data": { /* created beneficiary */ },
  "message": "Beneficiary added successfully"
}
```

### PUT /beneficiaries/:id
Update beneficiary

### POST /beneficiaries/:id/images
Upload impact images
```json
Request: multipart/form-data
{
  "images": [<file1>, <file2>, <file3>]
}

Response (200):
{
  "success": true,
  "data": {
    "imageUrls": ["/uploads/beneficiaries/...", ...]
  }
}
```

### GET /beneficiaries/stats
Get beneficiary statistics
```json
Response (200):
{
  "success": true,
  "data": {
    "totalBeneficiaries": 3890,
    "avgSatisfaction": 4.6,
    "feedbackCollected": 1245,
    "withImages": 890
  }
}
```

---

## 10. REPORTS & ANALYTICS ENDPOINTS

### GET /reports/appeal-wise
Get appeal-wise utilization report
```json
Query Params:
?from=2024-01-01&to=2024-12-31

Response (200):
{
  "success": true,
  "data": [
    {
      "appealId": "APP-2024-001",
      "appealTitle": "Education Support",
      "approvedAmount": 500000,
      "utilizedAmount": 375000,
      "remainingBalance": 125000,
      "utilizationPercentage": 75
    }
  ]
}
```

### GET /reports/donation-utilization
Get donation received vs utilized report

### GET /reports/pending-balance
Get pending balance report

### GET /reports/asset-utilization
Get asset utilization reference report

### GET /reports/beneficiary-impact
Get beneficiary impact report

### GET /reports/audit
Get complete audit report

### GET /reports/export/:type
Export report as PDF or Excel
```json
Query Params:
?format=pdf (options: pdf, excel)
&from=2024-01-01
&to=2024-12-31

Response (200): File Blob
Content-Type: application/pdf or application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="report-appeal-wise-2024.pdf"
```

### GET /reports/summary
Get overall summary for reports page
```json
Response (200):
{
  "success": true,
  "data": {
    "totalApproved": 4250000,
    "totalUtilized": 3160000,
    "remainingBalance": 1090000,
    "utilizationRate": 74.4
  }
}
```

---

## 11. SETTINGS & USER MANAGEMENT ENDPOINTS

### GET /settings/users
Get all system users

### POST /settings/users
Add new user
```json
Request:
{
  "name": "New User",
  "email": "newuser@email.com",
  "role": "itc_admin",
  "password": "temporary123"
}

Response (201):
{
  "success": true,
  "data": { /* created user */ },
  "message": "User created successfully"
}
```

### PUT /settings/users/:id
Update user details

### DELETE /settings/users/:id
Delete user

### PUT /settings/users/:id/password
Reset user password
```json
Request:
{
  "newPassword": "newpassword123"
}

Response (200):
{
  "success": true,
  "message": "Password reset successfully"
}
```

### GET /settings/roles
Get roles and permissions matrix
```json
Response (200):
{
  "success": true,
  "data": {
    "Super Admin": {
      "appeals": ["create", "view", "edit", "delete"],
      "approvals": ["approve", "reject", "view"],
      // ... all permissions
    },
    // ... other roles
  }
}
```

### GET /settings/general
Get general settings

### PUT /settings/general
Update general settings
```json
Request:
{
  "organizationName": "ITC × Anoopam Mission",
  "financialYear": "2024-2025",
  "sessionTimeout": 30
}

Response (200):
{
  "success": true,
  "message": "Settings updated successfully"
}
```

### PUT /settings/notifications
Update notification preferences
```json
Request:
{
  "emailNotifications": true,
  "approvalNotifications": true,
  "weeklyReports": false
}

Response (200):
{
  "success": true,
  "message": "Notification settings updated"
}
```

---

## Error Responses

All endpoints follow standard error response format:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password",
    "details": {}
  }
}
```

### Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

---

## Notes for Backend Development

1. **Authentication**: Implement JWT-based authentication with refresh tokens
2. **Role-based Access**: Enforce role-based permissions on all protected endpoints
3. **Pagination**: Use cursor-based or offset pagination for list endpoints
4. **File Uploads**: Support multipart/form-data for document and image uploads
5. **Validation**: Validate all input data on the server side
6. **Error Handling**: Provide descriptive error messages
7. **Logging**: Log all API requests and responses for audit
8. **Rate Limiting**: Implement rate limiting to prevent abuse
9. **CORS**: Configure CORS for frontend domain
10. **Database**: Use transactions for multi-step operations (approval + notification)

---

## Environment Variables Required

```env
PORT=5000
NODE_ENV=production
DATABASE_URL=postgresql://user:password@localhost:5432/donation_db
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRY=24h
FRONTEND_URL=https://your-frontend-domain.com
FILE_UPLOAD_PATH=/uploads
MAX_FILE_SIZE=10485760
EMAIL_SERVICE_API_KEY=your-email-api-key
WHATSAPP_API_KEY=your-whatsapp-api-key
```

---

## Database Schema Suggestions

**Tables needed:**
- users
- appeals
- approvals
- donations
- communications
- utilizations
- asset_links
- beneficiaries
- documents
- activity_logs

**Relationships:**
- appeals → approvals (one-to-many)
- appeals → donations (one-to-many)
- appeals → utilizations (one-to-many)
- appeals → beneficiaries (one-to-many)
- utilizations → asset_links (one-to-many)

---

This documentation provides all API endpoints needed for the frontend. Implement these on your backend and the system will work seamlessly.
