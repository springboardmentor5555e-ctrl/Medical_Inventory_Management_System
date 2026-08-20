package com.medistock.api.dto;

import com.medistock.api.models.UserRole;
import jakarta.validation.constraints.Email;

/**
 * Request body for updating an existing user's role or email.
 */
public class UpdateUserRequest {

    @Email
    private String email;

    private String phoneNumber;

    private UserRole role;

    public UpdateUserRequest() {}

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }
}
