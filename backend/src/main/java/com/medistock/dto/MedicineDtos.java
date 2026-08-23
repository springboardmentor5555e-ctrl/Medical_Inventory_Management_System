package com.medistock.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.time.LocalDate;

public class MedicineDtos {

    @Data
    public static class MedicineRequest {
        @NotBlank
        private String name;
        @NotBlank
        private String batchNumber;
        private Long categoryId;
        private Long supplierId;
        @NotNull @PositiveOrZero
        private Integer quantity;
        private LocalDate manufacturingDate;
        @NotNull
        private LocalDate expiryDate;
        @NotNull
        private Double price;
        private Integer lowStockThreshold;
    }

    @Data
    public static class StockAdjustmentRequest {
        @NotNull
        private Integer quantityChange; // positive to add stock, negative to remove
        private String note;
    }
}
