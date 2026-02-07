package com.itc.demo.controller;

import com.itc.demo.dto.request.SendCommunicationRequest;
import com.itc.demo.dto.response.ApiResponse;
import com.itc.demo.service.CommunicationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/communications")
@CrossOrigin
@Slf4j
public class CommunicationController {

    @Autowired
    private CommunicationService communicationService;

    /**
     * Send communication to all donors of an appeal or selected donors
     */
    @PostMapping("/send")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> sendCommunication(@RequestBody SendCommunicationRequest request) {
        try {
            log.info("Received communication request for appeal {} via {} to {} recipient type",
                    request.getAppealId(), request.getChannel(), request.getRecipientType());

            // Validate request
            if (!request.isValid()) {
                log.warn("Invalid request: missing required fields");
                return ResponseEntity.badRequest()
                        .body(new ApiResponse(false, "Invalid request: missing required fields (appealId, channel, message, recipientType)", null));
            }

            // Validate recipient type
            if (!request.isValidRecipientType()) {
                log.warn("Invalid recipient type: {}", request.getRecipientType());
                return ResponseEntity.badRequest()
                        .body(new ApiResponse(false, "Invalid recipient type. Must be 'ALL_DONORS' or 'SELECTED_DONORS'", null));
            }

            // Validate donorIds for SELECTED_DONORS
            if ("SELECTED_DONORS".equals(request.getRecipientType())) {
                if (request.getDonorIds() == null || request.getDonorIds().isEmpty()) {
                    log.warn("SELECTED_DONORS chosen but no donor IDs provided");
                    return ResponseEntity.badRequest()
                            .body(new ApiResponse(false, "Please select at least one donor", null));
                }
                log.info("SELECTED_DONORS with {} donors", request.getDonorIds().size());
            }

            // Validate email subject if channel is EMAIL
            if ("EMAIL".equalsIgnoreCase(request.getChannel())) {
                if (request.getSubject() == null || request.getSubject().trim().isEmpty()) {
                    log.warn("EMAIL channel chosen but no subject provided");
                    return ResponseEntity.badRequest()
                            .body(new ApiResponse(false, "Email subject is required for EMAIL channel", null));
                }
            }

            // Call service to send communication
            communicationService.sendCommunication(request);

            log.info("Communication sent successfully");
            return ResponseEntity.ok(new ApiResponse(true, "Communication sent successfully", null));

        } catch (IllegalArgumentException e) {
            log.error("Validation error: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Validation error: " + e.getMessage(), null));
        } catch (Exception e) {
            log.error("Error sending communication: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to send communication: " + e.getMessage(), null));
        }
    }
}
