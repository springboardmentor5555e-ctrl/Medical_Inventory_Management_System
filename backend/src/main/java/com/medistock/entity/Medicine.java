package com.medistock.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "medicines")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(exclude = {"alternatives"})
@ToString(exclude = {"alternatives"})
public class Medicine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String barcode;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @Column(nullable = false)
    private Integer quantity = 0;

    @Column(nullable = false)
    private Double price = 0.0;

    @Column(name = "batch_number")
    private String batchNumber;

    @Column(name = "manufacturing_date")
    private LocalDate manufacturingDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "reorder_level")
    private Integer reorderLevel = 10;

    @Column(length = 1000)
    private String description;

    @Column(name = "owner_id")
    private Long ownerId;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "medicine_alternatives",
        joinColumns = @JoinColumn(name = "medicine_id"),
        inverseJoinColumns = @JoinColumn(name = "alternative_id")
    )
    @JsonIgnoreProperties("alternatives")
    @Builder.Default
    private Set<Medicine> alternatives = new HashSet<>();
}
