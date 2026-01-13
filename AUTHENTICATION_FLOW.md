## JWT Token Persistence - Complete Flow Diagram

### 1. Login Flow
```
┌─────────────────────────────────────────────────────────────┐
│                     User Login                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│     Login.tsx: Submit email/password                        │
│     POST /auth/login                                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│     Backend Response:                                        │
│     {                                                        │
│       token: "eyJhbGc...",                                  │
│       user: { id, name, email, role },                     │
│       ...                                                    │
│     }                                                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│     authService.setToken(token)                             │
│     → localStorage.setItem('authToken', token)              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│     onLogin(user) called                                    │
│     → App updates state to authenticated                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│               Dashboard Loads                               │
└─────────────────────────────────────────────────────────────┘
```

### 2. Page Refresh Flow (Persistence)
```
┌─────────────────────────────────────────────────────────────┐
│              User Refreshes Page (F5)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│     App.tsx mounts                                          │
│     → useEffect() runs                                      │
│     → isLoading = true (show loading screen)               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│     authService.getToken()                                  │
│     → Check localStorage for 'authToken'                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
   ┌─────────────┐             ┌──────────────┐
   │Token Found? │             │No Token      │
   └──────┬──────┘             └────┬─────────┘
          │                         │
          ▼                         ▼
   ┌──────────────────────┐  ┌────────────────────┐
   │authService.          │  │setIsAuthenticated  │
   │isTokenValid()?       │  │(false)             │
   └──────┬───────────────┘  │→ Show Login Screen │
          │                  └────────────────────┘
    ┌─────┴─────┐
    │           │
    ▼           ▼
 VALID      INVALID
    │           │
    │           ▼
    │     ┌─────────────────────┐
    │     │authService.logout() │
    │     │Remove token         │
    │     │Show Login Screen    │
    │     └─────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  Call GET /auth/me                                          │
│  Headers: {                                                  │
│    Authorization: "Bearer {token}"   ← Auto added by        │
│  }                                     interceptor          │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
   ┌─────────────┐             ┌────────────────┐
   │200 OK       │             │401 Unauthorized│
   │User Data    │             │(Token Expired) │
   └──────┬──────┘             └────┬───────────┘
          │                         │
          ▼                         ▼
   ┌──────────────────┐    ┌─────────────────────┐
   │Set user state    │    │Response interceptor:│
   │Set authenticated │    │→ Clear token        │
   │  = true          │    │→ Show Login Screen  │
   │isLoading = false │    │isLoading = false    │
   │Show Dashboard    │    │                     │
   └──────────────────┘    └─────────────────────┘
```

### 3. API Request Flow (Token Auto-Injection)
```
┌─────────────────────────────────────────────────────────────┐
│     Any API Call (e.g., Get Appeals)                        │
│     appealAPI.getAppeals(params)                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│     Request Interceptor                                     │
│     ↓                                                        │
│     const token = localStorage.getItem('authToken')         │
│     if (token) {                                            │
│       config.headers.Authorization = `Bearer ${token}`      │
│     }                                                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│     GET /appeals                                            │
│     Headers: {                                              │
│       Authorization: "Bearer eyJhbGc..."                    │
│     }                                                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
   ┌──────────────┐          ┌───────────────────┐
   │200 OK        │          │401 Unauthorized   │
   │Data returned │          │(Token Expired)    │
   └──────┬───────┘          └─────────┬─────────┘
          │                            │
          ▼                            ▼
   ┌──────────────────┐    ┌──────────────────────────┐
   │Return to caller  │    │Response Interceptor:     │
   │Component updates │    │→ localStorage.removeItem │
   │                  │    │   ('authToken')          │
   │                  │    │→ window.location.href=   │
   │                  │    │   '/' (redirect to login)│
   └──────────────────┘    └──────────────────────────┘
```

### 4. Route Protection
```
All Routes Protected:
┌────────────────────────────────────────┐
│           Route Access                 │
├────────────────────────────────────────┤
│ 1. Check isLoading state               │
│    - if true: show loading spinner    │
│    - prevents premature redirect      │
│                                        │
│ 2. Check isAuthenticated state         │
│    - if false: show Login component   │
│    - blocks all protected routes      │
│                                        │
│ 3. If authenticated:                  │
│    - Render requested component       │
│    - Pass currentUser data            │
│    - Enable all features              │
└────────────────────────────────────────┘
```

### 5. Logout Flow
```
┌─────────────────────────────────────────────────────────────┐
│           User Clicks Logout                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│     handleLogout() called                                   │
│     ↓                                                        │
│     authService.logout()                                    │
│     → localStorage.removeItem('authToken')                  │
│     ↓                                                        │
│     setIsAuthenticated(false)                               │
│     setCurrentUser(null)                                    │
│     setActivePage('dashboard')                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│     React re-renders                                        │
│     isAuthenticated = false                                 │
│     ↓                                                        │
│     Show <Login /> component                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Login Screen Shown                             │
└─────────────────────────────────────────────────────────────┘
```

### 6. Error Handling Matrix
```
┌──────────────────────────────────────────────────────────────┐
│              Error Response Handling                         │
├──────────────────────────────────────────────────────────────┤
│ Status  │ Error Type      │ Action                           │
├──────────────────────────────────────────────────────────────┤
│ 401     │ Unauthorized    │ Clear token → Redirect to login  │
│ 403     │ Forbidden       │ Log error → Show error message   │
│ 404     │ Not Found       │ Log error → Show 404 message     │
│ 500+    │ Server Error    │ Log error → Show error message   │
│ Network │ Timeout/Error   │ Log error → Retry option        │
└──────────────────────────────────────────────────────────────┘
```

### 7. Authentication State Machine
```
                    ┌─────────────────┐
                    │   Initial Load  │
                    │  isLoading=true │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Check for token │
                    └────────┬────────┘
                             │
                ┌────────────┴────────────┐
                │                        │
                ▼                        ▼
         ┌──────────────┐          ┌──────────────┐
         │ Token Found  │          │ No Token     │
         └──────┬───────┘          └──────┬───────┘
                │                        │
                ▼                        ▼
         ┌────────────────┐      ┌─────────────────┐
         │ Validate       │      │ isLoading=false │
         │ /auth/me       │      │ authenticated   │
         └──────┬─────────┘      │   = false       │
                │                │ Show: LOGIN     │
    ┌───────────┴───────────┐    └─────────────────┘
    │                       │
    ▼                       ▼
┌────────────┐         ┌──────────────┐
│ Success    │         │ Failed       │
│200 OK      │         │401 Unauthorized│
└──────┬─────┘         └──────┬───────┘
       │                      │
       ▼                      ▼
  ┌────────────────┐   ┌─────────────────┐
  │isLoading=false │   │ Clear token     │
  │authenticated   │   │ isLoading=false │
  │  = true        │   │ authenticated   │
  │Show: DASHBOARD │   │   = false       │
  └────────────────┘   │ Show: LOGIN     │
                       └─────────────────┘
```

### Summary
✅ Tokens persisted in localStorage
✅ Automatic session restoration on refresh
✅ All routes protected
✅ Proper error handling for expired tokens
✅ User data restored from `/auth/me`
✅ Seamless refresh without logout
