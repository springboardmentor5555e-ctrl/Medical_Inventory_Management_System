package com.medistock.demo.controller;

import com.medistock.demo.entity.User;
import com.medistock.demo.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // =====================================================
    // GET ALL USERS
    // =====================================================

  @GetMapping
public ResponseEntity<List<User>> getAllUsers() {

    return ResponseEntity.ok(
            userRepository.findAll()
    );
}
    // =====================================================
    // GET USER BY ID
    // =====================================================
@GetMapping("/{id}")
public ResponseEntity<?> getUserById(
        @PathVariable Long id
) {

    User user = userRepository.findById(id).orElse(null);

    if (user == null) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body("User not found");
    }

    return ResponseEntity.ok(user);
}

    // =====================================================
    // ADD USER
    // =====================================================

    @PostMapping
    public ResponseEntity<?> createUser(
            @RequestBody User user
    ) {

        try {

            // -------------------------------
            // Validate email
            // -------------------------------

            if (user.getEmail() == null ||
                    user.getEmail().isBlank()) {

                return ResponseEntity
                        .badRequest()
                        .body("Email is required");
            }

            // -------------------------------
            // Validate password
            // -------------------------------

            if (user.getPassword() == null ||
                    user.getPassword().isBlank()) {

                return ResponseEntity
                        .badRequest()
                        .body("Password is required");
            }

            // -------------------------------
            // Validate phone
            // -------------------------------

            if (user.getPhone() == null ||
                    user.getPhone().isBlank()) {

                return ResponseEntity
                        .badRequest()
                        .body("Phone is required");
            }

            // -------------------------------
            // Validate role
            // -------------------------------

            if (user.getRole() == null ||
                    user.getRole().isBlank()) {

                return ResponseEntity
                        .badRequest()
                        .body("Role is required");
            }

            // -------------------------------
            // Check duplicate email
            // -------------------------------

            if (userRepository.existsByEmail(
                    user.getEmail().trim()
            )) {

                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body("Email already exists");
            }

            // -------------------------------
            // Check duplicate phone
            // -------------------------------
if (userRepository.findByPhone(
        user.getPhone().trim()
).isPresent()) {

    return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body("Phone number already exists");
}
            // -------------------------------
            // Normalize values
            // -------------------------------

            user.setEmail(
                    user.getEmail().trim()
            );

            user.setPhone(
                    user.getPhone().trim()
            );

            user.setRole(
                    user.getRole()
                            .trim()
                            .toUpperCase()
            );

            // -------------------------------
            // Encrypt password
            // -------------------------------

            user.setPassword(
                    passwordEncoder.encode(
                            user.getPassword()
                    )
            );

            // -------------------------------
            // Save
            // -------------------------------

            User savedUser =
                    userRepository.save(user);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(savedUser);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "Failed to save user: "
                                    + e.getMessage()
                    );
        }
    }

    // =====================================================
    // UPDATE USER
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long id,
            @RequestBody User updatedUser
    ) {

        try {

            User existingUser =
                    userRepository.findById(id)
                            .orElse(null);

            if (existingUser == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("User not found");
            }

            // -------------------------------
            // Update basic information
            // -------------------------------

            if (updatedUser.getFullName() != null) {

                existingUser.setFullName(
                        updatedUser.getFullName()
                );
            }

            if (updatedUser.getEmail() != null) {

                existingUser.setEmail(
                        updatedUser.getEmail().trim()
                );
            }

            if (updatedUser.getPhone() != null) {

                existingUser.setPhone(
                        updatedUser.getPhone().trim()
                );
            }

            if (updatedUser.getRole() != null &&
                    !updatedUser.getRole().isBlank()) {

                existingUser.setRole(
                        updatedUser.getRole()
                                .trim()
                                .toUpperCase()
                );
            }

            // -------------------------------
            // Update password only if supplied
            // -------------------------------

            if (updatedUser.getPassword() != null &&
                    !updatedUser.getPassword().isBlank()) {

                existingUser.setPassword(
                        passwordEncoder.encode(
                                updatedUser.getPassword()
                        )
                );
            }

            User savedUser =
                    userRepository.save(existingUser);

            return ResponseEntity.ok(savedUser);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "Failed to update user: "
                                    + e.getMessage()
                    );
        }
    }

    // =====================================================
    // DELETE USER
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(
            @PathVariable Long id
    ) {

        try {

            if (!userRepository.existsById(id)) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("User not found");
            }

            userRepository.deleteById(id);

            return ResponseEntity.ok(
                    "User deleted successfully"
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "Failed to delete user: "
                                    + e.getMessage()
                    );
        }
    }
}