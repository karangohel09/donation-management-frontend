# ✅ Email & WhatsApp - Quick Setup Guide

## What Was Fixed

✅ **Removed all dummy data** from frontend
✅ **Loads ONLY approved appeals** from backend
✅ **Shows real communication history**  
✅ **Uses real donor data** from database
✅ **Stats show actual numbers**

---

## Step 1: Configure Gmail SMTP

Add this to your backend `application.yml`:

```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: your-email@gmail.com
    password: xxxx-xxxx-xxxx-xxxx
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
            required: true
    default-encoding: UTF-8
```

### Get Gmail App Password:
1. Go to: myaccount.google.com/apppasswords
2. Select "Mail" and "Windows"
3. Copy 16-character password
4. Paste in application.yml

**NOTE:** Regular Gmail password won't work! Must use App Password.

---

## Step 2: Ensure Donors Are Linked to Appeals

Run this SQL to check:

```sql
-- Check donors linked to your approved appeals
SELECT 
  a.id, 
  a.title, 
  a.status, 
  COUNT(d.id) as donor_count
FROM appeals a
LEFT JOIN donor_appeals da ON a.id = da.appeal_id
LEFT JOIN donors d ON da.donor_id = d.id AND d.is_active = true
WHERE a.status = 'APPROVED'
GROUP BY a.id, a.title, a.status;
```

**Expected:** Each approved appeal should have at least 1+ donors

If no donors:
```sql
-- Add test donor
INSERT INTO donors (name, email, phone_number, is_active, created_at, updated_at)
VALUES ('Test Donor', 'test@example.com', '9999999999', true, NOW(), NOW());

-- Link donor to approved appeal
INSERT INTO donor_appeals (donor_id, appeal_id, donation_amount, donation_date, created_at)
VALUES (
  (SELECT id FROM donors WHERE email = 'test@example.com'),
  (SELECT id FROM appeals WHERE status = 'APPROVED' LIMIT 1),
  10000,
  NOW(),
  NOW()
);
```

---

## Step 3: Test Email Sending

### Option A: Approve an Appeal
1. Go to **Approval Workflow**
2. Click **Approve** on any pending appeal
3. Enter Amount and Remarks
4. Click **APPROVE**

→ System will automatically send email to all linked donors

### Option B: Send Custom Message
1. Go to **Donor Communication**
2. Select an **APPROVED** appeal (only approved appear here)
3. Choose **Email** channel
4. Type your message
5. Click **Send Communication**

---

## Step 4: View Communication History

### In Frontend:
1. Go to **Donor Communication** tab
2. Click **Communication History** or **Auto-Triggered** tab
3. **See all emails sent:**
   - Appeal name
   - Recipients count
   - Delivery status
   - Date & time

---

## Step 5: Enable WhatsApp (Optional)

### Current Status:
- ✅ WhatsApp messages are **queued** in database
- ❌ Messages are **NOT actually sent** yet

### To Enable Real WhatsApp:

Add to `application.yml`:

```yaml
twilio:
  account-sid: YOUR_ACCOUNT_SID
  auth-token: YOUR_AUTH_TOKEN
  phone-number: +1234567890
```

Then update backend `CommunicationServiceImpl.sendWhatsAppNotifications()`:

```java
private void sendWhatsAppNotifications(Appeal appeal, List<Donor> donors, String message) {
    for (Donor donor : donors) {
        if (donor.getPhoneNumber() != null) {
            try {
                // Using Twilio SDK
                Message twilioMessage = Message.creator(
                    new PhoneNumber("whatsapp:+" + donor.getPhoneNumber()),
                    new PhoneNumber("whatsapp:+1234567890"),
                    message
                ).create();
                
                log.info("WhatsApp sent to: {}", donor.getPhoneNumber());
            } catch (Exception e) {
                log.error("Failed to send WhatsApp: {}", e.getMessage());
            }
        }
    }
}
```

---

## What Happens Now

### When You Approve an Appeal:

```
1. Appeal status → APPROVED
2. Backend fetches all donors for that appeal
3. Builds professional HTML email
4. Sends email via Gmail SMTP
5. Logs communication in database
6. Shows in "Communication History" tab
```

### When You Send Custom Message:

```
1. Select an approved appeal
2. Choose channel (Email)
3. Type message
4. Click SEND
5. System sends to all donors for that appeal
6. Shows in "Communication History" immediately
7. Shows stats (# emails sent)
```

---

## Troubleshooting

### Emails Not Sending?

**1. Check Gmail Config:**
```bash
# Verify in application.yml
spring.mail.host: smtp.gmail.com
spring.mail.port: 587
spring.mail.username: your-email@gmail.com
spring.mail.password: xxxx-xxxx-xxxx-xxxx  # 16 chars, NOT regular password
```

**2. Check Backend Logs:**
```
Look for: "Notifying X donors about approval"
Look for: "Email sent to:"
Look for: "Error sending email:"
```

**3. Test Connection:**
```sql
-- Check if communication_history was created
SELECT * FROM communication_history 
ORDER BY sent_date DESC LIMIT 1;
```

**4. Check Spam Folder**
- Gmail may put first emails in spam
- Mark as "Not Spam" so future emails go to inbox

### Approved Appeals Not Showing?

```sql
-- Verify appeals have APPROVED status
SELECT id, title, status FROM appeals WHERE status = 'APPROVED';
```

If none found:
1. Go to Approval Workflow
2. Click Approve on pending appeal
3. Refresh Donor Communication page

### No Donors Showing?

```sql
-- Check donor links
SELECT da.* FROM donor_appeals da 
WHERE da.appeal_id = 1;

-- If empty, add donor
INSERT INTO donor_appeals...
```

---

## Key Files Modified

**Frontend:**
- `src/components/DonorCommunication.tsx` - Loads real appeals & shows real history

**Backend:**
- `application.yml` - Gmail SMTP config
- `CommunicationServiceImpl.java` - Sends emails
- `AppealServiceImpl.java` - Triggers emails on approval

---

## Statistics

After sending emails, stats auto-update:
- **Email Sent** - Count of emails sent
- **WhatsApp Sent** - Count of WhatsApp messages (queued)
- **Failed** - Failed delivery attempts
- **Total Recipients** - Sum of all recipients

All from **real data** in database, not dummy numbers!

---

## Next Steps

1. ✅ Configure Gmail SMTP
2. ✅ Add test donors
3. ✅ Approve an appeal
4. ✅ Check email arrives
5. ✅ View in Communication History
6. ⏳ (Optional) Enable WhatsApp with Twilio

---

**That's it! Your email system is now working with real data!** 🎉

No more dummy data, no more mock data - everything is now **live from your database**.
