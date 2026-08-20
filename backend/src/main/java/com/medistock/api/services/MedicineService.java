package com.medistock.api.services;

import com.medistock.api.dto.MedicineDTO;
import com.medistock.api.dto.MedicineRequest;
import com.medistock.api.dto.StockAdjustmentRequest;
import com.medistock.api.models.*;
import com.medistock.api.repositories.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MedicineService {

    private final MedicineRepository medicineRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final StockLogRepository stockLogRepository;
    private final UserRepository userRepository;

    public MedicineService(
            MedicineRepository medicineRepository,
            CategoryRepository categoryRepository,
            SupplierRepository supplierRepository,
            StockLogRepository stockLogRepository,
            UserRepository userRepository
    ) {
        this.medicineRepository = medicineRepository;
        this.categoryRepository = categoryRepository;
        this.supplierRepository = supplierRepository;
        this.stockLogRepository = stockLogRepository;
        this.userRepository = userRepository;
    }

    public Page<MedicineDTO> getAllMedicines(String name, Long categoryId, Pageable pageable) {
        String safeName = (name == null) ? "" : name;
        Long safeCategoryId = (categoryId == null) ? -1L : categoryId;
        return medicineRepository.findByFilters(safeName, safeCategoryId, pageable)
                .map(MedicineDTO::fromEntity);
    }

    public MedicineDTO getMedicineById(Long id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + id));
        return MedicineDTO.fromEntity(medicine);
    }

    @Transactional
    public MedicineDTO createMedicine(MedicineRequest request) {
        Medicine medicine = new Medicine();
        mapRequestToEntity(request, medicine);
        return MedicineDTO.fromEntity(medicineRepository.save(medicine));
    }

    @Transactional
    public MedicineDTO updateMedicine(Long id, MedicineRequest request) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + id));
        mapRequestToEntity(request, medicine);
        return MedicineDTO.fromEntity(medicineRepository.save(medicine));
    }

    @Transactional
    public void deleteMedicine(Long id) {
        if (!medicineRepository.existsById(id)) {
            throw new RuntimeException("Medicine not found with id: " + id);
        }
        medicineRepository.deleteById(id);
    }

    @Transactional
    public MedicineDTO adjustStock(StockAdjustmentRequest request, String username) {
        Medicine medicine = medicineRepository.findById(request.getMedicineId())
                .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + request.getMedicineId()));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        if (request.getMovementType() == StockMovementType.OUT) {
            if (medicine.getQuantity() < request.getQuantity()) {
                throw new RuntimeException("Insufficient stock. Available: " + medicine.getQuantity());
            }
            medicine.setQuantity(medicine.getQuantity() - request.getQuantity());
        } else {
            medicine.setQuantity(medicine.getQuantity() + request.getQuantity());
        }

        Medicine saved = medicineRepository.save(medicine);

        StockLog log = new StockLog(medicine, user, request.getMovementType(),
                request.getQuantity(), request.getReason());
        stockLogRepository.save(log);

        return MedicineDTO.fromEntity(saved);
    }

    @Transactional
    public void adjustStockByName(String medicineName, int quantity, StockMovementType type, String reason, String username, Supplier supplier) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        
        // Find existing or create placeholder
        Medicine medicine = medicineRepository.findFirstByNameIgnoreCase(medicineName)
                .orElseGet(() -> {
                    Medicine newMed = new Medicine();
                    newMed.setName(medicineName);
                    newMed.setQuantity(0);
                    newMed.setPrice(0.0);
                    newMed.setSupplier(supplier);
                    return medicineRepository.save(newMed);
                });

        if (type == StockMovementType.OUT) {
            if (medicine.getQuantity() < quantity) {
                throw new RuntimeException("Insufficient stock. Available: " + medicine.getQuantity());
            }
            medicine.setQuantity(medicine.getQuantity() - quantity);
        } else {
            medicine.setQuantity(medicine.getQuantity() + quantity);
        }

        medicine = medicineRepository.save(medicine);

        StockLog log = new StockLog(medicine, user, type, quantity, reason);
        stockLogRepository.save(log);
    }

    public List<MedicineDTO> getLowStockMedicines(int threshold) {
        return medicineRepository.findByQuantityLessThanEqual(threshold)
                .stream()
                .map(MedicineDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<MedicineDTO> getExpiringMedicines(int daysAhead) {
        LocalDate today = LocalDate.now();
        LocalDate endDate = today.plusDays(daysAhead);
        return medicineRepository.findExpiringBetween(today, endDate)
                .stream()
                .map(MedicineDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<MedicineDTO> getExpiredMedicines() {
        return medicineRepository.findByExpiryDateBefore(LocalDate.now())
                .stream()
                .map(MedicineDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<MedicineDTO> getMedicinesBySupplier(Long supplierId) {
        return medicineRepository.findBySupplierId(supplierId)
                .stream()
                .map(MedicineDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public long getTotalCount() {
        return medicineRepository.count();
    }

    public long getLowStockCount(int threshold) {
        return medicineRepository.countByQuantityLessThanEqual(threshold);
    }

    public long getExpiringCount(int daysAhead) {
        LocalDate today = LocalDate.now();
        LocalDate endDate = today.plusDays(daysAhead);
        return medicineRepository.countExpiringBetween(today, endDate);
    }

    private void mapRequestToEntity(MedicineRequest request, Medicine medicine) {
        medicine.setName(request.getName());
        medicine.setBatchNumber(request.getBatchNumber());
        medicine.setQuantity(request.getQuantity());
        medicine.setManufacturingDate(request.getManufacturingDate());
        medicine.setExpiryDate(request.getExpiryDate());
        medicine.setPrice(request.getPrice());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + request.getCategoryId()));
            medicine.setCategory(category);
        } else {
            medicine.setCategory(null);
        }

        if (request.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + request.getSupplierId()));
            medicine.setSupplier(supplier);
        } else {
            medicine.setSupplier(null);
        }
    }
}
