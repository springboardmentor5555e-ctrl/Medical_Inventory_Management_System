package com.medistock.dto;

import java.util.Map;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AnalyticsResponse {

    private Map<String, Long> inventoryTrends;
    private Map<String, Long> stockUsage;
    private Map<String, Long> medicineConsumption;
    private Map<String, Long> topMedicines;
    private Map<String, Long> supplierPerformance;
    private Map<String, Long> expiryStatistics;
}
