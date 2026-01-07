# Backend Development Checklist

This checklist will guide you through implementing the backend API for the Donation Management System.

---

## ✅ Prerequisites

- [ ] Node.js installed (v18+ recommended)
- [ ] Database installed (PostgreSQL/MySQL recommended)
- [ ] Postman or similar API testing tool
- [ ] Code editor (VS Code recommended)
- [ ] Git for version control

---

## 📦 Project Setup

### Initialize Backend Project
```bash
- [ ] mkdir donation-backend
- [ ] cd donation-backend
- [ ] npm init -y
- [ ] npm install express cors dotenv jsonwebtoken bcryptjs
- [ ] npm install pg pg-hstore sequelize (for PostgreSQL)
- [ ] npm install multer express-validator
- [ ] npm install --save-dev nodemon typescript @types/node @types/express
```

### Create Project Structure
```
- [ ] /src
  - [ ] /config         # Database, JWT config
  - [ ] /controllers    # Request handlers
  - [ ] /models         # Database models
  - [ ] /routes         # API routes
  - [ ] /middleware     # Auth, validation middleware
  - [ ] /utils          # Helper functions
  - [ ] /uploads        # File storage
  - [ ] server.js       # Entry point
- [ ] .env
- [ ] .gitignore
- [ ] package.json
```

---

## 🗄️ Database Setup

### Create Database
```sql
- [ ] CREATE DATABASE donation_management;
- [ ] CREATE USER donation_admin WITH PASSWORD 'secure_password';
- [ ] GRANT ALL PRIVILEGES ON DATABASE donation_management TO donation_admin;
```

### Create Tables (Using Sequelize or raw SQL)

#### Users Table
```sql
- [ ] CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Appeals Table
```sql
- [ ] CREATE TABLE appeals (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  purpose TEXT NOT NULL,
  estimated_amount DECIMAL(15,2) NOT NULL,
  approved_amount DECIMAL(15,2),
  beneficiary_category VARCHAR(100) NOT NULL,
  duration VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  created_by UUID REFERENCES users(id),
  created_date TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Approvals Table
```sql
- [ ] CREATE TABLE approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appeal_id VARCHAR(50) REFERENCES appeals(id),
  action VARCHAR(20) NOT NULL,
  approved_amount DECIMAL(15,2),
  approved_by UUID REFERENCES users(id),
  approved_date TIMESTAMP DEFAULT NOW(),
  remarks TEXT,
  conditions TEXT
);
```

#### Donations Table
```sql
- [ ] CREATE TABLE donations (
  id VARCHAR(50) PRIMARY KEY,
  donor_name VARCHAR(255) NOT NULL,
  donor_email VARCHAR(255) NOT NULL,
  donor_phone VARCHAR(20) NOT NULL,
  appeal_id VARCHAR(50) REFERENCES appeals(id),
  amount DECIMAL(15,2) NOT NULL,
  mode VARCHAR(20) NOT NULL,
  cheque_number VARCHAR(100),
  cheque_date DATE,
  transaction_ref VARCHAR(100),
  receiving_entity VARCHAR(20) NOT NULL,
  received_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  received_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Utilizations Table
```sql
- [ ] CREATE TABLE utilizations (
  id VARCHAR(50) PRIMARY KEY,
  appeal_id VARCHAR(50) REFERENCES appeals(id),
  utilization_date DATE NOT NULL,
  description TEXT NOT NULL,
  amount_utilized DECIMAL(15,2) NOT NULL,
  vendor_name VARCHAR(255) NOT NULL,
  vendor_details TEXT,
  invoice_number VARCHAR(100) NOT NULL,
  po_number VARCHAR(100) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'pending',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Asset Links Table
```sql
- [ ] CREATE TABLE asset_links (
  id VARCHAR(50) PRIMARY KEY,
  utilization_id VARCHAR(50) REFERENCES utilizations(id),
  asset_registration_number VARCHAR(100) NOT NULL,
  asset_name VARCHAR(255) NOT NULL,
  asset_owner VARCHAR(20) NOT NULL,
  notes TEXT,
  linked_by UUID REFERENCES users(id),
  linked_date TIMESTAMP DEFAULT NOW()
);
```

#### Beneficiaries Table
```sql
- [ ] CREATE TABLE beneficiaries (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  location TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  appeal_id VARCHAR(50) REFERENCES appeals(id),
  impact_received TEXT NOT NULL,
  feedback_rating INT NOT NULL,
  feedback_text TEXT NOT NULL,
  has_images BOOLEAN DEFAULT false,
  registered_by UUID REFERENCES users(id),
  registered_date TIMESTAMP DEFAULT NOW()
);
```

#### Communications Table
```sql
- [ ] CREATE TABLE communications (
  id VARCHAR(50) PRIMARY KEY,
  appeal_id VARCHAR(50) REFERENCES appeals(id),
  channel VARCHAR(20) NOT NULL,
  subject VARCHAR(500),
  message TEXT NOT NULL,
  recipients INT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  sent_by UUID REFERENCES users(id),
  sent_date TIMESTAMP DEFAULT NOW()
);
```

#### Documents Table
```sql
- [ ] CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(50) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

#### Activity Logs Table
```sql
- [ ] CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id VARCHAR(50),
  details JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔐 Authentication Implementation

### JWT Configuration
```javascript
- [ ] Create JWT_SECRET in .env
- [ ] Create JWT_EXPIRY config
- [ ] Implement generateToken() function
- [ ] Implement verifyToken() middleware
```

### Auth Endpoints
```javascript
- [ ] POST /api/auth/login
  - [ ] Validate email/password
  - [ ] Check user exists
  - [ ] Compare password hash
  - [ ] Generate JWT token
  - [ ] Update last_login
  - [ ] Return token + user data

- [ ] POST /api/auth/logout
  - [ ] Clear token (optional blacklist)
  - [ ] Log activity

- [ ] GET /api/auth/me
  - [ ] Verify JWT token
  - [ ] Return current user data
```

### Password Hashing
```javascript
- [ ] Use bcryptjs for password hashing
- [ ] Hash password on user creation
- [ ] Compare hash on login
```

---

## 🛡️ Middleware Implementation

### Authentication Middleware
```javascript
- [ ] Create authMiddleware.js
- [ ] Verify JWT token from header
- [ ] Attach user to request object
- [ ] Handle invalid/expired tokens
```

### Role-Based Access Control
```javascript
- [ ] Create roleMiddleware.js
- [ ] Check user role against allowed roles
- [ ] Return 403 if unauthorized
```

### Validation Middleware
```javascript
- [ ] Use express-validator
- [ ] Create validators for each endpoint
- [ ] Validate request body/params/query
```

### Error Handling Middleware
```javascript
- [ ] Create errorHandler.js
- [ ] Standardize error response format
- [ ] Log errors
- [ ] Don't expose sensitive info
```

---

## 📋 API Endpoints Implementation

### Dashboard APIs (5 endpoints)
```javascript
- [ ] GET /api/dashboard/stats
- [ ] GET /api/dashboard/donation-trend
- [ ] GET /api/dashboard/appeal-status
- [ ] GET /api/dashboard/recent-activity
- [ ] GET /api/dashboard/pending-approvals
```

### Appeal Management APIs (7 endpoints)
```javascript
- [ ] GET /api/appeals (with pagination)
- [ ] GET /api/appeals/:id
- [ ] POST /api/appeals
- [ ] PUT /api/appeals/:id
- [ ] DELETE /api/appeals/:id
- [ ] POST /api/appeals/:id/submit
- [ ] POST /api/appeals/:id/documents
```

### Approval Workflow APIs (5 endpoints)
```javascript
- [ ] GET /api/approvals/pending
- [ ] GET /api/approvals/history
- [ ] POST /api/approvals/:appealId/approve
- [ ] POST /api/approvals/:appealId/reject
- [ ] GET /api/approvals/stats
```

### Donor Communication APIs (4 endpoints)
```javascript
- [ ] GET /api/communications
- [ ] POST /api/communications/send
- [ ] GET /api/communications/templates
- [ ] GET /api/communications/stats
```

### Donation Receipt APIs (6 endpoints)
```javascript
- [ ] GET /api/donations (with pagination)
- [ ] GET /api/donations/:id
- [ ] POST /api/donations
- [ ] PUT /api/donations/:id
- [ ] GET /api/donations/stats
- [ ] GET /api/donations/:id/receipt (PDF generation)
```

### Fund Utilization APIs (6 endpoints)
```javascript
- [ ] GET /api/utilizations (with pagination)
- [ ] GET /api/utilizations/:id
- [ ] POST /api/utilizations
- [ ] PUT /api/utilizations/:id
- [ ] GET /api/utilizations/stats
- [ ] GET /api/utilizations/appeal/:appealId/balance
```

### Asset Reference APIs (5 endpoints)
```javascript
- [ ] GET /api/assets (with pagination)
- [ ] GET /api/assets/:id
- [ ] POST /api/assets/link
- [ ] DELETE /api/assets/:id
- [ ] GET /api/assets/stats
```

### Beneficiary Management APIs (6 endpoints)
```javascript
- [ ] GET /api/beneficiaries (with pagination)
- [ ] GET /api/beneficiaries/:id
- [ ] POST /api/beneficiaries
- [ ] PUT /api/beneficiaries/:id
- [ ] POST /api/beneficiaries/:id/images
- [ ] GET /api/beneficiaries/stats
```

### Reports & Analytics APIs (8 endpoints)
```javascript
- [ ] GET /api/reports/appeal-wise
- [ ] GET /api/reports/donation-utilization
- [ ] GET /api/reports/pending-balance
- [ ] GET /api/reports/asset-utilization
- [ ] GET /api/reports/beneficiary-impact
- [ ] GET /api/reports/audit
- [ ] GET /api/reports/export/:type
- [ ] GET /api/reports/summary
```

### Settings & User Management APIs (10 endpoints)
```javascript
- [ ] GET /api/settings/users
- [ ] POST /api/settings/users
- [ ] PUT /api/settings/users/:id
- [ ] DELETE /api/settings/users/:id
- [ ] PUT /api/settings/users/:id/password
- [ ] GET /api/settings/roles
- [ ] GET /api/settings/general
- [ ] PUT /api/settings/general
- [ ] PUT /api/settings/notifications
- [ ] GET /api/settings/activity-logs
```

---

## 📤 File Upload Implementation

### Setup Multer
```javascript
- [ ] Configure multer for file uploads
- [ ] Set file size limits (10MB)
- [ ] Filter allowed file types
- [ ] Generate unique filenames
- [ ] Store files in /uploads directory
```

### File Upload Endpoints
```javascript
- [ ] Handle appeal documents
- [ ] Handle beneficiary images
- [ ] Validate file types (PDF, JPG, PNG)
- [ ] Store file metadata in database
```

---

## 📧 Email/SMS Integration (Optional)

### Email Service
```javascript
- [ ] Choose email service (SendGrid/AWS SES/Nodemailer)
- [ ] Create email templates
- [ ] Implement sendEmail() function
- [ ] Send notifications on:
  - [ ] Appeal approval/rejection
  - [ ] Donation received
  - [ ] New user creation
```

### WhatsApp Integration (Optional)
```javascript
- [ ] Integrate WhatsApp Business API
- [ ] Implement sendWhatsApp() function
- [ ] Create message templates
```

---

## 🔍 Testing

### Unit Tests
```javascript
- [ ] Test authentication functions
- [ ] Test database models
- [ ] Test utility functions
- [ ] Use Jest or Mocha
```

### Integration Tests
```javascript
- [ ] Test API endpoints
- [ ] Test with Postman/Supertest
- [ ] Test role-based access
- [ ] Test file uploads
```

### Manual Testing Checklist
```javascript
- [ ] Test all GET endpoints
- [ ] Test all POST endpoints
- [ ] Test all PUT endpoints
- [ ] Test all DELETE endpoints
- [ ] Test authentication flow
- [ ] Test role permissions
- [ ] Test file uploads
- [ ] Test pagination
- [ ] Test error handling
- [ ] Test validation
```

---

## 🚀 Deployment

### Pre-deployment Checklist
```javascript
- [ ] All endpoints working
- [ ] Error handling implemented
- [ ] Validation on all inputs
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Logging implemented
- [ ] Environment variables set
- [ ] CORS configured
- [ ] SSL certificate ready
```

### Deployment Steps
```javascript
- [ ] Choose hosting (AWS/Heroku/DigitalOcean)
- [ ] Set up production database
- [ ] Configure environment variables
- [ ] Set up file storage (S3/local)
- [ ] Deploy backend code
- [ ] Run database migrations
- [ ] Test all endpoints in production
- [ ] Monitor logs for errors
- [ ] Set up backup system
```

---

## 📊 Monitoring & Maintenance

### Logging
```javascript
- [ ] Log all API requests
- [ ] Log all errors
- [ ] Log user actions
- [ ] Use winston or morgan
```

### Monitoring
```javascript
- [ ] Set up health check endpoint
- [ ] Monitor server uptime
- [ ] Monitor database connections
- [ ] Monitor API response times
- [ ] Set up alerts for errors
```

### Backup
```javascript
- [ ] Daily database backups
- [ ] File storage backups
- [ ] Test backup restoration
```

---

## 📝 Documentation

```javascript
- [ ] API documentation (Swagger/Postman)
- [ ] Database schema diagram
- [ ] Setup instructions
- [ ] Deployment guide
- [ ] Maintenance guide
```

---

## ⚡ Performance Optimization

```javascript
- [ ] Database indexing
- [ ] Query optimization
- [ ] Caching (Redis)
- [ ] Compression (gzip)
- [ ] CDN for file storage
- [ ] Load balancing (if needed)
```

---

## 🔒 Security Checklist

```javascript
- [ ] Environment variables for secrets
- [ ] Password hashing (bcrypt)
- [ ] JWT token expiration
- [ ] HTTPS only in production
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitize inputs)
- [ ] CSRF tokens
- [ ] Rate limiting
- [ ] Input validation
- [ ] File upload validation
- [ ] CORS configuration
- [ ] Helmet.js for security headers
- [ ] Regular dependency updates
```

---

## 🎯 Priority Order

### Phase 1: Core Features (Week 1-2)
1. Database setup
2. Authentication
3. User management
4. Appeals CRUD
5. Basic dashboard

### Phase 2: Main Features (Week 3-4)
6. Approval workflow
7. Donations management
8. Fund utilization
9. Reports (basic)

### Phase 3: Additional Features (Week 5-6)
10. Communications
11. Asset references
12. Beneficiary management
13. Advanced reports

### Phase 4: Polish & Deploy (Week 7-8)
14. Testing
15. Bug fixes
16. Documentation
17. Deployment

---

## ✅ Final Checklist Before Going Live

```javascript
- [ ] All 60+ endpoints implemented
- [ ] All endpoints tested
- [ ] Database optimized
- [ ] Security audit passed
- [ ] Load testing completed
- [ ] Backup system working
- [ ] Monitoring set up
- [ ] Documentation complete
- [ ] Frontend connected and working
- [ ] User acceptance testing done
- [ ] Production environment ready
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] Go live! 🚀
```

---

**Estimated Time:** 6-8 weeks for full implementation
**Team Size:** 2-3 developers recommended

Good luck with your backend development! Refer to `API_DOCUMENTATION.md` for detailed endpoint specifications.
