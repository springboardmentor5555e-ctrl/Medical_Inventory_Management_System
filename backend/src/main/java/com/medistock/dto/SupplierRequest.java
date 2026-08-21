package com.medistock.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SupplierRequest {

    @NotBlank
    @Size(max = 120)
    private String supplierName;

    @NotBlank
    @Size(max = 150)
    private String companyName;

    @NotBlank
    @Email
    @Size(max = 150)
    private String email;

    @NotBlank
    @Size(max = 30)
    private String phone;

    @Size(max = 120)
    private String contactPerson;

    @NotBlank
    @Size(max = 250)
    private String address;

    @NotBlank
    @Size(max = 80)
    private String city;

    @NotBlank
    @Size(max = 80)
    private String state;

    @NotBlank
    @Size(max = 80)
    private String country;

    @Size(max = 30)
    private String gstNumber;
}
