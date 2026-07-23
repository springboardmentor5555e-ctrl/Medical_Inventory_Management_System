package com.medistock.dto;

import com.medistock.enums.ReorderStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReorderRequestDTO {
    private Long id;

    @NotNull(message = "Medicine ID is required")
    private Long medicineId;

    private String medicineName;

    private Long supplierId;

    private String supplierName;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    private ReorderStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
