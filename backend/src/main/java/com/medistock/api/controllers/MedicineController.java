package com.medistock.api.controllers;

import com.medistock.api.dto.MedicineDTO;
import com.medistock.api.dto.MedicineRequest;
import com.medistock.api.dto.StockAdjustmentRequest;
import com.medistock.api.services.MedicineService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/medicines")
public class MedicineController {

    private final MedicineService medicineService;

    public MedicineController(MedicineService medicineService) {
        this.medicineService = medicineService;
    }

    @GetMapping
    public ResponseEntity<Page<MedicineDTO>> getAllMedicines(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(medicineService.getAllMedicines(name, categoryId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicineDTO> getMedicineById(@PathVariable Long id) {
        return ResponseEntity.ok(medicineService.getMedicineById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<?> createMedicine(@Valid @RequestBody MedicineRequest request) {
        try {
            return ResponseEntity.ok(medicineService.createMedicine(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<?> updateMedicine(@PathVariable Long id, @Valid @RequestBody MedicineRequest request) {
        try {
            return ResponseEntity.ok(medicineService.updateMedicine(id, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteMedicine(@PathVariable Long id) {
        try {
            medicineService.deleteMedicine(id);
            return ResponseEntity.ok(Map.of("message", "Medicine deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/adjust-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<?> adjustStock(
            @Valid @RequestBody StockAdjustmentRequest request,
            Authentication authentication
    ) {
        try {
            MedicineDTO updated = medicineService.adjustStock(request, authentication.getName());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<MedicineDTO>> getLowStockMedicines(
            @RequestParam(defaultValue = "10") int threshold
    ) {
        return ResponseEntity.ok(medicineService.getLowStockMedicines(threshold));
    }

    @GetMapping("/expiring")
    public ResponseEntity<List<MedicineDTO>> getExpiringMedicines(
            @RequestParam(defaultValue = "90") int days
    ) {
        return ResponseEntity.ok(medicineService.getExpiringMedicines(days));
    }

    @GetMapping("/expired")
    public ResponseEntity<List<MedicineDTO>> getExpiredMedicines() {
        return ResponseEntity.ok(medicineService.getExpiredMedicines());
    }

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<List<MedicineDTO>> getMedicinesBySupplier(@PathVariable Long supplierId) {
        return ResponseEntity.ok(medicineService.getMedicinesBySupplier(supplierId));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getDashboardStats(
            @RequestParam(defaultValue = "10") int lowStockThreshold,
            @RequestParam(defaultValue = "90") int expiryDays
    ) {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalMedicines", medicineService.getTotalCount());
        stats.put("lowStockCount", medicineService.getLowStockCount(lowStockThreshold));
        stats.put("expiringCount", medicineService.getExpiringCount(expiryDays));
        return ResponseEntity.ok(stats);
    }
}
