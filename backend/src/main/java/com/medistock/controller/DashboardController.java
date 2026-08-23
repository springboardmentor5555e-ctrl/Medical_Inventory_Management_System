package com.medistock.controller;

import com.medistock.dto.DashboardDtos.CategoryAnalytics;
import com.medistock.dto.DashboardDtos.DashboardSummary;
import com.medistock.dto.DashboardDtos.StockStatusBreakdown;
import com.medistock.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummary> summary() {
        return ResponseEntity.ok(dashboardService.getSummary());
    }

    @GetMapping("/analytics/by-category")
    public ResponseEntity<List<CategoryAnalytics>> byCategory() {
        return ResponseEntity.ok(dashboardService.getCategoryAnalytics());
    }

    @GetMapping("/analytics/stock-status")
    public ResponseEntity<StockStatusBreakdown> stockStatus() {
        return ResponseEntity.ok(dashboardService.getStockStatusBreakdown());
    }
}
