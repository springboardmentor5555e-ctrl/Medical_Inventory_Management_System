package com.medistock.controller;

import com.medistock.dto.MedicineRequest;
import com.medistock.dto.MedicineResponse;
import com.medistock.service.CloudinaryService;
import com.medistock.service.MedicineService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/medicines")
public class MedicineController {

    private final MedicineService medicineService;
    private final CloudinaryService cloudinaryService;

    public MedicineController(MedicineService medicineService, CloudinaryService cloudinaryService) {
        this.medicineService = medicineService;
        this.cloudinaryService = cloudinaryService;
    }

    @GetMapping
    public ResponseEntity<Page<MedicineResponse>> getAllMedicines(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        return ResponseEntity.ok(medicineService.getAllMedicines(search, PageRequest.of(page, size, sort)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicineResponse> getMedicineById(@PathVariable Long id) {
        return ResponseEntity.ok(medicineService.getMedicineById(id));
    }

    @GetMapping("/barcode/{barcode}")
    public ResponseEntity<MedicineResponse> getMedicineByBarcode(@PathVariable String barcode) {
        return ResponseEntity.ok(medicineService.getMedicineByBarcode(barcode));
    }

    @PostMapping
    public ResponseEntity<MedicineResponse> createMedicine(@Valid @RequestBody MedicineRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(medicineService.createMedicine(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicineResponse> updateMedicine(
            @PathVariable Long id,
            @Valid @RequestBody MedicineRequest request
    ) {
        return ResponseEntity.ok(medicineService.updateMedicine(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedicine(@PathVariable Long id) {
        medicineService.deleteMedicine(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<MedicineResponse>> getLowStockMedicines() {
        return ResponseEntity.ok(medicineService.getLowStockMedicines());
    }

    @GetMapping("/expiring")
    public ResponseEntity<List<MedicineResponse>> getExpiringMedicines(@RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(medicineService.getExpiringMedicines(days));
    }

    @PostMapping("/{id}/image")
    public ResponseEntity<MedicineResponse> uploadMedicineImage(
            @PathVariable Long id,
            @RequestParam("image") MultipartFile file
    ) {
        String imageUrl = cloudinaryService.uploadImage(file);
        return ResponseEntity.ok(medicineService.updateMedicineImage(id, imageUrl));
    }
}
