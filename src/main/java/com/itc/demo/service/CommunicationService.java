package com.itc.demo.service;

import com.itc.demo.dto.request.SendCommunicationRequest;
import com.itc.demo.entity.Appeal;
import java.util.List;

public interface CommunicationService {

    /**
     * Send communication to specific or all donors (NEW - handles DTO)
     */
    void sendCommunication(SendCommunicationRequest request) throws Exception;

    /**
     * Send communication to specific donors only (NEW)
     * ✅ FIX: Now accepts appealId parameter so Appeal can be fetched
     */
    void sendCommunicationToSpecificDonors(List<Integer> donorIds, String channel, String subject, String message, Long appealId) throws Exception;

    /**
     * Send approval notification to all donors of an appeal
     */
    void notifyDonorsOnApproval(Appeal appeal);

    /**
     * Send rejection notification to all donors of an appeal
     */
    void notifyDonorsOnRejection(Appeal appeal, String rejectionReason, Long rejectorUserId);

    /**
     * Send manual communication to appeal donors
     */
    void sendCommunicationToAppealDonors(Long appealId, String channel, String subject, String message);

}
