package com.medistock.service;

import com.medistock.dto.DashboardDtos.CategoryAnalytics;
import com.medistock.dto.DashboardDtos.DashboardSummary;
import com.medistock.dto.DashboardDtos.StockStatusBreakdown;
import com.medistock.entity.Medicine;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final MedicineRepository medicineRepository;
    private final SupplierRepository supplierRepository;

    @Value("${app.inventory.low-stock-threshold:20}")
    private int lowStockThreshold;

    @Value("${app.inventory.expiry-warning-days:30}")
    private int expiryWarningDays;

    public DashboardSummary getSummary() {
        List<Medicine> all = medicineRepository.findAll();

        long lowStock = all.stream().filter(Medicine::isLowStock).count();
        long outOfStock = all.stream().filter(Medicine::isOutOfStock).count();
        long expired = all.stream().filter(Medicine::isExpired).count();
        LocalDate soonCutoff = LocalDate.now().plusDays(expiryWarningDays);
        long expiringSoon = all.stream()
                .filter(m -> !m.isExpired() && m.getExpiryDate() != null && !m.getExpiryDate().isAfter(soonCutoff))
                .count();
        double totalValue = all.stream()
                .mapToDouble(m -> (m.getPrice() != null ? m.getPrice() : 0) * (m.getQuantity() != null ? m.getQuantity() : 0))
                .sum();

        return DashboardSummary.builder()
                .totalMedicines(all.size())
                .totalSuppliers(supplierRepository.count())
                .lowStockCount(lowStock)
                .outOfStockCount(outOfStock)
                .expiringSoonCount(expiringSoon)
                .expiredCount(expired)
                .totalInventoryValue(totalValue)
                .build();
    }

    /** Inventory value and quantity broken down by category, for analytics charts. */
    public List<CategoryAnalytics> getCategoryAnalytics() {
        List<Medicine> all = medicineRepository.findAll();

        Map<String, List<Medicine>> byCategory = all.stream()
                .collect(Collectors.groupingBy(m -> m.getCategory() != null ? m.getCategory().getName() : "Uncategorized"));

        return byCategory.entrySet().stream()
                .map(entry -> CategoryAnalytics.builder()
                        .categoryName(entry.getKey())
                        .medicineCount(entry.getValue().size())
                        .totalQuantity(entry.getValue().stream().mapToLong(m -> m.getQuantity() != null ? m.getQuantity() : 0).sum())
                        .totalValue(entry.getValue().stream()
                                .mapToDouble(m -> (m.getPrice() != null ? m.getPrice() : 0) * (m.getQuantity() != null ? m.getQuantity() : 0))
                                .sum())
                        .build())
                .sorted(Comparator.comparingDouble(CategoryAnalytics::getTotalValue).reversed())
                .toList();
    }

    /** Stock status distribution (in-stock vs low vs out vs expired), for a pie/donut chart. */
    public StockStatusBreakdown getStockStatusBreakdown() {
        List<Medicine> all = medicineRepository.findAll();

        long expired = all.stream().filter(Medicine::isExpired).count();
        long outOfStock = all.stream().filter(m -> !m.isExpired() && m.isOutOfStock()).count();
        long lowStock = all.stream().filter(m -> !m.isExpired() && !m.isOutOfStock() && m.isLowStock()).count();
        long inStock = all.size() - expired - outOfStock - lowStock;

        return StockStatusBreakdown.builder()
                .inStock(inStock)
                .lowStock(lowStock)
                .outOfStock(outOfStock)
                .expired(expired)
                .build();
    }
}
