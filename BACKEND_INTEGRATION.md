## Backend Integration Guide - JWT Token Persistence

### What the Frontend Expects

Your backend must implement the following endpoints for JWT authentication to work:

---

## 1. Login Endpoint

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "super_admin"
  },
  "userId": "user_123",
  "name": "John Doe",
  "role": "super_admin"
}
```

**Error Response (401):**
```json
{
  "message": "Invalid email or password",
  "error": "INVALID_CREDENTIALS"
}
```

**Notes:**
- Token must be a valid JWT (3 parts separated by dots: `header.payload.signature`)
- Token should be sent in Authorization header: `Bearer {token}`
- Include user data in response for immediate UI population
- Role should match one of: `super_admin`, `itc_admin`, `mission_authority`, `accounts_user`, `viewer`

---

## 2. Get Current User Endpoint

**Endpoint:** `GET /auth/me`

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Success Response (200):**
```json
{
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "super_admin"
  }
}
```

**Error Responses:**

When token is missing or invalid (401):
```json
{
  "message": "Unauthorized",
  "error": "INVALID_TOKEN"
}
```

When token is expired (401):
```json
{
  "message": "Token expired",
  "error": "TOKEN_EXPIRED"
}
```

When user lacks permissions (403):
```json
{
  "message": "Forbidden",
  "error": "INSUFFICIENT_PERMISSIONS"
}
```

**Notes:**
- This endpoint is called on page load to restore user session
- It validates the JWT token sent in Authorization header
- Returns 401 if token is invalid or expired
- Used to check if session is still valid

---

## 3. Optional: Logout Endpoint

**Endpoint:** `POST /auth/logout` (Optional)

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Success Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

**Notes:**
- Frontend doesn't call this, but you may want to implement it
- Clears token on backend if using token blacklist
- Not required if tokens are stateless JWTs

---

## Token Requirements

### JWT Format
Your JWT token should follow the standard format:
```
header.payload.signature
```

Example:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### Payload Example
```json
{
  "sub": "user_123",
  "name": "John Doe",
  "email": "user@example.com",
  "role": "super_admin",
  "iat": 1516239022,
  "exp": 1516325422
}
```

### Token Validation Rules
- Token should expire within reasonable time (e.g., 7 days)
- Frontend checks token format (3 parts with dots)
- Frontend relies on backend to return 401 when token is invalid/expired
- All requests include token in Authorization header

---

## Frontend Implementation Details

### How Frontend Uses Tokens

1. **Login Flow:**
   - Frontend sends credentials to `/auth/login`
   - Backend returns token in response
   - Frontend stores token in localStorage
   - Frontend stores token automatically for all future requests

2. **Session Restore (Page Refresh):**
   - Frontend checks localStorage for token
   - Calls `/auth/me` with token in Authorization header
   - Backend validates token and returns user data
   - If valid: User session restored
   - If invalid: Token deleted, user shown login screen

3. **API Calls:**
   - All API requests include `Authorization: Bearer {token}` header
   - Backend should validate token for each request
   - Return 401 if token is invalid/expired

4. **Token Expiration:**
   - Frontend doesn't refresh tokens automatically
   - When 401 is returned, frontend clears token and redirects to login
   - Consider implementing refresh tokens for seamless experience

---

## Implementation Checklist

- [ ] `/auth/login` endpoint returns token + user data
- [ ] `/auth/me` endpoint validates and returns current user
- [ ] Token is JWT format (3 parts with dots)
- [ ] Returns 401 for invalid/expired tokens
- [ ] Returns 403 for insufficient permissions
- [ ] Token persists across requests (doesn't expire on single request)
- [ ] User data matches expected interface (id, name, email, role)
- [ ] Role is one of: `super_admin`, `itc_admin`, `mission_authority`, `accounts_user`, `viewer`

---

## Testing Backend Integration

### 1. Test Login Endpoint
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password123"}'
```

Expected response:
```json
{
  "token": "eyJhbGc...",
  "user": {...}
}
```

### 2. Test Current User Endpoint
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json"
```

Expected response:
```json
{
  "user": {...}
}
```

### 3. Test Token Expiration
Get a token, wait for it to expire, then test `/auth/me`:

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer expiredToken" \
  -H "Content-Type: application/json"
```

Expected response: 401 Unauthorized

### 4. Test in Browser
1. Login with valid credentials
2. Open DevTools → Application → Local Storage
3. Verify `authToken` is stored
4. Refresh page
5. Verify you stay logged in
6. Check Network tab → headers include `Authorization: Bearer`

---

## Common Issues & Solutions

### Issue: User gets logged out on page refresh

**Solution:** 
- Ensure `/auth/me` endpoint returns 200 with user data for valid tokens
- Frontend calls this on every page load to restore session

### Issue: "Authorization header not found"

**Solution:**
- Check that token is being stored in localStorage
- Verify request interceptor in `src/services/api.ts` is adding header
- Token should be in format: `Authorization: Bearer {token}`

### Issue: User not restored but token exists

**Solution:**
- Check response format from `/auth/me`
- Must return `{ user: { id, name, email, role } }`
- Ensure 200 status code for valid tokens

### Issue: Token not persisting after login

**Solution:**
- Check login response includes `token` field
- Frontend stores with `authService.setToken(token)`
- Verify localStorage is enabled in browser

### Issue: All requests fail with 401

**Solution:**
- Check backend is receiving Authorization header
- Verify token validation logic
- Ensure token format is correct (3 parts with dots)
- Check token hasn't expired

---

## Security Notes

1. **Never send tokens in URL** - Always use Authorization header
2. **HTTPS only** - Don't send tokens over HTTP
3. **Validate on every request** - Check token validity for each API call
4. **Use strong secrets** - Generate JWT with secure secret key
5. **Set expiration** - Tokens should expire (recommended: 7 days for persistent login)
6. **Refresh tokens** - Consider implementing refresh tokens for better security
7. **Clear on logout** - Frontend removes token from localStorage

---

## Files Modified on Frontend

| File | Changes |
|------|---------|
| `src/App.tsx` | Added session restoration on load |
| `src/components/Login.tsx` | Uses authService for token storage |
| `src/services/api.ts` | Enhanced interceptors for token handling |
| `src/services/auth.ts` | NEW: Centralized auth service |

---

## Support

If users still get logged out on refresh:
1. Check browser console for errors
2. Verify `/auth/me` endpoint is working
3. Ensure token format is valid JWT
4. Check token hasn't expired
5. Verify localStorage is enabled
