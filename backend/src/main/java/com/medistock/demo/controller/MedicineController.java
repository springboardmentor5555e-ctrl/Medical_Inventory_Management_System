package com.medistock.demo.controller;

import com.medistock.demo.entity.Medicine;
import com.medistock.demo.service.MedicineService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/medicines")
@CrossOrigin(
        origins = "http://localhost:3000",
        allowedHeaders = "*",
        methods = {
                RequestMethod.GET,
                RequestMethod.POST,
                RequestMethod.PUT,
                RequestMethod.DELETE,
                RequestMethod.OPTIONS
        }
)
public class MedicineController {

    private final MedicineService medicineService;

    public MedicineController(MedicineService medicineService) {

        this.medicineService = medicineService;

    }


    // =====================================================
    // GET ALL MEDICINES
    // GET /api/medicines
    // ADMIN + PHARMACIST + STAFF
    // =====================================================

    @GetMapping
    public ResponseEntity<List<Medicine>> getAll() {

        List<Medicine> medicines =
                medicineService.getAllMedicines();

        return ResponseEntity.ok(medicines);

    }


// =====================================================
// DASHBOARD SUMMARY
// =====================================================

@GetMapping("/dashboard-summary")
public ResponseEntity<?> getDashboardSummary() {

    Map<String, Object> summary = new HashMap<>();

    summary.put(
            "totalMedicines",
            medicineService.getTotalMedicines()
    );

    summary.put(
            "totalStock",
            medicineService.getTotalStock()
    );

    summary.put(
            "lowStockMedicines",
            medicineService.getLowStockCount()
    );

    summary.put(
            "expiredMedicines",
            medicineService.getExpiredCount()
    );

    summary.put(
            "inventoryValue",
            medicineService.getInventoryValue()
    );

    return ResponseEntity.ok(summary);
}


    // =====================================================
    // GET MEDICINE BY ID
    // GET /api/medicines/1
    // =====================================================

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<Medicine> getById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                medicineService.getMedicineById(id)
        );

    }


    // =====================================================
    // ADD MEDICINE
    // POST /api/medicines
    // ADMIN ONLY
    // =====================================================

    @PostMapping
    public ResponseEntity<Medicine> addMedicine(
            @RequestBody Medicine medicine
    ) {

        Medicine saved =
                medicineService.saveMedicine(medicine);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(saved);

    }


    // =====================================================
    // UPDATE MEDICINE
    // PUT /api/medicines/1
    // ADMIN ONLY
    // =====================================================

    @PutMapping("/{id:\\d+}")
    public ResponseEntity<Medicine> update(
            @PathVariable Long id,
            @RequestBody Medicine medicine
    ) {

        Medicine updated =
                medicineService.updateMedicine(
                        id,
                        medicine
                );

        return ResponseEntity.ok(updated);

    }


    // =====================================================
    // DELETE MEDICINE
    // DELETE /api/medicines/1
    // ADMIN ONLY
    // =====================================================

    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<?> delete(
            @PathVariable Long id
    ) {

        try {

            medicineService.deleteMedicine(id);

            return ResponseEntity.ok(
                    "Medicine deleted successfully"
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(e.getMessage());

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "Error deleting medicine: "
                                    + e.getMessage()
                    );

        }

    }


    // =====================================================
    // LOW STOCK MEDICINES
    // GET /api/medicines/low-stock
    // =====================================================

    @GetMapping("/low-stock")
    public ResponseEntity<List<Medicine>> lowStock() {

        return ResponseEntity.ok(
                medicineService.getLowStockMedicines()
        );

    }


    // =====================================================
    // LOW STOCK COUNT
    // GET /api/medicines/low-stock/count
    // =====================================================

    @GetMapping("/low-stock/count")
    public ResponseEntity<Long> lowStockCount() {

        return ResponseEntity.ok(
                medicineService.getLowStockCount()
        );

    }


    // =====================================================
    // EXPIRY ALERTS
    // GET /api/medicines/expiry-alerts
    // =====================================================

    @GetMapping("/expiry-alerts")
    public ResponseEntity<List<Medicine>> expiryAlerts() {

        return ResponseEntity.ok(
                medicineService.getNearExpiryMedicines()
        );

    }


    // =====================================================
    // EXPIRED MEDICINES
    // GET /api/medicines/expired
    // =====================================================

    @GetMapping("/expired")
    public ResponseEntity<List<Medicine>> expired() {

        return ResponseEntity.ok(
                medicineService.getExpiredMedicines()
        );

    }


    // =====================================================
    // EXPIRED COUNT
    // GET /api/medicines/expired/count
    // =====================================================

    @GetMapping("/expired/count")
    public ResponseEntity<Long> expiredCount() {

        return ResponseEntity.ok(
                medicineService.getExpiredCount()
        );

    }


    // =====================================================
    // SEARCH
    // GET /api/medicines/search?keyword=paracetamol
    // =====================================================

    @GetMapping("/search")
    public ResponseEntity<List<Medicine>> search(
            @RequestParam String keyword
    ) {

        return ResponseEntity.ok(
                medicineService.searchMedicine(keyword)
        );

    }


    // =====================================================
    // CATEGORY FILTER
    // GET /api/medicines/category/tablet
    // =====================================================

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Medicine>> category(
            @PathVariable String category
    ) {

        return ResponseEntity.ok(
                medicineService.filterByCategory(category)
        );

    }


    // =====================================================
    // TOTAL MEDICINES
    // GET /api/medicines/count
    // =====================================================

    @GetMapping("/count")
    public ResponseEntity<Long> count() {

        return ResponseEntity.ok(
                medicineService.getTotalMedicines()
        );

    }


    // =====================================================
    // TOTAL STOCK
    // GET /api/medicines/stock
    // =====================================================

    @GetMapping("/stock")
    public ResponseEntity<Long> stock() {

        return ResponseEntity.ok(
                medicineService.getTotalStock()
        );

    }


    // =====================================================
    // INVENTORY VALUE
    // GET /api/medicines/value
    // =====================================================

    @GetMapping("/value")
    public ResponseEntity<Double> inventoryValue() {

        return ResponseEntity.ok(
                medicineService.getInventoryValue()
        );

    }

}