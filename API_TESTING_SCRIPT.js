/**
 * API Testing Script
 * 
 * This script helps test all API endpoints and debug connection issues.
 * 
 * Usage:
 * 1. Open browser DevTools Console
 * 2. Copy & paste functions below
 * 3. Run commands like: testLogin()
 */

// ============================================
// CONFIGURATION
// ============================================

const API_URL = '/api';  // Uses Vite proxy
const TEST_EMAIL = 'admin@itc.com';
const TEST_PASSWORD = 'admin123';  // Change to your password

// ============================================
// TEST FUNCTIONS
// ============================================

/**
 * Test basic connectivity to backend
 */
async function testConnection() {
  console.log('🔍 Testing connection to', API_URL);
  try {
    const response = await fetch(`${API_URL}/health`, { method: 'GET' });
    console.log('✅ Connected! Status:', response.status);
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }
}

/**
 * Test login endpoint
 */
async function testLogin(email = TEST_EMAIL, password = TEST_PASSWORD) {
  console.log('🔐 Testing login with:', { email, password });
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    console.log('Response Status:', response.status);
    console.log('Response Data:', data);
    
    if (response.ok && data.token) {
      console.log('✅ Login successful!');
      console.log('Token:', data.token);
      localStorage.setItem('auth_token', data.token);
      return true;
    } else {
      console.error('❌ Login failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

/**
 * Test getting current user (requires valid token)
 */
async function testGetCurrentUser() {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    console.error('❌ No token found. Run testLogin() first');
    return false;
  }

  console.log('👤 Testing get current user');
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    console.log('Response Status:', response.status);
    console.log('Response Data:', data);
    
    if (response.ok) {
      console.log('✅ Got user info!');
      localStorage.setItem('auth_user', JSON.stringify(data));
      return true;
    } else {
      console.error('❌ Failed to get user');
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

/**
 * Full login flow test
 */
async function testFullFlow(email = TEST_EMAIL, password = TEST_PASSWORD) {
  console.log('🚀 Starting full login flow test...\n');
  
  console.log('Step 1: Check connection');
  if (!await testConnection()) return;
  console.log('');
  
  console.log('Step 2: Login');
  if (!await testLogin(email, password)) return;
  console.log('');
  
  console.log('Step 3: Get user info');
  if (!await testGetCurrentUser()) return;
  console.log('');
  
  console.log('✅ All tests passed!');
  console.log('You can now reload the page');
}

/**
 * Logout and clear storage
 */
function logout() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  console.log('✅ Logged out');
}

/**
 * Show current auth status
 */
function showAuthStatus() {
  const token = localStorage.getItem('auth_token');
  const user = localStorage.getItem('auth_user');
  
  console.log('=== Auth Status ===');
  console.log('Token:', token ? '✅ Present' : '❌ Missing');
  console.log('User:', user ? JSON.parse(user) : '❌ Missing');
}

/**
 * Test specific endpoint
 */
async function testEndpoint(method = 'GET', path = '/dashboard/stats', body = null) {
  const token = localStorage.getItem('auth_token');
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  console.log(`📡 Testing ${method} ${path}`);
  try {
    const response = await fetch(`${API_URL}${path}`, options);
    const data = await response.json().catch(() => response.text());
    
    console.log('Status:', response.status);
    console.log('Response:', data);
    return { status: response.status, data };
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

// ============================================
// QUICK COMMANDS
// ============================================

console.log(`
╔════════════════════════════════════════════╗
║  API Testing Script Loaded                 ║
╚════════════════════════════════════════════╝

Available Commands:

📍 Connection Tests:
  - testConnection()           - Test backend connectivity
  - testLogin()                - Test login endpoint
  - testGetCurrentUser()       - Test /auth/me endpoint
  - testFullFlow()             - Run full login flow

🔐 Auth Management:
  - showAuthStatus()           - Show current auth status
  - logout()                   - Clear auth tokens

🧪 Custom Testing:
  - testEndpoint(method, path, body)
    Example: testEndpoint('GET', '/dashboard/stats')

💡 Tips:
  1. Run testFullFlow() first to test everything
  2. Check browser Network tab for detailed request/response
  3. Check console for detailed error logs
  4. Edit TEST_EMAIL and TEST_PASSWORD for your credentials
`);
