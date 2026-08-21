package com.medistock.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DashboardResponse {

    private long totalMedicines;
    private long totalSuppliers;
    private long lowStock;
    private long outOfStock;
    private long nearExpiry;
    private long expired;
    private long notifications;
    private BigDecimal inventoryValue;
    private Map<String, Long> categoryDistribution;
    private Map<String, Long> medicineStatus;
    private Map<String, Long> stockStatus;
    private Map<String, Long> medicinesAddedByMonth;
    private Map<String, Long> inventoryGrowthByMonth;
    private Map<String, BigDecimal> monthlyInventoryValue;
    private List<MedicineResponse> recentlyAddedMedicines;
    private List<AuditLogResponse> recentActivity;
}
