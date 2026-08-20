package com.medistock.api.services;

import com.medistock.api.dto.SupplierPerformanceDTO;
import com.medistock.api.models.PurchaseOrder;
import com.medistock.api.models.PurchaseOrderStatus;
import com.medistock.api.models.Supplier;
import com.medistock.api.repositories.PurchaseOrderRepository;
import com.medistock.api.repositories.SupplierRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * SupplierAnalyticsService — computes performance metrics for each supplier.
 *
 * Metrics calculated:
 * - Total orders, received, pending, cancelled counts
 * - Fulfilment rate (received / total × 100)
 * - Total spend and average order value
 * - Top medicines supplied (by name, distinct, up to 5)
 */
@Service
public class SupplierAnalyticsService {

    private final SupplierRepository supplierRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    public SupplierAnalyticsService(SupplierRepository supplierRepository,
                                    PurchaseOrderRepository purchaseOrderRepository) {
        this.supplierRepository      = supplierRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
    }

    /**
     * Returns performance metrics for all suppliers.
     * Suppliers with no orders still appear with zeroed metrics.
     */
    public List<SupplierPerformanceDTO> getAllSupplierPerformance() {
        return supplierRepository.findAll()
                .stream()
                .map(this::buildPerformanceDTO)
                .collect(Collectors.toList());
    }

    /**
     * Returns performance metrics for a single supplier.
     *
     * @param supplierId the ID of the supplier
     * @throws RuntimeException if supplier not found
     */
    public SupplierPerformanceDTO getSupplierPerformance(Long supplierId) {
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new RuntimeException("Supplier not found: " + supplierId));
        return buildPerformanceDTO(supplier);
    }

    // ── Private helpers ───────────────────────────────────────────────────────────

    private SupplierPerformanceDTO buildPerformanceDTO(Supplier supplier) {
        // Fetch all orders for this supplier
        List<PurchaseOrder> orders = purchaseOrderRepository.findAll().stream()
                .filter(o -> o.getSupplier().getId().equals(supplier.getId()))
                .collect(Collectors.toList());

        long total     = orders.size();
        long received  = orders.stream().filter(o -> o.getStatus() == PurchaseOrderStatus.RECEIVED).count();
        long pending   = orders.stream().filter(o -> o.getStatus() == PurchaseOrderStatus.PENDING).count();
        long cancelled = orders.stream().filter(o -> o.getStatus() == PurchaseOrderStatus.CANCELLED).count();

        double totalSpend = orders.stream()
                .mapToDouble(o -> o.getTotalAmount() != null ? o.getTotalAmount() : 0.0)
                .sum();

        double avgOrderValue = total > 0 ? totalSpend / total : 0.0;
        double fulfilmentRate = total > 0 ? (double) received / total * 100.0 : 0.0;

        // Collect distinct medicine names from all order items (up to 5)
        List<String> topMedicines = orders.stream()
                .flatMap(o -> o.getItems().stream())
                .map(item -> item.getMedicineName())
                .distinct()
                .limit(5)
                .collect(Collectors.toList());

        SupplierPerformanceDTO dto = new SupplierPerformanceDTO();
        dto.setSupplierId(supplier.getId());
        dto.setSupplierName(supplier.getName());
        dto.setContactNumber(supplier.getContactNumber());
        dto.setEmail(supplier.getEmail());
        dto.setTotalOrders(total);
        dto.setReceivedOrders(received);
        dto.setPendingOrders(pending);
        dto.setCancelledOrders(cancelled);
        dto.setFulfilmentRate(Math.round(fulfilmentRate * 100.0) / 100.0);
        dto.setTotalSpend(totalSpend);
        dto.setAvgOrderValue(Math.round(avgOrderValue * 100.0) / 100.0);
        dto.setTopMedicinesSupplied(topMedicines);
        return dto;
    }
}
