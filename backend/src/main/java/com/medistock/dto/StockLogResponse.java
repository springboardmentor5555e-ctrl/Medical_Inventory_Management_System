package com.medistock.dto;

import com.medistock.entity.StockMovementType;
import java.time.Instant;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StockLogResponse {

    private Long id;
    private Long medicineId;
    private String medicineName;
    private String batchNumber;
    private StockMovementType type;
    private Integer quantity;
    private Integer previousQuantity;
    private Integer newQuantity;
    private String reason;
    private Instant createdAt;
}
