# 📊 VISUAL IMPLEMENTATION GUIDE

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                      DONATION MANAGEMENT SYSTEM                     │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────┐          ┌──────────────────────────────┐
│       FRONTEND (React)        │          │      BACKEND (Spring Boot)   │
│                              │          │                              │
│  DonorCommunication.tsx      │          │  CommunicationController     │
│  ├─ Select Appeal            │          │  ├─ POST /send              │
│  ├─ Choose Channel           │          │  ├─ GET /auto-triggered     │
│  ├─ Compose Message          │          │  └─ GET /appeal/{id}        │
│  └─ Send                     │          │                              │
│        │                      │          │  CommunicationService       │
│        │                      │          │  ├─ Send to donors          │
│        │                      │          │  ├─ Log to database         │
│        │ POST /send           │          │  └─ Auto-trigger emails     │
│        ├─ JWT Token           │          │                              │
│        ├─ Appeal ID           │          │  DonorRepository            │
│        ├─ Channel             │          │  └─ Find donors by appeal   │
│        ├─ Subject             │          │                              │
│        └─ Message             │          │  EmailConfig                │
│        │                      │          │  └─ JavaMailSender bean     │
│        └──────────────────────┼─────────→                              │
│                              │          │                              │
└──────────────────────────────┘          └──────────────────────────────┘
                                                     │
                    ┌────────────────────────────────┼────────────────────────────────┐
                    │                                │                                │
                    ▼                                ▼                                ▼
         ┌─────────────────────┐        ┌──────────────────────┐      ┌──────────────────────┐
         │   GMAIL SMTP SERVER │        │  MYSQL DATABASE      │      │  Twilio (Future)     │
         │                     │        │                      │      │                      │
         │ smtp.gmail.com:587  │        │ communication_history│      │ WhatsApp API         │
         │ TLS Encryption      │        │ ├─ donor_id          │      │ SMS API              │
         │ App Password Auth   │        │ ├─ appeal_id         │      │                      │
         │                     │        │ ├─ channel           │      │ (Placeholder Ready)  │
         └─────────────────────┘        │ ├─ message           │      │                      │
                    │                   │ ├─ status            │      └──────────────────────┘
                    │                   │ ├─ trigger           │
                    ▼                   │ └─ created_at        │
         ┌─────────────────────┐        └──────────────────────┘
         │  DONOR EMAIL BOX    │                    │
         │                     │                    ▼
         │ From: karang...@... │        ┌──────────────────────┐
         │ Subject: Appeal ... │        │  Communication Audit │
         │ Body: Appeal info   │        │  Trail Maintained    │
         │       + Message     │        │                      │
         └─────────────────────┘        └──────────────────────┘
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    EMAIL SENDING FLOW                           │
└─────────────────────────────────────────────────────────────────┘

1. USER INTERACTION
   ┌─────────────────────────────────────────┐
   │ User in Donor Communication Tab         │
   │ 1. Selects Appeal from dropdown         │
   │ 2. Chooses EMAIL channel                │
   │ 3. Enters subject & message             │
   │ 4. Clicks Send button                   │
   └──────────────┬──────────────────────────┘
                  │
                  ▼

2. FRONTEND SUBMISSION
   ┌─────────────────────────────────────────┐
   │ Frontend creates request:               │
   │ {                                       │
   │   appealId: 1,                          │
   │   channel: "EMAIL",                     │
   │   subject: "Monthly Report",            │
   │   message: "Your donation was used...", │
   │   recipientType: "DONORS"               │
   │ }                                       │
   │ Adds JWT token to headers               │
   │ Sends to /api/communications/send       │
   └──────────────┬──────────────────────────┘
                  │
                  ▼

3. BACKEND RECEIVES
   ┌─────────────────────────────────────────┐
   │ CommunicationController.sendCommunication()
   │ Logs: "Received communication request..." │
   │ Validates request                       │
   │ Calls CommunicationService              │
   └──────────────┬──────────────────────────┘
                  │
                  ▼

4. STEP 1: FIND DONORS
   ┌─────────────────────────────────────────┐
   │ CommunicationService.sendCommunication...
   │ Calls: DonorRepository.findDonorsByAppealId(1)
   │ Runs SQL: SELECT d FROM Donor d       │
   │           WHERE d.id IN (               │
   │             SELECT da.donorId           │
   │             FROM DonorAppeal da         │
   │             WHERE da.appealId = 1      │
   │           )                             │
   │ Returns: List of 5 donors               │
   │ Logs: "STEP 1: Found 5 donors"          │
   └──────────────┬──────────────────────────┘
                  │
                  ▼

5. STEP 2: CHECK SMTP CONFIG
   ┌─────────────────────────────────────────┐
   │ Verifies JavaMailSender is configured   │
   │ Reads from application.yml:             │
   │ - host: smtp.gmail.com                  │
   │ - port: 587                             │
   │ - username: karang...@gmail.com         │
   │ - password: (app password)              │
   │ Logs: "STEP 2: JavaMailSender configured"
   └──────────────┬──────────────────────────┘
                  │
                  ▼

6. STEP 3: SEND EMAILS
   ┌─────────────────────────────────────────┐
   │ For each of 5 donors:                   │
   │ 1. Create MimeMessage                   │
   │ 2. Set recipient (donor.email)          │
   │ 3. Set subject                          │
   │ 4. Build HTML body with appeal details  │
   │ 5. Set From: karang...@gmail.com        │
   │ 6. Call mailSender.send(message)        │
   │ 7. Gmail SMTP sends email via TLS       │
   │                                         │
   │ Logs: "Email sent to donor@..."        │
   │ Logs: "Communication logged for donor 1"
   │ ... (repeat for 4 more donors)          │
   └──────────────┬──────────────────────────┘
                  │
                  ▼

7. STEP 4: LOG TO DATABASE
   ┌─────────────────────────────────────────┐
   │ For each sent email:                    │
   │ Create CommunicationHistory record:     │
   │ ├─ donor_id: 1                          │
   │ ├─ appeal_id: 1                         │
   │ ├─ channel: "EMAIL"                     │
   │ ├─ message: "Your donation was used..."│
   │ ├─ status: "SENT"                       │
   │ ├─ trigger: "MANUAL"                    │
   │ └─ created_at: 2024-01-15 10:30:45     │
   │                                         │
   │ Save to communication_history table     │
   │ Logs: "STEP 4: All communications logged"
   └──────────────┬──────────────────────────┘
                  │
                  ▼

8. RESPONSE TO FRONTEND
   ┌─────────────────────────────────────────┐
   │ Backend returns 200 OK:                 │
   │ {                                       │
   │   "success": true,                      │
   │   "message": "Communication sent...",  │
   │   "data": null                          │
   │ }                                       │
   │ Frontend shows success toast            │
   └──────────────┬──────────────────────────┘
                  │
                  ▼

9. EMAIL DELIVERY
   ┌─────────────────────────────────────────┐
   │ Each donor receives email within        │
   │ 1-5 minutes in their inbox              │
   │                                         │
   │ From: karangohel2093@gmail.com         │
   │ To: donor@example.com                   │
   │ Subject: Monthly Report                 │
   │ Body: HTML with appeal info             │
   │       + custom message                  │
   └─────────────────────────────────────────┘
```

---

## File Structure - Changes Required

```
Backend Project Structure:

src/main/java/com/itc/demo/
├── controller/
│   └── CommunicationController.java          ← REPLACE (empty file)
│       ├─ POST /api/communications/send
│       ├─ GET /api/communications/auto-triggered
│       └─ GET /api/communications/auto-triggered/appeal/{id}
│
├── service/
│   ├── CommunicationService.java             ← MODIFY (fix signature)
│   │   └─ notifyDonorsOnRejection(..., Long rejectorUserId)
│   │
│   └── impl/
│       ├── CommunicationServiceImpl.java      ← REPLACE (fix implementation)
│       │   ├─ sendCommunicationToAppealDonors()
│       │   ├─ notifyDonorsOnApproval()
│       │   ├─ notifyDonorsOnRejection()
│       │   ├─ sendEmail()
│       │   └─ logCommunication()
│       │
│       └── (Other services - no changes)
│
├── repository/
│   └── DonorRepository.java                  ← ALREADY FIXED
│       └─ findDonorsByAppealId(appealId)
│
├── dto/
│   ├── request/
│   │   └── SendCommunicationRequest.java    ← CREATE (new file)
│   │       ├─ appealId
│   │       ├─ channel
│   │       ├─ subject
│   │       ├─ message
│   │       └─ recipientType
│   │
│   └── (Other DTOs - no changes)
│
├── config/
│   └── EmailConfig.java                      ← ALREADY EXISTS
│       └─ JavaMailSender bean
│
├── entity/
│   ├── Appeal.java                           ← (Already defined)
│   ├── Donor.java                            ← (Already defined)
│   ├── DonorAppeal.java                      ← (Already defined)
│   ├── CommunicationHistory.java             ← (Already defined)
│   └── User.java                             ← (Already defined)
│
└── enum_package/
    ├── CommunicationChannel.java             ← (Already defined)
    ├── CommunicationStatus.java              ← (Already defined)
    ├── CommunicationTrigger.java             ← (Already defined)
    └── AppealStatus.java                     ← (Already defined)

src/main/resources/
└── application.yml                           ← ALREADY CONFIGURED
    ├─ spring.mail.host: smtp.gmail.com
    ├─ spring.mail.port: 587
    ├─ spring.mail.username: karangohel2093@gmail.com
    ├─ spring.mail.password: (app password)
    └─ spring.mail.properties.*

pom.xml                                        ← VERIFY (has dependency)
├─ spring-boot-starter-mail (verify exists)
└─ spring-boot-starter-web (already exists)
```

---

## Before & After Database

### BEFORE (Current)

```
Database: donation_management_db

Tables exist:
✓ users
✓ appeals
✓ donors
✓ donor_appeals (links donors to appeals)
✗ communication_history (might not have records)

Sample Data:
appeals table:
┌────┬──────────────────┬───────────┬─────┐
│ id │ title            │ status    │ ... │
├────┼──────────────────┼───────────┼─────┤
│ 1  │ Orphanage Support│ APPROVED  │     │
│ 2  │ School Meals     │ PENDING   │     │
└────┴──────────────────┴───────────┴─────┘

donors table:
┌────┬──────────────┬──────────────────┐
│ id │ name         │ email            │
├────┼──────────────┼──────────────────┤
│ 1  │ John Doe     │ john@gmail.com   │
│ 2  │ Jane Smith   │ jane@gmail.com   │
└────┴──────────────┴──────────────────┘

donor_appeals table:
┌────┬──────────┬───────────┐
│ id │ donor_id │ appeal_id │
├────┼──────────┼───────────┤
│ 1  │ 1        │ 1         │
│ 2  │ 2        │ 1         │
└────┴──────────┴───────────┘

communication_history table:
┌────┬──────────┬───────────┬────────────┬────────┬─────────┐
│ id │ donor_id │ appeal_id │ channel    │ status │ ... │
├────┼──────────┼───────────┼────────────┼────────┼─────────┤
│    │          │           │            │        │         │
└────┴──────────┴───────────┴────────────┴────────┴─────────┘
(EMPTY)
```

### AFTER (After Implementation)

```
Same database structure, but now:

communication_history table gets populated:
┌────┬──────────┬───────────┬────────┬────────┬──────────────────┬────────────────────┐
│ id │ donor_id │ appeal_id │channel │ status │ trigger          │ created_at         │
├────┼──────────┼───────────┼────────┼────────┼──────────────────┼────────────────────┤
│ 1  │ 1        │ 1         │ EMAIL  │ SENT   │ MANUAL           │ 2024-01-15 10:30:45│
│ 2  │ 2        │ 1         │ EMAIL  │ SENT   │ MANUAL           │ 2024-01-15 10:30:46│
│ 3  │ 3        │ 1         │ EMAIL  │ SENT   │ MANUAL           │ 2024-01-15 10:30:47│
│ 4  │ 1        │ 1         │ EMAIL  │ SENT   │ APPROVAL         │ 2024-01-15 10:45:32│
│ 5  │ 2        │ 1         │ EMAIL  │ SENT   │ APPROVAL         │ 2024-01-15 10:45:32│
└────┴──────────┴───────────┴────────┴────────┴──────────────────┴────────────────────┘

All manual and auto-triggered communications now logged!
```

---

## Technology Stack Diagram

```
DONATION MANAGEMENT SYSTEM
│
├─ FRONTEND LAYER
│  ├─ React 18+ (UI framework)
│  ├─ TypeScript (type safety)
│  ├─ Vite (build tool)
│  ├─ Axios (HTTP client with JWT interceptor)
│  └─ Components: DonorCommunication, Dashboard, etc.
│
├─ BACKEND LAYER
│  ├─ Spring Boot 3.2.5 (framework)
│  ├─ Spring Security (JWT authentication)
│  ├─ Spring Data JPA (database access)
│  ├─ Spring Mail (email sending) ← NEW
│  ├─ Hibernate (ORM)
│  ├─ Lombok (boilerplate reduction)
│  └─ MySQL 8 (database)
│
├─ EXTERNAL SERVICES
│  ├─ Gmail SMTP (email) ← CONFIGURED
│  │  └─ smtp.gmail.com:587 with TLS
│  │
│  └─ Twilio (future - WhatsApp/SMS)
│     └─ Placeholder code ready
│
└─ DATABASE LAYER
   ├─ MySQL 8 Server
   ├─ Tables: users, appeals, donors, donor_appeals, communication_history
   └─ Relationships: Donor ←→ Appeal (via DonorAppeal)
```

---

## Authentication Flow for API

```
COMMUNICATION REQUEST WITH JWT

┌─ Frontend ─────────────────────────────────┐
│                                            │
│ POST /api/communications/send              │
│ Headers:                                   │
│   Authorization: Bearer eyJhbGc...         │
│   Content-Type: application/json           │
│ Body:                                      │
│ {                                          │
│   "appealId": 1,                           │
│   "channel": "EMAIL",                      │
│   "subject": "...",                        │
│   "message": "...",                        │
│   "recipientType": "DONORS"                │
│ }                                          │
└────────────┬────────────────────────────────┘
             │ (with JWT token)
             ▼
┌─ Backend JWT Filter ──────────────────────┐
│ 1. Extract token from Authorization header│
│ 2. Validate token signature               │
│ 3. Check token expiration (24 hours)      │
│ 4. Extract user ID from token             │
│ 5. Set SecurityContext with user          │
│ 6. Allow request to proceed               │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─ Backend Security Filter ────────────────┐
│ 1. Check @PreAuthorize annotation        │
│    "@PreAuthorize("isAuthenticated()")"  │
│ 2. Verify user is authenticated          │
│ 3. Allow access to endpoint              │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─ CommunicationController ────────────────┐
│ ProcessRequest                           │
│ └─ sendCommunication() method            │
│    └─ Call CommunicationService          │
└────────────┬────────────────────────────────┘
             │
             ▼
          SUCCESS ✓
```

---

## Error Handling Flow

```
Error Scenarios & Handling:

┌─────────────────────────────────────────────────────────┐
│ Error: No JWT Token                                     │
├─────────────────────────────────────────────────────────┤
│ Response: 403 Forbidden                                 │
│ Message: "Access Denied"                                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Error: Invalid JWT Token                                │
├─────────────────────────────────────────────────────────┤
│ Response: 401 Unauthorized                              │
│ Message: "Invalid token"                                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Error: No Donors Found for Appeal                       │
├─────────────────────────────────────────────────────────┤
│ Backend Log: "No donors found for appeal 1"             │
│ Response: 200 OK (no error, just no action)             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Error: Email Send Failed                                │
├─────────────────────────────────────────────────────────┤
│ Caught by try-catch                                     │
│ Logs: "Error sending email to donor@... : ..."         │
│ Status: FAILED (logged to database)                     │
│ Response: 200 with "Communication sent successfully"   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Error: Database Connection Failed                       │
├─────────────────────────────────────────────────────────┤
│ Response: 500 Internal Server Error                     │
│ Message: "Failed to send communications: ..."          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Error: SMTP Configuration Missing                       │
├─────────────────────────────────────────────────────────┤
│ Backend Log: "JavaMailSender is NULL"                   │
│ Logs: "STEP 2: JavaMailSender is NULL - email will fail"
│ No email sent                                           │
│ Response: 200 (but communication not actually sent)     │
└─────────────────────────────────────────────────────────┘
```

---

## Timeline to Implementation

```
START                                                    SUCCESS
│                                                           │
├─ Read QUICK_START_GUIDE (5 min)                         │
│                                                           │
├─ Make 5 Backend Changes (14 min)                        │
│  ├─ Fix import (1 min)                                 │
│  ├─ Fix interface (1 min)                              │
│  ├─ Create DTO (2 min)                                 │
│  ├─ Replace controller (5 min)                         │
│  └─ Replace service (5 min)                            │
│                                                           │
├─ Compile Backend (3 min)                               │
│  └─ mvn clean install                                  │
│                                                           │
├─ Start Backend (3 min)                                 │
│  └─ mvn spring-boot:run                                │
│                                                           │
├─ Test from Frontend (5 min)                            │
│  ├─ Go to Donor Communication tab                      │
│  ├─ Select appeal & compose message                    │
│  ├─ Click Send                                         │
│  └─ Check backend logs                                 │
│                                                           │
├─ Verify Email Received (5 min)                         │
│  └─ Check donor email inbox                            │
│                                                           │
└─ Total: ~35 minutes ────────────────────────────────────────→ ✓

EMAIL SYSTEM WORKING!
```

---

**All diagrams reference the files in BACKEND_FIXES/ folder.**
