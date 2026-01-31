# Quick Implementation Guide - Email Communication Fix

## 📋 Step-by-Step Instructions

### Step 1: Update `application.yml` (CRITICAL)

**File Location:** `src/main/resources/application.yml`

**Add this section:**

```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: your-email@gmail.com
    password: your-16-char-app-password
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
            required: true
            protocol: smtp
    default-encoding: UTF-8
```

**Replace:**
- `your-email@gmail.com` → Your actual Gmail address
- `your-16-char-app-password` → Your Gmail App Password (from Step 0)

---

### Step 0: Get Gmail App Password (Before Step 1)

1. Go to https://myaccount.google.com/security
2. Click "2-Step Verification" and enable it if not already done
3. Go back to Security settings → "App passwords"
4. Select:
   - App: **Mail**
   - Device: **Windows Computer**
5. Google will show you a **16-character password**
6. Copy it and use in Step 1

---

### Step 2: Create EmailConfig.java

**File Location:** `src/main/java/com/itc/demo/config/EmailConfig.java`

**Use the file from:** `IMPLEMENTATION_FILES/EmailConfig.java`

---

### Step 3: Create/Update CommunicationService Interface

**File Location:** `src/main/java/com/itc/demo/service/CommunicationService.java`

**Use the file from:** `IMPLEMENTATION_FILES/CommunicationService.java`

---

### Step 4: Create CommunicationServiceImpl

**File Location:** `src/main/java/com/itc/demo/service/impl/CommunicationServiceImpl.java`

**Use the file from:** `IMPLEMENTATION_FILES/CommunicationServiceImpl.java`

**Make sure you have these imports/dependencies:**
```xml
<!-- Add to pom.xml if missing -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

---

### Step 5: Create CommunicationController

**File Location:** `src/main/java/com/itc/demo/controller/CommunicationController.java`

**Use the file from:** `IMPLEMENTATION_FILES/CommunicationController.java`

---

### Step 6: Update DonorRepository.java

**File Location:** `src/main/java/com/itc/demo/repository/DonorRepository.java`

**Add this method:**

```java
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Query("SELECT d FROM Donor d INNER JOIN DonorAppeal da ON d.id = da.donorId " +
       "WHERE da.appealId = :appealId")
List<Donor> findDonorsByAppealId(@Param("appealId") Long appealId);
```

---

### Step 7: Update ApprovalController.java

**File Location:** `src/main/java/com/itc/demo/controller/ApprovalController.java`

**In the `approveAppeal()` method, add:**

```java
@PostMapping("/{id}/approve")
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'COORDINATOR', 'APPROVER')")
public ResponseEntity<?> approveAppeal(
        @PathVariable Long id,
        @RequestBody ApproveAppealRequest request) {
    try {
        Appeal appeal = appealRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appeal not found"));
        
        appeal.setStatus(AppealStatus.APPROVED);
        appeal.setApprovedAmount(request.getApprovedAmount());
        appeal.setApprovalRemarks(request.getRemarks());
        appeal.setApprovalDate(LocalDateTime.now());
        appeal.setApproverId(getCurrentUserId());
        
        Appeal saved = appealRepository.save(appeal);
        
        // ✅ ADD THIS: Trigger automatic donor notification
        try {
            communicationService.notifyDonorsOnApproval(saved, getCurrentUserId());
        } catch (Exception e) {
            log.error("Error sending approval notifications: ", e);
            // Continue even if notifications fail
        }
        
        return ResponseEntity.ok(new ApiResponse(true, "Appeal approved successfully", appealMapper.toDTO(saved)));
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse(false, e.getMessage(), null));
    }
}
```

**And add this dependency injection at top of controller:**

```java
@Autowired
private CommunicationService communicationService;
```

---

### Step 8: Verify Database Tables

Run these SQL queries to verify your database is set up correctly:

```sql
-- Check if donors table has email column
DESC donors;
-- Should show: email VARCHAR(255)

-- Check if donor_appeals table exists
DESC donor_appeals;
-- Should have columns: id, donor_id, appeal_id, donation_amount

-- Check if communication_history table exists
DESC communication_history;
-- Should have columns: id, appeal_id, trigger_type, channel, status, sent_date
```

If these tables don't exist, create them:

```sql
-- Create donors table (if not exists)
CREATE TABLE IF NOT EXISTS donors (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    whatsapp_number VARCHAR(20),
    address TEXT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

-- Create donor_appeals linking table
CREATE TABLE IF NOT EXISTS donor_appeals (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    donor_id BIGINT NOT NULL,
    appeal_id BIGINT NOT NULL,
    donation_amount DECIMAL(12, 2),
    created_at DATETIME NOT NULL,
    FOREIGN KEY (donor_id) REFERENCES donors(id),
    FOREIGN KEY (appeal_id) REFERENCES appeals(id)
);

-- Create communication_history table
CREATE TABLE IF NOT EXISTS communication_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    appeal_id BIGINT NOT NULL,
    trigger_type VARCHAR(50),
    channel VARCHAR(50),
    recipient_count INT NOT NULL,
    content LONGTEXT,
    status VARCHAR(50),
    sent_by_user_id BIGINT,
    sent_date DATETIME,
    error_message LONGTEXT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (appeal_id) REFERENCES appeals(id),
    KEY idx_appeal_trigger (appeal_id, trigger_type),
    KEY idx_status (status)
);
```

---

## 🧪 Testing After Implementation

### Test 1: Manual Communication

1. Start backend server (should not show errors)
2. Open frontend → Donor Communication tab
3. Select an Appeal that has donors
4. Write a message
5. Click "Send Communication"
6. Check logs for success message

### Test 2: Auto Approval Notification

1. Open Approval Workflow tab
2. Create a test appeal first if needed
3. Click "Approve Appeal"
4. Enter approval amount
5. Click "Approve"
6. Check logs for "Email sent successfully to: ..."
7. Check your email inbox (or spam folder)

### Test 3: Check Logs

```bash
# In backend console, you should see:
Starting approval notification for Appeal ID: 123
Found X donors for appeal 123
Email sent successfully to: donor@gmail.com
Approval notification completed. Sent: X, Failed: 0
```

---

## ⚠️ Troubleshooting

### Error: "JavaMailSender not found"
**Solution:** Make sure `EmailConfig.java` is created in `com.itc.demo.config` package

### Error: "CommunicationService not found"
**Solution:** 
- Check `CommunicationService.java` exists in `com.itc.demo.service`
- Check `CommunicationServiceImpl.java` exists in `com.itc.demo.service.impl`
- Restart IDE/IDE indexing

### Error: "No donors found for appeal"
**Solution:**
- Create a test donation first that links a donor to the appeal
- Check `donor_appeals` table has records

### Error: "Failed to send email" with Gmail
**Solutions:**
1. Verify you're using App Password, NOT regular Gmail password
2. Enable "Less secure app access" if still using regular password
3. Check email/password in `application.yml` has no extra spaces
4. Verify SMTP host is `smtp.gmail.com` and port is `587`

### Email goes to Spam
**Solutions:**
1. Add `From` header: `noreply@itc-anoopam.org` in `application.yml`:
   ```yaml
   mail:
     default-from: noreply@itc-anoopam.org
   ```

2. Make sure HTML email is properly formatted (it is in provided code)

---

## 📊 How to Verify It's Working

1. **Check Logs**
   ```
   Starting approval notification for Appeal ID: 123
   Found 45 donors for appeal 123
   Email sent successfully to: rajesh@gmail.com
   Email sent successfully to: priya@email.com
   ...
   Approval notification completed. Sent: 45, Failed: 0
   ```

2. **Check Database**
   ```sql
   SELECT * FROM communication_history ORDER BY sent_date DESC LIMIT 10;
   ```
   Should show recent communications with status "SENT"

3. **Check Email Inbox**
   - Look for emails from `your-email@gmail.com`
   - Subject: "🎉 Your Appeal has been Approved!"
   - Contains appeal details in HTML format

---

## 🎯 What Each Component Does

| Component | Purpose |
|-----------|---------|
| `EmailConfig.java` | Creates JavaMailSender bean for Spring to use |
| `CommunicationService` | Interface defining what the service should do |
| `CommunicationServiceImpl` | Actual implementation - sends emails, logs communications |
| `CommunicationController` | API endpoint - receives requests from frontend |
| `DonorRepository.findDonorsByAppealId()` | Finds all donors who gave to an appeal |
| `application.yml` | SMTP configuration - how to connect to Gmail |

---

## 📝 Quick Checklist

- [ ] Got Gmail App Password from https://myaccount.google.com/security
- [ ] Updated `application.yml` with Gmail credentials
- [ ] Created `EmailConfig.java` in `com.itc.demo.config`
- [ ] Created/Updated `CommunicationService.java`
- [ ] Created `CommunicationServiceImpl.java` in `com.itc.demo.service.impl`
- [ ] Created `CommunicationController.java`
- [ ] Updated `DonorRepository.java` with `findDonorsByAppealId()` method
- [ ] Updated `ApprovalController.java` to call `communicationService.notifyDonorsOnApproval()`
- [ ] Verified database tables (donors, donor_appeals, communication_history)
- [ ] Added mail dependency to `pom.xml` if missing
- [ ] Restarted backend server
- [ ] Tested manual communication
- [ ] Tested auto approval notification

---

## 🚀 How It Will Work After Implementation

```
USER FLOW:
1. Admin approves an appeal
2. System automatically sends emails to all donors
3. Donors receive approval notification with details
4. Communication logged in communication_history table
5. Frontend shows in "Auto-Triggered" tab with status

OR

USER MANUALLY SENDS:
1. Go to Donor Communication → Compose Message
2. Select an Appeal
3. Write message
4. System finds all donors for that appeal
5. Sends email to each
6. Shows success message
```

**That's it! Follow these steps and your email communication will work perfectly.**

