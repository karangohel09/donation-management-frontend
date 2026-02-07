package com.itc.demo.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SendCommunicationRequest {

    private Long appealId;
    private String channel;           // EMAIL, WHATSAPP, SMS
    private String subject;           // For email
    private String message;           // Message content
    private String recipientType;     // "ALL_DONORS" or "SELECTED_DONORS"
    private List<Integer> donorIds;   // List of donor IDs (empty if ALL_DONORS)

    // Validation helper
    public boolean isValid() {
        return appealId != null &&
                channel != null && !channel.isEmpty() &&
                message != null && !message.isEmpty() &&
                recipientType != null && !recipientType.isEmpty();
    }

    public boolean isValidRecipientType() {
        return "ALL_DONORS".equals(recipientType) || "SELECTED_DONORS".equals(recipientType);
    }
}
