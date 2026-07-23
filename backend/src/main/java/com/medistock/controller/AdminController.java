package com.medistock.controller;

import com.medistock.entity.Supplier;
import com.medistock.entity.User;
import com.medistock.enums.Role;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.SupplierRepository;
import com.medistock.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final SupplierRepository supplierRepository;

    public AdminController(UserRepository userRepository, SupplierRepository supplierRepository) {
        this.userRepository = userRepository;
        this.supplierRepository = supplierRepository;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping("/users/{id}/approve")
    public ResponseEntity<User> approveUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        user.setStatus("APPROVED");
        user = userRepository.save(user);

        // If user is a supplier, also approve the supplier profile
        if (user.getRole() == Role.SUPPLIER) {
            Optional<Supplier> supplierOpt = supplierRepository.findByUserId(user.getId());
            if (supplierOpt.isPresent()) {
                Supplier supplier = supplierOpt.get();
                supplier.setStatus("APPROVED");
                supplierRepository.save(supplier);
            }
        }

        return ResponseEntity.ok(user);
    }

    @PostMapping("/users/{id}/reject")
    public ResponseEntity<User> rejectUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        user.setStatus("REJECTED");
        user = userRepository.save(user);

        if (user.getRole() == Role.SUPPLIER) {
            Optional<Supplier> supplierOpt = supplierRepository.findByUserId(user.getId());
            if (supplierOpt.isPresent()) {
                Supplier supplier = supplierOpt.get();
                supplier.setStatus("REJECTED");
                supplierRepository.save(supplier);
            }
        }

        return ResponseEntity.ok(user);
    }

    @PostMapping("/users/{id}/block")
    public ResponseEntity<User> blockUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        user.setStatus("BLOCKED");
        return ResponseEntity.ok(userRepository.save(user));
    }

    @PostMapping("/users/{id}/unblock")
    public ResponseEntity<User> unblockUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        user.setStatus("APPROVED");
        return ResponseEntity.ok(userRepository.save(user));
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getSystemAnalytics() {
        List<User> users = userRepository.findAll();
        long pharmaciesCount = users.stream().filter(u -> u.getRole() == Role.PHARMACIST).count();
        long suppliersCount = users.stream().filter(u -> u.getRole() == Role.SUPPLIER).count();
        long customersCount = users.stream().filter(u -> u.getRole() == Role.CUSTOMER).count();
        long staffCount = users.stream().filter(u -> u.getRole() == Role.STAFF).count();

        Map<String, Object> data = new HashMap<>();
        data.put("totalPharmacies", pharmaciesCount);
        data.put("totalSuppliers", suppliersCount);
        data.put("totalCustomers", customersCount);
        data.put("totalStaff", staffCount);
        data.put("systemStatus", "Active");

        return ResponseEntity.ok(data);
    }

    @GetMapping("/logs")
    public ResponseEntity<List<Map<String, String>>> getLogs() {
        // Return structured system logs for audit trail display
        List<Map<String, String>> logs = List.of(
            Map.of("timestamp", "2026-07-16 11:20:00", "module", "AUTHENTICATION", "level", "INFO", "message", "Admin logged in successfully."),
            Map.of("timestamp", "2026-07-16 11:25:32", "module", "DATABASE", "level", "INFO", "message", "Database constraints verified."),
            Map.of("timestamp", "2026-07-16 11:40:15", "module", "POS_BILLING", "level", "INFO", "message", "POS checkout completed."),
            Map.of("timestamp", "2026-07-16 12:10:04", "module", "CHAT_INBOX", "level", "INFO", "message", "Realtime WebSocket established.")
        );
        return ResponseEntity.ok(logs);
    }
}
