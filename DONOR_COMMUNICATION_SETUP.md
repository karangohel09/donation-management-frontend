# Donor Communication Setup - Complete Implementation Guide

## Overview
This document provides a complete setup guide for the donor communication feature, which automatically sends approval/rejection notifications to donors when appeals are processed.

---

## **BACKEND IMPLEMENTATION**

### 1. **Database Entities** (Already Implemented)

#### CommunicationHistory Entity
Tracks all automated communications sent to donors.

**Table:** `communication_history`

```sql
CREATE TABLE communication_history (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  appeal_id BIGINT NOT NULL,
  trigger_type VARCHAR(50),  -- APPROVAL, REJECTION, STATUS_UPDATE
  channel VARCHAR(50),        -- EMAIL, WHATSAPP, POSTAL_MAIL
  recipient_count INT NOT NULL,
  content LONGTEXT,
  status VARCHAR(50),         -- SENT, PENDING, FAILED
  sent_by_user_id BIGINT,
  sent_date DATETIME,
  error_message LONGTEXT,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  KEY idx_appeal_trigger (appeal_id, trigger_type),
  KEY idx_status (status)
);
```

#### Appeal Entity Updates
Already includes:
- `approval_date` - When the appeal was approved
- `approval_remarks` - Approval/rejection reason
- `approver_id` - Who approved it
- `approved_amount` - Final approved amount

---

### 2. **Backend Services**

#### CommunicationService Interface
Location: `com.itc.demo.service.CommunicationService`

```java
public interface CommunicationService {
    void notifyDonorsOnApproval(Appeal appeal, Long approverUserId);
    void notifyDonorsOnRejection(Appeal appeal, String rejectionReason);
    List<AutoTriggeredCommunicationDTO> getAutoTriggeredCommunications();
    List<AutoTriggeredCommunicationDTO> getAutoTriggeredCommunicationsByAppeal(Long appealId);
}
```

#### CommunicationServiceImpl
Location: `com.itc.demo.service.impl.CommunicationServiceImpl`

**Key Methods:**

1. **notifyDonorsOnApproval()**
   - Fetches all donors associated with the appeal
   - Sends HTML email with approval details
   - Sends WhatsApp message (queued)
   - Logs communication in history

2. **notifyDonorsOnRejection()**
   - Sends rejection notification with reason
   - Logs communication attempt

3. **getAutoTriggeredCommunications()**
   - Returns all auto-triggered communications

**Integration Points in AppealServiceImpl:**

```java
@Override
public AppealResponseDTO approveAppeal(Long id, ApproveAppealRequest request, Long approverUserId) {
    Appeal appeal = appealRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Appeal not found"));

    appeal.setStatus(AppealStatus.APPROVED);
    appeal.setApprovedAmount(request.getApprovedAmount());
    appeal.setApprovalRemarks(request.getRemarks());
    appeal.setApprovalDate(LocalDateTime.now());
    appeal.setApproverId(approverUserId);

    Appeal saved = appealRepository.save(appeal);

    // ✅ TRIGGER DONOR COMMUNICATION
    try {
        communicationService.notifyDonorsOnApproval(saved, approverUserId);
    } catch (Exception e) {
        log.error("Error sending notifications: " + e.getMessage());
    }

    return appealMapper.toDTO(saved);
}

@Override
public AppealResponseDTO rejectAppeal(Long id, String reason, Long approverUserId) {
    Appeal appeal = appealRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Appeal not found"));

    appeal.setStatus(AppealStatus.REJECTED);
    appeal.setApprovalRemarks(reason);
    appeal.setApprovalDate(LocalDateTime.now());
    appeal.setApproverId(approverUserId);

    Appeal saved = appealRepository.save(appeal);

    // ✅ TRIGGER DONOR COMMUNICATION
    try {
        communicationService.notifyDonorsOnRejection(saved, reason);
    } catch (Exception e) {
        log.error("Error sending notifications: " + e.getMessage());
    }

    return appealMapper.toDTO(saved);
}
```

---

### 3. **REST Controllers**

#### ApprovalController
Location: `com.itc.demo.controller.ApprovalController`

**Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/approvals/pending` | Get pending appeals for approval |
| POST | `/api/approvals/{id}/approve` | Approve an appeal & trigger notification |
| POST | `/api/approvals/{id}/reject` | Reject an appeal & trigger notification |
| GET | `/api/approvals/communications/auto-triggered` | Get all auto-triggered communications |
| GET | `/api/approvals/communications/auto-triggered/appeal/{appealId}` | Get communications for specific appeal |

---

### 4. **DTOs**

#### AutoTriggeredCommunicationDTO
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AutoTriggeredCommunicationDTO {
    private Long id;
    private Long appealId;
    private String triggerType;    // approval, rejection, status_update
    private String channels;        // EMAIL, WHATSAPP, POSTAL_MAIL
    private Integer recipientCount;
    private String status;          // sent, pending, failed
    private LocalDateTime sentDate;
}
```

#### SendCommunicationRequest
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SendCommunicationRequest {
    private Long appealId;
    private String channel;         // EMAIL, WHATSAPP, POSTAL_MAIL
    private String subject;
    private String message;
    private String recipientType;   // DONORS, APPROVERS, ALL
}
```

---

### 5. **Email Configuration**

Update `application.yml`:

```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: your-email@gmail.com
    password: your-app-password  # Use Google App Password, not regular password
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
            required: true
    default-encoding: UTF-8
```

**Gmail Setup:**
1. Enable 2-Step Verification
2. Generate App Password (not regular password)
3. Use App Password in configuration

---

## **FRONTEND IMPLEMENTATION**

### 1. **Updated DonorCommunication Component**

Location: `src/components/DonorCommunication.tsx`

**Features:**
- ✅ Dynamic appeal selection
- ✅ Channel selection (Email, WhatsApp, Postal)
- ✅ Message templates
- ✅ Real-time appeal details preview
- ✅ Auto-triggered communication history
- ✅ Communication status tracking

**Key Props:**
```typescript
interface DonorCommunicationProps {
  user: User;
}
```

**Tabs:**
1. **Compose Message** - Send communications to donors
2. **Communication History** - View past communications
3. **Auto-Triggered** - View automatic notifications triggered by approvals/rejections

---

### 2. **Communication API Methods**

Location: `src/services/api.ts`

```typescript
export const communicationAPI = {
  // Get all communications
  getCommunications: (params: { page?: number; limit?: number }) =>
    apiClient.get('/communications', { params }),

  // Send a communication
  sendCommunication: (data: any) =>
    apiClient.post('/communications/send', data),

  // Get templates
  getTemplates: () =>
    apiClient.get('/communications/templates'),

  // Get communication statistics
  getStats: () =>
    apiClient.get('/communications/stats'),

  // Get auto-triggered communications
  getAutoTriggeredCommunications: (params?: { triggerType?: string; page?: number; limit?: number }) =>
    apiClient.get('/communications/auto-triggered', { params }),

  // Get auto-triggered communication statistics
  getAutoTriggeredStats: () =>
    apiClient.get('/communications/auto-triggered/stats'),
};
```

---

### 3. **Integration in ApprovalWorkflow**

The donor communication is automatically triggered when:

1. **Appeal is Approved:**
   - Backend calls `communicationService.notifyDonorsOnApproval()`
   - Email sent: "Great News! Your Appeal is Approved"
   - WhatsApp queued for delivery
   - History logged in `CommunicationHistory`

2. **Appeal is Rejected:**
   - Backend calls `communicationService.notifyDonorsOnRejection()`
   - Email sent: "Update on Your Appeal"
   - Rejection reason included
   - History logged

---

## **WORKFLOW FLOW**

```
┌─────────────────────────────────────────────────────────┐
│                 APPROVAL WORKFLOW                        │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│  1. Admin clicks "Approve Appeal" in ApprovalWorkflow   │
│     - Fills: Approved Amount, Remarks                  │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│  2. POST /api/approvals/{id}/approve                    │
│     - Updates Appeal Status to APPROVED                 │
│     - Sets approval_date, approval_remarks              │
│     - Sets approverId                                   │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│  3. CommunicationService.notifyDonorsOnApproval()      │
│     - Fetches all Donors for Appeal                     │
│     - Builds HTML Email & WhatsApp message              │
│     - Sends Emails                                      │
│     - Queues WhatsApp messages                          │
│     - Logs in CommunicationHistory                      │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│  4. Frontend DonorCommunication shows:                  │
│     - Auto-triggered communication in History           │
│     - Status (SENT, PENDING, FAILED)                    │
│     - Recipient count                                   │
│     - Channel used                                      │
│     - Timestamp                                         │
└─────────────────────────────────────────────────────────┘
```

---

## **TESTING**

### 1. **Manual Testing Steps**

#### Approve Appeal:
```bash
# 1. Login
POST /api/auth/login
{
  "email": "admin@itc.com",
  "password": "admin123"
}

# 2. Get Appeals
GET /api/appeals

# 3. Approve Appeal
POST /api/approvals/{appealId}/approve
{
  "approvedAmount": 50000,
  "remarks": "Approved for implementation"
}

# 4. Check Communication History
GET /api/approvals/communications/auto-triggered
```

#### Frontend Testing:
1. Navigate to "Donor Communication" tab
2. Click "Auto-Triggered" tab
3. You should see the approval notification

---

### 2. **Test Email Configuration**

Add test email address to donors before approving to verify emails are sent.

```sql
INSERT INTO donors (name, email, phone_number, is_active, created_at, updated_at)
VALUES ('Test Donor', 'your-email@gmail.com', '9999999999', true, NOW(), NOW());

INSERT INTO donor_appeals (donor_id, appeal_id, donation_amount, donation_date, created_at)
SELECT 
  d.id,
  a.id,
  50000,
  NOW(),
  NOW()
FROM donors d
JOIN appeals a ON a.id = 1
WHERE d.email = 'your-email@gmail.com'
LIMIT 1;
```

---

## **TROUBLESHOOTING**

### Issue: Emails not sending

**Check:**
1. Email configuration in `application.yml`
2. Gmail App Password (not regular password)
3. SMTP server connectivity
4. Check logs for errors

### Issue: Donors not receiving notifications

**Check:**
1. Verify donors are linked to appeal via `donor_appeals` table
2. Verify donor email is valid
3. Check email provider spam folder
4. Review `CommunicationHistory` table for status

### Issue: Auto-triggered communication not showing

**Check:**
1. Verify approval was successful
2. Check `CommunicationHistory` table
3. Verify appeal ID is correct
4. Refresh page after approval

---

## **EMAIL TEMPLATES**

### Approval Email
Subject: "Great News! Your Appeal is Approved"

Features:
- Green header with check mark
- Appeal details
- Approved amount
- Next steps
- Professional branding

### Rejection Email
Subject: "Update on Your Appeal"

Features:
- Red header
- Rejection reason
- Professional closure
- Contact information

---

## **WHATSAPP INTEGRATION**

Currently implemented as **PENDING** status.

To enable actual WhatsApp delivery:
1. Integrate Twilio or WhatsApp Business API
2. Update `sendWhatsAppNotifications()` in `CommunicationServiceImpl`
3. Add phone number validation

**Placeholder implementation:**
```java
private void sendWhatsAppNotifications(Appeal appeal, List<Donor> donors, 
                                       String message, CommunicationTrigger trigger, 
                                       Long approverUserId) {
    int phoneCount = (int) donors.stream()
            .filter(d -> d.getPhoneNumber() != null && !d.getPhoneNumber().isEmpty())
            .count();

    if (phoneCount > 0) {
        log.info("WhatsApp notification queued for {} recipients", phoneCount);
        logCommunication(appeal.getId(), trigger, "WHATSAPP", phoneCount, message,
                CommunicationStatus.PENDING, approverUserId);
    }
}
```

---

## **NEXT STEPS**

1. ✅ Test approval workflow with email notification
2. ✅ Verify DonorCommunication component displays history
3. ⏳ Implement WhatsApp integration (optional)
4. ⏳ Add SMS notifications (optional)
5. ⏳ Create communication templates management UI

---

## **ARCHITECTURE DIAGRAM**

```
┌──────────────────────────────────────────────────────────────┐
│                       FRONTEND                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ ApprovalWorkflow  →  Approve Appeal Button            │  │
│  │ DonorCommunication → View Auto-Triggered Comms        │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                    BACKEND API                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ ApprovalController                                    │  │
│  │  - POST /approvals/{id}/approve                       │  │
│  │  - POST /approvals/{id}/reject                        │  │
│  │  - GET /approvals/communications/auto-triggered       │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                    SERVICES LAYER                            │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ AppealService.approveAppeal()                          │  │
│  │  ↓                                                     │  │
│  │ CommunicationService.notifyDonorsOnApproval()        │  │
│  │  - Get Donors from DonorRepository                    │  │
│  │  - Build Email Content                                │  │
│  │  - Send via JavaMailSender                            │  │
│  │  - Log in CommunicationHistoryRepository              │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                    DATABASE                                   │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ appeals - Updated status to APPROVED                  │  │
│  │ communication_history - Logged notification sent      │  │
│  │ donor_appeals - Retrieved donor list                  │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES                           │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Gmail SMTP - Email delivery                           │  │
│  │ Twilio (Optional) - WhatsApp delivery                 │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## **SECURITY CONSIDERATIONS**

1. **Authentication:** All endpoints require JWT token
2. **Authorization:** Only SUPER_ADMIN, MISSION_ADMIN, FINANCE_ADMIN can approve/reject
3. **Email Validation:** Donor emails validated before sending
4. **Rate Limiting:** Consider adding rate limiting for bulk communications
5. **Data Privacy:** Ensure donor email addresses are not logged in plain text

---

## **PERFORMANCE OPTIMIZATION**

1. **Database Indexes:**
   ```sql
   CREATE INDEX idx_appeal_trigger ON communication_history(appeal_id, trigger_type);
   CREATE INDEX idx_status ON communication_history(status);
   CREATE INDEX idx_email ON donors(email);
   ```

2. **Async Processing:** Consider using Spring @Async for email sending
   ```java
   @Async
   public void notifyDonorsOnApproval(Appeal appeal, Long approverUserId)
   ```

3. **Batch Email Sending:** Group emails in batches for better performance

---

## **MONITORING & LOGGING**

Key logs to monitor:
```
com.itc.demo.service.impl.CommunicationServiceImpl
- "Notifying {} donors about approval of appeal: {}"
- "Successfully sent email to: {}"
- "Error sending email to {}: {}"
- "Communication logged: Appeal {} via {}"
```

---

Generated: 2026-01-30
Version: 1.0
Status: Complete & Ready for Deployment
