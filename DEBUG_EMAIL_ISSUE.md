# Debug: Why Email Not Sending

## 🔍 Use this version: `CommunicationServiceImpl_DEBUG.java`

Copy it to: `src/main/java/com/itc/demo/service/impl/CommunicationServiceImpl.java`

Then try sending again and **check backend logs** for detailed debugging info.

---

## ✅ BEFORE YOU SEND, CHECK THESE 3 THINGS:

### 1️⃣ **SMTP Configuration in `application.yml`**

Add this:
```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: your-gmail@gmail.com
    password: your-app-password
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
```

**If missing:** You'll see error "SMTP NOT CONFIGURED! JavaMailSender is null"

---

### 2️⃣ **Donor Email Addresses in Database**

The appeal "test12" needs donors with emails.

**Check your database:**
```sql
-- Find all donors for appeal 5 (test12)
SELECT d.id, d.name, d.email 
FROM donors d 
INNER JOIN donor_appeals da ON d.id = da.donor_id 
WHERE da.appeal_id = 5;
```

**If empty:** You'll see error "NO DONORS FOUND for appeal!"

**If emails are NULL:** You'll see warning "Donor has no email!"

---

### 3️⃣ **DonorRepository Query Method**

Make sure your `DonorRepository.java` has:

```java
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Query("SELECT d FROM Donor d INNER JOIN DonorAppeal da ON d.id = da.donorId WHERE da.appealId = :appealId")
List<Donor> findDonorsByAppealId(@Param("appealId") Long appealId);
```

---

## 📋 What the Debug Logs Will Show:

```
=== SEND COMMUNICATION START ===
Appeal ID: 5
Channel: EMAIL
Subject: for donation

STEP 1: Finding donors for appeal 5...
STEP 1 RESULT: Found 0 donors        ← If 0, see #2 above

STEP 2: Checking email configuration...
STEP 2 RESULT: SMTP configured ✓      ← If fails, see #1 above

STEP 3: Sending 0 messages via EMAIL...
STEP 3 RESULT: 0 sent, 0 failed

=== SEND COMMUNICATION SUCCESS ===
```

---

## 🛠️ To Fix:

1. Add SMTP config to `application.yml`
2. Verify donors exist for the appeal in database
3. Restart backend
4. Try again and check logs

The logs will tell you exactly what's wrong!
