package com.medistock.controller;

import com.medistock.entity.Medicine;
import com.medistock.entity.User;
import com.medistock.enums.Role;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    private final UserRepository userRepository;
    private final MedicineRepository medicineRepository;

    public CustomerController(UserRepository userRepository, MedicineRepository medicineRepository) {
        this.userRepository = userRepository;
        this.medicineRepository = medicineRepository;
    }

    @GetMapping("/pharmacies")
    public ResponseEntity<List<User>> searchPharmacies(@RequestParam(required = false) String search) {
        List<User> owners = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.PHARMACIST && "APPROVED".equals(u.getStatus()))
                .filter(u -> {
                    if (search == null || search.trim().isEmpty()) {
                        return true;
                    }
                    String term = search.toLowerCase();
                    boolean matchName = u.getPharmacyName() != null && u.getPharmacyName().toLowerCase().contains(term);
                    boolean matchCity = u.getCity() != null && u.getCity().toLowerCase().contains(term);
                    boolean matchOwner = u.getName().toLowerCase().contains(term);
                    return matchName || matchCity || matchOwner;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(owners);
    }

    @GetMapping("/pharmacies/{ownerId}/medicines")
    public ResponseEntity<List<Medicine>> getPharmacyMedicines(@PathVariable Long ownerId) {
        // Query database directly for medicines belonging to pharmacy ownerId
        List<Medicine> medicines = medicineRepository.findByOwnerId(ownerId, PageRequest.of(0, 1000)).getContent();
        return ResponseEntity.ok(medicines);
    }
}
