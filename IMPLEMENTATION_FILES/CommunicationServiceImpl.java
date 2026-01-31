package com.itc.demo.service.impl;

import com.itc.demo.dto.response.AutoTriggeredCommunicationDTO;
import com.itc.demo.entity.Appeal;
import com.itc.demo.entity.CommunicationHistory;
import com.itc.demo.entity.Donor;
import com.itc.demo.entity.User;
import com.itc.demo.repository.CommunicationHistoryRepository;
import com.itc.demo.repository.DonorRepository;
import com.itc.demo.repository.UserRepository;
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
    private JavaMailSender mailSender;
    
    @Autowired
    private DonorRepository donorRepository;
    
    @Autowired
    private CommunicationHistoryRepository communicationHistoryRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Value("${spring.mail.username:noreply@itc-anoopam.org}")
    private String fromEmail;
    
    @Override
    public void notifyDonorsOnApproval(Appeal appeal, Long approverUserId) {
        log.info("Starting approval notification for Appeal ID: {}", appeal.getId());
        
        try {
            // 1. Get all donors who donated to this appeal
            List<Donor> donors = donorRepository.findDonorsByAppealId(appeal.getId());
            log.info("Found {} donors for appeal {}", donors.size(), appeal.getId());
            
            if (donors.isEmpty()) {
                log.warn("No donors found for appeal {}", appeal.getId());
                return;
            }
            
            // 2. Get approver details
            User approver = userRepository.findById(approverUserId).orElse(null);
            String approverName = approver != null ? approver.getFullName() : "Admin";
            
            // 3. Build email content
            String subject = "🎉 Your Appeal has been Approved!";
            String htmlContent = buildApprovalEmailHtml(appeal, approverName);
            
            // 4. Send email to each donor
            int successCount = 0;
            int failureCount = 0;
            
            for (Donor donor : donors) {
                try {
                    sendEmail(donor.getEmail(), subject, htmlContent);
                    log.info("Email sent successfully to: {}", donor.getEmail());
                    successCount++;
                } catch (Exception e) {
                    log.error("Failed to send email to {}: {}", donor.getEmail(), e.getMessage());
                    failureCount++;
                }
            }
            
            // 5. Log communication in history
            CommunicationHistory history = new CommunicationHistory();
            history.setAppealId(appeal.getId());
            history.setTriggerType("APPROVAL");
            history.setChannel("EMAIL");
            history.setRecipientCount(successCount);
            history.setStatus(failureCount == 0 ? "SENT" : "PARTIAL");
            history.setContent(htmlContent);
            history.setSentByUserId(approverUserId);
            history.setSentDate(LocalDateTime.now());
            history.setErrorMessage(failureCount > 0 ? "Failed for " + failureCount + " donors" : null);
            
            communicationHistoryRepository.save(history);
            log.info("Approval notification completed. Sent: {}, Failed: {}", successCount, failureCount);
            
        } catch (Exception e) {
            log.error("Error in notifyDonorsOnApproval: ", e);
        }
    }
    
    @Override
    public void notifyDonorsOnRejection(Appeal appeal, String rejectionReason, Long rejectorUserId) {
        log.info("Starting rejection notification for Appeal ID: {}", appeal.getId());
        
        try {
            List<Donor> donors = donorRepository.findDonorsByAppealId(appeal.getId());
            
            if (donors.isEmpty()) {
                log.warn("No donors found for appeal {}", appeal.getId());
                return;
            }
            
            String subject = "Appeal Status Update";
            String htmlContent = buildRejectionEmailHtml(appeal, rejectionReason);
            
            int successCount = 0;
            for (Donor donor : donors) {
                try {
                    sendEmail(donor.getEmail(), subject, htmlContent);
                    successCount++;
                } catch (Exception e) {
                    log.error("Failed to send rejection email to {}: {}", donor.getEmail(), e.getMessage());
                }
            }
            
            CommunicationHistory history = new CommunicationHistory();
            history.setAppealId(appeal.getId());
            history.setTriggerType("REJECTION");
            history.setChannel("EMAIL");
            history.setRecipientCount(successCount);
            history.setStatus(successCount > 0 ? "SENT" : "FAILED");
            history.setContent(htmlContent);
            history.setSentByUserId(rejectorUserId);
            history.setSentDate(LocalDateTime.now());
            
            communicationHistoryRepository.save(history);
            
        } catch (Exception e) {
            log.error("Error in notifyDonorsOnRejection: ", e);
        }
    }
    
    @Override
    public void sendCommunicationToAppealDonors(Long appealId, String channel, String subject, String message) {
        log.info("Sending {} communication for appeal {}", channel, appealId);
        
        try {
            List<Donor> donors = donorRepository.findDonorsByAppealId(appealId);
            
            if (donors.isEmpty()) {
                log.warn("No donors found for appeal {}", appealId);
                return;
            }
            
            int successCount = 0;
            for (Donor donor : donors) {
                try {
                    if ("EMAIL".equalsIgnoreCase(channel)) {
                        sendEmail(donor.getEmail(), subject, message);
                    } else if ("WHATSAPP".equalsIgnoreCase(channel)) {
                        // TODO: Implement WhatsApp API integration
                        log.info("WhatsApp message queued for: {}", donor.getPhoneNumber());
                    }
                    successCount++;
                } catch (Exception e) {
                    log.error("Failed to send {} to {}: {}", channel, donor.getEmail(), e.getMessage());
                }
            }
            
            CommunicationHistory history = new CommunicationHistory();
            history.setAppealId(appealId);
            history.setTriggerType("MANUAL");
            history.setChannel(channel);
            history.setRecipientCount(successCount);
            history.setStatus("SENT");
            history.setContent(message);
            history.setSentDate(LocalDateTime.now());
            
            communicationHistoryRepository.save(history);
            log.info("Manual communication sent to {} donors", successCount);
            
        } catch (Exception e) {
            log.error("Error in sendCommunicationToAppealDonors: ", e);
        }
    }
    
    @Override
    public List<AutoTriggeredCommunicationDTO> getAutoTriggeredCommunications() {
        List<CommunicationHistory> histories = communicationHistoryRepository.findAll();
        return histories.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<AutoTriggeredCommunicationDTO> getAutoTriggeredCommunicationsByAppeal(Long appealId) {
        List<CommunicationHistory> histories = communicationHistoryRepository.findByAppealId(appealId);
        return histories.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    // ==================== PRIVATE HELPER METHODS ====================
    
    private void sendEmail(String to, String subject, String htmlContent) throws Exception {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
        
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true); // true means HTML
        helper.setFrom(fromEmail);
        
        mailSender.send(mimeMessage);
    }
    
    private String buildApprovalEmailHtml(Appeal appeal, String approverName) {
        return """
            <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
                        .container { max-width: 600px; margin: 20px auto; background: white; padding: 20px; border-radius: 8px; }
                        .header { color: #27ae60; text-align: center; padding-bottom: 20px; border-bottom: 2px solid #27ae60; }
                        .content { padding: 20px 0; }
                        .details { background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin: 15px 0; }
                        .details-row { margin: 10px 0; }
                        .label { font-weight: bold; color: #2c3e50; }
                        .value { color: #34495e; margin-left: 10px; }
                        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #bdc3c7; color: #7f8c8d; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>🎉 Great News!</h2>
                            <p>Your Appeal has been Approved</p>
                        </div>
                        
                        <div class="content">
                            <p>Dear Valued Donor,</p>
                            <p>We are delighted to inform you that your appeal has been officially approved and we will now proceed with implementation.</p>
                            
                            <div class="details">
                                <div class="details-row">
                                    <span class="label">Appeal:</span>
                                    <span class="value">""" + appeal.getTitle() + """</span>
                                </div>
                                <div class="details-row">
                                    <span class="label">Description:</span>
                                    <span class="value">""" + appeal.getDescription() + """</span>
                                </div>
                                <div class="details-row">
                                    <span class="label">Approved Amount:</span>
                                    <span class="value">₹""" + String.format("%,d", appeal.getApprovedAmount()) + """</span>
                                </div>
                                <div class="details-row">
                                    <span class="label">Approved by:</span>
                                    <span class="value">""" + approverName + """</span>
                                </div>
                            </div>
                            
                            <p>We will keep you updated with regular progress reports and impact updates on this appeal.</p>
                            <p>Thank you for your generous support and trust in our mission!</p>
                            
                            <p>Warm regards,<br/>
                            <strong>ITC × Anoopam Mission Team</strong></p>
                        </div>
                        
                        <div class="footer">
                            <p>This is an automated email. Please do not reply directly.</p>
                            <p>For queries, contact us at: info@itc-anoopam.org</p>
                        </div>
                    </div>
                </body>
            </html>
            """;
    }
    
    private String buildRejectionEmailHtml(Appeal appeal, String rejectionReason) {
        return """
            <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
                        .container { max-width: 600px; margin: 20px auto; background: white; padding: 20px; border-radius: 8px; }
                        .header { color: #e74c3c; text-align: center; padding-bottom: 20px; border-bottom: 2px solid #e74c3c; }
                        .content { padding: 20px 0; }
                        .details { background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin: 15px 0; }
                        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #bdc3c7; color: #7f8c8d; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>Appeal Status Update</h2>
                        </div>
                        
                        <div class="content">
                            <p>Dear Valued Donor,</p>
                            <p>Thank you for your interest in supporting our mission. Unfortunately, your appeal has not been approved at this time.</p>
                            
                            <div class="details">
                                <p><strong>Appeal:</strong> """ + appeal.getTitle() + """</p>
                                <p><strong>Reason:</strong> """ + rejectionReason + """</p>
                            </div>
                            
                            <p>Please feel free to revise and resubmit your appeal with any additional information or modifications.</p>
                            <p>We appreciate your understanding and look forward to working with you.</p>
                            
                            <p>Best regards,<br/>
                            <strong>ITC × Anoopam Mission Team</strong></p>
                        </div>
                        
                        <div class="footer">
                            <p>This is an automated email. Please do not reply directly.</p>
                            <p>For queries, contact us at: info@itc-anoopam.org</p>
                        </div>
                    </div>
                </body>
            </html>
            """;
    }
    
    private AutoTriggeredCommunicationDTO convertToDTO(CommunicationHistory history) {
        AutoTriggeredCommunicationDTO dto = new AutoTriggeredCommunicationDTO();
        dto.setId(String.valueOf(history.getId()));
        dto.setAppealId(String.valueOf(history.getAppealId()));
        dto.setTriggerType(history.getTriggerType());
        dto.setChannel(history.getChannel());
        dto.setRecipientCount(history.getRecipientCount());
        dto.setSentDate(history.getSentDate().toString());
        dto.setStatus(history.getStatus());
        return dto;
    }
}
