package com.medistock.scheduler;

import com.medistock.entity.Medicine;
import com.medistock.entity.MedicineBatch;
import com.medistock.repository.InventoryTransactionRepository;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.UserRepository;
import com.medistock.service.EmailNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class InventoryScheduler {

    private final MedicineRepository medicineRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final EmailNotificationService emailService;

    /**
     * Runs every day at 06:00 AM to check and email expiry warnings
     */
    @Scheduled(cron = "0 0 6 * * ?")
    @Transactional(readOnly = true)
    public void trackMedicineBatchesExpiry() {
        log.info("System Scheduler: Commencing clinical medicine expiry sweep...");

        // Fetch all ADMIN emails for notification
        List<String> adminEmails = userRepository.findAll().stream()
                .filter(u -> "ADMIN".equals(u.getRole().name()))
                .map(u -> u.getEmail())
                .toList();

        if (adminEmails.isEmpty()) {
            log.warn("No ADMIN users found for expiry notification emails.");
            return;
        }

        // Check batches expiring within 30 days
        LocalDate warningDate = LocalDate.now().plusDays(30);
        List<Medicine> expiringMedicines = medicineRepository.findExpiringMedicines(warningDate);

        for (Medicine medicine : expiringMedicines) {
            for (MedicineBatch batch : medicine.getBatches()) {
                if (batch.getExpiryDate() != null && !batch.getExpiryDate().isAfter(warningDate) && batch.getQuantity() > 0) {
                    log.warn("ALERT: {} — Batch {} expiring on {}. Sending email notification.",
                            medicine.getName(), batch.getBatchNumber(), batch.getExpiryDate());
                    // Send email to all admins
                    for (String adminEmail : adminEmails) {
                        emailService.sendExpiryAlert(
                                medicine.getName(),
                                batch.getBatchNumber(),
                                batch.getExpiryDate(),
                                batch.getQuantity(),
                                adminEmail
                        );
                    }
                }
            }
        }

        log.info("Expiry sweep completed. {} medicines flagged.", expiringMedicines.size());
    }

    /**
     * Runs every day at 07:00 AM to audit stock against minimum safety thresholds
     */
    @Scheduled(cron = "0 0 7 * * ?")
    @Transactional(readOnly = true)
    public void auditLowStockThresholds() {
        log.info("System Scheduler: Initiating low stock safety margin audit...");

        List<String> adminEmails = userRepository.findAll().stream()
                .filter(u -> "ADMIN".equals(u.getRole().name()))
                .map(u -> u.getEmail())
                .toList();

        if (adminEmails.isEmpty()) {
            log.warn("No ADMIN users found for low stock notification emails.");
            return;
        }

        List<Medicine> activeCatalogue = medicineRepository.findAll();
        int lowStockCount = 0;

        for (Medicine medicine : activeCatalogue) {
            int currentStock = transactionRepository.calculateCurrentStockByMedicineId(medicine.getId());
            if (currentStock < medicine.getMinStockThreshold()) {
                log.error("CRITICAL SAFETY STOCK DEPLETED: {} | Current: {} | Threshold: {}",
                        medicine.getName(), currentStock, medicine.getMinStockThreshold());
                for (String adminEmail : adminEmails) {
                    emailService.sendLowStockAlert(
                            medicine.getName(),
                            currentStock,
                            medicine.getMinStockThreshold(),
                            adminEmail
                    );
                }
                lowStockCount++;
            }
        }

        log.info("Low stock audit completed. {} medicines below safety threshold.", lowStockCount);
    }
}
