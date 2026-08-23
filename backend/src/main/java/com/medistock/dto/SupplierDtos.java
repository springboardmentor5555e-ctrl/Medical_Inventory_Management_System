package com.medistock.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

public class SupplierDtos {

    @Data
    public static class SupplierRequest {
        @NotBlank
        private String name;
        private String contactNumber;
        private String email;
        private String address;
    }
}
