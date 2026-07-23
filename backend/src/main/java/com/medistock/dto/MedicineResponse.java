package com.medistock.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicineResponse {
    private Long id;
    private String name;
    private String barcode;
    private CategoryDTO category;
    private SupplierDTO supplier;
    private Integer quantity;
    private Double price;
    private String batchNumber;
    private LocalDate manufacturingDate;
    private LocalDate expiryDate;
    private String imageUrl;
    private Integer reorderLevel;
    private String description;

    @Builder.Default
    private Set<MedicineSummary> alternatives = new HashSet<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MedicineSummary {
        private Long id;
        private String name;
        private String barcode;
    }
}
