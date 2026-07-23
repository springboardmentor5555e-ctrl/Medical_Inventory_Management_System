package com.medistock.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class TwilioService {

    @Value("${app.twilio.account-sid}")
    private String accountSid;

    @Value("${app.twilio.auth-token}")
    private String authToken;

    @Value("${app.twilio.whatsapp-number}")
    private String whatsappNumber;

    @Value("${app.twilio.recipient-number}")
    private String recipientNumber;

    private boolean isInitialized = false;

    @PostConstruct
    public void init() {
        try {
            if (accountSid != null && !accountSid.trim().isEmpty() && !"placeholder".equalsIgnoreCase(accountSid)
                    && authToken != null && !authToken.trim().isEmpty() && !"placeholder".equalsIgnoreCase(authToken)) {
                Twilio.init(accountSid, authToken);
                isInitialized = true;
                log.info("Twilio successfully initialized.");
            } else {
                log.warn("Twilio credentials are placeholder or empty. SMS/WhatsApp delivery is disabled.");
            }
        } catch (Exception e) {
            log.error("Failed to initialize Twilio: {}", e.getMessage());
        }
    }

    public void sendWhatsAppMessage(String messageBody) {
        if (!isInitialized) {
            log.warn("Twilio is not initialized. Simulated WhatsApp Alert: {}", messageBody);
            return;
        }

        try {
            Message message = Message.creator(
                    new PhoneNumber(recipientNumber),
                    new PhoneNumber(whatsappNumber),
                    messageBody
            ).create();
            log.info("WhatsApp notification sent. SID: {}", message.getSid());
        } catch (Exception e) {
            log.error("Failed to send WhatsApp message via Twilio: {}", e.getMessage());
        }
    }
}
