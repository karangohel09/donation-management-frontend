package com.itc.demo.service.impl;

import com.itc.demo.entity.Appeal;
import com.itc.demo.entity.CommunicationHistory;
import com.itc.demo.entity.Donor;
import com.itc.demo.repository.CommunicationHistoryRepository;
import com.itc.demo.repository.DonorRepository;
import com.itc.demo.service.CommunicationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import javax.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class CommunicationServiceImpl implements CommunicationService {

    @Autowired
    private DonorRepository donorRepository;

    @Autowired
    private CommunicationHistoryRepository communicationHistoryRepository;

    @Autowired(required = false)
    private JavaMailSender javaMailSender;

    @Value("${spring.mail.username:noreply@itc-anoopam.org}")
    private String fromEmail;

    @Override
    public void sendCommunicationToAppealDonors(Long appealId, String channel, String subject, String message) {
        log.info("=== SEND COMMUNICATION START ===");
        log.info("Appeal ID: {}", appealId);
        log.info("Channel: {}", channel);
        log.info("Subject: {}", subject);
        
        try {
            // Step 1: Find donors
            log.info("STEP 1: Finding donors for appeal {}...", appealId);
            List<Donor> donors = donorRepository.findDonorsByAppealId(appealId);
            log.info("STEP 1 RESULT: Found {} donors", donors.size());
            
            if (donors.isEmpty()) {
                log.error("❌ NO DONORS FOUND for appeal {}!", appealId);
                log.info("This means either:");
                log.info("  1. No donations recorded for this appeal");
                log.info("  2. donor_appeals table is empty for this appeal");
                log.info("  3. Query method not working properly");
                return;
            }
            
            // List all donors
            log.info("Donors found:");
            donors.forEach(d -> log.info("  - {} (email: {})", d.getName(), d.getEmail()));
            
            // Step 2: Check SMTP config
            log.info("STEP 2: Checking email configuration...");
            if (javaMailSender == null) {
                log.error("❌ SMTP NOT CONFIGURED! JavaMailSender is null");
                log.info("Fix: Add to application.yml:");
                log.info("  spring:");
                log.info("    mail:");
                log.info("      host: smtp.gmail.com");
                log.info("      port: 587");
                log.info("      username: your-email@gmail.com");
                log.info("      password: your-app-password");
                return;
            }
            log.info("STEP 2 RESULT: SMTP configured ✓");
            
            // Step 3: Send emails
            log.info("STEP 3: Sending {} messages via {}...", donors.size(), channel);
            int successCount = 0;
            int failCount = 0;

            for (Donor donor : donors) {
                try {
                    log.info("  Sending to: {}", donor.getEmail());
                    
                    if (donor.getEmail() == null || donor.getEmail().isEmpty()) {
                        log.warn("  ⚠️ SKIPPED: Donor has no email!");
                        failCount++;
                        continue;
                    }
                    
                    if ("EMAIL".equalsIgnoreCase(channel)) {
                        sendEmail(donor.getEmail(), subject, message);
                        log.info("  ✅ Email sent successfully");
                        successCount++;
                    } else if ("WHATSAPP".equalsIgnoreCase(channel)) {
                        log.info("  ✅ WhatsApp queued for: {}", donor.getPhoneNumber());
                        successCount++;
                    }
                } catch (Exception e) {
                    log.error("  ❌ FAILED: {}", e.getMessage());
                    log.error("  Full error: ", e);
                    failCount++;
                }
            }

            log.info("STEP 3 RESULT: {} sent, {} failed", successCount, failCount);

            // Step 4: Log to database
            log.info("STEP 4: Logging to database...");
            CommunicationHistory history = new CommunicationHistory();
            history.setAppealId(appealId);
            history.setTriggerType("MANUAL");
            history.setChannel(channel);
            history.setRecipientCount(successCount);
            history.setStatus("SENT");
            history.setContent(message);
            history.setSentDate(LocalDateTime.now());
            communicationHistoryRepository.save(history);
            log.info("STEP 4 RESULT: Logged ✓");

            log.info("=== SEND COMMUNICATION SUCCESS ===");

        } catch (Exception e) {
            log.error("=== SEND COMMUNICATION ERROR ===", e);
            log.error("Exception type: {}", e.getClass().getName());
            log.error("Message: {}", e.getMessage());
        }
    }

    @Override
    public void notifyDonorsOnApproval(Appeal appeal, Long approverUserId) {
        try {
            log.info("🔔 Approval notification for appeal: {}", appeal.getTitle());
            List<Donor> donors = donorRepository.findDonorsByAppealId(appeal.getId());

            if (donors.isEmpty()) {
                log.warn("No donors found for appeal");
                return;
            }

            String subject = "🎉 Your Appeal has been Approved!";
            String htmlContent = buildApprovalEmailContent(appeal);

            int sentCount = 0;
            for (Donor donor : donors) {
                try {
                    if (donor.getEmail() != null && !donor.getEmail().isEmpty()) {
                        sendEmail(donor.getEmail(), subject, htmlContent);
                        sentCount++;
                        log.info("✅ Email sent to: {}", donor.getEmail());
                    }
                } catch (Exception e) {
                    log.error("Failed to send email to {}: {}", donor.getEmail(), e.getMessage());
                }
            }

            CommunicationHistory history = new CommunicationHistory();
            history.setAppealId(appeal.getId());
            history.setTriggerType("APPROVAL");
            history.setChannel("EMAIL");
            history.setRecipientCount(sentCount);
            history.setStatus("SENT");
            history.setContent(htmlContent);
            history.setSentByUserId(approverUserId);
            history.setSentDate(LocalDateTime.now());
            communicationHistoryRepository.save(history);

            log.info("✅ Approval notification sent to {} donors", sentCount);

        } catch (Exception e) {
            log.error("Error notifying donors on approval: " + e.getMessage(), e);
        }
    }

    @Override
    public void notifyDonorsOnRejection(Appeal appeal, String rejectionReason, Long rejectorUserId) {
        try {
            log.info("📧 Rejection notification for appeal: {}", appeal.getTitle());
            List<Donor> donors = donorRepository.findDonorsByAppealId(appeal.getId());

            if (donors.isEmpty()) {
                log.warn("No donors found for appeal");
                return;
            }

            String subject = "Appeal Status Update";
            String htmlContent = buildRejectionEmailContent(appeal, rejectionReason);

            int sentCount = 0;
            for (Donor donor : donors) {
                try {
                    if (donor.getEmail() != null && !donor.getEmail().isEmpty()) {
                        sendEmail(donor.getEmail(), subject, htmlContent);
                        sentCount++;
                    }
                } catch (Exception e) {
                    log.error("Failed to send email to {}: {}", donor.getEmail(), e.getMessage());
                }
            }

            CommunicationHistory history = new CommunicationHistory();
            history.setAppealId(appeal.getId());
            history.setTriggerType("REJECTION");
            history.setChannel("EMAIL");
            history.setRecipientCount(sentCount);
            history.setStatus("SENT");
            history.setContent(htmlContent);
            history.setSentByUserId(rejectorUserId);
            history.setSentDate(LocalDateTime.now());
            communicationHistoryRepository.save(history);

            log.info("✅ Rejection notification sent to {} donors", sentCount);

        } catch (Exception e) {
            log.error("Error notifying donors on rejection: " + e.getMessage(), e);
        }
    }

    @Override
    public List<Object> getAutoTriggeredCommunications() {
        return communicationHistoryRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<Object> getAutoTriggeredCommunicationsByAppeal(Long appealId) {
        return communicationHistoryRepository.findByAppealId(appealId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private void sendEmail(String to, String subject, String htmlContent) throws Exception {
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");
        
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        helper.setFrom(fromEmail);
        
        javaMailSender.send(message);
    }

    private String buildApprovalEmailContent(Appeal appeal) {
        return "<html><body style='font-family: Arial, sans-serif;'>" +
                "<div style='max-width: 600px; margin: 0 auto; padding: 20px;'>" +
                "<h2 style='color: green;'>✓ Approval Confirmed</h2>" +
                "<p>Dear Valued Donor,</p>" +
                "<p>Your appeal <strong>\"" + appeal.getTitle() + "\"</strong> has been <strong>APPROVED</strong>.</p>" +
                "<p>Approved Amount: <strong style='color: green;'>₹" + appeal.getApprovedAmount() + "</strong></p>" +
                "<p>Thank you for your support!</p>" +
                "<p>ITC × Anoopam Mission Team</p>" +
                "</div></body></html>";
    }

    private String buildRejectionEmailContent(Appeal appeal, String rejectionReason) {
        return "<html><body style='font-family: Arial, sans-serif;'>" +
                "<div style='max-width: 600px; margin: 0 auto; padding: 20px;'>" +
                "<h2 style='color: red;'>Appeal Status Update</h2>" +
                "<p>Dear Valued Donor,</p>" +
                "<p>Your appeal <strong>\"" + appeal.getTitle() + "\"</strong> has been reviewed.</p>" +
                "<p><strong>Reason:</strong> " + rejectionReason + "</p>" +
                "<p>We appreciate your understanding.</p>" +
                "<p>ITC × Anoopam Mission Team</p>" +
                "</div></body></html>";
    }

    private Object convertToDTO(CommunicationHistory history) {
        return new Object() {
            public Long getId() { return history.getId(); }
            public Long getAppealId() { return history.getAppealId(); }
            public String getTriggerType() { return history.getTriggerType(); }
            public String getChannel() { return history.getChannel(); }
            public Integer getRecipientCount() { return history.getRecipientCount(); }
            public String getStatus() { return history.getStatus(); }
            public LocalDateTime getSentDate() { return history.getSentDate(); }
        };
    }
}
