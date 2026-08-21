package com.medistock.dto;

import java.time.Instant;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SupplierResponse {

    private Long id;
    private String supplierName;
    private String companyName;
    private String email;
    private String phone;
    private String contactPerson;
    private String address;
    private String city;
    private String state;
    private String country;
    private String gstNumber;
    private long activeMedicines;
    private long totalOrders;
    private String performance;
    private Instant createdAt;
    private Instant updatedAt;
}
