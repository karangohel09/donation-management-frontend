# Donor Communication - Quick Code Reference

## Backend Changes Summary

### 1. Key Service Methods (Already Implemented)

**Location:** `com.itc.demo.service.impl.CommunicationServiceImpl`

#### Method: notifyDonorsOnApproval()
```java
@Override
public void notifyDonorsOnApproval(Appeal appeal, Long approverUserId) {
    try {
        // 1. Get all donors linked to this appeal
        List<Donor> relevantDonors = donorRepository.findByAppealId(appeal.getId());
        
        if (relevantDonors.isEmpty()) {
            log.warn("No donors found for appeal: " + appeal.getId());
            return;
        }

        // 2. Build email content
        String emailSubject = "Great News! Your Appeal \"" + appeal.getTitle() + "\" is Approved";
        String emailContent = buildApprovalEmailContent(appeal);
        String whatsappMessage = buildApprovalWhatsAppMessage(appeal);

        // 3. Send notifications via multiple channels
        sendEmailNotifications(appeal, relevantDonors, emailSubject, emailContent,
                CommunicationTrigger.APPROVAL, approverUserId);

        sendWhatsAppNotifications(appeal, relevantDonors, whatsappMessage,
                CommunicationTrigger.APPROVAL, approverUserId);

        log.info("Successfully notified donors for appeal approval: {}", appeal.getId());

    } catch (Exception e) {
        log.error("Error notifying donors on approval: " + e.getMessage(), e);
    }
}
```

#### Method: notifyDonorsOnRejection()
```java
@Override
public void notifyDonorsOnRejection(Appeal appeal, String rejectionReason) {
    try {
        List<Donor> relevantDonors = donorRepository.findByAppealId(appeal.getId());

        if (relevantDonors.isEmpty()) {
            log.warn("No donors found for appeal: " + appeal.getId());
            return;
        }

        // Build and send rejection notification
        String emailSubject = "Update on Your Appeal: \"" + appeal.getTitle() + "\"";
        String emailContent = buildRejectionEmailContent(appeal, rejectionReason);

        sendEmailNotifications(appeal, relevantDonors, emailSubject, emailContent,
                CommunicationTrigger.REJECTION, null);

        log.info("Successfully notified donors for appeal rejection: {}", appeal.getId());

    } catch (Exception e) {
        log.error("Error notifying donors on rejection: " + e.getMessage(), e);
    }
}
```

### 2. Integration in AppealServiceImpl

**Location:** `com.itc.demo.service.impl.AppealServiceImpl`

#### In approveAppeal() method:
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

    // 👇 THIS TRIGGERS DONOR NOTIFICATIONS
    try {
        communicationService.notifyDonorsOnApproval(saved, approverUserId);
    } catch (Exception e) {
        log.error("Error sending notifications: " + e.getMessage());
        // Don't throw - approval should succeed even if notification fails
    }

    return appealMapper.toDTO(saved);
}
```

#### In rejectAppeal() method:
```java
@Override
public AppealResponseDTO rejectAppeal(Long id, String reason, Long approverUserId) {
    Appeal appeal = appealRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Appeal not found"));

    appeal.setStatus(AppealStatus.REJECTED);
    appeal.setApprovalRemarks(reason);
    appeal.setApprovalDate(LocalDateTime.now());
    appeal.setApproverId(approverUserId);

    Appeal saved = appealRepository.save(appeal);

    // 👇 THIS TRIGGERS DONOR NOTIFICATIONS
    try {
        communicationService.notifyDonorsOnRejection(saved, reason);
    } catch (Exception e) {
        log.error("Error sending notifications: " + e.getMessage());
    }

    return appealMapper.toDTO(saved);
}
```

### 3. API Endpoints

**Location:** `com.itc.demo.controller.ApprovalController`

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/approvals/{id}/approve` | POST | Approve appeal & send notifications | SUPER_ADMIN, MISSION_ADMIN, FINANCE_ADMIN |
| `/api/approvals/{id}/reject` | POST | Reject appeal & send notifications | SUPER_ADMIN, MISSION_ADMIN, FINANCE_ADMIN |
| `/api/approvals/communications/auto-triggered` | GET | Get all auto-triggered communications | Authenticated users |
| `/api/approvals/communications/auto-triggered/appeal/{appealId}` | GET | Get communications for specific appeal | Authenticated users |

### 4. Request/Response Bodies

#### Approve Appeal Request:
```json
{
  "approvedAmount": 50000,
  "remarks": "Approved for implementation. Funds will be transferred within 7 days."
}
```

#### Reject Appeal Request:
```json
{
  "reason": "Insufficient documentation provided"
}
```

#### Auto-Triggered Communication Response:
```json
{
  "id": 1,
  "appealId": 5,
  "triggerType": "approval",
  "channel": "EMAIL",
  "recipientCount": 45,
  "status": "sent",
  "sentDate": "2024-12-27T10:30:00"
}
```

---

## Frontend Changes Summary

### 1. DonorCommunication Component Updates

**Location:** `src/components/DonorCommunication.tsx`

#### State Updates:
```typescript
// New state variables added
const [appeals, setAppeals] = useState<Appeal[]>([]);
const [successMessage, setSuccessMessage] = useState('');

interface Appeal {
  id: number;
  title: string;
  description: string;
  estimatedAmount: number;
  approvedAmount?: number;
  status: string;
  createdAt: string;
}
```

#### Load Appeals on Mount:
```typescript
useEffect(() => {
  loadAppeals();
}, []);

const loadAppeals = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/appeals', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      const data = await response.json();
      setAppeals(data);
    }
  } catch (err) {
    console.error('Error loading appeals:', err);
  }
};
```

#### Send Communication Handler:
```typescript
const handleSendCommunication = async () => {
  if (!selectedAppeal) {
    setError('Please select an appeal');
    return;
  }
  
  if (!message.trim()) {
    setError('Please compose a message');
    return;
  }
  
  if (selectedChannel === 'email' && !subject.trim()) {
    setError('Please enter an email subject');
    return;
  }

  setLoading(true);
  setError('');
  try {
    const response = await communicationAPI.sendCommunication({
      appealId: selectedAppeal,
      channel: selectedChannel.toUpperCase(),
      subject: subject,
      message: message,
      recipientType: 'DONORS'
    });
    
    setSuccessMessage('Communication sent successfully!');
    // Reset form
    setSelectedAppeal('');
    setSubject('');
    setMessage('');
    setSelectedTemplate('');
    
    setTimeout(() => setSuccessMessage(''), 3000);
    loadAutoTriggeredCommunications();
  } catch (err: any) {
    console.error('Failed to send communication:', err);
    setError(err.response?.data?.message || 'Failed to send communication');
  } finally {
    setLoading(false);
  }
};
```

#### Dynamic Appeal Selection:
```typescript
<select value={selectedAppeal} onChange={(e) => setSelectedAppeal(e.target.value)}>
  <option value="">Choose an appeal</option>
  {appeals.map((appeal) => (
    <option key={appeal.id} value={appeal.id}>
      {appeal.title} (Status: {appeal.status})
    </option>
  ))}
</select>

{selectedAppeal && (
  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
    {(() => {
      const appeal = appeals.find(a => a.id.toString() === selectedAppeal);
      return appeal ? (
        <>
          <p className="font-semibold text-blue-900">{appeal.title}</p>
          <p className="text-sm text-blue-700 mt-1">{appeal.description}</p>
          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
            <div>
              <span className="text-blue-600">Estimated:</span>
              <span className="ml-2 font-semibold">₹{appeal.estimatedAmount?.toLocaleString()}</span>
            </div>
            {appeal.approvedAmount && (
              <div>
                <span className="text-blue-600">Approved:</span>
                <span className="ml-2 font-semibold">₹{appeal.approvedAmount.toLocaleString()}</span>
              </div>
            )}
          </div>
        </>
      ) : null;
    })()}
  </div>
)}
```

### 2. Communication API Methods

**Location:** `src/services/api.ts`

```typescript
export const communicationAPI = {
  getCommunications: (params: { page?: number; limit?: number }) =>
    apiClient.get('/communications', { params }),

  sendCommunication: (data: any) =>
    apiClient.post('/communications/send', data),

  getTemplates: () =>
    apiClient.get('/communications/templates'),

  getStats: () =>
    apiClient.get('/communications/stats'),

  getAutoTriggeredCommunications: (params?: { triggerType?: string; page?: number; limit?: number }) =>
    apiClient.get('/communications/auto-triggered', { params }),

  getAutoTriggeredStats: () =>
    apiClient.get('/communications/auto-triggered/stats'),
};
```

### 3. Display Communication History

```typescript
{filteredLogs.length === 0 ? (
  <div className="text-center py-12">
    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
    <p className="text-gray-500">No auto-triggered communications yet</p>
  </div>
) : (
  <div className="space-y-4">
    {filteredLogs.map((comm) => (
      <div key={comm.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold">{comm.appealTitle}</h4>
            <p className="text-sm text-gray-600">
              Sent to {comm.recipientCount} recipient{comm.recipientCount !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(comm.sentDate).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge className={getTriggerColor(comm.triggerType)}>
              {comm.triggerType.replace('_', ' ').toUpperCase()}
            </Badge>
            <Badge className={getStatusColor(comm.status)}>
              {comm.status.toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>
    ))}
  </div>
)}
```

---

## Database Tables to Verify

### 1. Appeal Status Updates
```sql
SELECT id, title, status, approved_amount, approver_id, approval_date, approval_remarks
FROM appeals 
WHERE status = 'APPROVED' 
ORDER BY approval_date DESC;
```

### 2. Communication History
```sql
SELECT id, appeal_id, trigger_type, channel, recipient_count, status, sent_date
FROM communication_history
ORDER BY sent_date DESC
LIMIT 10;
```

### 3. Donors Linked to Appeal
```sql
SELECT DISTINCT d.id, d.name, d.email, d.phone_number
FROM donor_appeals da
JOIN donors d ON da.donor_id = d.id
WHERE da.appeal_id = ?
AND d.is_active = true;
```

---

## Email Configuration Checklist

- [ ] Update `application.yml` with Gmail SMTP settings
- [ ] Generate Gmail App Password (2FA required)
- [ ] Test email connectivity
- [ ] Verify sender email address
- [ ] Test email templates rendering
- [ ] Check spam filters
- [ ] Verify HTML email formatting

---

## Testing Checklist

- [ ] Create test donors and link to appeal
- [ ] Approve appeal and verify email sent
- [ ] Check communication history appears in UI
- [ ] Verify email content accuracy
- [ ] Check auto-triggered communications tab
- [ ] Test rejection flow
- [ ] Verify status updates in real-time
- [ ] Test with multiple donors

---

## Deployment Checklist

- [ ] Database migrations applied
- [ ] Email configuration in production
- [ ] CORS settings updated if needed
- [ ] JWT secrets configured
- [ ] Logging enabled for troubleshooting
- [ ] Error handling verified
- [ ] Performance tested with load
- [ ] Monitoring and alerts configured

---

**Version:** 1.0  
**Last Updated:** 2026-01-30  
**Status:** Ready for Implementation
