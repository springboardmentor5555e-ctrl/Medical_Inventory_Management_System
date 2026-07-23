package com.medistock.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "suppliers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Supplier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String phone;

    private String email;

    private String address;

    @Column(name = "gst_number")
    private String gstNumber;

    @Column(name = "drug_license_number")
    private String drugLicenseNumber;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "owner_id")
    private Long ownerId;

    private String status;
}
