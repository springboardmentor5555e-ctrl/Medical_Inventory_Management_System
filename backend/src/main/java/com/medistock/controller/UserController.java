package com.medistock.controller;

import com.medistock.dto.UserRequest;
import com.medistock.dto.UserResponse;
import com.medistock.service.UserService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public List<UserResponse> findAll() {
        return userService.findAll();
    }

    @PostMapping
    public ResponseEntity<UserResponse> create(@Valid @RequestBody UserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.create(request));
    }

    @PutMapping("/{id}")
    public UserResponse update(@PathVariable Long id, @Valid @RequestBody UserRequest request) {
        return userService.update(id, request);
    }

    @GetMapping("/profile")
    public UserResponse getProfile(java.security.Principal principal) {
        return userService.getProfile(principal.getName());
    }

    @PostMapping("/change-password")
    public ResponseEntity<com.medistock.dto.AuthResponse> changePassword(
            java.security.Principal principal,
            @Valid @RequestBody com.medistock.dto.PasswordChangeRequest request
    ) {
        userService.changePassword(principal.getName(), request);
        return ResponseEntity.ok(com.medistock.dto.AuthResponse.builder()
                .message("Password updated successfully")
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
