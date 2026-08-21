package com.medistock.service;

import com.medistock.dto.AnalyticsResponse;
import com.medistock.entity.StockMovementType;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.StockLogRepository;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final MedicineRepository medicineRepository;
    private final StockLogRepository stockLogRepository;
    private final InventoryMapper mapper;

    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public AnalyticsResponse summary() {
        var medicines = medicineRepository.findAll();
        Map<String, Long> topMedicines = medicines.stream()
                .sorted((a, b) -> b.getQuantity().compareTo(a.getQuantity()))
                .limit(10)
                .collect(Collectors.toMap(
                        medicine -> medicine.getMedicineName(),
                        medicine -> medicine.getQuantity().longValue(),
                        (a, b) -> a,
                        LinkedHashMap::new
                ));
        Map<String, Long> supplierPerformance = medicines.stream()
                .collect(Collectors.groupingBy(m -> m.getSupplier().getSupplierName(), Collectors.counting()));
        Map<String, Long> expiryStatistics = medicines.stream()
                .collect(Collectors.groupingBy(mapper::resolveStatus, Collectors.counting()));
        Map<String, Long> stockUsage = stockLogRepository.findAll().stream()
                .collect(Collectors.groupingBy(log -> log.getType().name(), Collectors.summingLong(log -> log.getQuantity())));

        return AnalyticsResponse.builder()
                .inventoryTrends(topMedicines)
                .stockUsage(stockUsage)
                .medicineConsumption(Map.of(StockMovementType.STOCK_OUT.name(), stockUsage.getOrDefault(StockMovementType.STOCK_OUT.name(), 0L)))
                .topMedicines(topMedicines)
                .supplierPerformance(supplierPerformance)
                .expiryStatistics(expiryStatistics)
                .build();
    }
}
