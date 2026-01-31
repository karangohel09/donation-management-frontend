# STEP-BY-STEP: Make Email & WhatsApp Working

## ✅ FRONTEND FIX (DONE)
- Fixed the appeals dropdown to show ALL appeals
- Removed the APPROVED filter that was hiding your appeals

---

## 🔧 BACKEND FIXES NEEDED (3 Simple Steps)

### Step 1: Update `application.yml`

Add this to your `src/main/resources/application.yml`:

```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: your-email@gmail.com
    password: your-app-password
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

**Get Gmail App Password:**
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification (if not done)
3. Go to "App passwords"
4. Select "Mail" and "Windows Computer"
5. Copy the 16-character password
6. Paste in above

---

### Step 2: Copy Java Files

In your backend project, copy these 4 files from `IMPLEMENTATION_FILES` folder:

**File 1:** `EmailConfig.java`
- Copy to: `src/main/java/com/itc/demo/config/EmailConfig.java`

**File 2:** `CommunicationService.java`
- Copy to: `src/main/java/com/itc/demo/service/CommunicationService.java`
- If you already have this file, replace it

**File 3:** `CommunicationServiceImpl.java`
- Copy to: `src/main/java/com/itc/demo/service/impl/CommunicationServiceImpl.java`
- Create if doesn't exist

**File 4:** `CommunicationController.java`
- Copy to: `src/main/java/com/itc/demo/controller/CommunicationController.java`
- Create if doesn't exist

---

### Step 3: Update `DonorRepository.java`

Find your `src/main/java/com/itc/demo/repository/DonorRepository.java`

Add this method:

```java
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Query("SELECT d FROM Donor d INNER JOIN DonorAppeal da ON d.id = da.donorId " +
       "WHERE da.appealId = :appealId")
List<Donor> findDonorsByAppealId(@Param("appealId") Long appealId);
```

---

## 🎯 Then It Will Work!

**To send email:**
1. Go to Donor Communication tab
2. **Select an appeal** (dropdown now shows all 7!)
3. Write message
4. Click "Send Communication"
5. ✅ Emails sent to all donors for that appeal!

**Automatic WhatsApp/Email on approval:**
1. Go to Approval Workflow
2. Approve an appeal
3. ✅ System automatically sends notification to all donors!

---

## 📋 Testing

After copying files, restart backend and:

1. Open browser console (F12)
2. Go to Donor Communication
3. Check if dropdown shows your 7 appeals
4. Select one
5. Click Send Communication
6. Check backend logs for: "Email sent successfully to: ..."

**Done!** Your email and WhatsApp will work.

