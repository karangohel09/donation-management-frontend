# Frontend Troubleshooting & Testing Guide

## ✅ Current Setup Status

### Fixed Issues:
1. ✅ **Vite Proxy Configuration** - Fixed duplicate `server` config
2. ✅ **API Base URL** - Changed from `http://localhost:5000/api` to `/api` (uses proxy)
3. ✅ **Proxy Path Rewriting** - Correctly rewrites `/api` requests to `/auth/login` format
4. ✅ **Error Handling** - Enhanced logging for debugging
5. ✅ **UI Error Display** - Better error message formatting

---

## 🔧 Backend Requirements

Your backend must be running on `http://localhost:5000` with these endpoints:

### Authentication Endpoints
```
POST   /api/auth/login       - Login with email & password
GET    /api/auth/me          - Get current user info (requires Bearer token)
```

### Expected Backend Response Format

**Login Response:**
```json
{
  "token": "eyJhbGc...",
  "id": "1",
  "name": "Super Admin",
  "email": "admin@itc.com",
  "role": "SUPER_ADMIN"
}
```

**Current User Response:**
```json
{
  "id": "1",
  "name": "Super Admin",
  "email": "admin@itc.com",
  "role": "SUPER_ADMIN"
}
```

---

## 🚀 Testing Checklist

### 1. **Start Backend Server**
- Ensure your Spring Boot backend is running on `http://localhost:5000`
- Check the backend application status in IntelliJ console

### 2. **Start Frontend Dev Server**
```bash
npm run dev
```
- Frontend will run on `http://localhost:3002` (or next available port)
- Dev server logs should show: `VITE v6.4.1 ready`

### 3. **Test Login Flow**
- Navigate to the login page
- Enter your admin credentials:
  - Email: `admin@itc.com`
  - Password: `admin123` (or your actual password)
- Click "Login"

### 4. **Verify Token Storage**
After successful login:
```javascript
// In browser console, verify:
localStorage.getItem('auth_token')   // Should contain JWT token
localStorage.getItem('auth_user')    // Should contain user object
```

### 5. **Test Navigation**
- Navigate through all menu items
- Verify each page loads without errors
- Check browser console for any API errors

---

## 🔍 Common Issues & Solutions

### Issue 1: 403 Forbidden on Login

**Cause:** Proxy path rewriting issue

**Solution:** Verify `vite.config.ts` has correct proxy configuration:
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:5000/api',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
  },
},
```

**Test:** In Postman, make request to `http://localhost:5000/api/auth/login`

---

### Issue 2: 401 Unauthorized on /auth/me

**Cause:** Token not being sent in Authorization header

**Solution:** Check browser DevTools Network tab:
- Headers should contain: `Authorization: Bearer <token>`
- If missing, check that `authService.getToken()` returns the token

**Debug:** Add to console after login:
```javascript
fetch('/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
}).then(r => r.json()).then(console.log)
```

---

### Issue 3: Network Error (Cannot reach backend)

**Cause:** Backend is not running or using wrong port

**Solution:**
1. Check backend is running on port 5000
2. Verify in browser: `curl http://localhost:5000/api/health`
3. Check firewall settings

---

### Issue 4: CORS Errors

**Cause:** Requests going directly to backend instead of through proxy

**Solution:** Verify API client is using proxy:
```typescript
// ✅ CORRECT - Uses proxy
const API_BASE_URL = '/api'

// ❌ WRONG - Direct backend call
const API_BASE_URL = 'http://localhost:5000/api'
```

---

## 📋 Frontend Architecture

### File Structure:
```
src/
├── services/
│   ├── api.ts           - All API endpoints
│   ├── auth.ts          - JWT token & user management
│   └── mockData.ts      - Mock data for development
├── components/
│   ├── App.tsx          - Main app routing
│   ├── Login.tsx        - Authentication page
│   ├── Dashboard.tsx    - Main dashboard
│   └── [other pages]
├── App.tsx              - Root component
└── main.tsx             - Entry point
```

### Authentication Flow:
1. User enters credentials → Login component
2. Login calls `authAPI.login(email, password)`
3. Backend returns JWT token
4. Token saved to `localStorage` via `authService.setToken()`
5. Call `authAPI.getCurrentUser()` with Bearer token
6. Redirect to dashboard on success

### API Interceptors:
- **Request:** Automatically adds `Authorization: Bearer <token>` header
- **Response:** 
  - 401 → Clears auth & redirects to login
  - 403 → Logs insufficient permissions
  - 5xx → Logs server error

---

## 🧪 Console Debugging

### Enable Detailed Logging:

In `src/services/api.ts`, all API errors now log:
```
{
  status: 403,
  url: "/auth/me",
  method: "get",
  message: "Request failed with status code 403",
  data: { ... }
}
```

Check browser DevTools Console to see:
- Network errors
- Authentication failures
- API response data

---

## ✨ What Should Work Now

✅ Login with valid credentials
✅ Token persistence (refresh page, token is restored)
✅ Navigate through all pages
✅ API requests use proxy (no CORS issues)
✅ Automatic logout on token expiration (401)
✅ Better error messages
✅ All routes load without breaking

---

## 📞 Quick Support

| Issue | Check |
|-------|-------|
| Login fails | Backend running on port 5000? |
| 403 error | Proxy config correct? Backend accepting JWT? |
| Can't navigate | Check console for JavaScript errors |
| Token not persisting | Check localStorage in DevTools |
| Blank page | Check browser DevTools Console for errors |

---

## 🔄 Restart Steps

If something breaks:

1. **Stop everything:**
   ```bash
   # Ctrl+C in all terminals
   ```

2. **Clear cache:**
   ```bash
   npm run clean  # or manually delete node_modules/.vite
   ```

3. **Restart in order:**
   ```bash
   # Terminal 1: Backend
   # (Start your Spring Boot app)

   # Terminal 2: Frontend
   npm run dev
   ```

4. **Open browser:**
   ```
   http://localhost:3002
   ```

---

**Last Updated:** January 17, 2026
