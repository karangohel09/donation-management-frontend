# Fixed Backend Files - Copy These

## Files to Replace in Your Backend:

### 1. CommunicationService.java
**Location:** `src/main/java/com/itc/demo/service/CommunicationService.java`

Copy from: `CommunicationService_CORRECTED.java`

### 2. CommunicationServiceImpl.java
**Location:** `src/main/java/com/itc/demo/service/impl/CommunicationServiceImpl.java`

Copy from: `CommunicationServiceImpl_CORRECTED.java`

---

## Key Fixes Made:

✅ Changed `findByAppealId()` → `findDonorsByAppealId()` (correct method name)
✅ Removed complex enums and builders (simplified)
✅ Using `MimeMessage` for HTML emails (sends properly)
✅ Removed enum dependencies (CommunicationTrigger, CommunicationStatus)
✅ Fixed method signatures to match interface
✅ Proper error handling

---

## Also Ensure You Have:

### In DonorRepository.java
```java
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Query("SELECT d FROM Donor d INNER JOIN DonorAppeal da ON d.id = da.donorId WHERE da.appealId = :appealId")
List<Donor> findDonorsByAppealId(@Param("appealId") Long appealId);
```

### In application.yml
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
```

### In pom.xml (if missing)
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

---

## Then:

1. Replace the 2 Java files
2. Restart backend
3. Test: Select appeal → Send message → Check logs for "✅ Email sent to: ..."

Done!
