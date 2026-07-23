package com.medistock.scheduler;

import com.medistock.entity.Medicine;
import com.medistock.entity.Notification;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.NotificationRepository;
import com.medistock.service.TwilioService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
public class MedicineExpiryScheduler {

    private final MedicineRepository medicineRepository;
    private final NotificationRepository notificationRepository;
    private final TwilioService twilioService;

    public MedicineExpiryScheduler(
            MedicineRepository medicineRepository,
            NotificationRepository notificationRepository,
            TwilioService twilioService
    ) {
        this.medicineRepository = medicineRepository;
        this.notificationRepository = notificationRepository;
        this.twilioService = twilioService;
    }

    // Runs daily at 1:00 AM
    @Scheduled(cron = "0 0 1 * * ?")
    @Transactional
    public void checkMedicineExpiries() {
        log.info("Starting scheduled medicine expiry check...");
        LocalDate today = LocalDate.now();
        LocalDate thirtyDaysFromNow = today.plusDays(30);

        // 1. Expired Medicines
        List<Medicine> expired = medicineRepository.findExpiringMedicines(today);
        for (Medicine medicine : expired) {
            String msg = String.format("EXPIRED MEDICINE WARNING: %s (Barcode: %s, Batch: %s) expired on %s. Please remove from active stock!",
                    medicine.getName(),
                    medicine.getBarcode() != null ? medicine.getBarcode() : "N/A",
                    medicine.getBatchNumber() != null ? medicine.getBatchNumber() : "N/A",
                    medicine.getExpiryDate()
            );

            createAndSendExpiryAlert(msg);
        }

        // 2. Medicines expiring within next 30 days (excluding already expired ones)
        List<Medicine> expiringSoon = medicineRepository.findExpiringMedicines(thirtyDaysFromNow);
        for (Medicine medicine : expiringSoon) {
            // Exclude already expired
            if (medicine.getExpiryDate() != null && medicine.getExpiryDate().isAfter(today)) {
                String msg = String.format("EXPIRING SOON WARNING: %s (Barcode: %s, Batch: %s) is expiring soon on %s. Plan to use or replace.",
                        medicine.getName(),
                        medicine.getBarcode() != null ? medicine.getBarcode() : "N/A",
                        medicine.getBatchNumber() != null ? medicine.getBatchNumber() : "N/A",
                        medicine.getExpiryDate()
                );

                createAndSendExpiryAlert(msg);
            }
        }
        log.info("Completed scheduled medicine expiry check.");
    }

    private void createAndSendExpiryAlert(String messageContent) {
        // Log to DB if similar unread message doesn't already exist to avoid duplicate spam
        // For simplicity, we just save a new notification.
        Notification notification = Notification.builder()
                .message(messageContent)
                .type("EXPIRY")
                .isRead(false)
                .build();
        notificationRepository.save(notification);

        // Send Twilio WhatsApp notification
        twilioService.sendWhatsAppMessage(messageContent);
    }
}
