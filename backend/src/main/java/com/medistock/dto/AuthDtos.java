package com.medistock.dto;

import com.medistock.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AuthDtos {

    @Data
    public static class RegisterRequest {
        @NotBlank
        private String fullName;
        @NotBlank @Email
        private String email;
        @NotBlank
        private String password;
        private Role role; // optional, defaults to STAFF
    }

    @Data
    public static class LoginRequest {
        @NotBlank @Email
        private String email;
        @NotBlank
        private String password;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthResponse {
        private String token;
        private Long userId;
        private String email;
        private String fullName;
        private String role;
    }
}
