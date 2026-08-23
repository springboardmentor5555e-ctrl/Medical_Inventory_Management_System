package com.medistock.service;

import com.medistock.dto.MedicineDtos.MedicineRequest;
import com.medistock.dto.MedicineDtos.StockAdjustmentRequest;
import com.medistock.entity.*;
import com.medistock.exception.BadRequestException;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.CategoryRepository;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.StockLogRepository;
import com.medistock.repository.SupplierRepository;
import com.medistock.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicineService {

    private final MedicineRepository medicineRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final StockLogRepository stockLogRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public List<Medicine> search(String name, Long categoryId, Long supplierId, String batchNumber,
                                  String stockStatus, LocalDate expiryBefore) {

        Specification<Medicine> spec = Specification.where(null);

        if (name != null && !name.isBlank()) {
            String pattern = "%" + name.toLowerCase() + "%";
            spec = spec.and((root, q, cb) -> cb.like(cb.lower(root.get("name")), pattern));
        }
        if (batchNumber != null && !batchNumber.isBlank()) {
            String pattern = "%" + batchNumber.toLowerCase() + "%";
            spec = spec.and((root, q, cb) -> cb.like(cb.lower(root.get("batchNumber")), pattern));
        }
        if (categoryId != null) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("category").get("id"), categoryId));
        }
        if (supplierId != null) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("supplier").get("id"), supplierId));
        }
        if (expiryBefore != null) {
            spec = spec.and((root, q, cb) -> cb.lessThanOrEqualTo(root.get("expiryDate"), expiryBefore));
        }
        if (stockStatus != null) {
            switch (stockStatus.toUpperCase()) {
                case "LOW_STOCK" -> spec = spec.and((root, q, cb) ->
                        cb.lessThanOrEqualTo(root.get("quantity"), root.get("lowStockThreshold")));
                case "OUT_OF_STOCK" -> spec = spec.and((root, q, cb) -> cb.lessThanOrEqualTo(root.get("quantity"), 0));
                case "EXPIRED" -> spec = spec.and((root, q, cb) -> cb.lessThan(root.get("expiryDate"), LocalDate.now()));
                default -> { /* IN_STOCK or unknown -> no extra filter */ }
            }
        }

        return medicineRepository.findAll(spec);
    }

    public Medicine getById(Long id) {
        return medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found: " + id));
    }

    public Medicine create(MedicineRequest request) {
        if (medicineRepository.existsByBatchNumber(request.getBatchNumber())) {
            throw new BadRequestException("A medicine with batch number '" + request.getBatchNumber() + "' already exists");
        }

        Category category = request.getCategoryId() != null
                ? categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + request.getCategoryId()))
                : null;

        Supplier supplier = request.getSupplierId() != null
                ? supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found: " + request.getSupplierId()))
                : null;

        Medicine medicine = Medicine.builder()
                .name(request.getName())
                .batchNumber(request.getBatchNumber())
                .category(category)
                .supplier(supplier)
                .quantity(request.getQuantity())
                .manufacturingDate(request.getManufacturingDate())
                .expiryDate(request.getExpiryDate())
                .price(request.getPrice())
                .lowStockThreshold(request.getLowStockThreshold() != null ? request.getLowStockThreshold() : 20)
                .build();

        Medicine saved = medicineRepository.save(medicine);

        logStock(saved, StockLog.StockAction.INITIAL, saved.getQuantity(), saved.getQuantity(), "Initial stock on creation", null);
        notificationService.checkStockAlerts(saved);
        notificationService.checkExpiryAlerts(saved);

        return saved;
    }

    public Medicine update(Long id, MedicineRequest request) {
        Medicine existing = getById(id);

        Category category = request.getCategoryId() != null
                ? categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + request.getCategoryId()))
                : null;

        Supplier supplier = request.getSupplierId() != null
                ? supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found: " + request.getSupplierId()))
                : null;

        existing.setName(request.getName());
        existing.setBatchNumber(request.getBatchNumber());
        existing.setCategory(category);
        existing.setSupplier(supplier);
        existing.setQuantity(request.getQuantity());
        existing.setManufacturingDate(request.getManufacturingDate());
        existing.setExpiryDate(request.getExpiryDate());
        existing.setPrice(request.getPrice());
        if (request.getLowStockThreshold() != null) {
            existing.setLowStockThreshold(request.getLowStockThreshold());
        }

        Medicine saved = medicineRepository.save(existing);
        notificationService.checkStockAlerts(saved);
        notificationService.checkExpiryAlerts(saved);
        return saved;
    }

    public Medicine adjustStock(Long id, StockAdjustmentRequest request, String performedByEmail) {
        Medicine medicine = getById(id);
        int newQuantity = medicine.getQuantity() + request.getQuantityChange();
        if (newQuantity < 0) {
            throw new BadRequestException("Resulting stock cannot be negative");
        }
        medicine.setQuantity(newQuantity);
        Medicine saved = medicineRepository.save(medicine);

        StockLog.StockAction action = request.getQuantityChange() >= 0
                ? StockLog.StockAction.STOCK_IN
                : StockLog.StockAction.STOCK_OUT;

        User performedBy = performedByEmail != null ? userRepository.findByEmail(performedByEmail).orElse(null) : null;
        logStock(saved, action, request.getQuantityChange(), newQuantity, request.getNote(), performedBy);

        notificationService.checkStockAlerts(saved);

        return saved;
    }

    public void delete(Long id) {
        if (!medicineRepository.existsById(id)) {
            throw new ResourceNotFoundException("Medicine not found: " + id);
        }
        medicineRepository.deleteById(id);
    }

    public List<Medicine> getLowStock(int threshold) {
        return medicineRepository.findByQuantityLessThanEqual(threshold);
    }

    public List<Medicine> getExpiringSoon(int days) {
        return medicineRepository.findByExpiryDateBetween(LocalDate.now(), LocalDate.now().plusDays(days));
    }

    public List<Medicine> getExpired() {
        return medicineRepository.findByExpiryDateBefore(LocalDate.now());
    }

    public List<Medicine> getAll() {
        return medicineRepository.findAll();
    }

    public List<StockLog> getStockHistory(Long medicineId) {
        return stockLogRepository.findByMedicineIdOrderByTimestampDesc(medicineId);
    }

    public List<StockLog> getRecentStockActivity(int limit) {
        return stockLogRepository.findAllByOrderByTimestampDesc().stream().limit(limit).toList();
    }

    private void logStock(Medicine medicine, StockLog.StockAction action, Integer quantityChanged,
                           Integer resultingQuantity, String note, User performedBy) {
        StockLog log = StockLog.builder()
                .medicine(medicine)
                .action(action)
                .quantityChanged(quantityChanged)
                .resultingQuantity(resultingQuantity)
                .note(note)
                .performedBy(performedBy)
                .build();
        stockLogRepository.save(log);
    }
}
