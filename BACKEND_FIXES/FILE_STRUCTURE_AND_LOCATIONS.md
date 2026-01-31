# 📁 FILE STRUCTURE & LOCATIONS

## Complete Folder Structure

```
Donation Management System UI/
│
├── BACKEND_FIXES/                          ← You are in this folder!
│   │
│   ├── 📖 READ_ME_FIRST.md                 ← START HERE! (this file explains everything)
│   ├── 📖 IMPLEMENTATION_INDEX.md           ← Master index of all docs
│   │
│   ├── 🚀 QUICK_START_GUIDE.md             ← 11-step quick implementation
│   ├── 📋 EXACT_CODE_CHANGES.md            ← Copy & paste code
│   ├── 📖 BACKEND_CHANGES_GUIDE.md         ← Detailed explanations
│   ├── ✅ COMPLETE_IMPLEMENTATION_CHECKLIST.md ← Verification steps
│   ├── 📊 VISUAL_IMPLEMENTATION_GUIDE.md   ← Diagrams & flows
│   │
│   ├── 💾 CommunicationController_FIXED.java
│   ├── 💾 CommunicationServiceImpl_FIXED.java
│   ├── 💾 SendCommunicationRequest.java
│   │
│   └── 📝 (You may add more files here)
│
├── src/
│   ├── components/
│   │   └── DonorCommunication.tsx           ← Already fixed!
│   │
│   └── (other files)
│
└── (other files in root)
```

---

## Backend Project Structure (Spring Boot)

```
backend/                                    ← Backend folder

src/main/java/com/itc/demo/
│
├── controller/
│   └── CommunicationController.java         ← CHANGE: Replace entire file
│       └─ Location: .../controller/CommunicationController.java
│       └─ Use: BACKEND_FIXES/CommunicationController_FIXED.java
│
├── service/
│   ├── CommunicationService.java            ← CHANGE: Fix method signature
│   │   └─ Location: .../service/CommunicationService.java
│   │   └─ Find: void notifyDonorsOnRejection(Appeal, String)
│   │   └─ Change: void notifyDonorsOnRejection(Appeal, String, Long)
│   │
│   └── impl/
│       ├── CommunicationServiceImpl.java     ← CHANGE: Replace entire file + Fix import
│       │   └─ Location: .../service/impl/CommunicationServiceImpl.java
│       │   └─ Use: BACKEND_FIXES/CommunicationServiceImpl_FIXED.java
│       │   └─ Line 14: Fix import javax.mail → jakarta.mail
│       │
│       └── (other service implementations)
│
├── repository/
│   └── DonorRepository.java                 ← No change needed (already fixed)
│       └─ Location: .../repository/DonorRepository.java
│       └─ Has: findDonorsByAppealId(Long appealId)
│
├── dto/
│   ├── request/
│   │   └── SendCommunicationRequest.java    ← CREATE: New DTO file
│   │       └─ Location: .../dto/request/SendCommunicationRequest.java
│   │       └─ Use: BACKEND_FIXES/SendCommunicationRequest.java
│   │       └─ Contains: appealId, channel, subject, message, recipientType
│   │
│   └── response/
│       └── (existing response DTOs)
│
├── entity/
│   ├── Appeal.java                          ← Already defined
│   ├── Donor.java                           ← Already defined
│   ├── DonorAppeal.java                     ← Already defined
│   ├── CommunicationHistory.java            ← Already defined
│   └── User.java                            ← Already defined
│
├── enum_package/
│   ├── CommunicationChannel.java            ← Already defined
│   ├── CommunicationStatus.java             ← Already defined
│   ├── CommunicationTrigger.java            ← Already defined
│   └── AppealStatus.java                    ← Already defined
│
├── config/
│   ├── EmailConfig.java                     ← Already exists (has JavaMailSender bean)
│   ├── JwtAuthenticationFilter.java         ← Already exists
│   ├── SecurityConfig.java                  ← Already exists
│   └── CorsConfig.java                      ← Already exists
│
├── security/
│   ├── JwtTokenProvider.java                ← Already exists
│   └── (other security files)
│
└── (other packages)

src/main/resources/
├── application.yml                          ← VERIFY: Has Gmail SMTP config
│   └─ Should have:
│       spring.mail.host: smtp.gmail.com
│       spring.mail.port: 587
│       spring.mail.username: karangohel2093@gmail.com
│       spring.mail.password: (app password)
│
└── (other configuration files)

pom.xml                                      ← VERIFY: Has mail dependency
├─ spring-boot-starter-mail (should be there)
├─ spring-boot-starter-web
├─ spring-boot-starter-security
└─ (other dependencies)
```

---

## Files You Need to Modify or Create

### File 1: Fix Import in CommunicationServiceImpl.java

**Location:** `src/main/java/com/itc/demo/service/impl/CommunicationServiceImpl.java`

**Change Line 14 from:**
```java
import javax.mail.internet.MimeMessage;
```

**To:**
```java
import jakarta.mail.internet.MimeMessage;
```

**Time:** 1 minute

---

### File 2: Fix Method Signature in CommunicationService.java

**Location:** `src/main/java/com/itc/demo/service/CommunicationService.java`

**Find:**
```java
void notifyDonorsOnRejection(Appeal appeal, String rejectionReason);
```

**Replace with:**
```java
void notifyDonorsOnRejection(Appeal appeal, String rejectionReason, Long rejectorUserId);
```

**Time:** 1 minute

---

### File 3: Create SendCommunicationRequest.java

**Create New File:** `src/main/java/com/itc/demo/dto/request/SendCommunicationRequest.java`

**Copy entire content from:** `BACKEND_FIXES/SendCommunicationRequest.java`

**Time:** 2 minutes

---

### File 4: Replace CommunicationController.java

**Location:** `src/main/java/com/itc/demo/controller/CommunicationController.java`

**Delete all content and replace with:** `BACKEND_FIXES/CommunicationController_FIXED.java`

**Time:** 5 minutes

---

### File 5: Replace CommunicationServiceImpl.java

**Location:** `src/main/java/com/itc/demo/service/impl/CommunicationServiceImpl.java`

**Delete all content and replace with:** `BACKEND_FIXES/CommunicationServiceImpl_FIXED.java`

**Time:** 5 minutes

---

## Verification Files (Check These)

### pom.xml
**Location:** `pom.xml` in backend root

**Verify contains:**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

**If missing:** Add it!

---

### application.yml
**Location:** `src/main/resources/application.yml`

**Verify contains:**
```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: karangohel2093@gmail.com
    password: ftaf yyjs zpxd ongk
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
            required: true
```

**If missing fields:** Add them!

---

## Frontend Files (Already Fixed)

### DonorCommunication.tsx
**Location:** `src/components/DonorCommunication.tsx`

**Status:** ✅ Already fixed!

**What was fixed:**
- Appeals dropdown loads all appeals
- Communication API uses proper JWT auth
- Request formatting correct
- Error handling improved

**No changes needed!**

---

## Database Tables (Should Already Exist)

### communication_history
```sql
CREATE TABLE communication_history (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  donor_id BIGINT,
  appeal_id BIGINT,
  channel VARCHAR(50),
  message TEXT,
  status VARCHAR(50),
  trigger VARCHAR(50),
  created_at TIMESTAMP,
  FOREIGN KEY (donor_id) REFERENCES donors(id),
  FOREIGN KEY (appeal_id) REFERENCES appeals(id)
);
```

### donor_appeals
```sql
CREATE TABLE donor_appeals (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  donor_id BIGINT,
  appeal_id BIGINT,
  donation_amount DECIMAL(10,2),
  donation_date DATE,
  created_at TIMESTAMP,
  FOREIGN KEY (donor_id) REFERENCES donors(id),
  FOREIGN KEY (appeal_id) REFERENCES appeals(id)
);
```

---

## File Copy Checklist

- [ ] CommunicationController_FIXED.java copied from BACKEND_FIXES
- [ ] CommunicationServiceImpl_FIXED.java copied from BACKEND_FIXES
- [ ] SendCommunicationRequest.java created from BACKEND_FIXES template
- [ ] Import fixed in CommunicationServiceImpl.java (javax → jakarta)
- [ ] Method signature fixed in CommunicationService.java
- [ ] Verified pom.xml has spring-boot-starter-mail
- [ ] Verified application.yml has Gmail SMTP config

---

## How to Find Files in Your IDE

### IntelliJ IDEA
```
Press Ctrl+Shift+N (Go to Class)
Type: CommunicationController
Press Enter
```

### Eclipse
```
Press Ctrl+Shift+T (Open Type)
Type: CommunicationController
Press Enter
```

### VSCode
```
Press Ctrl+P (Quick Open)
Type: CommunicationController.java
Press Enter
```

---

## Important File Paths to Remember

```
Source file locations (what to modify):
- CommunicationController:     src/main/java/com/itc/demo/controller/
- CommunicationService:        src/main/java/com/itc/demo/service/
- CommunicationServiceImpl:     src/main/java/com/itc/demo/service/impl/
- SendCommunicationRequest:    src/main/java/com/itc/demo/dto/request/
- DonorRepository:             src/main/java/com/itc/demo/repository/
- application.yml:             src/main/resources/
- pom.xml:                     (root of backend folder)

Reference file locations (copy from):
- CommunicationController_FIXED.java:   BACKEND_FIXES/
- CommunicationServiceImpl_FIXED.java:   BACKEND_FIXES/
- SendCommunicationRequest.java:        BACKEND_FIXES/

Frontend files (already fixed):
- DonorCommunication.tsx:      src/components/
```

---

## Quick Navigation

### From BACKEND_FIXES folder:
```
Read documentation (START HERE):
├─ READ_ME_FIRST.md              ← If unsure, start here
├─ QUICK_START_GUIDE.md          ← For quick implementation
├─ BACKEND_CHANGES_GUIDE.md      ← For detailed learning
└─ (Other docs)

Get code from:
├─ CommunicationController_FIXED.java
├─ CommunicationServiceImpl_FIXED.java
└─ SendCommunicationRequest.java
```

### To navigate to backend files:
```
Go to backend folder
├─ src/main/java/com/itc/demo/controller/CommunicationController.java
├─ src/main/java/com/itc/demo/service/CommunicationService.java
├─ src/main/java/com/itc/demo/service/impl/CommunicationServiceImpl.java
├─ src/main/java/com/itc/demo/dto/request/ (create SendCommunicationRequest here)
└─ src/main/resources/application.yml
```

---

## Summary

| File | Action | Time |
|------|--------|------|
| CommunicationServiceImpl.java | Fix import line 14 | 1 min |
| CommunicationService.java | Add parameter to method | 1 min |
| SendCommunicationRequest.java | Create new file | 2 min |
| CommunicationController.java | Replace entire file | 5 min |
| CommunicationServiceImpl.java | Replace entire file | 5 min |
| pom.xml | Verify dependency | 1 min |
| application.yml | Verify SMTP config | 1 min |

**TOTAL: 16 minutes**

---

**Now you know exactly where every file is and what to do with it!**

Open **READ_ME_FIRST.md** to get started! 🚀
