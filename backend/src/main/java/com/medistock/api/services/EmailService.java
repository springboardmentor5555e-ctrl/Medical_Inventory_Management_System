package com.medistock.api.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * EmailService — sends plain-text alert emails for low-stock and expiry events.
 *
 * Requires spring-boot-starter-mail in pom.xml and the following properties:
 *   spring.mail.host, spring.mail.port, spring.mail.username, spring.mail.password
 *
 * Email sending is best-effort: failures are logged and never propagate
 * exceptions that would break the notification generation flow.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:no-reply@medistock.local}")
    private String fromAddress;

    @Value("${medistock.email.alerts.enabled:false}")
    private boolean emailAlertsEnabled;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Sends an email notification for a low-stock alert.
     *
     * @param recipientEmail  the recipient's email address
     * @param medicineName    name of the medicine with low stock
     * @param batchNumber     batch number of the medicine
     * @param currentQuantity current stock quantity
     */
    public void sendLowStockAlert(String recipientEmail,
                                  String medicineName,
                                  String batchNumber,
                                  int currentQuantity) {
        if (!emailAlertsEnabled) {
            log.debug("Email alerts disabled — skipping low-stock email for '{}'", medicineName);
            return;
        }

        String subject = "[MediStock] Low Stock Alert: " + medicineName;
        String body = String.format(
                "Dear MediStock User,%n%n" +
                "This is an automated alert from MediStock.%n%n" +
                "Medicine   : %s%n" +
                "Batch No.  : %s%n" +
                "Current Qty: %d unit(s)%n%n" +
                "Please reorder as soon as possible to avoid stock-out.%n%n" +
                "Regards,%nMediStock Notification System",
                medicineName, batchNumber, currentQuantity
        );

        sendEmail(recipientEmail, subject, body);
    }

    /**
     * Sends an email notification for an expiry alert.
     *
     * @param recipientEmail the recipient's email address
     * @param medicineName   name of the medicine
     * @param batchNumber    batch number of the medicine
     * @param expiryDate     expiry date as string (yyyy-MM-dd)
     * @param daysLeft       number of days until expiry (negative = already expired)
     */
    public void sendExpiryAlert(String recipientEmail,
                                String medicineName,
                                String batchNumber,
                                String expiryDate,
                                long daysLeft) {
        if (!emailAlertsEnabled) {
            log.debug("Email alerts disabled — skipping expiry email for '{}'", medicineName);
            return;
        }

        boolean alreadyExpired = daysLeft < 0;
        String subject = alreadyExpired
                ? "[MediStock] Expired Medicine: " + medicineName
                : "[MediStock] Expiry Warning: " + medicineName + " expires in " + daysLeft + " day(s)";

        String body = alreadyExpired
                ? String.format(
                    "Dear MediStock User,%n%n" +
                    "URGENT: The following medicine has EXPIRED:%n%n" +
                    "Medicine   : %s%n" +
                    "Batch No.  : %s%n" +
                    "Expiry Date: %s%n%n" +
                    "Please remove this medicine from the inventory immediately.%n%n" +
                    "Regards,%nMediStock Notification System",
                    medicineName, batchNumber, expiryDate)
                : String.format(
                    "Dear MediStock User,%n%n" +
                    "This medicine is approaching its expiry date:%n%n" +
                    "Medicine   : %s%n" +
                    "Batch No.  : %s%n" +
                    "Expiry Date: %s%n" +
                    "Days Left  : %d day(s)%n%n" +
                    "Please take appropriate action before it expires.%n%n" +
                    "Regards,%nMediStock Notification System",
                    medicineName, batchNumber, expiryDate, daysLeft);

        sendEmail(recipientEmail, subject, body);
    }

    /**
     * Generic email sender. Catches and logs all mail exceptions to avoid
     * propagating email failures into the main business logic.
     */
    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email sent to '{}' with subject: '{}'", to, subject);
        } catch (MailException ex) {
            log.error("Failed to send email to '{}': {}", to, ex.getMessage());
        }
    }
}
