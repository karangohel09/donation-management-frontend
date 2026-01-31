package com.itc.demo.service;

import com.itc.demo.entity.Appeal;
import java.util.List;

public interface CommunicationService {
    
    /**
     * Send approval notification to all donors of an appeal
     */
    void notifyDonorsOnApproval(Appeal appeal, Long approverUserId);
    
    /**
     * Send rejection notification to all donors of an appeal
     */
    void notifyDonorsOnRejection(Appeal appeal, String rejectionReason, Long rejectorUserId);
    
    /**
     * Send manual communication to appeal donors
     */
    void sendCommunicationToAppealDonors(Long appealId, String channel, String subject, String message);
    
    /**
     * Get all auto-triggered communications
     */
    List<Object> getAutoTriggeredCommunications();
    
    /**
     * Get auto-triggered communications for specific appeal
     */
    List<Object> getAutoTriggeredCommunicationsByAppeal(Long appealId);
}
