package com.medistock.service;

import com.medistock.entity.Medicine;
import com.medistock.entity.NotificationType;
import com.medistock.repository.MedicineRepository;
import java.util.LinkedHashMap;
import java.util.Map;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ExpiryService {

    private final MedicineRepository medicineRepository;
    private final InventoryMapper mapper;
    private final NotificationService notificationService;
    private final AuditService auditService;

    @Value("${app.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void dailyExpiryScan() {
        int alerts = scanNow();
        auditService.record("EXPIRY_SCAN", "Medicine", null, alerts + " expiry/stock alerts generated or verified");
    }

    @Transactional
    public int scanNow() {
        LocalDate today = LocalDate.now();
        int alerts = 0;
        for (Medicine medicine : medicineRepository.findAll()) {
            if (medicine.getExpiryDate().isBefore(today)) {
                notificationService.createOnce(
                        NotificationType.EXPIRED,
                        medicine.getId(),
                        "Expired medicine",
                        medicine.getMedicineName() + " batch " + medicine.getBatchNumber() + " is expired",
                        medicineEmailDetails(medicine)
                );
                alerts++;
            } else if (!medicine.getExpiryDate().isAfter(today.plusDays(30))) {
                notificationService.createOnce(
                        NotificationType.NEAR_EXPIRY,
                        medicine.getId(),
                        "Medicine near expiry",
                        medicine.getMedicineName() + " expires on " + medicine.getExpiryDate(),
                        medicineEmailDetails(medicine)
                );
                alerts++;
            }
            int availableQuantity = mapper.availableQuantity(medicine);
            if (availableQuantity == 0) {
                notificationService.createOnce(
                        NotificationType.OUT_OF_STOCK,
                        medicine.getId(),
                        "Out of stock alert",
                        medicine.getMedicineName() + " is out of stock",
                        medicineEmailDetails(medicine)
                );
                alerts++;
            } else if (availableQuantity <= medicine.getMinimumStock()) {
                notificationService.createOnce(
                        NotificationType.LOW_STOCK,
                        medicine.getId(),
                        "Low stock alert",
                        medicine.getMedicineName() + " available stock is " + availableQuantity,
                        medicineEmailDetails(medicine)
                );
                alerts++;
            }
        }
        return alerts;
    }

    private Map<String, String> medicineEmailDetails(Medicine medicine) {
        Map<String, String> details = new LinkedHashMap<>();
        details.put("Medicine Name", medicine.getMedicineName());
        details.put("Supplier Name", medicine.getSupplier().getSupplierName());
        details.put("Batch Number", medicine.getBatchNumber());
        details.put("Quantity", String.valueOf(mapper.availableQuantity(medicine)));
        details.put("Minimum Stock", String.valueOf(medicine.getMinimumStock()));
        details.put("Expiry Date", String.valueOf(medicine.getExpiryDate()));
        details.put("Direct Link", frontendBaseUrl + "/?view=Medicines&medicineId=" + medicine.getId());
        return details;
    }
}
