package com.medistock.demo.service;

import com.medistock.demo.dto.AuthResponse;
import com.medistock.demo.dto.LoginRequest;
import com.medistock.demo.dto.RegisterRequest;
import com.medistock.demo.entity.User;
import com.medistock.demo.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

 public AuthService(
        UserRepository userRepository,
        JwtService jwtService,
        PasswordEncoder passwordEncoder,
        EmailService emailService
) {
    this.userRepository = userRepository;
    this.jwtService = jwtService;
    this.passwordEncoder = passwordEncoder;
    this.emailService = emailService;
}
    // =====================================================
    // REGISTER
    // =====================================================

    public AuthResponse register(RegisterRequest req) {

        if (req == null) {
            throw new RuntimeException(
                    "Registration request is required"
            );
        }

        if (req.getEmail() == null ||
                req.getEmail().isBlank()) {

            throw new RuntimeException(
                    "Email is required"
            );
        }

        if (req.getPassword() == null ||
                req.getPassword().isBlank()) {

            throw new RuntimeException(
                    "Password is required"
            );
        }

        if (req.getRole() == null ||
                req.getRole().isBlank()) {

            throw new RuntimeException(
                    "Role is required"
            );
        }

        String email = req.getEmail().trim();

        String role = req.getRole()
                .trim()
                .toUpperCase(Locale.ROOT);

        // -------------------------------------------------
        // CHECK EMAIL
        // -------------------------------------------------

        if (userRepository.findByEmail(email).isPresent()) {

            throw new RuntimeException(
                    "Email already registered"
            );
        }

        // -------------------------------------------------
        // CREATE USER
        // -------------------------------------------------

        User user = new User();

        user.setFullName(req.getFullName());

        user.setEmail(email);

        user.setPhone(req.getPhone());

        user.setPassword(
                passwordEncoder.encode(
                        req.getPassword()
                )
        );

        user.setRole(role);
        // =====================================================
// ADMIN APPROVAL
// =====================================================

if ("ADMIN".equals(role)) {

    user.setApproved(true);

} else {

    user.setApproved(false);
}

        // -------------------------------------------------
        // SAVE USER
        // -------------------------------------------------

        User savedUser =
                userRepository.save(user);

        // -------------------------------------------------
        // GENERATE JWT
        // -------------------------------------------------

        String token =
                jwtService.generateToken(
                        savedUser.getEmail(),
                        role
                );

        // -------------------------------------------------
        // RETURN RESPONSE
        // -------------------------------------------------

        return new AuthResponse(
                token,
                role,
                savedUser.getId()
        );
    }

    // =====================================================
    // LOGIN
    // =====================================================

    public AuthResponse login(LoginRequest req) {

        if (req == null) {

            throw new RuntimeException(
                    "Login request is required"
            );
        }

        if (req.getEmail() == null ||
                req.getEmail().isBlank()) {

            throw new RuntimeException(
                    "Email is required"
            );
        }

        if (req.getPassword() == null ||
                req.getPassword().isBlank()) {

            throw new RuntimeException(
                    "Password is required"
            );
        }

        // -------------------------------------------------
        // FIND USER
        // -------------------------------------------------

        User user =
                userRepository
                        .findByEmail(
                                req.getEmail().trim()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );

        // -------------------------------------------------
        // CHECK ROLE
        // -------------------------------------------------

        if (user.getRole() == null ||
                user.getRole().isBlank()) {

            throw new RuntimeException(
                    "User role missing"
            );
        }

        String userRole =
                user.getRole()
                        .trim()
                        .toUpperCase(
                                Locale.ROOT
                        );

        // -------------------------------------------------
        // NO SECRET CODE
        // -------------------------------------------------
        //
        // ADMIN      → Email + Password
        // PHARMACIST → Email + Password
        // STAFF      → Email + Password
        //
        // No secret code is required for any role.
        // -------------------------------------------------

        // -------------------------------------------------
        // CHECK PASSWORD
        // -------------------------------------------------
// -------------------------------------------------
// CHECK PASSWORD
// -------------------------------------------------

String enteredPassword = req.getPassword();
String storedPassword = user.getPassword();

boolean passwordValid;

// Check whether the database password is already BCrypt
if (storedPassword != null &&
        (storedPassword.startsWith("$2a$") ||
         storedPassword.startsWith("$2b$") ||
         storedPassword.startsWith("$2y$"))) {

    // BCrypt password
    passwordValid = passwordEncoder.matches(
            enteredPassword,
            storedPassword
    );

} else {

    // Existing plain-text password
    passwordValid = enteredPassword.equals(
            storedPassword
    );

    // Automatically convert plain-text password to BCrypt
    if (passwordValid) {

        user.setPassword(
                passwordEncoder.encode(
                        enteredPassword
                )
        );

        userRepository.save(user);
    }
}

if (!passwordValid) {

    throw new RuntimeException(
            "Invalid Password"
    );
}
        // -------------------------------------------------
        // GENERATE JWT
        // -------------------------------------------------

        String token =
                jwtService.generateToken(
                        user.getEmail(),
                        userRole
                );

        // -------------------------------------------------
        // RETURN RESPONSE
        // -------------------------------------------------

        return new AuthResponse(
                token,
                userRole,
                user.getId()
        );
    }
    // =====================================================
// FORGOT PASSWORD
// =====================================================

public void forgotPassword(String email) {

    if (email == null || email.isBlank()) {
        throw new RuntimeException("Email is required");
    }

    String cleanEmail = email.trim();

    User user = userRepository
            .findByEmail(cleanEmail)
            .orElseThrow(() ->
                    new RuntimeException(
                            "No account found with this email"
                    )
            );

    // Generate temporary password
    String temporaryPassword =
            "Medi@" + (int)(Math.random() * 900000 + 100000);

    // Save encrypted password
    user.setPassword(
            passwordEncoder.encode(
                    temporaryPassword
            )
    );

    userRepository.save(user);

    // Send new password to email
    emailService.sendForgotPasswordEmail(
            cleanEmail,
            temporaryPassword
    );
}
}