package com.medistock.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "coupons")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String type; // FLAT, PERCENTAGE, BOGO, FREE_DELIVERY

    @Column(nullable = false)
    private Double value = 0.0;

    @Column(name = "minimum_amount")
    private Double minimumAmount = 0.0;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "max_usage")
    private Integer maxUsage;

    @Column(name = "used_count")
    @Builder.Default
    private Integer usedCount = 0;

    @Column(name = "max_users")
    private Integer maxUsers;

    @Column(name = "owner_id")
    private Long ownerId; // Pharmacy Owner ID

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}
