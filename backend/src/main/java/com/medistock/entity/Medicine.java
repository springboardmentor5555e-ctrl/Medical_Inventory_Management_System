package com.medistock.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "app_medicines",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_app_medicines_batch_number", columnNames = "batch_number"),
                @UniqueConstraint(name = "uk_app_medicines_barcode", columnNames = "barcode")
        },
        indexes = {
                @Index(name = "idx_app_medicines_name", columnList = "medicine_name"),
                @Index(name = "idx_app_medicines_expiry", columnList = "expiry_date"),
                @Index(name = "idx_app_medicines_supplier", columnList = "supplier_id"),
                @Index(name = "idx_app_medicines_category", columnList = "category_id")
        }
)
public class Medicine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "medicine_name", nullable = false, length = 150)
    private String medicineName;

    @Column(name = "generic_name", nullable = false, length = 150)
    private String genericName;

    @Column(nullable = false, length = 120)
    private String brand;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Column(name = "batch_number", nullable = false, length = 80)
    private String batchNumber;

    @Column(nullable = false, length = 80)
    private String barcode;

    @Column(name = "manufacturing_date", nullable = false)
    private LocalDate manufacturingDate;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(name = "purchase_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal purchasePrice;

    @Column(name = "selling_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal sellingPrice;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "reserved_quantity", nullable = false, columnDefinition = "integer default 0")
    private Integer reservedQuantity;

    @Column(name = "damaged_quantity", nullable = false, columnDefinition = "integer default 0")
    private Integer damagedQuantity;

    @Column(name = "minimum_stock", nullable = false)
    private Integer minimumStock;

    @Column(name = "storage_location", nullable = false, length = 120)
    private String storageLocation;

    @Column(length = 1000)
    private String description;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        if (reservedQuantity == null) {
            reservedQuantity = 0;
        }
        if (damagedQuantity == null) {
            damagedQuantity = 0;
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }
}
