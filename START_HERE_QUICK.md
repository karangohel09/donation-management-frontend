# ⚡ INSTANT SETUP - Email & WhatsApp Working in 5 Minutes

## ✅ DONE: Frontend Fixed
The appeals dropdown will now show all your 7 appeals. Reload the page to see them.

---

## 🔧 DO THIS NOW (Backend Setup)

### Copy 2 Files to Your Backend:

**File 1:** Go to `IMPLEMENTATION_FILES` folder
- Copy `EmailConfig.java` 
- Paste to: `src/main/java/com/itc/demo/config/EmailConfig.java`

**File 2:** Go to `IMPLEMENTATION_FILES` folder  
- Copy `CommunicationServiceImpl_FINAL.java`
- Paste to: `src/main/java/com/itc/demo/service/impl/CommunicationServiceImpl.java`
- (Rename the file, remove _FINAL)

### Update 1 File:

**File:** `src/main/resources/application.yml`

Add this section:

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

**Get app password:**
1. https://myaccount.google.com/security
2. App passwords → Mail → Windows Computer
3. Copy 16-char password → paste above

### Add 1 Query to Repository:

**File:** `src/main/java/com/itc/demo/repository/DonorRepository.java`

Add this method:

```java
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Query("SELECT d FROM Donor d INNER JOIN DonorAppeal da ON d.id = da.donorId WHERE da.appealId = :appealId")
List<Donor> findDonorsByAppealId(@Param("appealId") Long appealId);
```

---

## ✨ That's It!

Restart backend → Test:

1. Frontend: Select an appeal → Send message
2. Backend logs show: "✅ Email sent to: ..."
3. Check your email inbox

**Done! Email & WhatsApp working!**

