package com.medistock.service;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.mail.BodyPart;
import jakarta.mail.Multipart;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import java.io.InputStream;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Properties;
import org.junit.jupiter.api.Test;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

class EmailServiceTest {

    @Test
    void sendsBrandedHtmlEmailWithRequiredFieldsForEveryEventName() throws Exception {
        CapturingMailSender mailSender = new CapturingMailSender();
        EmailService emailService = configuredEmailService(mailSender, true, "admin@example.com");

        for (String eventName : eventNames()) {
            assertThat(emailService.sendAdminEventEmail(eventName, emailDetails(eventName))).isTrue();
            assertThat(mailSender.sentMessage.getSubject()).isEqualTo("[MediStock] " + eventName);

            String html = htmlBody(mailSender.sentMessage);
            assertThat(html).contains("MediStock");
            assertThat(html).contains(eventName);
            assertThat(html).contains("Medicine Name");
            assertThat(html).contains("Supplier Name");
            assertThat(html).contains("Batch Number");
            assertThat(html).contains("Quantity");
            assertThat(html).contains("Expiry Date");
            assertThat(html).contains("Action Performed");
            assertThat(html).contains("User");
            assertThat(html).contains("Date");
            assertThat(html).contains("Time");
        }
    }

    @Test
    void disabledEmailDoesNotCallJavaMailSender() {
        CapturingMailSender mailSender = new CapturingMailSender();
        EmailService emailService = configuredEmailService(mailSender, false, "admin@example.com");

        assertThat(emailService.sendAdminEventEmail("Medicine Added", emailDetails("Medicine Added"))).isFalse();
        assertThat(mailSender.sentMessage).isNull();
    }

    @Test
    void missingAdminEmailDoesNotCallJavaMailSender() {
        CapturingMailSender mailSender = new CapturingMailSender();
        EmailService emailService = configuredEmailService(mailSender, true, "");

        assertThat(emailService.sendAdminEventEmail("Medicine Added", emailDetails("Medicine Added"))).isFalse();
        assertThat(mailSender.sentMessage).isNull();
    }

    private EmailService configuredEmailService(CapturingMailSender mailSender, boolean enabled, String adminEmail) {
        EmailService emailService = new EmailService(mailSender);
        ReflectionTestUtils.setField(emailService, "enabled", enabled);
        ReflectionTestUtils.setField(emailService, "fromAddress", "no-reply@medistock.local");
        ReflectionTestUtils.setField(emailService, "adminAddress", adminEmail);
        return emailService;
    }

    private String[] eventNames() {
        return new String[] {
                "Medicine Added",
                "Medicine Updated",
                "Medicine Deleted",
                "Supplier Added",
                "Supplier Updated",
                "Supplier Deleted",
                "Low Stock Alert",
                "Out of Stock Alert",
                "Medicine Expiring within 30 Days",
                "Medicine Expired"
        };
    }

    private Map<String, String> emailDetails(String eventName) {
        Map<String, String> details = new LinkedHashMap<>();
        details.put("Medicine Name", "Test Medicine");
        details.put("Supplier Name", "Test Supplier");
        details.put("Batch Number", "BATCH-1");
        details.put("Quantity", "5");
        details.put("Minimum Stock", "10");
        details.put("Expiry Date", "2026-08-30");
        details.put("Action Performed", eventName);
        details.put("User", "admin@example.com");
        details.put("Date", "2026-08-07");
        details.put("Time", "16:45:00");
        details.put("Direct Link", "http://localhost:5173/?view=Medicines&medicineId=1");
        return details;
    }

    private String htmlBody(MimeMessage message) throws Exception {
        return extractText(message.getContent());
    }

    private String extractText(Object content) throws Exception {
        if (content instanceof String text) {
            return text;
        }
        if (content instanceof Multipart multipart) {
            StringBuilder text = new StringBuilder();
            for (int index = 0; index < multipart.getCount(); index++) {
                BodyPart bodyPart = multipart.getBodyPart(index);
                text.append(extractText(bodyPart.getContent()));
            }
            return text.toString();
        }
        return String.valueOf(content);
    }

    private static class CapturingMailSender implements JavaMailSender {

        private MimeMessage sentMessage;

        @Override
        public MimeMessage createMimeMessage() {
            return new MimeMessage(Session.getInstance(new Properties()));
        }

        @Override
        public MimeMessage createMimeMessage(InputStream contentStream) {
            throw new UnsupportedOperationException();
        }

        @Override
        public void send(MimeMessage mimeMessage) throws MailException {
            this.sentMessage = mimeMessage;
        }

        @Override
        public void send(MimeMessage... mimeMessages) throws MailException {
            this.sentMessage = mimeMessages[0];
        }

        @Override
        public void send(org.springframework.mail.javamail.MimeMessagePreparator mimeMessagePreparator) {
            throw new UnsupportedOperationException();
        }

        @Override
        public void send(org.springframework.mail.javamail.MimeMessagePreparator... mimeMessagePreparators) {
            throw new UnsupportedOperationException();
        }

        @Override
        public void send(SimpleMailMessage simpleMessage) {
            throw new UnsupportedOperationException();
        }

        @Override
        public void send(SimpleMailMessage... simpleMessages) {
            throw new UnsupportedOperationException();
        }
    }
}
