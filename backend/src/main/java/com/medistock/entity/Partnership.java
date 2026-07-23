package com.medistock.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "partnerships")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Partnership {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "pharmacy_owner_id", nullable = false)
    private Long pharmacyOwnerId;

    @Column(name = "supplier_id", nullable = false)
    private Long supplierId; // references User with Role.SUPPLIER

    @Column(nullable = false)
    @Builder.Default
    private String status = "PENDING"; // PENDING, ACCEPTED, REJECTED, CANCELLED

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
