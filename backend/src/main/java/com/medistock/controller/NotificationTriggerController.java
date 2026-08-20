package com.medistock.controller;

import com.medistock.response.ApiResponse;
import com.medistock.scheduler.InventoryScheduler;
import com.medistock.service.EmailNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationTriggerController {

    private final InventoryScheduler inventoryScheduler;
    private final EmailNotificationService emailService;

    /**
     * Manually trigger the Expiry Check Sweep (normally runs at 6:00 AM)
     */
    @PostMapping("/trigger-expiry-check")
    public ResponseEntity<ApiResponse<String>> triggerExpiryCheck() {
        inventoryScheduler.trackMedicineBatchesExpiry();
        return ResponseEntity.ok(ApiResponse.success("Expiry check executed successfully. Alert emails dispatched to admins.", "DONE"));
    }

    /**
     * Manually trigger the Low Stock Audit (normally runs at 7:00 AM)
     */
    @PostMapping("/trigger-low-stock-check")
    public ResponseEntity<ApiResponse<String>> triggerLowStockCheck() {
        inventoryScheduler.auditLowStockThresholds();
        return ResponseEntity.ok(ApiResponse.success("Low stock audit executed successfully. Alert emails dispatched to admins.", "DONE"));
    }

    /**
     * Send an instant test email to any specified email address
     */
    @PostMapping("/test-email")
    public ResponseEntity<ApiResponse<String>> sendTestEmail(@RequestParam String email) {
        emailService.sendExpiryAlert(
                "Paracetamol 500mg (TEST)",
                "BATCH-TEST-999",
                LocalDate.now().minusDays(2),
                150,
                email
        );
        return ResponseEntity.ok(ApiResponse.success("Test email sent to " + email, "SENT"));
    }
}
