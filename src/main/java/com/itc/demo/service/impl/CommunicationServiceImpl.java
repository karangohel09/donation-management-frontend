package com.itc.demo.service.impl;

import com.itc.demo.entity.Appeal;
import com.itc.demo.entity.CommunicationHistory;
import com.itc.demo.entity.Donor;
import com.itc.demo.enum_package.CommunicationChannel;
import com.itc.demo.enum_package.CommunicationStatus;
import com.itc.demo.enum_package.CommunicationTrigger;
import com.itc.demo.repository.AppealRepository;
import com.itc.demo.repository.CommunicationHistoryRepository;
import com.itc.demo.repository.DonorAppealRepository;
import com.itc.demo.service.CommunicationService;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
@Transactional
public class CommunicationServiceImpl implements CommunicationService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Autowired
    private DonorAppealRepository donorAppealRepository;
    
    @Autowired
    private AppealRepository appealRepository;
    
    @Autowired
    private CommunicationHistoryRepository communicationHistoryRepository;
    
    @Override
    public void sendCommunicationToAppealDonors(Long appealId, String channel, String subject, String message) {
        log.info("=== STEP 1: Finding donors for appeal {} ===", appealId);
        
        try {
            // Get all donors associated with this appeal
            List<Donor> donors = donorAppealRepository.findDonorsByAppealId(appealId);
            log.info("STEP 1: Found {} donors for appeal {}", donors.size(), appealId);
            
            if (donors.isEmpty()) {
                log.warn("No donors found for appeal {}", appealId);
                return;
            }
            
            // Get appeal details
            Appeal appeal = appealRepository.findById(appealId).orElse(null);
            if (appeal == null) {
                log.error("Appeal {} not found", appealId);
                return;
            }
            
            log.info("=== STEP 2: Checking SMTP configuration ===");
            if (mailSender == null) {
                log.error("STEP 2: JavaMailSender is NULL - email will fail!");
                return;
            }
            log.info("STEP 2: JavaMailSender is configured");
            
            log.info("=== STEP 3: Sending {} communications via {} ===", donors.size(), channel);
            
            CommunicationChannel commChannel = CommunicationChannel.valueOf(channel.toUpperCase());
            
            for (Donor donor : donors) {
                try {
                    if (commChannel == CommunicationChannel.EMAIL) {
                        sendEmail(donor.getEmail(), subject, message, appeal);
                        log.info("STEP 3: Email sent to {}", donor.getEmail());
                    } else if (commChannel == CommunicationChannel.WHATSAPP) {
                        sendWhatsApp(donor.getPhoneNumber(), message, appeal);
                        log.info("STEP 3: WhatsApp message sent to {}", donor.getPhoneNumber());
                    } else if (commChannel == CommunicationChannel.SMS) {
                        sendSMS(donor.getPhoneNumber(), message);
                        log.info("STEP 3: SMS sent to {}", donor.getPhoneNumber());
                    }
                    
                    // Log to database
                    logCommunication(donor, appeal, channel, message, CommunicationStatus.SENT, CommunicationTrigger.MANUAL);
                    log.info("STEP 3: Communication logged for donor {}", donor.getId());
                    
                } catch (Exception e) {
                    log.error("Error sending communication to donor {}: {}", donor.getId(), e.getMessage(), e);
                    // Log failed attempt
                    logCommunication(donor, appeal, channel, message, CommunicationStatus.FAILED, CommunicationTrigger.MANUAL);
                }
            }
            
            log.info("=== STEP 4: All communications processed ===");
            
        } catch (Exception e) {
            log.error("Error in sendCommunicationToAppealDonors: ", e);
            throw new RuntimeException("Failed to send communications: " + e.getMessage());
        }
    }
    
    @Override
    public void notifyDonorsOnApproval(Appeal appeal) {
        log.info("Notifying donors of appeal approval: {}", appeal.getId());
        
        String message = "Great news! Your donation appeal '" + appeal.getTitle() + "' has been approved. "
                + "Your donations will be utilized as per the plan. Thank you for your contribution!";
        
        List<Donor> donors = donorAppealRepository.findDonorsByAppealId(appeal.getId());
        
        for (Donor donor : donors) {
            try {
                // Send email
                sendEmail(donor.getEmail(), 
                    "Appeal Approved: " + appeal.getTitle(), 
                    message, 
                    appeal);
                
                logCommunication(donor, appeal, "EMAIL", message, CommunicationStatus.SENT, CommunicationTrigger.APPROVAL);
                log.info("Approval notification sent to {}", donor.getEmail());
            } catch (Exception e) {
                log.error("Error notifying donor {} of approval: {}", donor.getId(), e.getMessage());
                logCommunication(donor, appeal, "EMAIL", message, CommunicationStatus.FAILED, CommunicationTrigger.APPROVAL);
            }
        }
    }
    
    @Override
    public void notifyDonorsOnRejection(Appeal appeal, String rejectionReason, Long rejectorUserId) {
        log.info("Notifying donors of appeal rejection: {}", appeal.getId());
        
        String message = "We regret to inform you that the appeal '" + appeal.getTitle() + "' has been rejected. "
                + "Reason: " + rejectionReason + ". "
                + "Please feel free to reapply with a revised plan.";
        
        List<Donor> donors = donorAppealRepository.findDonorsByAppealId(appeal.getId());
        
        for (Donor donor : donors) {
            try {
                // Send email
                sendEmail(donor.getEmail(), 
                    "Appeal Rejected: " + appeal.getTitle(), 
                    message, 
                    appeal);
                
                logCommunication(donor, appeal, "EMAIL", message, CommunicationStatus.SENT, CommunicationTrigger.REJECTION);
                log.info("Rejection notification sent to {}", donor.getEmail());
            } catch (Exception e) {
                log.error("Error notifying donor {} of rejection: {}", donor.getId(), e.getMessage());
                logCommunication(donor, appeal, "EMAIL", message, CommunicationStatus.FAILED, CommunicationTrigger.REJECTION);
            }
        }
    }
    
    private void sendEmail(String recipientEmail, String subject, String messageBody, Appeal appeal) throws Exception {
        log.debug("Sending email to: {}", recipientEmail);
        
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
        
        helper.setTo(recipientEmail);
        helper.setSubject(subject);
        helper.setText(messageBody, true);
        
        mailSender.send(mimeMessage);
        log.info("Email sent successfully to: {}", recipientEmail);
    }
    
    private void sendWhatsApp(String phoneNumber, String message, Appeal appeal) {
        log.info("WhatsApp feature under development for: {}", phoneNumber);
        // TODO: Integrate with Twilio for WhatsApp
    }
    
    private void sendSMS(String phoneNumber, String message) {
        log.info("SMS feature under development for: {}", phoneNumber);
        // TODO: Integrate with Twilio for SMS
    }
    
    private void logCommunication(Donor donor, Appeal appeal, String channel, String message, 
                                  CommunicationStatus status, CommunicationTrigger trigger) {
        try {
            CommunicationHistory history = new CommunicationHistory();
            history.setDonorId(donor.getId());
            history.setAppealId(appeal.getId());
            history.setChannel(channel);
            history.setMessage(message);
            history.setStatus(status.toString());
            history.setTrigger(trigger.toString());
            history.setCreatedAt(LocalDateTime.now());
            
            communicationHistoryRepository.save(history);
            log.info("Communication logged for donor {} with status {}", donor.getId(), status);
        } catch (Exception e) {
            log.error("Error logging communication: ", e);
        }
    }
}
