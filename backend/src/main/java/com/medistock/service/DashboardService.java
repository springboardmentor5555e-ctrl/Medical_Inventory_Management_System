package com.medistock.service;

import com.medistock.dto.DashboardResponse;
import com.medistock.entity.Medicine;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.SupplierRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final MedicineRepository medicineRepository;
    private final SupplierRepository supplierRepository;
    private final InventoryMapper mapper;
    private final NotificationService notificationService;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST','STAFF')")
    public DashboardResponse summary() {
        var medicines = medicineRepository.findAll();
        LocalDate today = LocalDate.now();
        Map<String, Long> categoryDistribution = medicines.stream()
                .collect(Collectors.groupingBy(m -> m.getCategory().getName(), Collectors.counting()));
        Map<String, Long> medicineStatus = medicines.stream()
                .collect(Collectors.groupingBy(mapper::resolveStatus, Collectors.counting()));
        Map<String, Long> stockStatus = new LinkedHashMap<>();
        stockStatus.put("Available", medicines.stream().filter(m -> mapper.availableQuantity(m) > m.getMinimumStock()).count());
        stockStatus.put("Low Stock", medicines.stream().filter(m -> mapper.availableQuantity(m) > 0 && mapper.availableQuantity(m) <= m.getMinimumStock()).count());
        stockStatus.put("Out of Stock", medicines.stream().filter(m -> mapper.availableQuantity(m) == 0).count());

        return DashboardResponse.builder()
                .totalMedicines(medicineRepository.count())
                .totalSuppliers(supplierRepository.count())
                .lowStock(stockStatus.get("Low Stock"))
                .outOfStock(stockStatus.get("Out of Stock"))
                .nearExpiry(medicineRepository.countByExpiryDateBetween(today, today.plusDays(30)))
                .expired(medicineRepository.countByExpiryDateBefore(today))
                .notifications(notificationService.unreadCount())
                .inventoryValue(medicineRepository.inventoryValue())
                .categoryDistribution(categoryDistribution)
                .medicineStatus(medicineStatus)
                .stockStatus(stockStatus)
                .medicinesAddedByMonth(medicinesAddedByMonth(medicines))
                .inventoryGrowthByMonth(inventoryGrowthByMonth(medicines))
                .monthlyInventoryValue(monthlyInventoryValue(medicines))
                .recentlyAddedMedicines(medicines.stream()
                        .sorted(Comparator.comparing(Medicine::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                        .limit(5)
                        .map(mapper::toMedicineResponse)
                        .toList())
                .recentActivity(auditService.recent(8))
                .build();
    }

    private Map<String, Long> medicinesAddedByMonth(List<Medicine> medicines) {
        Map<String, Long> data = monthTemplate();
        medicines.stream()
                .filter(medicine -> medicine.getCreatedAt() != null)
                .collect(Collectors.groupingBy(medicine -> monthKey(medicine.getCreatedAt().atZone(ZoneId.systemDefault()).toLocalDate()), Collectors.counting()))
                .forEach(data::put);
        return data;
    }

    private Map<String, Long> inventoryGrowthByMonth(List<Medicine> medicines) {
        Map<String, Long> data = new LinkedHashMap<>();
        long runningTotal = 0;
        for (String month : monthTemplate().keySet()) {
            YearMonth current = YearMonth.parse(month);
            runningTotal = medicines.stream()
                    .filter(medicine -> medicine.getCreatedAt() != null)
                    .filter(medicine -> {
                        YearMonth created = YearMonth.from(medicine.getCreatedAt().atZone(ZoneId.systemDefault()).toLocalDate());
                        return !created.isAfter(current);
                    })
                    .mapToLong(medicine -> medicine.getQuantity() == null ? 0 : medicine.getQuantity())
                    .sum();
            data.put(month, runningTotal);
        }
        return data;
    }

    private Map<String, BigDecimal> monthlyInventoryValue(List<Medicine> medicines) {
        Map<String, BigDecimal> data = new LinkedHashMap<>();
        monthTemplate().keySet().forEach(month -> data.put(month, BigDecimal.ZERO));
        medicines.stream()
                .filter(medicine -> medicine.getCreatedAt() != null)
                .forEach(medicine -> {
                    String key = monthKey(medicine.getCreatedAt().atZone(ZoneId.systemDefault()).toLocalDate());
                    if (data.containsKey(key)) {
                        BigDecimal value = medicine.getPurchasePrice().multiply(BigDecimal.valueOf(medicine.getQuantity()));
                        data.put(key, data.get(key).add(value));
                    }
                });
        return data;
    }

    private Map<String, Long> monthTemplate() {
        Map<String, Long> months = new LinkedHashMap<>();
        YearMonth start = YearMonth.now().minusMonths(5);
        for (int i = 0; i < 6; i++) {
            months.put(start.plusMonths(i).toString(), 0L);
        }
        return months;
    }

    private String monthKey(LocalDate date) {
        return YearMonth.from(date).toString();
    }
}
