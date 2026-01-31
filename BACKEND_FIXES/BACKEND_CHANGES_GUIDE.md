# BACKEND CHANGES REQUIRED FOR EMAIL & WHATSAPP

## CRITICAL CHANGES (Must do these)

### 1. FIX CommunicationServiceImpl Import
**File:** `src/main/java/com/itc/demo/service/impl/CommunicationServiceImpl.java`

**Line 14 - Change from:**
```java
import javax.mail.internet.MimeMessage;
```

**To:**
```java
import jakarta.mail.internet.MimeMessage;
```

**Why:** Spring Boot 3.2.5+ uses Jakarta Mail (jakarta.*) not javax.mail. Using wrong import will cause compilation error.

---

### 2. REPLACE CommunicationController (Currently Empty!)
**File:** `src/main/java/com/itc/demo/controller/CommunicationController.java`

**Replace entire file with:**
See `CommunicationController_FIXED.java` in BACKEND_FIXES folder.

**What it adds:**
- POST `/api/communications/send` - Main endpoint to send emails/WhatsApp
- GET `/api/communications/auto-triggered` - Fetch all auto-triggered messages
- GET `/api/communications/auto-triggered/appeal/{appealId}` - Fetch messages for specific appeal

---

### 3. CREATE SendCommunicationRequest DTO
**New File:** `src/main/java/com/itc/demo/dto/request/SendCommunicationRequest.java`

**Add from:** `SendCommunicationRequest.java` in BACKEND_FIXES folder

**Contains:**
```java
private Long appealId;
private String channel;      // EMAIL, WHATSAPP, SMS
private String subject;      // For email
private String message;
private String recipientType; // DONORS, etc.
```

---

### 4. FIX CommunicationService Interface Signature
**File:** `src/main/java/com/itc/demo/service/CommunicationService.java`

**Find method:**
```java
void notifyDonorsOnRejection(Appeal appeal, String rejectionReason);
```

**Change to:**
```java
void notifyDonorsOnRejection(Appeal appeal, String rejectionReason, Long rejectorUserId);
```

**Why:** AppealServiceImpl.rejectAppeal() passes 3 parameters but interface only accepts 2. This causes mismatch error.

---

### 5. REPLACE CommunicationServiceImpl Implementation
**File:** `src/main/java/com/itc/demo/service/impl/CommunicationServiceImpl.java`

**Replace entire file with:** `CommunicationServiceImpl_FIXED.java` in BACKEND_FIXES folder

**Key improvements:**
- ✅ Fixed jakarta.mail import
- ✅ Proper error handling and try-catch blocks
- ✅ Detailed logging at each step (STEP 1, 2, 3, 4)
- ✅ Sends to ALL donors for an appeal
- ✅ Logs each communication to CommunicationHistory table
- ✅ Handles auto-triggered notifications (approval/rejection)
- ✅ WhatsApp/SMS placeholders for future integration

**Logging output:**
```
=== STEP 1: Finding donors for appeal 1 ===
STEP 1: Found 5 donors for appeal 1
=== STEP 2: Checking SMTP configuration ===
STEP 2: JavaMailSender is configured
=== STEP 3: Sending 5 communications via EMAIL ===
STEP 3: Email sent to donor1@example.com
STEP 3: Communication logged for donor 1
...
=== STEP 4: All communications processed ===
```

---

## VERIFICATION STEPS

### Check 1: Verify Spring Boot Version
**File:** `pom.xml`

Look for:
```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.5</version>
</parent>
```

**If it's 3.0+** → Use `jakarta.*` imports ✓
**If it's 2.x** → Use `javax.*` imports

---

### Check 2: Verify Mail Dependency
**File:** `pom.xml`

Find in `<dependencies>`:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

**If missing:** Add it!

---

### Check 3: Verify Gmail SMTP Configuration
**File:** `application.yml` or `application.properties`

Should contain:
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

---

### Check 4: Database Tables Exist
Run this SQL:

```sql
-- Check if tables exist
SHOW TABLES LIKE '%communication%';
SHOW TABLES LIKE '%donor%';
SHOW TABLES LIKE '%appeal%';

-- Verify structure
DESC communication_history;
DESC donor_appeals;

-- Check sample data
SELECT COUNT(*) FROM communication_history;
SELECT * FROM donor_appeals LIMIT 5;
```

**Required tables:**
- `communication_history` - Logs all communications
- `donor_appeals` - Links donors to appeals
- `appeals` - Appeal records
- `donors` - Donor records

---

## TESTING THE IMPLEMENTATION

### Test 1: Start Backend
```bash
mvn clean install
mvn spring-boot:run
```

**Expected logs:**
```
...
Started Application in 8.5 seconds
Mapped "{POST /api/communications/send}" 
Mapped "{GET /api/communications/auto-triggered}"
...
```

---

### Test 2: Send Email from Frontend
1. Go to **Donor Communication** tab
2. Select an appeal with donors
3. Choose **EMAIL** channel
4. Enter subject and message
5. Click **Send**

**Expected backend logs:**
```
Received communication request for appeal 1 via EMAIL
=== STEP 1: Finding donors for appeal 1 ===
STEP 1: Found 3 donors for appeal 1
=== STEP 2: Checking SMTP configuration ===
STEP 2: JavaMailSender is configured
=== STEP 3: Sending 3 communications via EMAIL ===
STEP 3: Email sent to donor1@example.com
STEP 3: Communication logged for donor 1
...
```

---

### Test 3: Verify Email Was Sent
1. Check receiver's inbox (might be in spam)
2. Check database:
```sql
SELECT * FROM communication_history WHERE channel = 'EMAIL' ORDER BY created_at DESC;
```

---

## TROUBLESHOOTING

### Issue: "No such field: `javax.mail`"
**Solution:** Verify you changed import to `jakarta.mail` in all files

### Issue: "CommunicationController not found"
**Solution:** Make sure file exists at `src/main/java/com/itc/demo/controller/CommunicationController.java`

### Issue: "No donors found"
**Solution:** Check database:
```sql
SELECT * FROM donor_appeals WHERE appeal_id = 1;
```
If empty, add some donors to appeals first.

### Issue: "Email not sending (timeout)"
**Solution:** 
1. Check Gmail password is app password (not regular password)
2. Check port 587 is accessible
3. Verify SMTP settings in application.yml
4. Check backend logs for "JavaMailSender is NULL" message

### Issue: "CommunicationHistory save failed"
**Solution:** Verify CommunicationHistoryRepository is working:
```bash
# Check if table exists
SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_NAME = 'communication_history';
```

---

## WHATSAPP & SMS (Future Implementation)

Current status: **Placeholders only** (logs output but doesn't actually send)

### To Enable WhatsApp:
1. Sign up for Twilio (www.twilio.com)
2. Get WhatsApp Business API credentials
3. Replace `sendWhatsApp()` method in CommunicationServiceImpl with Twilio integration

### To Enable SMS:
1. Sign up for Twilio
2. Get SMS API credentials  
3. Replace `sendSMS()` method with Twilio integration

Example Twilio integration pattern:
```java
@Autowired
private TwilioMessagingService twilioService;

private void sendWhatsApp(String phoneNumber, String message, Appeal appeal) {
    twilioService.sendWhatsAppMessage(phoneNumber, message);
}
```

---

## SUMMARY OF FILES MODIFIED

| File | Change | Type |
|------|--------|------|
| CommunicationController.java | Replace (empty file) | CRITICAL |
| CommunicationServiceImpl.java | Replace implementation | CRITICAL |
| CommunicationService.java | Update interface signature | CRITICAL |
| SendCommunicationRequest.java | Create new DTO | NEW |
| pom.xml | Add spring-boot-starter-mail | VERIFY |
| application.yml | Verify SMTP config | VERIFY |

---

## NEXT STEPS

1. ✅ Make the 5 changes above
2. ✅ Run `mvn clean install` to compile
3. ✅ Start the backend: `mvn spring-boot:run`
4. ✅ Test from frontend Donor Communication tab
5. ✅ Check backend logs for debug output
6. ✅ Verify emails in inbox
7. ✅ Check communication_history table for records
