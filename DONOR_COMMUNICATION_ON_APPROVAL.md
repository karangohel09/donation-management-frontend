# Donor Communication on Appeal Approval - Implementation Plan

## Overview
When an appeal is **APPROVED**, automatically trigger donor communication to notify relevant stakeholders about the approval.

---

## BACKEND CHANGES REQUIRED

### 1. **Update ApprovalController**
**File:** `com.itc.demo.controller.ApprovalController`

**Change:** When approving an appeal, trigger communication workflow
```java
@PostMapping("/{appealId}/approve")
public ResponseEntity<?> approveAppeal(
    @PathVariable Long appealId,
    @RequestBody ApproveAppealRequest request
) {
    // Existing approval logic...
    
    // NEW: Trigger donor communication
    Appeal approvedAppeal = approvalService.approveAppeal(appealId, request);
    
    // Send notification to donors
    communicationService.notifyDonorsOnApproval(approvedAppeal);
    
    return ResponseEntity.ok(new AppealResponseDTO(approvedAppeal));
}
```

---

### 2. **Create CommunicationService** (if not already exists)
**File:** `com.itc.demo.service.impl.CommunicationServiceImpl`

**New Service Methods:**
```java
@Service
@Transactional
public class CommunicationServiceImpl implements CommunicationService {
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private WhatsAppService whatsAppService;
    
    @Autowired
    private DonorRepository donorRepository;
    
    @Autowired
    private CommunicationHistoryRepository historyRepository;
    
    /**
     * Notify all donors when appeal is approved
     */
    public void notifyDonorsOnApproval(Appeal appeal) {
        try {
            // Get all donors who donated or showed interest in this appeal
            List<Donor> relevantDonors = donorRepository.findByAppealId(appeal.getId());
            
            if (relevantDonors.isEmpty()) {
                logger.warn("No donors found for appeal: " + appeal.getId());
                return;
            }
            
            // Prepare message
            String subject = "Great News! Your Appeal \"" + appeal.getTitle() + "\" is Approved";
            String message = buildApprovalMessage(appeal);
            
            // Send via multiple channels
            sendViaEmail(appeal, relevantDonors, subject, message);
            sendViaWhatsApp(appeal, relevantDonors, message);
            
            // Log communication
            logCommunication(appeal, "email", relevantDonors.size(), subject);
            
        } catch (Exception e) {
            logger.error("Error notifying donors on approval: " + e.getMessage());
            // Don't fail the approval if communication fails
        }
    }
    
    private String buildApprovalMessage(Appeal appeal) {
        return "Dear Donor,\n\n" +
               "We are pleased to inform you that your appeal \"" + appeal.getTitle() + 
               "\" has been approved with an amount of ₹" + appeal.getApprovedAmount() + ".\n\n" +
               "Impact Expected: " + appeal.getExpectedBeneficiaries() + " beneficiaries\n" +
               "Duration: " + appeal.getDuration() + " months\n\n" +
               "We will keep you updated on the implementation and impact of this initiative.\n\n" +
               "Thank you for your support!\n\n" +
               "Best regards,\nITC × Anoopam Mission Team";
    }
    
    private void sendViaEmail(Appeal appeal, List<Donor> donors, 
                             String subject, String message) {
        // Use existing email service
        for (Donor donor : donors) {
            emailService.sendEmail(
                donor.getEmail(),
                subject,
                message
            );
        }
    }
    
    private void sendViaWhatsApp(Appeal appeal, List<Donor> donors, String message) {
        // Use WhatsApp service (if available)
        for (Donor donor : donors) {
            if (donor.getPhoneNumber() != null) {
                whatsAppService.sendMessage(
                    donor.getPhoneNumber(),
                    message
                );
            }
        }
    }
    
    private void logCommunication(Appeal appeal, String channel, 
                                 int recipientCount, String content) {
        CommunicationHistory history = new CommunicationHistory();
        history.setAppealId(appeal.getId());
        history.setChannel(channel);
        history.setRecipientCount(recipientCount);
        history.setContent(content);
        history.setStatus("sent");
        history.setSentDate(LocalDateTime.now());
        historyRepository.save(history);
    }
}
```

---

### 3. **Add Donor Entity & Repository**
**File:** `com.itc.demo.entity.Donor`

```java
@Entity
@Table(name = "donors")
public class Donor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String email;
    private String phoneNumber;
    
    @ManyToMany
    @JoinTable(
        name = "donor_appeals",
        joinColumns = @JoinColumn(name = "donor_id"),
        inverseJoinColumns = @JoinColumn(name = "appeal_id")
    )
    private List<Appeal> appeals;
    
    // Getters & Setters
}
```

**File:** `com.itc.demo.repository.DonorRepository`

```java
@Repository
public interface DonorRepository extends JpaRepository<Donor, Long> {
    List<Donor> findByAppealId(Long appealId);
    Donor findByEmail(String email);
}
```

---

### 4. **Update Appeal Entity to Track Approved Status**
**File:** `com.itc.demo.entity.Appeal`

```java
@Entity
public class Appeal {
    // Existing fields...
    
    @Enumerated(EnumType.STRING)
    private AppealStatus status; // PENDING, APPROVED, REJECTED, COMPLETED
    
    private BigDecimal approvedAmount;
    
    private LocalDateTime approvalDate;
    
    private String approvalRemarks;
    
    // Getters & Setters
}
```

**Enum:** `com.itc.demo.enums.AppealStatus`

```java
public enum AppealStatus {
    PENDING,
    APPROVED,
    REJECTED,
    COMPLETED,
    ON_HOLD
}
```

---

### 5. **Create CommunicationHistory Entity**
**File:** `com.itc.demo.entity.CommunicationHistory`

```java
@Entity
@Table(name = "communication_history")
public class CommunicationHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long appealId;
    
    @Enumerated(EnumType.STRING)
    private CommunicationChannel channel; // EMAIL, WHATSAPP, POSTAL
    
    private Integer recipientCount;
    
    private String content;
    
    @Enumerated(EnumType.STRING)
    private CommunicationStatus status; // SENT, PENDING, FAILED
    
    private LocalDateTime sentDate;
    
    private String errorMessage;
    
    // Getters & Setters
}
```

---

### 6. **Add ApprovalServiceImpl Enhancement**
**File:** `com.itc.demo.service.impl.ApprovalServiceImpl`

```java
@Service
@Transactional
public class ApprovalServiceImpl implements ApprovalService {
    
    @Autowired
    private AppealRepository appealRepository;
    
    @Autowired
    private CommunicationService communicationService;
    
    public Appeal approveAppeal(Long appealId, ApproveAppealRequest request) {
        Appeal appeal = appealRepository.findById(appealId)
            .orElseThrow(() -> new ResourceNotFoundException("Appeal not found"));
        
        // Update appeal status
        appeal.setStatus(AppealStatus.APPROVED);
        appeal.setApprovedAmount(request.getApprovedAmount());
        appeal.setApprovalRemarks(request.getRemarks());
        appeal.setApprovalDate(LocalDateTime.now());
        
        Appeal savedAppeal = appealRepository.save(appeal);
        
        // ✅ TRIGGER DONOR COMMUNICATION
        communicationService.notifyDonorsOnApproval(savedAppeal);
        
        return savedAppeal;
    }
}
```

---

### 7. **Update ApprovalController Full Implementation**

```java
@RestController
@RequestMapping("/api/approvals")
public class ApprovalController {
    
    @Autowired
    private ApprovalService approvalService;
    
    @PostMapping("/{appealId}/approve")
    @PreAuthorize("hasRole('APPROVER') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> approveAppeal(
            @PathVariable Long appealId,
            @RequestBody ApproveAppealRequest request) {
        try {
            Appeal approvedAppeal = approvalService.approveAppeal(appealId, request);
            return ResponseEntity.ok(new AppealResponseDTO(approvedAppeal));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Failed to approve appeal", e.getMessage()));
        }
    }
    
    @PostMapping("/{appealId}/reject")
    @PreAuthorize("hasRole('APPROVER') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> rejectAppeal(
            @PathVariable Long appealId,
            @RequestBody RejectAppealRequest request) {
        try {
            Appeal rejectedAppeal = approvalService.rejectAppeal(appealId, request);
            // NO communication on rejection (optional - can be added)
            return ResponseEntity.ok(new AppealResponseDTO(rejectedAppeal));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Failed to reject appeal", e.getMessage()));
        }
    }
}
```

---

## FRONTEND CHANGES REQUIRED

### 1. **Update ApprovalWorkflow.tsx**
Add automatic notification when approval succeeds:

```tsx
const handleConfirm = async () => {
    if (!selectedAppeal) return;
    try {
        setSubmitting(true);
        setError('');

        if (approvalAction === 'approve') {
            const response = await approvalAPI.approveAppeal(
                selectedAppeal.id.toString(),
                {
                    approvedAmount: parseFloat(approvedAmount),
                    remarks,
                }
            );
            
            // ✅ NEW: Show success message with communication info
            showSuccessNotification(
                `Appeal Approved! 
                 Donors will be notified via email and WhatsApp.`,
                selectedAppeal.title
            );
        }
        
        // Refresh the list
        await fetchPendingAppeals();
        setShowApprovalModal(false);
        // ... reset form
    } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to process request.');
    } finally {
        setSubmitting(false);
    }
};
```

---

### 2. **Add Communication Feedback in DonorCommunication.tsx**
Add ability to view auto-triggered communications:

```tsx
interface AutoTriggeredCommunication {
    id: string;
    appealId: string;
    appealTitle: string;
    triggerType: 'approval' | 'rejection' | 'status_update';
    channels: ('email' | 'whatsapp' | 'postal')[];
    recipientCount: number;
    sentDate: string;
    status: 'sent' | 'pending' | 'failed';
}

const [autoComms, setAutoComms] = useState<AutoTriggeredCommunication[]>([]);

useEffect(() => {
    loadAutoTriggeredCommunications();
}, []);

const loadAutoTriggeredCommunications = async () => {
    try {
        const response = await communicationAPI.getAutoTriggeredCommunications();
        setAutoComms(response.data);
    } catch (err) {
        console.error('Failed to load auto communications:', err);
    }
};
```

---

### 3. **Create New API Method in api.ts**

```typescript
export const communicationAPI = {
    // ... existing methods
    
    // NEW: Get auto-triggered communications
    getAutoTriggeredCommunications: () =>
        apiClient.get('/communications/auto-triggered'),
    
    // NEW: Get communication stats by trigger type
    getAutoTriggeredStats: () =>
        apiClient.get('/communications/auto-triggered/stats'),
};
```

---

### 4. **Update Approval Modal to Show Communication Intent**

```tsx
{showApprovalModal && approvalAction === 'approve' && (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
        <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
                <p className="font-medium text-blue-900">
                    Donor Notification
                </p>
                <p className="text-sm text-blue-700 mt-1">
                    All donors will be notified about this approval via:
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                    <li>✓ Email</li>
                    <li>✓ WhatsApp (if phone number available)</li>
                </ul>
            </div>
        </div>
    </div>
)}
```

---

## DATABASE SCHEMA CHANGES

### 1. **Create Donors Table**
```sql
CREATE TABLE donors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. **Create Donor-Appeal Junction Table**
```sql
CREATE TABLE donor_appeals (
    donor_id BIGINT NOT NULL,
    appeal_id BIGINT NOT NULL,
    PRIMARY KEY (donor_id, appeal_id),
    FOREIGN KEY (donor_id) REFERENCES donors(id),
    FOREIGN KEY (appeal_id) REFERENCES appeals(id)
);
```

### 3. **Create Communication History Table**
```sql
CREATE TABLE communication_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    appeal_id BIGINT NOT NULL,
    channel VARCHAR(50) NOT NULL, -- EMAIL, WHATSAPP, POSTAL
    recipient_count INT,
    content LONGTEXT,
    status VARCHAR(50) NOT NULL, -- SENT, PENDING, FAILED
    sent_date TIMESTAMP,
    error_message LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appeal_id) REFERENCES appeals(id)
);
```

### 4. **Alter Appeals Table**
```sql
ALTER TABLE appeals ADD COLUMN status VARCHAR(50) DEFAULT 'PENDING';
ALTER TABLE appeals ADD COLUMN approved_amount DECIMAL(15, 2);
ALTER TABLE appeals ADD COLUMN approval_date TIMESTAMP;
ALTER TABLE appeals ADD COLUMN approval_remarks LONGTEXT;
```

---

## IMPLEMENTATION FLOW DIAGRAM

```
Appeal Submitted
    ↓
Review & Approve (by Approver)
    ↓
ApprovalController.approveAppeal() ✅ Backend
    ↓
ApprovalService.approveAppeal()
    ↓
Update Appeal Status → APPROVED ✅
    ↓
CommunicationService.notifyDonorsOnApproval() ✅ AUTO-TRIGGERED
    ↓
Fetch Relevant Donors ✅
    ↓
Send Email (via EmailService) ✅
Send WhatsApp (via WhatsAppService) ✅
    ↓
Log Communication History ✅
    ↓
Return Success Response to Frontend ✅ Frontend
    ↓
DonorCommunication.tsx - Show Success Message
    ↓
Display Auto-Triggered Communication in History
```

---

## SUMMARY

**Backend:** 5-6 new/updated classes, 2-3 new database tables
**Frontend:** 2 component updates, 1 new API method, UI enhancements
**Timeline:** 2-3 days for backend + 1-2 days for frontend integration

