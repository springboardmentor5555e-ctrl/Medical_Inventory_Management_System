package com.medistock.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MedicineRequest {

    @NotBlank
    @Size(max = 150)
    private String medicineName;

    @NotBlank
    @Size(max = 150)
    private String genericName;

    @NotBlank
    @Size(max = 120)
    private String brand;

    @NotBlank
    @Size(max = 80)
    private String category;

    @NotNull
    private Long supplierId;

    @NotBlank
    @Size(max = 80)
    private String batchNumber;

    @NotBlank
    @Size(max = 80)
    private String barcode;

    @NotNull
    private LocalDate manufacturingDate;

    @NotNull
    private LocalDate expiryDate;

    @NotNull
    @DecimalMin("0.0")
    private BigDecimal purchasePrice;

    @NotNull
    @DecimalMin("0.0")
    private BigDecimal sellingPrice;

    @NotNull
    @Min(0)
    private Integer quantity;

    @Min(0)
    private Integer reservedQuantity;

    @Min(0)
    private Integer damagedQuantity;

    @NotNull
    @Min(0)
    private Integer minimumStock;

    @NotBlank
    @Size(max = 120)
    private String storageLocation;

    @Size(max = 1000)
    private String description;

    @Size(max = 500)
    private String imageUrl;
}
