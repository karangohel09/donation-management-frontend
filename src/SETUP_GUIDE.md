# Donation Management System - Setup Guide

## Overview
This is a fully responsive, enterprise-grade Donation Management & Utilization Tracking System built with React, TypeScript, and Tailwind CSS. The frontend is **API-ready** and configured to work with a backend API using Axios.

---

## Features
✅ **Fully Responsive** - Works on all devices (mobile, tablet, desktop)
✅ **API Integration** - Complete Axios setup with all endpoints documented
✅ **Role-Based Access** - 5 user roles with different permissions
✅ **Mock Data Mode** - Works without backend for development
✅ **Production Ready** - Switch to real API by changing one variable

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
# or
yarn install
```

### 2. Configure API URL
Create a `.env` file in the root directory:

```env
# Development (Mock API)
REACT_APP_API_URL=http://localhost:5000/api

# Production (Your Backend URL)
# REACT_APP_API_URL=https://api.yourdomain.com/api
```

### 3. Run the Application
```bash
npm start
# or
yarn start
```

The app will run on `http://localhost:3000`

---

## API Integration

### Current State: Mock Mode
The application currently uses **mock data** to simulate API responses. This allows you to:
- Test the entire UI/UX
- Develop without a backend
- See realistic data flow

### Switching to Real API

**Step 1:** Build your backend with the endpoints documented in `API_DOCUMENTATION.md`

**Step 2:** Update the API URL in `.env`:
```env
REACT_APP_API_URL=https://your-backend-api.com/api
```

**Step 3:** Remove mock data simulation:
In `/services/api.ts`, replace mock responses with real API calls. For example:

**Current (Mock):**
```typescript
// In components
import { mockUsers, delay } from '../services/mockData';

const handleSubmit = async (e) => {
  await delay(800); // Simulate network delay
  const user = mockUsers.find(...);
  // ...
};
```

**Change to (Real API):**
```typescript
// In components
import { authAPI } from '../services/api';

const handleSubmit = async (e) => {
  const response = await authAPI.login(email, password);
  const { token, user } = response.data;
  // ...
};
```

**Step 4:** All API calls are already structured in `/services/api.ts`. Just uncomment and use them!

---

## File Structure

```
/
├── src/
│   ├── components/          # All React components
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Navigation.tsx
│   │   ├── AppealManagement.tsx
│   │   ├── ApprovalWorkflow.tsx
│   │   ├── DonorCommunication.tsx
│   │   ├── DonationReceipt.tsx
│   │   ├── FundUtilization.tsx
│   │   ├── AssetReference.tsx
│   │   ├── BeneficiaryManagement.tsx
│   │   ├── Reports.tsx
│   │   └── Settings.tsx
│   │
│   ├── services/            # API integration layer
│   │   ├── api.ts          # Axios setup + all endpoints
│   │   └── mockData.ts     # Mock data (remove for production)
│   │
│   ├── hooks/              # Custom React hooks
│   │   └── useAPI.ts       # Hook for API calls
│   │
│   ├── App.tsx             # Main app component
│   └── styles/
│       └── globals.css     # Global styles
│
├── API_DOCUMENTATION.md    # Complete API documentation
├── SETUP_GUIDE.md         # This file
└── .env                    # Environment variables
```

---

## API Documentation

See `API_DOCUMENTATION.md` for complete API specifications including:
- All endpoints (50+ endpoints)
- Request/Response formats
- Authentication flow
- Error handling
- Database schema suggestions

---

## Responsive Design

The application is fully responsive with breakpoints:

- **Mobile:** < 640px (sm)
- **Tablet:** 640px - 1024px (md, lg)
- **Desktop:** > 1024px (lg, xl)

### Mobile Features:
- Hamburger menu for navigation
- Collapsible sidebar
- Touch-friendly buttons
- Optimized layouts for small screens
- Horizontal scrolling for tables (when needed)

### Key Responsive Components:
- Navigation with mobile menu
- Dashboard cards stack on mobile
- Tables scroll horizontally on mobile
- Charts resize automatically
- Modals are full-screen on mobile

---

## User Roles & Permissions

1. **Super Admin** - Full access to everything
2. **ITC Admin** - Manage appeals, donations, utilization
3. **Mission Authority** - Approve/reject appeals
4. **Accounts User** - Manage donations and utilization
5. **Viewer** - Read-only access

---

## Demo Accounts

Use these credentials for quick login (mock mode only):

| Email | Password | Role |
|-------|----------|------|
| rajesh@itc.com | demo | Super Admin |
| priya@itc.com | demo | ITC Admin |
| swami@anoopam.org | demo | Mission Authority |
| amit@accounts.com | demo | Accounts User |
| viewer@itc.com | demo | Viewer |

---

## Backend Requirements

To build the backend API, you need:

### Technology Stack (Recommended):
- **Node.js + Express** (or any backend framework)
- **PostgreSQL** (or MySQL, MongoDB)
- **JWT** for authentication
- **Multer** for file uploads
- **Nodemailer** for emails (optional)
- **WhatsApp Business API** (optional)

### Database Tables Needed:
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

See `API_DOCUMENTATION.md` for detailed schema suggestions.

---

## Environment Variables

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Backend (.env)
```env
PORT=5000
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@localhost:5432/donation_db
JWT_SECRET=your-super-secret-key
JWT_EXPIRY=24h
FRONTEND_URL=https://your-frontend.com
FILE_UPLOAD_PATH=/uploads
MAX_FILE_SIZE=10485760
EMAIL_SERVICE_API_KEY=your-key
WHATSAPP_API_KEY=your-key
```

---

## Testing the Application

### 1. Test Responsiveness
- Open browser DevTools (F12)
- Click "Toggle Device Toolbar" (Ctrl+Shift+M)
- Test on different screen sizes:
  - iPhone SE (375px)
  - iPad (768px)
  - Desktop (1920px)

### 2. Test API Integration (Mock Mode)
- All features work with mock data
- Network delay is simulated (500-800ms)
- Check browser console for errors

### 3. Test User Roles
- Login as different users
- Verify role-based menu access
- Check read-only restrictions for Viewer

---

## Deployment

### Frontend Deployment (Vercel/Netlify)

1. **Build the app:**
```bash
npm run build
```

2. **Set environment variables** in your hosting platform:
```
REACT_APP_API_URL=https://api.yourdomain.com/api
```

3. **Deploy:**
- Vercel: `vercel --prod`
- Netlify: `netlify deploy --prod`

### Backend Deployment (Heroku/AWS/DigitalOcean)

1. Set up your database
2. Configure environment variables
3. Deploy your backend code
4. Update `REACT_APP_API_URL` in frontend

---

## Common Issues & Solutions

### Issue: CORS Error
**Solution:** Configure CORS in your backend:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### Issue: 401 Unauthorized
**Solution:** Check JWT token in localStorage:
```javascript
console.log(localStorage.getItem('authToken'));
```

### Issue: Mobile menu not working
**Solution:** Check z-index and overlay click handler in Navigation component

### Issue: Tables overflow on mobile
**Solution:** Tables are wrapped in `overflow-x-auto` div - scroll horizontally

---

## Development Workflow

### Phase 1: Frontend Development (Current)
✅ UI/UX complete
✅ All components built
✅ Responsive design
✅ API structure ready
✅ Mock data working

### Phase 2: Backend Development (Next)
- [ ] Set up Node.js + Express
- [ ] Create database schema
- [ ] Implement all API endpoints
- [ ] Add JWT authentication
- [ ] File upload handling
- [ ] Email/SMS integration

### Phase 3: Integration
- [ ] Update API URLs
- [ ] Remove mock data
- [ ] Test all features
- [ ] Fix bugs
- [ ] Performance optimization

### Phase 4: Production
- [ ] Security audit
- [ ] Load testing
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Monitor & maintain

---

## API Call Examples

### Example 1: Fetching Dashboard Stats
```typescript
import { dashboardAPI } from './services/api';
import { useAPI } from './hooks/useAPI';

function Dashboard() {
  const { data, loading, error } = useAPI(() => dashboardAPI.getStats());
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <div>Total Approved: ₹{data.totalApproved}</div>;
}
```

### Example 2: Creating an Appeal
```typescript
import { appealAPI } from './services/api';

async function createAppeal(data) {
  try {
    const response = await appealAPI.createAppeal(data);
    console.log('Appeal created:', response.data);
  } catch (error) {
    console.error('Failed to create appeal:', error);
  }
}
```

### Example 3: Downloading a Report
```typescript
import { reportsAPI } from './services/api';

async function downloadReport() {
  try {
    const response = await reportsAPI.exportReport(
      'appeal-wise',
      'pdf',
      { from: '2024-01-01', to: '2024-12-31' }
    );
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'report.pdf');
    document.body.appendChild(link);
    link.click();
  } catch (error) {
    console.error('Failed to download report:', error);
  }
}
```

---

## Support & Documentation

- **API Documentation:** `API_DOCUMENTATION.md`
- **Component Guide:** Check JSDoc comments in each component
- **Styling Guide:** Tailwind CSS v4 with custom design tokens
- **Icons:** Lucide React icons library

---

## Next Steps

1. ✅ Frontend is complete and ready
2. 📝 Read `API_DOCUMENTATION.md` carefully
3. 🔨 Build your backend following the API specs
4. 🔗 Connect frontend to backend (change API URL)
5. 🧪 Test thoroughly
6. 🚀 Deploy to production

---

## License & Credits

**Built for:** ITC × Anoopam Mission  
**Purpose:** CSR Donation Management & Transparency  
**Technology:** React, TypeScript, Tailwind CSS, Axios, Recharts

---

For questions or support, refer to the code comments and documentation files.

**Good luck with your backend development! 🚀**
