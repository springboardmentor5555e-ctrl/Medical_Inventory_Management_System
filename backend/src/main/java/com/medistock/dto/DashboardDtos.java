package com.medistock.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class DashboardDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardSummary {
        private long totalMedicines;
        private long totalSuppliers;
        private long lowStockCount;
        private long outOfStockCount;
        private long expiringSoonCount;
        private long expiredCount;
        private double totalInventoryValue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryAnalytics {
        private String categoryName;
        private long medicineCount;
        private long totalQuantity;
        private double totalValue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StockStatusBreakdown {
        private long inStock;
        private long lowStock;
        private long outOfStock;
        private long expired;
    }
}
