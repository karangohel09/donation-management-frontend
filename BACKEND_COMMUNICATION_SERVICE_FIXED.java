package com.itc.demo.service.impl;

import com.itc.demo.dto.request.SendCommunicationRequest;
import com.itc.demo.entity.Appeal;
import com.itc.demo.entity.CommunicationHistory;
import com.itc.demo.entity.Donor;
import com.itc.demo.enums.CommunicationStatus;
import com.itc.demo.enums.CommunicationTrigger;
import com.itc.demo.repository.AppealRepository;
import com.itc.demo.enums.CommunicationChannel;
import com.itc.demo.repository.CommunicationHistoryRepository;
import com.itc.demo.repository.DonorRepository;
import com.itc.demo.service.CommunicationService;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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
    private DonorRepository donorRepository;

    @Autowired
    private AppealRepository appealRepository;

    @Autowired
    private CommunicationHistoryRepository communicationHistoryRepository;

    @Value("${spring.mail.username:karangohel2093@gmail.com}")
    private String fromEmail;

    @Override
    public void sendCommunicationToAppealDonors(Long appealId, String channel, String subject, String message) {
        log.info("=== STEP 1: Finding donors for appeal {} ===", appealId);

        try {
            // Get all donors associated with this appeal
            List<Donor> donors = donorRepository.findDonorsByAppealId(appealId);
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

            // Normalize channel to uppercase
            String normalizedChannel = channel.toUpperCase();
            CommunicationChannel commChannel;
            
            try {
                commChannel = CommunicationChannel.valueOf(normalizedChannel);
            } catch (IllegalArgumentException e) {
                log.error("Invalid channel: {}", channel);
                return;
            }

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
                    logCommunication(donor, appeal, channel.toUpperCase(), message, CommunicationStatus.SENT, CommunicationTrigger.MANUAL);
                    log.info("STEP 3: Communication logged for donor {}", donor.getId());

                } catch (Exception e) {
                    log.error("Error sending communication to donor {}: {}", donor.getId(), e.getMessage(), e);
                    // Log failed attempt
                    logCommunication(donor, appeal, channel.toUpperCase(), message, CommunicationStatus.FAILED, CommunicationTrigger.MANUAL);
                }
            }

            log.info("=== STEP 4: All communications processed ===");

        } catch (Exception e) {
            log.error("Error in sendCommunicationToAppealDonors: ", e);
            throw new RuntimeException("Failed to send communications: " + e.getMessage());
        }
    }

    @Override
    public void sendCommunication(SendCommunicationRequest request) throws Exception {
        log.info("Processing communication request for appeal {} via {} to {} recipient type",
                request.getAppealId(), request.getChannel(), request.getRecipientType());

        // Validate request
        if (!request.isValid() || !request.isValidRecipientType()) {
            throw new IllegalArgumentException("Invalid communication request");
        }

        // Normalize channel to uppercase
        String normalizedChannel = request.getChannel().toUpperCase();
        
        // Validate channel
        try {
            CommunicationChannel.valueOf(normalizedChannel);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid channel: " + request.getChannel());
        }

        // Verify appeal exists
        Appeal appeal = appealRepository.findById(request.getAppealId())
                .orElseThrow(() -> new Exception("Appeal not found with ID: " + request.getAppealId()));

        // Route based on recipient type
        if ("ALL_DONORS".equals(request.getRecipientType())) {
            log.info("Routing to sendCommunicationToAppealDonors");
            sendCommunicationToAppealDonors(
                    request.getAppealId(),
                    normalizedChannel,
                    request.getSubject(),
                    request.getMessage()
            );
        } else if ("SELECTED_DONORS".equals(request.getRecipientType())) {
            log.info("Routing to sendCommunicationToSpecificDonors with {} donors",
                    request.getDonorIds().size());
            sendCommunicationToSpecificDonors(
                    request.getDonorIds(),
                    normalizedChannel,
                    request.getSubject(),
                    request.getMessage(),
                    request.getAppealId()
            );
        }

        log.info("Communication sent successfully");
    }

    @Override
    public void sendCommunicationToSpecificDonors(List<Integer> donorIds, String channel, String subject, String message, Long appealId) throws Exception {
        log.info("=== STEP 1: Finding {} specific donors ===", donorIds.size());

        try {
            // Validate that donors were provided
            if (donorIds == null || donorIds.isEmpty()) {
                throw new Exception("No donor IDs provided");
            }

            // Convert Integer list to Long list for query
            List<Long> longDonorIds = donorIds.stream()
                    .map(Integer::longValue)
                    .toList();

            // Get specific donors
            List<Donor> donors = donorRepository.findAllById(longDonorIds);

            if (donors.isEmpty()) {
                throw new Exception("No donors found with provided IDs");
            }

            log.info("STEP 1: Found {} donors", donors.size());

            // Log if some IDs were not found
            if (donors.size() < donorIds.size()) {
                log.warn("Only {} donors found out of {} requested IDs", donors.size(), donorIds.size());
            }

            log.info("=== STEP 2: Checking SMTP configuration ===");
            if (mailSender == null) {
                log.error("STEP 2: JavaMailSender is NULL - email will fail!");
                return;
            }
            log.info("STEP 2: JavaMailSender is configured");

            log.info("=== STEP 3: Sending {} communications via {} ===", donors.size(), channel);

            // Normalize channel to uppercase
            String normalizedChannel = channel.toUpperCase();
            CommunicationChannel commChannel;
            
            try {
                commChannel = CommunicationChannel.valueOf(normalizedChannel);
            } catch (IllegalArgumentException e) {
                log.error("Invalid channel: {}", channel);
                return;
            }

            // Get appeal details for logging/personalization
            Appeal appeal = null;
            if (appealId != null) {
                appeal = appealRepository.findById(appealId).orElse(null);
                if (appeal != null) {
                    log.info("STEP 2.5: Appeal details fetched for ID {}", appealId);
                } else {
                    log.warn("STEP 2.5: Appeal not found for ID {}, emails will be sent without appeal details", appealId);
                }
            } else {
                log.warn("STEP 2.5: No appealId provided, emails will be sent without appeal details");
            }

            int successCount = 0;
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

                    // Log to database (with or without appeal)
                    if (appeal != null) {
                        logCommunication(donor, appeal, normalizedChannel, message, CommunicationStatus.SENT, CommunicationTrigger.MANUAL);
                    }

                    successCount++;
                    log.info("STEP 3: Communication processed for donor {}", donor.getId());

                } catch (Exception e) {
                    log.error("Error sending communication to donor {}: {}", donor.getId(), e.getMessage(), e);
                    // Log failed attempt if appeal available
                    if (appeal != null) {
                        logCommunication(donor, appeal, normalizedChannel, message, CommunicationStatus.FAILED, CommunicationTrigger.MANUAL);
                    }
                }
            }

            log.info("=== STEP 4: Completed. Sent to {}/{} selected donors ===", successCount, donors.size());

        } catch (Exception e) {
            log.error("Error in sendCommunicationToSpecificDonors: ", e);
            throw new RuntimeException("Failed to send communications: " + e.getMessage());
        }
    }

    @Override
    public void notifyDonorsOnApproval(Appeal appeal, Long approverUserId) {
        log.info("Notifying donors of appeal approval: {}", appeal.getId());

        String message = "Great news! Your donation appeal '" + appeal.getTitle() + "' has been approved. "
                + "Your donations will be utilized as per the plan. Thank you for your contribution!";

        List<Donor> donors = donorRepository.findDonorsByAppealId(appeal.getId());

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
    public void notifyDonorsOnRejection(Appeal appeal, String rejectionReason) {
        log.info("Notifying donors of appeal rejection: {}", appeal.getId());

        String message = "We regret to inform you that the appeal '" + appeal.getTitle() + "' has been rejected. "
                + "Reason: " + rejectionReason + ". "
                + "Please feel free to reapply with a revised plan.";

        List<Donor> donors = donorRepository.findDonorsByAppealId(appeal.getId());

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

    @Override
    public List<Object> getAutoTriggeredCommunications() {
        log.info("Fetching all auto-triggered communications");
        return new ArrayList<>(communicationHistoryRepository.findAll());
    }

    @Override
    public List<Object> getAutoTriggeredCommunicationsByAppeal(Long appealId) {
        log.info("Fetching auto-triggered communications for appeal {}", appealId);
        return new ArrayList<>(communicationHistoryRepository.findByAppealId(appealId));
    }

    /**
     * Send email using SMTP - WITH NULL SAFETY FOR APPEAL
     */
    private void sendEmail(String to, String subject, String body, Appeal appeal) throws Exception {
        log.debug("Preparing email to: {}", to);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);

            // Add appeal context to email body (WITH NULL SAFETY)
            String htmlBody = "<html><body>"
                    + "<h2>" + subject + "</h2>"
                    + "<p>" + body + "</p>"
                    + "<hr/>";

            // Only add appeal details if appeal exists
            if (appeal != null) {
                htmlBody += "<p><strong>Appeal Details:</strong></p>"
                        + "<p>Title: " + (appeal.getTitle() != null ? appeal.getTitle() : "N/A") + "</p>"
                        + "<p>Description: " + (appeal.getDescription() != null ? appeal.getDescription() : "N/A") + "</p>"
                        + "<p>Target Amount: " + (appeal.getApprovedAmount() != null ? appeal.getApprovedAmount() : appeal.getEstimatedAmount() != null ? appeal.getEstimatedAmount() : "N/A") + "</p>";
            }

            htmlBody += "</body></html>";

            helper.setText(htmlBody, true);
            
            // Use configured email from application.properties
            helper.setFrom(fromEmail);

            mailSender.send(message);
            log.info("Email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Send WhatsApp message (placeholder - requires Twilio or similar)
     */
    private void sendWhatsApp(String phoneNumber, String message, Appeal appeal) {
        log.info("WhatsApp integration pending - would send to: {}", phoneNumber);
        // TODO: Integrate Twilio or WhatsApp Business API
        // For now, just log that it was attempted
    }

    /**
     * Send SMS (placeholder - requires Twilio or similar)
     */
    private void sendSMS(String phoneNumber, String message) {
        log.info("SMS integration pending - would send to: {}", phoneNumber);
        // TODO: Integrate Twilio for SMS
        // For now, just log that it was attempted
    }

    /**
     * Log communication to database
     */
    private void logCommunication(Donor donor,
                                  Appeal appeal,
                                  String channel,
                                  String message,
                                  CommunicationStatus status,
                                  CommunicationTrigger trigger) {
        try {
            CommunicationHistory history = new CommunicationHistory();

            history.setAppealId(appeal.getId());
            history.setTriggerType(trigger);
            history.setChannel(channel.toUpperCase());
            history.setRecipientCount(1); // one donor per record
            history.setContent(message);
            history.setStatus(status);
            history.setSentDate(LocalDateTime.now());
            history.setSentByUserId(appeal.getApproverId()); // or null if manual
            history.setErrorMessage(
                    status == CommunicationStatus.FAILED ? "Delivery failed" : null
            );

            communicationHistoryRepository.save(history);

            log.debug("Communication logged for donor {}", donor.getId());
        } catch (Exception e) {
            log.error("Error logging communication to database", e);
        }
    }
}
