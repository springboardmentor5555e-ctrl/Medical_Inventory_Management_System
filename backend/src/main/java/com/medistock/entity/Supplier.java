package com.medistock.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "suppliers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String contactNumber;

    private String email;

    private String address;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    // Intentionally no cascade = ALL here: deleting a supplier must never
    // cascade-delete its medicines. See SupplierService.delete().
    @JsonIgnore
    @OneToMany(mappedBy = "supplier")
    private List<Medicine> medicines;
}
