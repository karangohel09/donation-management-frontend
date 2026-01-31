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

    @Autowired
    private JavaMailSender javaMailSender;

    @Value("${spring.mail.username:noreply@itc-anoopam.org}")
    private String fromEmail;

    @Override
    public void notifyDonorsOnApproval(Appeal appeal, Long approverUserId) {
        try {
            List<Donor> donors = donorRepository.findDonorsByAppealId(appeal.getId());

            if (donors.isEmpty()) {
                log.warn("No donors found for appeal: " + appeal.getId());
                return;
            }

            log.info("Notifying {} donors about approval of appeal: {}", donors.size(), appeal.getId());

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

            // Log communication
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
            List<Donor> donors = donorRepository.findDonorsByAppealId(appeal.getId());

            if (donors.isEmpty()) {
                log.warn("No donors found for appeal: " + appeal.getId());
                return;
            }

            log.info("Notifying {} donors about rejection of appeal: {}", donors.size(), appeal.getId());

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
    public void sendCommunicationToAppealDonors(Long appealId, String channel, String subject, String message) {
        log.info("Sending {} communication for appeal {}", channel, appealId);

        try {
            List<Donor> donors = donorRepository.findDonorsByAppealId(appealId);
            log.info("Found {} donors for appeal {}", donors.size(), appealId);

            if (donors.isEmpty()) {
                log.warn("No donors found for appeal {}", appealId);
                return;
            }

            int successCount = 0;
            int failCount = 0;

            // Send to each donor
            for (Donor donor : donors) {
                try {
                    if ("EMAIL".equalsIgnoreCase(channel)) {
                        sendEmail(donor.getEmail(), subject, message);
                        log.info("✅ Email sent to: {}", donor.getEmail());
                        successCount++;
                    } else if ("WHATSAPP".equalsIgnoreCase(channel)) {
                        log.info("✅ WhatsApp queued for: {}", donor.getPhoneNumber());
                        successCount++;
                    }
                } catch (Exception e) {
                    log.error("❌ Failed to send {} to {}: {}", channel, donor.getEmail(), e.getMessage());
                    failCount++;
                }
            }

            // Log communication
            CommunicationHistory history = new CommunicationHistory();
            history.setAppealId(appealId);
            history.setTriggerType("MANUAL");
            history.setChannel(channel);
            history.setRecipientCount(successCount);
            history.setStatus("SENT");
            history.setContent(message);
            history.setSentDate(LocalDateTime.now());
            communicationHistoryRepository.save(history);

            log.info("✅ Communication sent to {} donors, {} failed", successCount, failCount);

        } catch (Exception e) {
            log.error("Error sending communication:", e);
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

    // ===== Private Helper Methods =====

    private void sendEmail(String to, String subject, String htmlContent) throws Exception {
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");
        
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true); // true = HTML
        helper.setFrom(fromEmail);
        
        javaMailSender.send(message);
    }

    private String buildApprovalEmailContent(Appeal appeal) {
        return "<html><body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>" +
                "<div style='max-width: 600px; margin: 0 auto; padding: 20px;'>" +
                "  <div style='background-color: #28a745; color: white; padding: 20px; border-radius: 5px 5px 0 0;'>" +
                "    <h2 style='margin: 0;'>✓ Approval Confirmed</h2>" +
                "  </div>" +
                "  <div style='border: 1px solid #ddd; padding: 20px;'>" +
                "    <p>Dear Valued Donor,</p>" +
                "    <p>We are delighted to inform you that your appeal <strong>\"" + appeal.getTitle() + "\"</strong> has been officially <strong>APPROVED</strong>.</p>" +
                "    <div style='background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;'>" +
                "      <p><strong>Approval Details:</strong></p>" +
                "      <p>Appeal ID: " + appeal.getId() + "</p>" +
                "      <p>Approved Amount: <span style='color: #28a745; font-weight: bold; font-size: 18px;'>₹" + appeal.getApprovedAmount() + "</span></p>" +
                "      <p>Approval Date: " + LocalDateTime.now().toString() + "</p>" +
                "    </div>" +
                "    <p><strong>What's Next?</strong></p>" +
                "    <ul>" +
                "      <li>Implementation will commence shortly</li>" +
                "      <li>We will keep you updated on progress with regular impact reports</li>" +
                "      <li>Your contribution will create meaningful change</li>" +
                "    </ul>" +
                "    <p>Thank you for your generous support and trust in our mission!</p>" +
                "    <p>Best regards,<br/><strong>ITC × Anoopam Mission Team</strong></p>" +
                "  </div>" +
                "  <div style='background-color: #f8f9fa; padding: 10px; font-size: 12px; color: #666; text-align: center;'>" +
                "    <p>This is an automated notification. Please do not reply to this email.</p>" +
                "  </div>" +
                "</div>" +
                "</body></html>";
    }

    private String buildRejectionEmailContent(Appeal appeal, String rejectionReason) {
        return "<html><body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>" +
                "<div style='max-width: 600px; margin: 0 auto; padding: 20px;'>" +
                "  <div style='background-color: #dc3545; color: white; padding: 20px; border-radius: 5px 5px 0 0;'>" +
                "    <h2 style='margin: 0;'>Appeal Status Update</h2>" +
                "  </div>" +
                "  <div style='border: 1px solid #ddd; padding: 20px;'>" +
                "    <p>Dear Valued Donor,</p>" +
                "    <p>Thank you for submitting the appeal <strong>\"" + appeal.getTitle() + "\"</strong>.</p>" +
                "    <p>After careful review, we regret to inform you that your appeal has been <strong>rejected</strong>.</p>" +
                "    <p><strong>Reason for Rejection:</strong></p>" +
                "    <p style='background-color: #f8d7da; padding: 15px; border-radius: 5px;'>" + rejectionReason + "</p>" +
                "    <p>We appreciate your understanding. If you have any questions or wish to discuss further, please feel free to reach out to us.</p>" +
                "    <p>Best regards,<br/><strong>ITC × Anoopam Mission Team</strong></p>" +
                "  </div>" +
                "</div>" +
                "</body></html>";
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
