package com.medistock.service;

import com.medistock.dto.AuthResponse;
import com.medistock.dto.LoginRequest;
import com.medistock.dto.RegisterRequest;
import com.medistock.entity.Supplier;
import com.medistock.entity.User;
import com.medistock.enums.Role;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.SupplierRepository;
import com.medistock.repository.UserRepository;
import com.medistock.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final SupplierRepository supplierRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            UserRepository userRepository,
            SupplierRepository supplierRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.supplierRepository = supplierRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        String initialStatus = "PENDING";
        Long ownerId = null;

        if (request.getRole() == Role.CUSTOMER) {
            initialStatus = "APPROVED";
        } else if (request.getRole() == Role.ADMIN) {
            // Block direct Admin signups if one already exists
            if (userRepository.findByEmail("admin@medistock.com").isPresent()) {
                throw new IllegalArgumentException("Administrator registration is restricted.");
            }
            initialStatus = "APPROVED";
        } else if (request.getRole() == Role.STAFF) {
            if (request.getOwnerEmail() != null && !request.getOwnerEmail().trim().isEmpty()) {
                User owner = userRepository.findByEmail(request.getOwnerEmail().trim())
                        .orElseThrow(() -> new ResourceNotFoundException("Pharmacy owner email not found: " + request.getOwnerEmail()));
                if (owner.getRole() != Role.PHARMACIST) {
                    throw new IllegalArgumentException("Provided email does not belong to a pharmacy owner");
                }
                ownerId = owner.getId();
            } else {
                throw new IllegalArgumentException("Pharmacy owner email is required for staff registration");
            }
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .status(initialStatus)
                .ownerId(ownerId)
                .pharmacyName(request.getPharmacyName())
                .address(request.getAddress())
                .city(request.getCity())
                .phone(request.getPhone())
                .gstNumber(request.getGstNumber())
                .drugLicenseNumber(request.getDrugLicenseNumber())
                .build();

        user = userRepository.save(user);

        // If registering as a Supplier, also insert a record into the suppliers table
        if (request.getRole() == Role.SUPPLIER) {
            Supplier supplier = Supplier.builder()
                    .name(request.getName())
                    .email(request.getEmail())
                    .phone(request.getPhone())
                    .address(request.getAddress())
                    .userId(user.getId())
                    .gstNumber(request.getGstNumber())
                    .drugLicenseNumber(request.getDrugLicenseNumber())
                    .status("PENDING")
                    .build();
            supplierRepository.save(supplier);
        }

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name(), user.getName());
        return new AuthResponse(token, user.getEmail(), user.getName(), user.getRole().name());
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        if ("PENDING".equals(user.getStatus())) {
            throw new IllegalArgumentException("Your account registration is pending approval.");
        }
        if ("BLOCKED".equals(user.getStatus())) {
            throw new IllegalArgumentException("Your account has been blocked by admin.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name(), user.getName());
        return new AuthResponse(token, user.getEmail(), user.getName(), user.getRole().name());
    }

    @Transactional(readOnly = true)
    public User getCurrentUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }
}
