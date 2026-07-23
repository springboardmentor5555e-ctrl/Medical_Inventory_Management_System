package com.medistock.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.medistock.enums.Role;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Full Name
    @Column(nullable = false)
    private String name;

    // Unique Email
    @Column(nullable = false, unique = true)
    private String email;

    // Password (ignored in API responses)
    @JsonIgnore
    @Column(nullable = true) // Nullable for OAuth2 users
    private String password;

    // User Role
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // Login Provider: local / google
    @Builder.Default
    @Column(nullable = false)
    private String provider = "local";

    // OAuth Provider ID
    @Column(name = "provider_id")
    private String providerId;

    // Approval status: PENDING, APPROVED, REJECTED, BLOCKED
    @Builder.Default
    @Column(nullable = false)
    private String status = "PENDING";

    // Employer mapping for STAFF users
    @Column(name = "owner_id")
    private Long ownerId;

    @Column(name = "pharmacy_name")
    private String pharmacyName;

    private String address;
    private String city;
    private String phone;

    @Column(name = "gst_number")
    private String gstNumber;

    @Column(name = "drug_license_number")
    private String drugLicenseNumber;

    @Column(name = "bank_details")
    private String bankDetails;

    @Column(name = "upi_id")
    private String upiId;

    @Column(name = "qr_code_url")
    private String qrCodeUrl;

    @Builder.Default
    @Column(name = "cash_enabled")
    private Boolean cashEnabled = true;

    @Builder.Default
    @Column(name = "card_enabled")
    private Boolean cardEnabled = false;

    @Builder.Default
    @Column(name = "upi_enabled")
    private Boolean upiEnabled = false;

    @Builder.Default
    @Column(name = "phonepe_enabled")
    private Boolean phonepeEnabled = false;

    @Builder.Default
    @Column(name = "paytm_enabled")
    private Boolean paytmEnabled = false;

    @Builder.Default
    @Column(name = "gpay_enabled")
    private Boolean gpayEnabled = false;
}