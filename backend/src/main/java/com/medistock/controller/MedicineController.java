package com.medistock.controller;

import com.medistock.dto.MedicineDtos.MedicineRequest;
import com.medistock.dto.MedicineDtos.StockAdjustmentRequest;
import com.medistock.entity.Medicine;
import com.medistock.entity.StockLog;
import com.medistock.service.MedicineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/medicines")
@RequiredArgsConstructor
public class MedicineController {

    private final MedicineService medicineService;

    @GetMapping
    public ResponseEntity<List<Medicine>> search(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) String batchNumber,
            @RequestParam(required = false) String stockStatus,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate expiryBefore
    ) {
        return ResponseEntity.ok(medicineService.search(name, categoryId, supplierId, batchNumber, stockStatus, expiryBefore));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Medicine> getById(@PathVariable Long id) {
        return ResponseEntity.ok(medicineService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<Medicine> create(@Valid @RequestBody MedicineRequest request) {
        return ResponseEntity.ok(medicineService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<Medicine> update(@PathVariable Long id, @Valid @RequestBody MedicineRequest request) {
        return ResponseEntity.ok(medicineService.update(id, request));
    }

    @PatchMapping("/{id}/stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST', 'STAFF')")
    public ResponseEntity<Medicine> adjustStock(@PathVariable Long id,
                                                 @Valid @RequestBody StockAdjustmentRequest request,
                                                 Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(medicineService.adjustStock(id, request, email));
    }

    @GetMapping("/{id}/stock-history")
    public ResponseEntity<List<StockLog>> stockHistory(@PathVariable Long id) {
        return ResponseEntity.ok(medicineService.getStockHistory(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        medicineService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/alerts/low-stock")
    public ResponseEntity<List<Medicine>> lowStock(@RequestParam(defaultValue = "20") int threshold) {
        return ResponseEntity.ok(medicineService.getLowStock(threshold));
    }

    @GetMapping("/alerts/expiring-soon")
    public ResponseEntity<List<Medicine>> expiringSoon(@RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(medicineService.getExpiringSoon(days));
    }

    @GetMapping("/alerts/expired")
    public ResponseEntity<List<Medicine>> expired() {
        return ResponseEntity.ok(medicineService.getExpired());
    }
}
