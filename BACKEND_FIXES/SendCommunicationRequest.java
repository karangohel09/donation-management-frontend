package com.itc.demo.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SendCommunicationRequest {
    private Long appealId;
    private String channel; // EMAIL, WHATSAPP, SMS, etc.
    private String subject; // For email
    private String message;
    private String recipientType; // DONORS, etc.
}
