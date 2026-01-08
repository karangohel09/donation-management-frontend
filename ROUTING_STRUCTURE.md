# Routing & Navigation Structure

## Overview
This Donation Management System uses a **client-side routing system** (not React Router) with state management through React props. The application uses a simple page-switching mechanism based on an `activePage` state.

---

## Route Configuration

### Available Routes

| Route ID | Label | Component | Required Role |
|----------|-------|-----------||
| `dashboard` | Dashboard | `Dashboard.tsx` | All roles |
| `appeals` | Appeal Management | `AppealManagement.tsx` | super_admin, itc_admin, mission_authority, viewer |
| `approvals` | Approval Workflow | `ApprovalWorkflow.tsx` | super_admin, mission_authority |
| `communication` | Donor Communication | `DonorCommunication.tsx` | super_admin, itc_admin, viewer |
| `donations` | Donation Receipt | `DonationReceipt.tsx` | super_admin, itc_admin, accounts_user, viewer |
| `utilization` | Fund Utilization | `FundUtilization.tsx` | super_admin, itc_admin, accounts_user, viewer |
| `assets` | Asset Reference | `AssetReference.tsx` | super_admin, itc_admin, accounts_user, viewer |
| `beneficiaries` | Beneficiary Management | `BeneficiaryManagement.tsx` | super_admin, itc_admin, viewer |
| `reports` | Reports & Analytics | `Reports.tsx` | super_admin, itc_admin, mission_authority, accounts_user, viewer |
| `settings` | Settings | `Settings.tsx` | super_admin, itc_admin |

---

## User Roles

The system supports the following user roles:

```typescript
type UserRole = 'super_admin' | 'itc_admin' | 'mission_authority' | 'accounts_user' | 'viewer';
```

### Role-Based Access Control
- **Super Admin** (`super_admin`): Full access to all pages
- **ITC Admin** (`itc_admin`): Access to dashboard, appeals, communication, donations, utilization, assets, beneficiaries, reports, settings
- **Mission Authority** (`mission_authority`): Access to dashboard, appeals, approvals, reports
- **Accounts User** (`accounts_user`): Access to dashboard, donations, utilization, assets, reports
- **Viewer** (`viewer`): Read-only access to dashboard, appeals, communication, donations, utilization, assets, beneficiaries, reports

---

## Application Flow

### 1. Authentication Flow

```
User Opens App
    ↓
Check isAuthenticated state
    ↓
  NO → Show Login Component
         ↓
      User enters credentials
         ↓
      API call to /auth/login
         ↓
      Set authToken in localStorage
         ↓
      Set isAuthenticated = true
         ↓
  YES → Show Main App with Navigation
```

### 2. Page Navigation

```
Navigation Component (Sidebar)
    ↓
Menu Item Click
    ↓
onPageChange(pageId) called
    ↓
Update activePage state in App.tsx
    ↓
renderPage() switch statement
    ↓
Display corresponding component
```

---

## File Structure

```
src/
├── App.tsx                          # Main app, routing logic, state management
├── components/
│   ├── Navigation.tsx               # Sidebar navigation component
│   ├── Login.tsx                    # Login page
│   ├── Dashboard.tsx                # Dashboard page
│   ├── AppealManagement.tsx         # Appeals page
│   ├── ApprovalWorkflow.tsx         # Approvals page
│   ├── DonorCommunication.tsx       # Communication page
│   ├── DonationReceipt.tsx          # Donations page
│   ├── FundUtilization.tsx          # Fund utilization page
│   ├── AssetReference.tsx           # Assets page
│   ├── BeneficiaryManagement.tsx    # Beneficiaries page
│   ├── Reports.tsx                  # Reports page
│   ├── Settings.tsx                 # Settings page
│   └── ui/                          # UI component library (Shadcn)
├── services/
│   ├── api.ts                       # API client configuration
│   └── mockData.ts                  # Mock data for development
└── hooks/
    └── useAPI.ts                    # API hook for data fetching
```

---

## State Management

### App.tsx State Variables

```typescript
const [isAuthenticated, setIsAuthenticated] = useState(false);      // Auth status
const [currentUser, setCurrentUser] = useState<User | null>(null);  // Current user info
const [activePage, setActivePage] = useState('dashboard');         // Current page
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);    // Mobile menu state
```

### Navigation Props

```typescript
interface NavigationProps {
  user: User;                                    // Current user
  activePage: string;                            // Current active page
  onPageChange: (page: string) => void;         // Page change handler
  onLogout: () => void;                         // Logout handler
  isMobileMenuOpen: boolean;                    // Mobile menu state
  setIsMobileMenuOpen: (open: boolean) => void; // Mobile menu setter
}
```

---

## Component Pages

Each page component receives a `user` prop:

```typescript
interface PageProps {
  user: User;
}

export default function DashboardPage({ user }: PageProps) {
  // Component implementation
}
```

---

## Mobile Responsive Design

- **Desktop**: Fixed sidebar navigation (64 units / 256px width)
- **Mobile**: Hamburger menu with overlay
- **Transitions**: Smooth slide-in/out animations for mobile menu

---

## Error Handling

### Login Errors
- Invalid credentials → Shows error message
- Network errors → Error toast notification
- Missing auth token → Redirects to login

### Route Access Errors
- Unauthorized role → Filtered from menu
- Direct URL access → Falls back to dashboard

---

## Logout Flow

```
User Clicks Logout
    ↓
handleLogout() called
    ↓
Clear currentUser
    ↓
Clear isAuthenticated
    ↓
Reset activePage to 'dashboard'
    ↓
Remove authToken from localStorage
    ↓
Show Login Component
```

---

## Integration Points

### API Endpoints Used

- **Authentication**: `/auth/login` - User login
- **Future**: `/auth/me` - Get current user (TODO)
- **Data**: Various endpoints in `services/api.ts`

### External Dependencies

- **Radix UI**: Component primitives
- **Lucide React**: Icons
- **React Hook Form**: Form management
- **Axios**: HTTP requests
- **Tailwind CSS**: Styling

---

## Notes

1. **No React Router**: This app uses state-based routing instead of URL-based routing
2. **Role-Based UI**: Menu items automatically filtered based on user role
3. **Session Storage**: Auth token stored in localStorage
4. **Responsive**: Mobile-first design with Tailwind CSS utilities
5. **Type-Safe**: Full TypeScript implementation with proper types

---

## Future Enhancements

- [ ] Add URL-based routing with React Router v6
- [ ] Implement `/auth/me` endpoint for user profile refresh
- [ ] Add route guards and protected routes
- [ ] Implement breadcrumb navigation
- [ ] Add deep linking support
- [ ] Implement history navigation (back/forward)
