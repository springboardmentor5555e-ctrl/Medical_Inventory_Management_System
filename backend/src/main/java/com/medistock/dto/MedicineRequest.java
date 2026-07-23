package com.medistock.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicineRequest {
    @NotBlank(message = "Medicine name is required")
    private String name;

    private String barcode;

    private Long categoryId;

    private Long supplierId;

    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer quantity;

    @DecimalMin(value = "0.0", message = "Price cannot be negative")
    private Double price;

    private String batchNumber;

    private LocalDate manufacturingDate;

    private LocalDate expiryDate;

    @Min(value = 0, message = "Reorder level cannot be negative")
    private Integer reorderLevel;

    private String description;

    @Builder.Default
    private Set<Long> alternativeIds = new HashSet<>();
}
