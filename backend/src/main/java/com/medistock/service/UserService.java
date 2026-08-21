package com.medistock.service;

import com.medistock.dto.UserRequest;
import com.medistock.dto.UserResponse;
import com.medistock.entity.Role;
import com.medistock.entity.User;
import com.medistock.exception.BadRequestException;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.RoleRepository;
import com.medistock.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> findAll() {
        return userRepository.findAll(Sort.by(Sort.Direction.ASC, "name")).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse create(UserRequest request) {
        String email = cleanEmail(request.getEmail());
        userRepository.findByEmailIgnoreCase(email).ifPresent(user -> {
            throw new BadRequestException("User email already exists");
        });
        User user = new User();
        apply(request, user, true);
        User saved = userRepository.save(user);
        auditService.record("CREATE", "User", saved.getId(), "Created user " + saved.getEmail());
        return toResponse(saved);
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse update(Long id, UserRequest request) {
        User user = getUser(id);
        String email = cleanEmail(request.getEmail());
        userRepository.findByEmailIgnoreCase(email)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new BadRequestException("User email already exists");
                });
        apply(request, user, false);
        User saved = userRepository.save(user);
        auditService.record("UPDATE", "User", saved.getId(), "Updated user " + saved.getEmail());
        return toResponse(saved);
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(Long id) {
        User user = getUser(id);
        if ("ADMIN".equals(user.getRole().getName()) && userRepository.countByRoleName("ADMIN") <= 1) {
            throw new BadRequestException("At least one admin user must remain active");
        }
        userRepository.delete(user);
        auditService.record("DELETE", "User", id, "Deleted user " + user.getEmail());
    }

    private void apply(UserRequest request, User user, boolean requirePassword) {
        if (requirePassword && (request.getPassword() == null || request.getPassword().isBlank())) {
            throw new BadRequestException("Password is required");
        }
        Role role = roleRepository.findByName(request.getRole().trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + request.getRole()));
        user.setName(request.getName().trim());
        user.setEmail(cleanEmail(request.getEmail()));
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        user.setRole(role);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST','STAFF')")
    public UserResponse getProfile(String email) {
        User user = userRepository.findByEmailIgnoreCase(cleanEmail(email))
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        return toResponse(user);
    }

    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST','STAFF')")
    public void changePassword(String email, com.medistock.dto.PasswordChangeRequest request) {
        User user = userRepository.findByEmailIgnoreCase(cleanEmail(email))
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password does not match");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        auditService.record("PASSWORD_CHANGE", "User", user.getId(), "Password updated for " + user.getEmail());
    }

    private User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().getName())
                .build();
    }

    private String cleanEmail(String email) {
        return email.trim().toLowerCase();
    }
}
