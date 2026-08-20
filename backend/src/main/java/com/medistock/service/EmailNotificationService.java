package com.medistock.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * MediStock Email Notification Engine
 * Sends HTML emails for: Low Stock Alerts, Expiry Warnings, Purchase Order Status Changes
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationService {

    private final JavaMailSender mailSender;

    @Value("${medistock.mail.enabled:true}")
    private boolean mailEnabled;

    @Value("${spring.mail.username:noreply@medistock.com}")
    private String fromEmail;

    @Value("${medistock.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    // ─────────────────────────────────────────────────────────────────
    // LOW STOCK ALERT
    // ─────────────────────────────────────────────────────────────────
    public void sendLowStockAlert(String medicineName, int currentStock, int threshold, String toEmail) {
        if (!mailEnabled) {
            log.warn("[EMAIL DISABLED] LOW STOCK: {} | Current: {} | Threshold: {}", medicineName, currentStock, threshold);
            return;
        }
        String subject = "⚠️ MediStock Low Stock Alert: " + medicineName;
        String body = buildHtmlEmail(
            "Low Stock Alert",
            "⚠️ Critical Stock Depletion",
            "#f59e0b",
            "<p>The following medicine has fallen below its minimum safety threshold:</p>" +
            "<table style='width:100%;border-collapse:collapse;margin:16px 0;'>" +
            "<tr><td style='padding:8px;background:#fef3c7;font-weight:bold;border-radius:6px;'>Medicine</td>" +
            "<td style='padding:8px;'>" + medicineName + "</td></tr>" +
            "<tr><td style='padding:8px;background:#fef3c7;font-weight:bold;'>Current Stock</td>" +
            "<td style='padding:8px;color:#dc2626;font-weight:bold;'>" + currentStock + " units</td></tr>" +
            "<tr><td style='padding:8px;background:#fef3c7;font-weight:bold;'>Safety Minimum</td>" +
            "<td style='padding:8px;'>" + threshold + " units</td></tr>" +
            "</table>" +
            "<p>Please place a purchase order immediately to replenish stock.</p>"
        );
        sendEmail(toEmail, subject, body);
    }

    // ─────────────────────────────────────────────────────────────────
    // EXPIRY WARNING ALERT
    // ─────────────────────────────────────────────────────────────────
    public void sendExpiryAlert(String medicineName, String batchNumber, LocalDate expiryDate, int quantity, String toEmail) {
        if (!mailEnabled) {
            log.warn("[EMAIL DISABLED] EXPIRY ALERT: {} | Batch: {} | Expiry: {}", medicineName, batchNumber, expiryDate);
            return;
        }
        boolean isExpired = expiryDate.isBefore(LocalDate.now());
        String subject = isExpired
            ? "🚨 MediStock EXPIRED Batch: " + medicineName
            : "📅 MediStock Expiry Warning: " + medicineName;
        String color = isExpired ? "#dc2626" : "#f59e0b";
        String title = isExpired ? "🚨 Expired Batch Detected" : "📅 Batch Expiry Warning";

        String body = buildHtmlEmail(
            "Expiry Alert",
            title,
            color,
            "<p>A medicine batch " + (isExpired ? "has expired" : "is expiring soon") + " and requires immediate attention:</p>" +
            "<table style='width:100%;border-collapse:collapse;margin:16px 0;'>" +
            "<tr><td style='padding:8px;background:#fee2e2;font-weight:bold;border-radius:6px;'>Medicine</td>" +
            "<td style='padding:8px;'>" + medicineName + "</td></tr>" +
            "<tr><td style='padding:8px;background:#fee2e2;font-weight:bold;'>Batch Number</td>" +
            "<td style='padding:8px;font-family:monospace;'>" + batchNumber + "</td></tr>" +
            "<tr><td style='padding:8px;background:#fee2e2;font-weight:bold;'>Expiry Date</td>" +
            "<td style='padding:8px;color:" + color + ";font-weight:bold;'>" + expiryDate.format(DateTimeFormatter.ofPattern("dd MMM yyyy")) + "</td></tr>" +
            "<tr><td style='padding:8px;background:#fee2e2;font-weight:bold;'>Quantity at Risk</td>" +
            "<td style='padding:8px;'>" + quantity + " units</td></tr>" +
            "</table>" +
            (isExpired ? "<p style='color:#dc2626;font-weight:bold;'>⚠️ This batch must be quarantined immediately to prevent dispensing of expired medicines.</p>"
                       : "<p>Please review this batch and initiate a new purchase order to ensure stock continuity.</p>")
        );
        sendEmail(toEmail, subject, body);
    }

    // ─────────────────────────────────────────────────────────────────
    // PURCHASE ORDER STATUS NOTIFICATION
    // ─────────────────────────────────────────────────────────────────
    public void sendPurchaseOrderStatusEmail(String orderNumber, String status, String supplierName,
                                              String medicineName, int quantity, String toEmail) {
        if (!mailEnabled) {
            log.info("[EMAIL DISABLED] PO STATUS: {} | {} | {}", orderNumber, status, status);
            return;
        }
        String icon;
        String color;
        String message;

        switch (status) {
            case "APPROVED" -> {
                icon = "✅"; color = "#059669";
                message = "Your purchase order has been <strong>approved</strong> by an administrator. The supplier will be notified.";
            }
            case "REJECTED" -> {
                icon = "❌"; color = "#dc2626";
                message = "Your purchase order has been <strong>rejected</strong>. Please review the order details and resubmit.";
            }
            case "RECEIVED", "DELIVERED" -> {
                icon = "📦"; color = "#0284c7";
                message = "Your purchase order has been <strong>marked as received</strong>. Stock has been automatically updated.";
            }
            default -> {
                icon = "📋"; color = "#6366f1";
                message = "Your purchase order status has been updated to <strong>" + status + "</strong>.";
            }
        }

        String subject = icon + " MediStock PO " + status + ": " + orderNumber;
        String body = buildHtmlEmail(
            "Purchase Order Update",
            icon + " Order " + status,
            color,
            "<p>" + message + "</p>" +
            "<table style='width:100%;border-collapse:collapse;margin:16px 0;'>" +
            "<tr><td style='padding:8px;background:#eff6ff;font-weight:bold;border-radius:6px;'>Order Number</td>" +
            "<td style='padding:8px;font-family:monospace;'>" + orderNumber + "</td></tr>" +
            "<tr><td style='padding:8px;background:#eff6ff;font-weight:bold;'>Supplier</td>" +
            "<td style='padding:8px;'>" + supplierName + "</td></tr>" +
            "<tr><td style='padding:8px;background:#eff6ff;font-weight:bold;'>Medicine</td>" +
            "<td style='padding:8px;'>" + medicineName + "</td></tr>" +
            "<tr><td style='padding:8px;background:#eff6ff;font-weight:bold;'>Quantity</td>" +
            "<td style='padding:8px;'>" + quantity + " units</td></tr>" +
            "</table>"
        );
        sendEmail(toEmail, subject, body);
    }

    // ─────────────────────────────────────────────────────────────────
    // WELCOME EMAIL (sent on new user registration)
    // ─────────────────────────────────────────────────────────────────
    public void sendWelcomeEmail(String fullName, String username, String role, String toEmail) {
        if (!mailEnabled) {
            log.info("[EMAIL DISABLED] WELCOME: {} | {} | {}", fullName, username, toEmail);
            return;
        }
        String subject = "🏥 Welcome to MediStock, " + fullName + "!";
        String body = buildHtmlEmail(
            "Welcome",
            "🏥 Welcome to MediStock",
            "#0284c7",
            "<p>Hi <strong>" + fullName + "</strong>,</p>" +
            "<p>Your MediStock account has been successfully created. You can now log in to the platform.</p>" +
            "<table style='width:100%;border-collapse:collapse;margin:16px 0;'>" +
            "<tr><td style='padding:8px;background:#eff6ff;font-weight:bold;border-radius:6px;'>Username</td>" +
            "<td style='padding:8px;font-family:monospace;'>" + username + "</td></tr>" +
            "<tr><td style='padding:8px;background:#eff6ff;font-weight:bold;'>Role</td>" +
            "<td style='padding:8px;'>" + role + "</td></tr>" +
            "</table>" +
            "<div style='text-align:center;margin:24px 0;'>" +
            "<a href='" + frontendUrl + "' style='background:#0284c7;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;'>Login to MediStock</a>" +
            "</div>"
        );
        sendEmail(toEmail, subject, body);
    }

    // ─────────────────────────────────────────────────────────────────
    // PASSWORD RESET EMAIL
    // ─────────────────────────────────────────────────────────────────
    public void sendPasswordResetEmail(String fullName, String resetToken, String toEmail) {
        if (!mailEnabled) {
            log.info("[EMAIL DISABLED] PASSWORD RESET: {}", toEmail);
            return;
        }
        String resetUrl = frontendUrl + "/reset-password?token=" + resetToken;
        String subject = "🔒 MediStock Password Reset Request";
        String body = buildHtmlEmail(
            "Password Reset",
            "🔒 Password Reset",
            "#6366f1",
            "<p>Hi <strong>" + fullName + "</strong>,</p>" +
            "<p>We received a request to reset your MediStock password. Click the button below to set a new password:</p>" +
            "<div style='text-align:center;margin:24px 0;'>" +
            "<a href='" + resetUrl + "' style='background:#6366f1;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;'>Reset Password</a>" +
            "</div>" +
            "<p style='color:#94a3b8;font-size:12px;'>This link expires in 1 hour. If you did not request a password reset, please ignore this email.</p>"
        );
        sendEmail(toEmail, subject, body);
    }

    // ─────────────────────────────────────────────────────────────────
    // INTERNAL: HTML template builder
    // ─────────────────────────────────────────────────────────────────
    private String buildHtmlEmail(String pageTitle, String heading, String accentColor, String contentHtml) {
        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"><title>%s</title></head>
            <body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0;">
                <tr><td align="center">
                  <table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                    <!-- Header -->
                    <tr><td style="background:%s;padding:28px 32px;">
                      <h1 style="margin:0;color:white;font-size:20px;font-weight:800;">%s</h1>
                      <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:12px;">MediStock — Medical Inventory Management</p>
                    </td></tr>
                    <!-- Body -->
                    <tr><td style="padding:28px 32px;color:#334155;font-size:14px;line-height:1.7;">
                      %s
                    </td></tr>
                    <!-- Footer -->
                    <tr><td style="background:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0;">
                      <p style="margin:0;color:#94a3b8;font-size:11px;">MediStock &mdash; Automated Notification System &mdash; Do not reply to this email.</p>
                    </td></tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(pageTitle, accentColor, heading, contentHtml);
    }

    // ─────────────────────────────────────────────────────────────────
    // INTERNAL: Core send method
    // ─────────────────────────────────────────────────────────────────
    private void sendEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, "MediStock Alerts");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true = HTML
            mailSender.send(message);
            log.info("Email sent successfully to {} | Subject: {}", to, subject);
        } catch (Exception e) {
            log.error("Failed to send email to {} | Error: {}", to, e.getMessage());
        }
    }
}
