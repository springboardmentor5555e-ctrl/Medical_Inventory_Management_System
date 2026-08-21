package com.medistock.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MedicineResponse {

    private Long id;
    private String medicineName;
    private String genericName;
    private String brand;
    private CategoryResponse category;
    private SupplierResponse supplier;
    private String batchNumber;
    private String barcode;
    private LocalDate manufacturingDate;
    private LocalDate expiryDate;
    private BigDecimal purchasePrice;
    private BigDecimal sellingPrice;
    private Integer quantity;
    private Integer availableQuantity;
    private Integer reservedQuantity;
    private Integer damagedQuantity;
    private Integer minimumStock;
    private String storageLocation;
    private String description;
    private String imageUrl;
    private String status;
    private Instant createdAt;
    private Instant updatedAt;
}
