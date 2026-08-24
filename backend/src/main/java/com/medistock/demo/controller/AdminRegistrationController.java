package com.medistock.demo.controller;

import com.medistock.demo.entity.User;
import com.medistock.demo.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/registration-requests")
public class AdminRegistrationController {

    private final UserRepository userRepository;

    public AdminRegistrationController(
            UserRepository userRepository
    ) {
        this.userRepository = userRepository;
    }

    // GET PENDING STAFF / PHARMACIST REQUESTS

    @GetMapping
    public ResponseEntity<List<User>> getPendingRequests() {

        List<User> users =
                userRepository.findByApprovedFalseAndRoleIn(
                        List.of(
                                "STAFF",
                                "PHARMACIST"
                        )
                );

        return ResponseEntity.ok(users);
    }

    // APPROVE USER
@PutMapping("/{userId}/approve")
public ResponseEntity<String> approveRegistration(
        @PathVariable Long userId
) {

    User user = userRepository
            .findById(userId)
            .orElseThrow(() ->
                    new RuntimeException(
                            "User not found"
                    )
            );

    user.setApproved(true);

    userRepository.save(user);

    return ResponseEntity.ok(
            "User approved successfully"
    );
}
}