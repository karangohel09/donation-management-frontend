# Code Reference - JWT Token Persistence Implementation

## 1. Session Restoration (App.tsx)

### useEffect Hook - Runs on App Load
```typescript
useEffect(() => {
  const restoreSession = async () => {
    try {
      const token = authService.getToken();
      
      if (token && authService.isTokenValid()) {
        // Try to fetch current user with the token
        const response = await authAPI.getCurrentUser();
        if (response?.data?.user) {
          setCurrentUser(response.data.user);
          setIsAuthenticated(true);
        } else {
          // Token exists but user fetch failed
          authService.logout();
          setIsAuthenticated(false);
        }
      } else {
        // No valid token found
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
      authService.logout();
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  restoreSession();
}, []);
```

---

## 2. Request Interceptor (api.ts)

### Auto-Inject Token in Headers
```typescript
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

---

## 3. Response Interceptor (api.ts)

### Handle 401 Errors
```typescript
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized (token expired or invalid)
    if (error.response?.status === 401) {
      console.warn("JWT expired or invalid – logging out");
      localStorage.removeItem('authToken');
      window.location.href = '/'; // Redirect to login
    }
    
    // Handle 403 Forbidden (insufficient permissions)
    if (error.response?.status === 403) {
      console.warn("Access forbidden - insufficient permissions");
    }
    
    // Handle 500+ Server errors
    if (error.response?.status >= 500) {
      console.error("Server error:", error.response?.status);
    }
    
    return Promise.reject(error);
  }
);
```

---

## 4. Auth Service (auth.ts)

### Complete Authentication Utilities
```typescript
export const authService = {
  setToken: (token: string) => {
    localStorage.setItem('authToken', token);
  },

  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  },

  removeToken: () => {
    localStorage.removeItem('authToken');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  },

  validateSession: async (): Promise<User | null> => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return null;

      const response = await authAPI.getCurrentUser();
      if (response?.data?.user) {
        return response.data.user;
      }
      return null;
    } catch (error) {
      console.error('Session validation failed:', error);
      localStorage.removeItem('authToken');
      return null;
    }
  },

  logout: () => {
    localStorage.removeItem('authToken');
  },

  isTokenValid: (): boolean => {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    try {
      // Check if token has 3 parts (header.payload.signature)
      const parts = token.split('.');
      return parts.length === 3;
    } catch {
      return false;
    }
  },
};
```

---

## 5. Login Handler (Login.tsx)

### Store Token on Successful Login
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const response = await authAPI.login(email, password);

    if (!response?.data?.token) {
      setError('Invalid email or password');
      return;
    }

    const token = response.data.token;
    authService.setToken(token); // Store token

    // Get user data from response
    const user: User = response.data.user || {
      id: response.data.userId || '1',
      name: response.data.name || 'User',
      email: email,
      role: response.data.role || 'viewer',
    };

    onLogin(user);

  } catch (err: any) {
    setError(err.response?.data?.message || 'Login failed');
  } finally {
    setLoading(false);
  }
};
```

---

## 6. Logout Handler (App.tsx)

### Clear Token and Session
```typescript
const handleLogout = () => {
  authService.logout(); // Remove token from localStorage
  setCurrentUser(null);
  setIsAuthenticated(false);
  setActivePage('dashboard');
};
```

---

## 7. Route Protection (App.tsx)

### Loading State
```typescript
if (isLoading) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-600">Loading...</div>
    </div>
  );
}
```

### Authentication Guard
```typescript
if (!isAuthenticated) {
  return <Login onLogin={handleLogin} />;
}
```

---

## 8. API Calls in Components

### Example: Fetch Appeals (Auto-includes token)
```typescript
// Token is auto-injected by request interceptor
const response = await appealAPI.getAppeals({ page: 1 });

// What the browser sends:
// GET /appeals?page=1
// Headers: {
//   Authorization: "Bearer eyJhbGc..."
// }
```

---

## 9. State Management (App.tsx)

### Auth State Variables
```typescript
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [currentUser, setCurrentUser] = useState<User | null>(null);
const [activePage, setActivePage] = useState('dashboard');
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
const [isLoading, setIsLoading] = useState(true); // For session restore
```

---

## 10. Backend Response Format

### Login Response (Expected)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "admin@example.com",
    "role": "super_admin"
  },
  "userId": "user_123",
  "name": "John Doe",
  "role": "super_admin"
}
```

### Current User Response (Expected)
```json
{
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "admin@example.com",
    "role": "super_admin"
  }
}
```

### Error Response (Expected)
```json
{
  "message": "Invalid email or password",
  "error": "INVALID_CREDENTIALS"
}
```

---

## 11. Flow Diagram - Code Perspective

### Login Flow
```
Input: email, password
  ↓
POST /auth/login (api.ts)
  ↓
Response: { token, user }
  ↓
authService.setToken(token) // Store in localStorage
  ↓
onLogin(user) // Update React state
  ↓
Output: Dashboard shown, user authenticated
```

### Refresh Flow
```
App mounts
  ↓
useEffect runs (App.tsx)
  ↓
authService.getToken() // Get from localStorage
  ↓
if (token && isTokenValid())
  ↓
GET /auth/me (api.ts)
  ↓
Request Interceptor adds header:
  Authorization: Bearer {token}
  ↓
Response: { user }
  ↓
setCurrentUser(user)
setIsAuthenticated(true)
  ↓
Output: Dashboard shown, no login screen
```

### API Call Flow
```
appealAPI.getAppeals()
  ↓
Request Interceptor triggers
  ↓
Adds Authorization header:
  Authorization: Bearer {token}
  ↓
GET /appeals with header
  ↓
Response: 200 or 401
  ↓
If 401: Response Interceptor triggers
  localStorage.removeItem('authToken')
  window.location.href = '/'
  ↓
Output: User logged out and redirected to login
```

---

## 12. Error Handling Reference

### 401 Unauthorized (Token Expired)
```typescript
if (error.response?.status === 401) {
  localStorage.removeItem('authToken');
  window.location.href = '/';
  // User sees login screen
}
```

### 403 Forbidden (Permission Denied)
```typescript
if (error.response?.status === 403) {
  console.warn("Access forbidden");
  // Show permission error to user
}
```

### 500+ Server Error
```typescript
if (error.response?.status >= 500) {
  console.error("Server error");
  // Show error message to user
}
```

---

## 13. Testing Code

### Manual Token Test
```typescript
// In browser console:
localStorage.getItem('authToken')  // See token
localStorage.removeItem('authToken')  // Clear token
localStorage.setItem('authToken', 'test')  // Set test token
```

### Test API with Token
```javascript
// Get token
const token = localStorage.getItem('authToken');

// Use in fetch (if not using axios)
const response = await fetch('/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## Summary

| Component | Responsibility |
|-----------|----------------|
| `App.tsx` | Session restoration, route protection |
| `Login.tsx` | Store token on login |
| `api.ts` | Request/response interceptors |
| `auth.ts` | Token management utilities |

All together = **Persistent JWT Authentication** ✅
