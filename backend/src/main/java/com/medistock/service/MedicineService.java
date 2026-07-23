package com.medistock.service;

import com.medistock.dto.CategoryDTO;
import com.medistock.dto.MedicineRequest;
import com.medistock.dto.MedicineResponse;
import com.medistock.dto.SupplierDTO;
import com.medistock.entity.Category;
import com.medistock.entity.Medicine;
import com.medistock.entity.Supplier;
import com.medistock.entity.User;
import com.medistock.enums.Role;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.CategoryRepository;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.SupplierRepository;
import com.medistock.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class MedicineService {

    private final MedicineRepository medicineRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;

    public MedicineService(
            MedicineRepository medicineRepository,
            CategoryRepository categoryRepository,
            SupplierRepository supplierRepository
    ) {
        this.medicineRepository = medicineRepository;
        this.categoryRepository = categoryRepository;
        this.supplierRepository = supplierRepository;
    }

    private Long getCurrentOwnerId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof UserPrincipal) {
            User user = ((UserPrincipal) principal).getUser();
            if (user.getRole() == Role.ADMIN) {
                return null; // Admin sees all data
            }
            if (user.getRole() == Role.STAFF) {
                return user.getOwnerId(); // Staff works on behalf of owner
            }
            return user.getId(); // Owner/Pharmacist
        }
        return null;
    }

    @Transactional(readOnly = true)
    public Page<MedicineResponse> getAllMedicines(String search, Pageable pageable) {
        Long ownerId = getCurrentOwnerId();
        Page<Medicine> medicines;
        if (ownerId != null) {
            if (search != null && !search.trim().isEmpty()) {
                medicines = medicineRepository.searchMedicinesAndOwner(search.trim(), ownerId, pageable);
            } else {
                medicines = medicineRepository.findByOwnerId(ownerId, pageable);
            }
        } else {
            if (search != null && !search.trim().isEmpty()) {
                medicines = medicineRepository.searchMedicines(search.trim(), pageable);
            } else {
                medicines = medicineRepository.findAll(pageable);
            }
        }
        return medicines.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public MedicineResponse getMedicineById(Long id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with ID: " + id));
        Long ownerId = getCurrentOwnerId();
        if (ownerId != null && !ownerId.equals(medicine.getOwnerId())) {
            throw new AccessDeniedException("You do not have access to this medicine.");
        }
        return mapToResponse(medicine);
    }

    @Transactional(readOnly = true)
    public MedicineResponse getMedicineByBarcode(String barcode) {
        Long ownerId = getCurrentOwnerId();
        Medicine medicine;
        if (ownerId != null) {
            medicine = medicineRepository.findByBarcodeAndOwnerId(barcode, ownerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with barcode: " + barcode));
        } else {
            medicine = medicineRepository.findByBarcode(barcode)
                    .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with barcode: " + barcode));
        }
        return mapToResponse(medicine);
    }

    @Transactional
    public MedicineResponse createMedicine(MedicineRequest request) {
        Long ownerId = getCurrentOwnerId();
        if (ownerId != null && request.getBarcode() != null && !request.getBarcode().trim().isEmpty()
                && medicineRepository.existsByBarcodeAndOwnerId(request.getBarcode(), ownerId)) {
            throw new IllegalArgumentException("Medicine with barcode '" + request.getBarcode() + "' already exists in your inventory");
        }

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + request.getCategoryId()));
        }

        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + request.getSupplierId()));
        }

        Medicine medicine = Medicine.builder()
                .name(request.getName())
                .barcode(request.getBarcode() != null ? request.getBarcode().trim() : null)
                .category(category)
                .supplier(supplier)
                .quantity(request.getQuantity() != null ? request.getQuantity() : 0)
                .price(request.getPrice() != null ? request.getPrice() : 0.0)
                .batchNumber(request.getBatchNumber())
                .manufacturingDate(request.getManufacturingDate())
                .expiryDate(request.getExpiryDate())
                .reorderLevel(request.getReorderLevel() != null ? request.getReorderLevel() : 10)
                .description(request.getDescription())
                .ownerId(ownerId)
                .build();

        if (request.getAlternativeIds() != null && !request.getAlternativeIds().isEmpty()) {
            Set<Medicine> alternatives = new HashSet<>(medicineRepository.findAllById(request.getAlternativeIds()));
            medicine.setAlternatives(alternatives);
        }

        medicine = medicineRepository.save(medicine);
        return mapToResponse(medicine);
    }

    @Transactional
    public MedicineResponse updateMedicine(Long id, MedicineRequest request) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with ID: " + id));
        Long ownerId = getCurrentOwnerId();
        if (ownerId != null && !ownerId.equals(medicine.getOwnerId())) {
            throw new AccessDeniedException("You do not have permission to edit this medicine.");
        }

        if (request.getBarcode() != null && !request.getBarcode().trim().isEmpty()) {
            String newBarcode = request.getBarcode().trim();
            if (ownerId != null) {
                if (!newBarcode.equals(medicine.getBarcode()) && medicineRepository.existsByBarcodeAndOwnerId(newBarcode, ownerId)) {
                    throw new IllegalArgumentException("Medicine with barcode '" + newBarcode + "' already exists");
                }
            } else {
                if (!newBarcode.equals(medicine.getBarcode()) && medicineRepository.existsByBarcode(newBarcode)) {
                    throw new IllegalArgumentException("Medicine with barcode '" + newBarcode + "' already exists");
                }
            }
            medicine.setBarcode(newBarcode);
        } else {
            medicine.setBarcode(null);
        }

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + request.getCategoryId()));
        }
        medicine.setCategory(category);

        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + request.getSupplierId()));
        }
        medicine.setSupplier(supplier);

        medicine.setName(request.getName());
        medicine.setQuantity(request.getQuantity() != null ? request.getQuantity() : 0);
        medicine.setPrice(request.getPrice() != null ? request.getPrice() : 0.0);
        medicine.setBatchNumber(request.getBatchNumber());
        medicine.setManufacturingDate(request.getManufacturingDate());
        medicine.setExpiryDate(request.getExpiryDate());
        medicine.setReorderLevel(request.getReorderLevel() != null ? request.getReorderLevel() : 10);
        medicine.setDescription(request.getDescription());

        if (request.getAlternativeIds() != null) {
            Set<Medicine> alternatives = new HashSet<>(medicineRepository.findAllById(request.getAlternativeIds()));
            medicine.setAlternatives(alternatives);
        } else {
            medicine.getAlternatives().clear();
        }

        medicine = medicineRepository.save(medicine);
        return mapToResponse(medicine);
    }

    @Transactional
    public void deleteMedicine(Long id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with ID: " + id));
        Long ownerId = getCurrentOwnerId();
        if (ownerId != null && !ownerId.equals(medicine.getOwnerId())) {
            throw new AccessDeniedException("You do not have permission to delete this medicine.");
        }
        medicineRepository.delete(medicine);
    }

    @Transactional
    public MedicineResponse updateMedicineImage(Long id, String imageUrl) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with ID: " + id));
        Long ownerId = getCurrentOwnerId();
        if (ownerId != null && !ownerId.equals(medicine.getOwnerId())) {
            throw new AccessDeniedException("You do not have permission to edit this medicine.");
        }
        medicine.setImageUrl(imageUrl);
        medicine = medicineRepository.save(medicine);
        return mapToResponse(medicine);
    }

    @Transactional(readOnly = true)
    public List<MedicineResponse> getLowStockMedicines() {
        Long ownerId = getCurrentOwnerId();
        List<Medicine> list = (ownerId != null) ? medicineRepository.findLowStockMedicinesByOwner(ownerId) : medicineRepository.findLowStockMedicines();
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MedicineResponse> getExpiringMedicines(int daysAhead) {
        Long ownerId = getCurrentOwnerId();
        LocalDate limitDate = LocalDate.now().plusDays(daysAhead);
        List<Medicine> list = (ownerId != null) ? medicineRepository.findExpiringMedicinesByOwner(ownerId, limitDate) : medicineRepository.findExpiringMedicines(limitDate);
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private MedicineResponse mapToResponse(Medicine medicine) {
        CategoryDTO categoryDTO = null;
        if (medicine.getCategory() != null) {
            categoryDTO = CategoryDTO.builder()
                    .id(medicine.getCategory().getId())
                    .name(medicine.getCategory().getName())
                    .description(medicine.getCategory().getDescription())
                    .build();
        }

        SupplierDTO supplierDTO = null;
        if (medicine.getSupplier() != null) {
            supplierDTO = SupplierDTO.builder()
                    .id(medicine.getSupplier().getId())
                    .name(medicine.getSupplier().getName())
                    .phone(medicine.getSupplier().getPhone())
                    .email(medicine.getSupplier().getEmail())
                    .address(medicine.getSupplier().getAddress())
                    .build();
        }

        Set<MedicineResponse.MedicineSummary> alternatives = new HashSet<>();
        if (medicine.getAlternatives() != null) {
            alternatives = medicine.getAlternatives().stream()
                    .map(alt -> MedicineResponse.MedicineSummary.builder()
                            .id(alt.getId())
                            .name(alt.getName())
                            .barcode(alt.getBarcode())
                            .build())
                    .collect(Collectors.toSet());
        }

        return MedicineResponse.builder()
                .id(medicine.getId())
                .name(medicine.getName())
                .barcode(medicine.getBarcode())
                .category(categoryDTO)
                .supplier(supplierDTO)
                .quantity(medicine.getQuantity())
                .price(medicine.getPrice())
                .batchNumber(medicine.getBatchNumber())
                .manufacturingDate(medicine.getManufacturingDate())
                .expiryDate(medicine.getExpiryDate())
                .imageUrl(medicine.getImageUrl())
                .reorderLevel(medicine.getReorderLevel())
                .description(medicine.getDescription())
                .alternatives(alternatives)
                .build();
    }
}
