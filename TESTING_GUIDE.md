# Routes & Navigation Testing Guide

## Quick Start

### 1. Run the Development Server
```bash
npm run dev
```
The app will open at `http://localhost:3000`

---

## Test Scenarios

### Authentication Flow

#### Test 1: Login Page Display
1. Open the app
2. **Expected**: Login form should be displayed
3. **Components tested**: Login.tsx

#### Test 2: Login Submission (with Mock)
1. Enter any email and password
2. Click "Login"
3. **Expected**: User is logged in and redirected to Dashboard
4. **Components tested**: Login.tsx, App.tsx

#### Test 3: Dashboard Loads After Login
1. After successful login
2. **Expected**: Dashboard component displays with user info in sidebar
3. **Components tested**: Dashboard.tsx, Navigation.tsx

---

### Navigation Routes (Desktop)

#### Test 4: Sidebar Navigation Works
1. After login, click on each menu item:
   - Appeal Management
   - Approval Workflow
   - Donor Communication
   - Donation Receipt
   - Fund Utilization
   - Asset Reference
   - Beneficiary Management
   - Reports & Analytics
   - Settings

2. **Expected**: 
   - Page changes to selected component
   - Sidebar highlight updates
   - User stays authenticated

#### Test 5: Active Page Indicator
1. Click any menu item
2. **Expected**: 
   - Selected item shows green highlight
   - Highlight matches activePage state
   - Visual feedback is immediate

#### Test 6: Logout Function
1. Click "Logout" button in sidebar
2. **Expected**: 
   - User redirected to login page
   - authToken removed from localStorage
   - isAuthenticated state reset

---

### Navigation Routes (Mobile)

#### Test 7: Mobile Menu Toggle
1. Resize browser to mobile size (< 1024px)
2. Click hamburger menu icon (top left)
3. **Expected**: Sidebar slides in from left with overlay

#### Test 8: Mobile Menu Navigation
1. On mobile view, open menu
2. Click any menu item
3. **Expected**: 
   - Menu closes automatically
   - Page changes to selected component
   - Overlay disappears

#### Test 9: Mobile Menu Close
1. On mobile view with menu open
2. Click the X button or overlay
3. **Expected**: Menu slides out, overlay removed

---

### Role-Based Access Control

#### Test 10: Menu Items Filtered by Role
1. Login as `super_admin` role
2. **Expected**: All 10 menu items visible

#### Test 11: Limited Access Roles
1. Login with different roles (simulate in mockData):
   - `mission_authority` → Should see: Dashboard, Appeals, Approvals, Reports
   - `accounts_user` → Should see: Dashboard, Donations, Utilization, Assets, Reports
   - `viewer` → Should see: Dashboard, Appeals, Communication, Donations, Utilization, Assets, Beneficiaries, Reports

2. **Expected**: Only allowed items appear in menu

#### Test 12: Unauthorized Navigation
1. Login as `viewer` (no Settings access)
2. **Expected**: Settings menu item not visible
3. Try to access directly by checking App.tsx default case
4. **Expected**: Defaults to Dashboard

---

### State Management

#### Test 13: User Info Persistence
1. Login and navigate pages
2. **Expected**: 
   - User name and role visible in sidebar
   - Avatar initial shows first letter of name
   - Same across all pages

#### Test 14: Menu State Persistence
1. Login and navigate to various pages
2. **Expected**: 
   - Mobile menu state independent per navigation
   - Desktop sidebar always visible
   - No menu state carries over to subsequent pages

#### Test 15: Page Switching Without Logout
1. Login and navigate multiple times
2. **Expected**: 
   - Logout still works correctly
   - AuthToken still valid in localStorage
   - No unexpected state resets

---

### API Integration

#### Test 16: API Call on Page Load
1. Login successfully
2. **Expected**: 
   - authToken stored in localStorage
   - Token available for API calls in components
   - Mock data loads (if using mockData service)

---

## Page Component Tests

### Dashboard
- [x] Displays user information
- [x] Shows welcome message
- [x] Responsive layout

### Appeal Management
- [x] Component loads
- [x] Can navigate away
- [x] Returns to same state

### Approval Workflow
- [x] Restricted to super_admin, mission_authority
- [x] Component renders

### Donor Communication
- [x] Accessible to super_admin, itc_admin, viewer
- [x] Component renders

### Donation Receipt
- [x] Shows donation data
- [x] Multiple role access works

### Fund Utilization
- [x] Component loads
- [x] Renders correctly

### Asset Reference
- [x] Component loads
- [x] Responsive design works

### Beneficiary Management
- [x] Component loads
- [x] Multiple role access works

### Reports & Analytics
- [x] Component loads
- [x] Charts render (if available)

### Settings
- [x] Restricted to super_admin, itc_admin only
- [x] Component loads

---

## Edge Cases

#### Test 17: Direct Component Access
1. Try to manually navigate or reload page
2. **Expected**: 
   - If not authenticated → Login page
   - If authenticated → Current page maintained
   - No state loss on page refresh (if token is valid)

#### Test 18: Rapid Menu Clicks
1. Rapidly click multiple menu items
2. **Expected**: 
   - All pages load correctly
   - No state conflicts
   - Clean transitions

#### Test 19: Window Resize During Navigation
1. Navigate on desktop, resize to mobile
2. Resize to desktop while on mobile
3. **Expected**: 
   - Layout adapts correctly
   - Navigation stays functional
   - No errors in console

---

## Console Checks

After each test:
- ✓ No errors in browser console
- ✓ No warnings about unused props
- ✓ No TypeScript type errors
- ✓ No API call failures (for connected endpoints)

---

## Browser DevTools Checks

### Network Tab
- ✓ Auth token sent in headers
- ✓ API calls use correct headers
- ✓ No failed requests for assets

### Application/Storage Tab
- ✓ authToken visible in localStorage after login
- ✓ authToken removed after logout

### React DevTools (if installed)
- ✓ activePage state updates correctly
- ✓ isAuthenticated state toggles on login/logout
- ✓ currentUser object contains correct data

---

## Performance Metrics

- Build time: < 15 seconds ✓
- Bundle size: < 800 kB
- First page load: < 2 seconds
- Navigation transitions: < 300ms

---

## Accessibility Checks

- [x] Keyboard navigation works (Tab through menu)
- [x] Color contrast meets WCAG standards
- [x] Buttons are properly sized for touch (mobile)
- [x] Responsive text sizing

---

## Summary

All routes and navigation are functioning properly:
- ✓ 10 main routes configured
- ✓ 5 user roles implemented with proper access control
- ✓ Mobile responsive navigation
- ✓ Authentication flow working
- ✓ State management correct
- ✓ Build succeeds with no blocking errors
