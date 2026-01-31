# 🚀 Donor Communication - Quick Start Guide

## What's New? 

When you **approve or reject an appeal**, the system automatically:
1. ✅ Sends HTML email to all donors linked to the appeal
2. ✅ Queues WhatsApp messages
3. ✅ Logs communication in database
4. ✅ Shows in UI communication history

---

## How to Use

### Step 1: Approve an Appeal
```
Dashboard → Approval Workflow → Click "Approve Appeal"
├─ Enter: Approved Amount
├─ Enter: Remarks/Comments
└─ Click: APPROVE
```

### Step 2: View Communication History
```
Dashboard → Donor Communication → Auto-Triggered Tab
├─ See list of all approval/rejection notifications
├─ View recipient count
├─ Check status (SENT/PENDING/FAILED)
└─ Click appeal for details
```

---

## What Donors Receive

### Email ✉️
**Subject:** "Great News! Your Appeal [Title] is Approved"

**Content:**
- Approval confirmation
- Approved amount
- Next steps
- Professional branding

### WhatsApp 💬 (When Enabled)
**Message:** Approval notification with key details

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/approvals/{id}/approve` | POST | Approve & Notify |
| `/api/approvals/{id}/reject` | POST | Reject & Notify |
| `/api/approvals/communications/auto-triggered` | GET | View History |

---

## Database Setup

### Required Tables (Already Created)
✅ appeals - with approval fields
✅ communication_history - tracks all communications
✅ donors - donor contact info
✅ donor_appeals - links donors to appeals

### Sample Query to Verify Setup
```sql
-- Check if appeal was approved and notification sent
SELECT 
  a.id, a.title, a.status, 
  ch.trigger_type, ch.channel, ch.recipient_count, ch.status as comm_status
FROM appeals a
LEFT JOIN communication_history ch ON a.id = ch.appeal_id
WHERE a.status = 'APPROVED'
ORDER BY a.approval_date DESC;
```

---

## Email Configuration

### Gmail Setup (Required)

```yaml
# application.yml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: your-email@gmail.com
    password: xxxx-xxxx-xxxx-xxxx  # 16-char app password
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
```

### Get Gmail App Password
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Generate App Password (Mail + Windows)
4. Use 16-character password in config

---

## Testing

### Test Flow
```
1. Create donor and link to appeal
2. Approve appeal
3. Check email (sent to donor)
4. View "Auto-Triggered" tab (should see communication)
5. Check database (communication_history table)
```

### Test Database Setup
```sql
-- Add test donor
INSERT INTO donors (name, email, phone_number, is_active, created_at, updated_at)
VALUES ('Test Donor', 'test@example.com', '9999999999', true, NOW(), NOW());

-- Link to appeal
INSERT INTO donor_appeals (donor_id, appeal_id, donation_amount, donation_date, created_at)
VALUES (1, 1, 10000, NOW(), NOW());

-- Then approve the appeal
-- Check if email was sent and communication_history updated
SELECT * FROM communication_history WHERE appeal_id = 1;
```

---

## Common Questions

**Q: Why didn't the donor get the email?**
A: 
- Check if donor is linked to appeal in donor_appeals table
- Verify email address in donors table
- Check Gmail SMTP configuration
- Check backend logs for errors
- Look in spam folder

**Q: Can I send custom messages?**
A: Yes! Use "Compose Message" tab to send custom communications

**Q: How do I enable WhatsApp?**
A: Integrate Twilio API in backend (framework ready)

**Q: What information is logged?**
A: Appeal ID, trigger type, channel, recipient count, status, timestamp

---

## Troubleshooting

### Emails Not Sending
```bash
# 1. Check Gmail credentials
echo "Spring Mail Debug: Check logs"

# 2. Verify SMTP connection
# Check: host: smtp.gmail.com, port: 587

# 3. Enable debug logging
logging:
  level:
    org.springframework.mail: DEBUG
```

### Communication Not Showing
```bash
# 1. Verify approval happened
SELECT * FROM appeals WHERE id = 5;

# 2. Check communication_history
SELECT * FROM communication_history WHERE appeal_id = 5;

# 3. Refresh frontend page
# Check browser console for API errors
```

### Can't see Auto-Triggered Tab
- Ensure user has "authenticated" role
- Approve an appeal first
- Refresh the page
- Check browser console

---

## File Locations

### Backend
```
src/main/java/com/itc/demo/
├── service/impl/CommunicationServiceImpl.java
├── service/impl/AppealServiceImpl.java
├── controller/ApprovalController.java
└── entity/CommunicationHistory.java
```

### Frontend
```
src/components/
├── DonorCommunication.tsx
└── ApprovalWorkflow.tsx

src/services/
└── api.ts
```

### Documentation
```
DONOR_COMMUNICATION_SETUP.md
DONOR_COMMUNICATION_CODE_REFERENCE.md
DONOR_COMMUNICATION_ARCHITECTURE.md
DONOR_COMMUNICATION_COMPLETE_IMPLEMENTATION.md
```

---

## Checklist Before Production

- [ ] Gmail SMTP configured with app password
- [ ] Test email sent successfully
- [ ] Donors linked to appeals
- [ ] Communication history visible in UI
- [ ] Database indexes created
- [ ] Error logging enabled
- [ ] Monitoring set up
- [ ] Backup configured

---

## Key Features

✨ **Automatic** - No manual action needed
✨ **Fast** - Emails sent immediately
✨ **Professional** - HTML templates with branding
✨ **Tracked** - All communications logged
✨ **Transparent** - Visible in UI
✨ **Scalable** - Handles multiple donors
✨ **Secure** - JWT authenticated

---

## Support

📧 **Questions?** Check documentation files
🐛 **Issues?** Check backend logs
📊 **Stats?** Check communication_history table

---

## Quick Links

📖 [Full Setup Guide](DONOR_COMMUNICATION_SETUP.md)
📖 [Code Reference](DONOR_COMMUNICATION_CODE_REFERENCE.md)
📖 [Architecture Diagram](DONOR_COMMUNICATION_ARCHITECTURE.md)
📖 [Complete Implementation](DONOR_COMMUNICATION_COMPLETE_IMPLEMENTATION.md)

---

**Status:** ✅ Ready to Use
**Version:** 1.0
**Last Updated:** 2026-01-30
