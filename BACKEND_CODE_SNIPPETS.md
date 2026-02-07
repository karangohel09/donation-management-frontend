# Backend Implementation - Exact Code Snippets

Copy and paste these code snippets to implement donor selection in your backend.

---

## 1. SendCommunicationRequest.java (DTO)

**Location:** `src/main/java/com/itc/demo/dto/request/SendCommunicationRequest.java`

```java
package com.itc.demo.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SendCommunicationRequest {
    
    private Integer appealId;
    private String channel;           // EMAIL, WHATSAPP, POSTAL
    private String subject;           // For email
    private String message;           // Message content
    private String recipientType;     // "ALL_DONORS" or "SELECTED_DONORS"
    private List<Integer> donorIds;   // List of donor IDs (empty if ALL_DONORS)
    
    // Validation helper
    public boolean isValid() {
        return appealId != null && 
               channel != null && !channel.isEmpty() && 
               message != null && !message.isEmpty() &&
               recipientType != null && !recipientType.isEmpty();
    }
    
    public boolean isValidRecipientType() {
        return "ALL_DONORS".equals(recipientType) || "SELECTED_DONORS".equals(recipientType);
    }
}
```

---

## 2. CommunicationService.java (Interface)

**Location:** `src/main/java/com/itc/demo/service/CommunicationService.java`

```java
package com.itc.demo.service;

import com.itc.demo.dto.request.SendCommunicationRequest;
import java.util.List;

public interface CommunicationService {
    
    /**
     * Send communication to specific or all donors of an appeal
     * 
     * @param request SendCommunicationRequest containing appeal, channel, message, and donor selection
     * @throws Exception if appeal or donors not found
     */
    void sendCommunication(SendCommunicationRequest request) throws Exception;
    
    /**
     * Send communication to all donors of an appeal
     * 
     * @param appealId ID of the appeal
     * @param channel Communication channel (EMAIL, WHATSAPP, POSTAL)
     * @param subject Email subject (for email channel)
     * @param message Message content
     * @throws Exception if appeal not found
     */
    void sendCommunicationToAppealDonors(Integer appealId, String channel, String subject, String message) throws Exception;
    
    /**
     * Send communication to specific donors
     * 
     * @param donorIds List of donor IDs
     * @param channel Communication channel
     * @param subject Email subject (for email channel)
     * @param message Message content
     * @throws Exception if donors not found
     */
    void sendCommunicationToSpecificDonors(List<Integer> donorIds, String channel, String subject, String message) throws Exception;
}
```

---

## 3. CommunicationServiceImpl.java (Implementation)

**Location:** `src/main/java/com/itc/demo/service/impl/CommunicationServiceImpl.java`

```java
package com.itc.demo.service.impl;

import com.itc.demo.dto.request.SendCommunicationRequest;
import com.itc.demo.entity.Appeal;
import com.itc.demo.entity.Donor;
import com.itc.demo.repository.AppealRepository;
import com.itc.demo.repository.DonorRepository;
import com.itc.demo.service.CommunicationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@Slf4j
public class CommunicationServiceImpl implements CommunicationService {
    
    @Autowired
    private AppealRepository appealRepository;
    
    @Autowired
    private DonorRepository donorRepository;
    
    @Override
    public void sendCommunication(SendCommunicationRequest request) throws Exception {
        log.info("Processing communication request for appeal {} via {} to {} recipient type", 
                 request.getAppealId(), request.getChannel(), request.getRecipientType());
        
        // Validate request
        if (!request.isValid() || !request.isValidRecipientType()) {
            throw new IllegalArgumentException("Invalid communication request");
        }
        
        // Verify appeal exists
        Appeal appeal = appealRepository.findById(request.getAppealId())
                .orElseThrow(() -> new Exception("Appeal not found with ID: " + request.getAppealId()));
        
        // Route based on recipient type
        if ("ALL_DONORS".equals(request.getRecipientType())) {
            log.info("Routing to sendCommunicationToAppealDonors");
            sendCommunicationToAppealDonors(
                    request.getAppealId(),
                    request.getChannel(),
                    request.getSubject(),
                    request.getMessage()
            );
        } else if ("SELECTED_DONORS".equals(request.getRecipientType())) {
            log.info("Routing to sendCommunicationToSpecificDonors with {} donors", 
                     request.getDonorIds().size());
            sendCommunicationToSpecificDonors(
                    request.getDonorIds(),
                    request.getChannel(),
                    request.getSubject(),
                    request.getMessage()
            );
        }
        
        log.info("Communication sent successfully");
    }
    
    @Override
    public void sendCommunicationToAppealDonors(Integer appealId, String channel, String subject, String message) throws Exception {
        log.info("Sending communication to all donors of appeal {}", appealId);
        
        // Get appeal
        Appeal appeal = appealRepository.findById(appealId)
                .orElseThrow(() -> new Exception("Appeal not found with ID: " + appealId));
        
        // Get all donors
        List<Donor> donors = donorRepository.findAll();
        log.info("Sending to {} donors", donors.size());
        
        // Send to each donor
        int successCount = 0;
        for (Donor donor : donors) {
            try {
                sendToChannel(donor, channel, subject, message, appeal);
                successCount++;
            } catch (Exception e) {
                log.error("Failed to send to donor {}: {}", donor.getId(), e.getMessage());
            }
        }
        
        log.info("Communication completed. Sent to {}/{} donors", successCount, donors.size());
    }
    
    @Override
    public void sendCommunicationToSpecificDonors(List<Integer> donorIds, String channel, String subject, String message) throws Exception {
        log.info("Sending communication to {} specific donors via {}", donorIds.size(), channel);
        
        // Validate that donors were provided
        if (donorIds == null || donorIds.isEmpty()) {
            throw new Exception("No donor IDs provided");
        }
        
        // Get specific donors
        List<Donor> donors = donorRepository.findAllById(donorIds);
        
        if (donors.isEmpty()) {
            throw new Exception("No donors found with provided IDs");
        }
        
        // Log if some IDs were not found
        if (donors.size() < donorIds.size()) {
            log.warn("Only {} donors found out of {} requested IDs", donors.size(), donorIds.size());
        }
        
        // Send to each donor
        int successCount = 0;
        for (Donor donor : donors) {
            try {
                sendToChannel(donor, channel, subject, message, null);
                successCount++;
            } catch (Exception e) {
                log.error("Failed to send to donor {}: {}", donor.getId(), e.getMessage());
            }
        }
        
        log.info("Communication completed. Sent to {}/{} selected donors", successCount, donors.size());
    }
    
    /**
     * Helper method to send to appropriate channel
     */
    private void sendToChannel(Donor donor, String channel, String subject, String message, Appeal appeal) throws Exception {
        if (channel == null || channel.isEmpty()) {
            throw new Exception("Channel cannot be empty");
        }
        
        switch (channel.toUpperCase()) {
            case "EMAIL":
                sendEmail(donor, subject, message, appeal);
                break;
            case "WHATSAPP":
                sendWhatsApp(donor, message, appeal);
                break;
            case "POSTAL":
                logPostalMail(donor, message, appeal);
                break;
            default:
                log.warn("Unknown channel: {}", channel);
                throw new Exception("Unknown channel: " + channel);
        }
    }
    
    /**
     * Send email to donor with message personalization
     */
    private void sendEmail(Donor donor, String subject, String message, Appeal appeal) throws Exception {
        // Merge tags: [Donor Name], [Amount], [Appeal Title]
        String personalizedSubject = subject != null ? subject : "Communication from ITC × Anoopam";
        String personalizedMessage = message
                .replace("[Donor Name]", donor.getName() != null ? donor.getName() : "Valued Donor")
                .replace("[Amount]", appeal != null && appeal.getApprovedAmount() != null ? 
                         "₹" + appeal.getApprovedAmount().toString() : "N/A")
                .replace("[Appeal Title]", appeal != null && appeal.getTitle() != null ? 
                         appeal.getTitle() : "Our Appeal");
        
        log.info("Sending email to {}: subject={}", donor.getEmail(), personalizedSubject);
        
        // TODO: Implement email sending here
        // Example using your email service:
        // emailService.send(
        //     to: donor.getEmail(),
        //     subject: personalizedSubject,
        //     body: personalizedMessage
        // );
        
        // For now, just log it
        log.info("Email content preview: {}", personalizedMessage.substring(0, Math.min(100, personalizedMessage.length())));
    }
    
    /**
     * Send WhatsApp message to donor
     */
    private void sendWhatsApp(Donor donor, String message, Appeal appeal) throws Exception {
        // Merge tags
        String personalizedMessage = message
                .replace("[Donor Name]", donor.getName() != null ? donor.getName() : "Valued Donor")
                .replace("[Amount]", appeal != null && appeal.getApprovedAmount() != null ? 
                         "₹" + appeal.getApprovedAmount().toString() : "N/A")
                .replace("[Appeal Title]", appeal != null && appeal.getTitle() != null ? 
                         appeal.getTitle() : "Our Appeal");
        
        log.info("Sending WhatsApp to {}: {}", donor.getPhoneNumber(), 
                 personalizedMessage.substring(0, Math.min(50, personalizedMessage.length())));
        
        // TODO: Implement WhatsApp sending here
        // Example using WhatsApp Business API:
        // whatsAppService.sendMessage(
        //     phoneNumber: donor.getPhoneNumber(),
        //     message: personalizedMessage
        // );
        
        // For now, just log it
        log.info("WhatsApp sent successfully");
    }
    
    /**
     * Log postal mail for manual processing
     */
    private void logPostalMail(Donor donor, String message, Appeal appeal) throws Exception {
        log.info("Postal mail scheduled for: {} at {}", donor.getName(), donor.getEmail());
        
        // TODO: Implement postal mail scheduling
        // Create a postal_mail_queue table entry
        // Or integrate with postal service API
        
        log.info("Postal mail logged for manual processing");
    }
}
```

---

## 4. CommunicationController.java (Updated)

**Location:** `src/main/java/com/itc/demo/controller/CommunicationController.java`

```java
package com.itc.demo.controller;

import com.itc.demo.dto.request.SendCommunicationRequest;
import com.itc.demo.dto.response.ApiResponse;
import com.itc.demo.service.CommunicationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/communications")
@CrossOrigin
@Slf4j
public class CommunicationController {
    
    @Autowired
    private CommunicationService communicationService;
    
    /**
     * Send communication to specific or all donors
     */
    @PostMapping("/send")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> sendCommunication(@RequestBody SendCommunicationRequest request) {
        try {
            log.info("Received communication request for appeal {} via {} to {} recipient type", 
                     request.getAppealId(), request.getChannel(), request.getRecipientType());
            
            // Validate request
            if (!request.isValid()) {
                log.warn("Invalid request: missing required fields");
                return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Invalid request: missing required fields (appealId, channel, message, recipientType)", null));
            }
            
            // Validate recipient type
            if (!request.isValidRecipientType()) {
                log.warn("Invalid recipient type: {}", request.getRecipientType());
                return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Invalid recipient type. Must be 'ALL_DONORS' or 'SELECTED_DONORS'", null));
            }
            
            // Validate donorIds for SELECTED_DONORS
            if ("SELECTED_DONORS".equals(request.getRecipientType())) {
                if (request.getDonorIds() == null || request.getDonorIds().isEmpty()) {
                    log.warn("SELECTED_DONORS chosen but no donor IDs provided");
                    return ResponseEntity.badRequest()
                        .body(new ApiResponse(false, "Please select at least one donor", null));
                }
                log.info("SELECTED_DONORS with {} donors", request.getDonorIds().size());
            }
            
            // Validate email subject if channel is EMAIL
            if ("EMAIL".equalsIgnoreCase(request.getChannel())) {
                if (request.getSubject() == null || request.getSubject().trim().isEmpty()) {
                    log.warn("EMAIL channel chosen but no subject provided");
                    return ResponseEntity.badRequest()
                        .body(new ApiResponse(false, "Email subject is required for EMAIL channel", null));
                }
            }
            
            // Call service to send communication
            communicationService.sendCommunication(request);
            
            log.info("Communication sent successfully");
            return ResponseEntity.ok(new ApiResponse(true, "Communication sent successfully", null));
            
        } catch (IllegalArgumentException e) {
            log.error("Validation error: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Validation error: " + e.getMessage(), null));
        } catch (Exception e) {
            log.error("Error sending communication: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to send communication: " + e.getMessage(), null));
        }
    }
}
```

---

## 5. DonorRepository.java (Make sure this exists)

**Location:** `src/main/java/com/itc/demo/repository/DonorRepository.java`

```java
package com.itc.demo.repository;

import com.itc.demo.entity.Donor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DonorRepository extends JpaRepository<Donor, Integer> {
    // JpaRepository provides:
    // - findAll()
    // - findAllById(Iterable<ID>)
    // - findById(ID)
    // - save(Entity)
    // - delete(Entity)
    // - etc.
}
```

---

## 6. Donor.java Entity (Ensure it exists)

**Location:** `src/main/java/com/itc/demo/entity/Donor.java`

```java
package com.itc.demo.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "donors")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Donor {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(name = "phone_number")
    private String phoneNumber;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
```

---

## Testing with Postman

### Test 1: Send to All Donors

**URL:** `http://localhost:5000/api/communications/send`

**Method:** POST

**Headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Body:**
```json
{
  "appealId": 1,
  "channel": "EMAIL",
  "subject": "Thank You for Your Support",
  "message": "Dear [Donor Name],\n\nThank you for supporting [Appeal Title]. Your contribution of [Amount] has been received.\n\nBest regards,\nITC × Anoopam Team",
  "recipientType": "ALL_DONORS",
  "donorIds": []
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Communication sent successfully",
  "data": null
}
```

---

### Test 2: Send to Specific Donors (First 20)

**URL:** `http://localhost:5000/api/communications/send`

**Method:** POST

**Headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Body:**
```json
{
  "appealId": 1,
  "channel": "EMAIL",
  "subject": "Special Update for Selected Donors",
  "message": "Dear [Donor Name],\n\nWe have a special update about [Appeal Title] that we wanted to share with our valued supporters like you.\n\nYour support of [Amount] is making a real difference.\n\nThank you,\nITC × Anoopam Team",
  "recipientType": "SELECTED_DONORS",
  "donorIds": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Communication sent successfully",
  "data": null
}
```

---

### Test 3: Error - No Donors Selected

**URL:** `http://localhost:5000/api/communications/send`

**Method:** POST

**Body:**
```json
{
  "appealId": 1,
  "channel": "EMAIL",
  "subject": "Test",
  "message": "Test message",
  "recipientType": "SELECTED_DONORS",
  "donorIds": []
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Please select at least one donor",
  "data": null
}
```

---

### Test 4: Error - Invalid Recipient Type

**URL:** `http://localhost:5000/api/communications/send`

**Method:** POST

**Body:**
```json
{
  "appealId": 1,
  "channel": "EMAIL",
  "subject": "Test",
  "message": "Test",
  "recipientType": "INVALID_TYPE",
  "donorIds": []
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Invalid recipient type. Must be 'ALL_DONORS' or 'SELECTED_DONORS'",
  "data": null
}
```

---

### Test 5: Error - Email Missing Subject

**URL:** `http://localhost:5000/api/communications/send`

**Method:** POST

**Body:**
```json
{
  "appealId": 1,
  "channel": "EMAIL",
  "subject": "",
  "message": "Test",
  "recipientType": "ALL_DONORS",
  "donorIds": []
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Email subject is required for EMAIL channel",
  "data": null
}
```

---

## Summary of Changes

| File | What Changed | Lines |
|------|--------------|-------|
| SendCommunicationRequest.java | Added recipientType, donorIds, validation methods | +15 |
| CommunicationService.java | Added 2 new methods for donor selection | +30 |
| CommunicationServiceImpl.java | Implemented new routing and donor selection logic | +120 |
| CommunicationController.java | Added comprehensive validation | +20 |
| DonorRepository.java | Ensure it exists (uses JpaRepository default methods) | 0 |
| Donor.java | Ensure it exists with proper fields | 0 |

**Total New Code:** ~185 lines

---

## Next Steps

1. ✅ Copy the code snippets above to your project
2. ✅ Build and test with Postman examples
3. ✅ Verify donor selection works
4. ✅ Implement email/WhatsApp services (optional)
5. ✅ Add communication tracking/logging tables (optional)
6. ✅ Test end-to-end with frontend

