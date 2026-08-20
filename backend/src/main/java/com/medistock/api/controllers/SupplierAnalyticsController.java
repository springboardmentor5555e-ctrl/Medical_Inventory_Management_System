package com.medistock.api.controllers;

import com.medistock.api.dto.SupplierPerformanceDTO;
import com.medistock.api.services.SupplierAnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * SupplierAnalyticsController — advanced analytics endpoints for supplier performance.
 *
 * GET /api/supplier-analytics        → All suppliers with performance metrics
 * GET /api/supplier-analytics/{id}   → Single supplier performance metrics
 *
 * Accessible by ADMIN and PHARMACIST roles.
 */
@RestController
@RequestMapping("/api/supplier-analytics")
@PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
public class SupplierAnalyticsController {

    private final SupplierAnalyticsService supplierAnalyticsService;

    public SupplierAnalyticsController(SupplierAnalyticsService supplierAnalyticsService) {
        this.supplierAnalyticsService = supplierAnalyticsService;
    }

    /**
     * GET /api/supplier-analytics
     * Returns performance metrics for all suppliers.
     */
    @GetMapping
    public ResponseEntity<List<SupplierPerformanceDTO>> getAllSupplierPerformance() {
        return ResponseEntity.ok(supplierAnalyticsService.getAllSupplierPerformance());
    }

    /**
     * GET /api/supplier-analytics/{id}
     * Returns performance metrics for a single supplier.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getSupplierPerformance(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(supplierAnalyticsService.getSupplierPerformance(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
