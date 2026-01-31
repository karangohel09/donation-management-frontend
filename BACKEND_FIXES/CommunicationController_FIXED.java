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
import java.util.List;

@RestController
@RequestMapping("/api/communications")
@CrossOrigin
@Slf4j
public class CommunicationController {
    
    @Autowired
    private CommunicationService communicationService;
    
    /**
     * Send communication to all donors of an appeal
     */
    @PostMapping("/send")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> sendCommunication(@RequestBody SendCommunicationRequest request) {
        try {
            log.info("Received communication request for appeal {} via {}", request.getAppealId(), request.getChannel());
            
            communicationService.sendCommunicationToAppealDonors(
                    request.getAppealId(),
                    request.getChannel(),
                    request.getSubject(),
                    request.getMessage()
            );
            
            return ResponseEntity.ok(new ApiResponse(true, "Communication sent successfully", null));
        } catch (Exception e) {
            log.error("Error sending communication: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to send communication: " + e.getMessage(), null));
        }
    }
    
    /**
     * Get all auto-triggered communications
     */
    @GetMapping("/auto-triggered")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAutoTriggeredCommunications() {
        try {
            List<Object> communications = communicationService.getAutoTriggeredCommunications();
            return ResponseEntity.ok(communications);
        } catch (Exception e) {
            log.error("Error fetching auto-triggered communications: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to fetch communications", null));
        }
    }
    
    /**
     * Get auto-triggered communications for specific appeal
     */
    @GetMapping("/auto-triggered/appeal/{appealId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAppealCommunications(@PathVariable Long appealId) {
        try {
            List<Object> communications = communicationService.getAutoTriggeredCommunicationsByAppeal(appealId);
            return ResponseEntity.ok(communications);
        } catch (Exception e) {
            log.error("Error fetching appeal communications: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to fetch communications", null));
        }
    }
}
