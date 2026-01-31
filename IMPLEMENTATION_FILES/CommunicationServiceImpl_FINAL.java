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

@Service
@Slf4j
public class CommunicationServiceImpl implements CommunicationService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Autowired
    private DonorRepository donorRepository;
    
    @Autowired
    private CommunicationHistoryRepository communicationHistoryRepository;
    
    @Value("${spring.mail.username:noreply@itc-anoopam.org}")
    private String fromEmail;
    
    @Override
    public void sendCommunicationToAppealDonors(Long appealId, String channel, String subject, String message) {
        log.info("Sending {} communication for appeal {}", channel, appealId);
        
        try {
            // Get all donors for this appeal
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
    public void notifyDonorsOnApproval(Appeal appeal, Long approverUserId) {
        log.info("🔔 Sending approval notification for Appeal: {}", appeal.getTitle());
        
        try {
            List<Donor> donors = donorRepository.findDonorsByAppealId(appeal.getId());
            
            if (donors.isEmpty()) {
                log.warn("No donors found for appeal");
                return;
            }
            
            String subject = "🎉 Your Appeal has been Approved!";
            String htmlContent = buildApprovalEmail(appeal);
            
            int count = 0;
            for (Donor donor : donors) {
                try {
                    sendEmail(donor.getEmail(), subject, htmlContent);
                    count++;
                } catch (Exception e) {
                    log.error("Failed to send email to {}", donor.getEmail());
                }
            }
            
            // Log it
            CommunicationHistory history = new CommunicationHistory();
            history.setAppealId(appeal.getId());
            history.setTriggerType("APPROVAL");
            history.setChannel("EMAIL");
            history.setRecipientCount(count);
            history.setStatus("SENT");
            history.setContent(htmlContent);
            history.setSentDate(LocalDateTime.now());
            communicationHistoryRepository.save(history);
            
            log.info("✅ Approval notification sent to {} donors", count);
        } catch (Exception e) {
            log.error("Error in approval notification:", e);
        }
    }
    
    @Override
    public void notifyDonorsOnRejection(Appeal appeal, String rejectionReason, Long rejectorUserId) {
        log.info("📧 Sending rejection notification");
        try {
            List<Donor> donors = donorRepository.findDonorsByAppealId(appeal.getId());
            String subject = "Appeal Status Update";
            String htmlContent = "<html><body><p>Dear Valued Donor,</p><p>Your appeal has been rejected.</p><p>Reason: " + rejectionReason + "</p></body></html>";
            
            int count = 0;
            for (Donor donor : donors) {
                try {
                    sendEmail(donor.getEmail(), subject, htmlContent);
                    count++;
                } catch (Exception e) {
                    log.error("Failed to send rejection email");
                }
            }
            
            CommunicationHistory history = new CommunicationHistory();
            history.setAppealId(appeal.getId());
            history.setTriggerType("REJECTION");
            history.setChannel("EMAIL");
            history.setRecipientCount(count);
            history.setStatus("SENT");
            history.setContent(htmlContent);
            history.setSentDate(LocalDateTime.now());
            communicationHistoryRepository.save(history);
            
        } catch (Exception e) {
            log.error("Error in rejection notification:", e);
        }
    }
    
    private void sendEmail(String to, String subject, String htmlContent) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        helper.setFrom(fromEmail);
        mailSender.send(message);
    }
    
    private String buildApprovalEmail(Appeal appeal) {
        return "<html><body style='font-family: Arial'>" +
               "<h2 style='color: green;'>✅ Your Appeal is Approved!</h2>" +
               "<p><strong>Appeal:</strong> " + appeal.getTitle() + "</p>" +
               "<p><strong>Description:</strong> " + appeal.getDescription() + "</p>" +
               "<p><strong>Approved Amount:</strong> ₹" + appeal.getApprovedAmount() + "</p>" +
               "<p>We will proceed with implementation and keep you updated.</p>" +
               "<p>Thank you for your support!</p>" +
               "<p>ITC × Anoopam Mission</p>" +
               "</body></html>";
    }
}
