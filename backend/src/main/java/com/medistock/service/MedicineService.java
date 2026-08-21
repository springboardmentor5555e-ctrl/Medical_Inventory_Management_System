package com.medistock.service;

import com.medistock.dto.MedicineRequest;
import com.medistock.dto.MedicineResponse;
import com.medistock.dto.PageResponse;
import com.medistock.dto.StockLogResponse;
import com.medistock.dto.StockMutationRequest;
import com.medistock.entity.Category;
import com.medistock.entity.Medicine;
import com.medistock.entity.NotificationType;
import com.medistock.entity.StockLog;
import com.medistock.entity.StockMovementType;
import com.medistock.entity.Supplier;
import com.medistock.exception.BadRequestException;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.CategoryRepository;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.StockLogRepository;
import jakarta.persistence.criteria.Predicate;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class MedicineService {

    private final MedicineRepository medicineRepository;
    private final CategoryRepository categoryRepository;
    private final StockLogRepository stockLogRepository;
    private final SupplierService supplierService;
    private final InventoryMapper mapper;
    private final AuditService auditService;
    private final ExpiryService expiryService;
    private final NotificationService notificationService;

    @Value("${app.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST','STAFF')")
    public PageResponse<MedicineResponse> findAll(
            String search,
            Long supplierId,
            String category,
            String status,
            int page,
            int size,
            String sortBy,
            String direction
    ) {
        Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
        Page<Medicine> medicines = medicineRepository.findAll(
                filters(search, supplierId, category, status),
                PageRequest.of(page, size, sort)
        );
        return PageResponse.<MedicineResponse>builder()
                .content(medicines.getContent().stream().map(mapper::toMedicineResponse).toList())
                .page(medicines.getNumber())
                .size(medicines.getSize())
                .totalElements(medicines.getTotalElements())
                .totalPages(medicines.getTotalPages())
                .last(medicines.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST','STAFF')")
    public MedicineResponse findById(Long id) {
        return mapper.toMedicineResponse(getMedicine(id));
    }

    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public MedicineResponse create(MedicineRequest request) {
        validateDates(request);
        if (medicineRepository.existsByBatchNumberIgnoreCase(request.getBatchNumber())) {
            throw new BadRequestException("Batch number already exists");
        }
        if (medicineRepository.existsByBarcodeIgnoreCase(request.getBarcode())) {
            throw new BadRequestException("Barcode already exists");
        }
        Medicine medicine = new Medicine();
        apply(request, medicine);
        Medicine saved = medicineRepository.save(medicine);
        saveStockLog(saved, StockMovementType.STOCK_IN, saved.getQuantity(), 0, saved.getQuantity(), "Initial stock");
        auditService.record("CREATE", "Medicine", saved.getId(), "Created medicine " + saved.getMedicineName());
        notificationService.create(
                NotificationType.MEDICINE_ADDED,
                saved.getId(),
                "Medicine added",
                saved.getMedicineName() + " was added to inventory",
                true,
                medicineEmailDetails(saved)
        );
        expiryService.scanNow();
        return mapper.toMedicineResponse(saved);
    }

    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public MedicineResponse update(Long id, MedicineRequest request) {
        validateDates(request);
        Medicine medicine = getMedicine(id);
        apply(request, medicine);
        Medicine saved = medicineRepository.save(medicine);
        auditService.record("UPDATE", "Medicine", saved.getId(), "Updated medicine " + saved.getMedicineName());
        notificationService.create(
                NotificationType.MEDICINE_UPDATED,
                saved.getId(),
                "Medicine updated",
                saved.getMedicineName() + " details were updated",
                true,
                medicineEmailDetails(saved)
        );
        expiryService.scanNow();
        return mapper.toMedicineResponse(saved);
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(Long id) {
        Medicine medicine = getMedicine(id);
        stockLogRepository.deleteByMedicineId(id);
        medicineRepository.delete(medicine);
        auditService.record("DELETE", "Medicine", id, "Deleted medicine " + medicine.getMedicineName());
        notificationService.create(
                NotificationType.MEDICINE_DELETED,
                id,
                "Medicine deleted",
                medicine.getMedicineName() + " was deleted from inventory",
                true,
                medicineEmailDetails(medicine)
        );
    }

    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST','STAFF')")
    public MedicineResponse mutateStock(Long id, StockMutationRequest request) {
        Medicine medicine = getMedicine(id);
        int previous = medicine.getQuantity();
        int next = switch (request.getType()) {
            case STOCK_IN -> previous + request.getQuantity();
            case STOCK_OUT -> previous - request.getQuantity();
            case ADJUSTMENT -> request.getQuantity();
            case RESERVE -> previous;
            case RELEASE_RESERVATION -> previous;
            case MARK_DAMAGED -> previous;
        };
        if (next < 0) {
            throw new BadRequestException("Stock cannot become negative");
        }
        applyInventoryBuckets(medicine, request);
        medicine.setQuantity(next);
        Medicine saved = medicineRepository.save(medicine);
        saveStockLog(saved, request.getType(), request.getQuantity(), previous, next, request.getReason());
        auditService.record("STOCK_" + request.getType().name(), "Medicine", saved.getId(), request.getReason());
        expiryService.scanNow();
        return mapper.toMedicineResponse(saved);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST','STAFF')")
    public PageResponse<StockLogResponse> stockLogs(Long medicineId, int page, int size) {
        Page<StockLog> logs = medicineId == null
                ? stockLogRepository.findAll(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")))
                : stockLogRepository.findByMedicineId(medicineId, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return PageResponse.<StockLogResponse>builder()
                .content(logs.getContent().stream().map(mapper::toStockLogResponse).toList())
                .page(logs.getNumber())
                .size(logs.getSize())
                .totalElements(logs.getTotalElements())
                .totalPages(logs.getTotalPages())
                .last(logs.isLast())
                .build();
    }

    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public int importCsv(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("CSV file is empty");
        }
        int imported = 0;
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line = reader.readLine();
            while ((line = reader.readLine()) != null) {
                String[] columns = line.split(",", -1);
                if (columns.length < 14) {
                    throw new BadRequestException("Invalid CSV row: " + line);
                }
                MedicineRequest request = new MedicineRequest();
                request.setMedicineName(columns[0].trim());
                request.setGenericName(columns[1].trim());
                request.setBrand(columns[2].trim());
                request.setCategory(columns[3].trim());
                request.setSupplierId(Long.parseLong(columns[4].trim()));
                request.setBatchNumber(columns[5].trim());
                request.setBarcode(columns[6].trim());
                request.setManufacturingDate(LocalDate.parse(columns[7].trim()));
                request.setExpiryDate(LocalDate.parse(columns[8].trim()));
                request.setPurchasePrice(new BigDecimal(columns[9].trim()));
                request.setSellingPrice(new BigDecimal(columns[10].trim()));
                request.setQuantity(Integer.parseInt(columns[11].trim()));
                request.setMinimumStock(Integer.parseInt(columns[12].trim()));
                request.setStorageLocation(columns[13].trim());
                request.setDescription(columns.length > 14 ? columns[14].trim() : null);
                create(request);
                imported++;
            }
        } catch (IOException | NumberFormatException ex) {
            throw new BadRequestException("Unable to import CSV: " + ex.getMessage());
        }
        return imported;
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public String exportCsv() {
        StringBuilder csv = new StringBuilder("medicineName,genericName,brand,category,supplier,batchNumber,barcode,manufacturingDate,expiryDate,purchasePrice,sellingPrice,quantity,minimumStock,storageLocation,status\n");
        medicineRepository.findAll(Sort.by("medicineName")).forEach(m -> csv
                .append(m.getMedicineName()).append(',')
                .append(m.getGenericName()).append(',')
                .append(m.getBrand()).append(',')
                .append(m.getCategory().getName()).append(',')
                .append(m.getSupplier().getSupplierName()).append(',')
                .append(m.getBatchNumber()).append(',')
                .append(m.getBarcode()).append(',')
                .append(m.getManufacturingDate()).append(',')
                .append(m.getExpiryDate()).append(',')
                .append(m.getPurchasePrice()).append(',')
                .append(m.getSellingPrice()).append(',')
                .append(m.getQuantity()).append(',')
                .append(m.getMinimumStock()).append(',')
                .append(m.getStorageLocation()).append(',')
                .append(mapper.resolveStatus(m)).append('\n'));
        return csv.toString();
    }

    public Medicine getMedicine(Long id) {
        return medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found: " + id));
    }

    private void apply(MedicineRequest request, Medicine medicine) {
        Category category = categoryRepository.findByNameIgnoreCase(request.getCategory().trim())
                .orElseGet(() -> categoryRepository.save(Category.builder().name(request.getCategory().trim()).build()));
        Supplier supplier = supplierService.getSupplier(request.getSupplierId());
        medicine.setMedicineName(request.getMedicineName().trim());
        medicine.setGenericName(request.getGenericName().trim());
        medicine.setBrand(request.getBrand().trim());
        medicine.setCategory(category);
        medicine.setSupplier(supplier);
        medicine.setBatchNumber(request.getBatchNumber().trim());
        medicine.setBarcode(request.getBarcode().trim());
        medicine.setManufacturingDate(request.getManufacturingDate());
        medicine.setExpiryDate(request.getExpiryDate());
        medicine.setPurchasePrice(request.getPurchasePrice());
        medicine.setSellingPrice(request.getSellingPrice());
        medicine.setQuantity(request.getQuantity());
        medicine.setReservedQuantity(request.getReservedQuantity() == null ? 0 : request.getReservedQuantity());
        medicine.setDamagedQuantity(request.getDamagedQuantity() == null ? 0 : request.getDamagedQuantity());
        medicine.setMinimumStock(request.getMinimumStock());
        medicine.setStorageLocation(request.getStorageLocation().trim());
        medicine.setDescription(request.getDescription());
        medicine.setImageUrl(request.getImageUrl());
    }

    private void saveStockLog(Medicine medicine, StockMovementType type, int quantity, int previous, int next, String reason) {
        stockLogRepository.save(StockLog.builder()
                .medicine(medicine)
                .type(type)
                .quantity(quantity)
                .previousQuantity(previous)
                .newQuantity(next)
                .reason(reason)
                .build());
    }

    private void applyInventoryBuckets(Medicine medicine, StockMutationRequest request) {
        int quantity = request.getQuantity();
        int reserved = medicine.getReservedQuantity() == null ? 0 : medicine.getReservedQuantity();
        int damaged = medicine.getDamagedQuantity() == null ? 0 : medicine.getDamagedQuantity();
        int available = mapper.availableQuantity(medicine);

        switch (request.getType()) {
            case RESERVE -> {
                if (quantity > available) {
                    throw new BadRequestException("Cannot reserve more than available quantity");
                }
                medicine.setReservedQuantity(reserved + quantity);
            }
            case RELEASE_RESERVATION -> medicine.setReservedQuantity(Math.max(0, reserved - quantity));
            case MARK_DAMAGED -> {
                if (quantity > available) {
                    throw new BadRequestException("Cannot mark more damaged stock than available quantity");
                }
                medicine.setDamagedQuantity(damaged + quantity);
            }
            default -> {
            }
        }
    }

    private void validateDates(MedicineRequest request) {
        if (!request.getExpiryDate().isAfter(request.getManufacturingDate())) {
            throw new BadRequestException("Expiry date must be after manufacturing date");
        }
    }

    private Map<String, String> medicineEmailDetails(Medicine medicine) {
        Map<String, String> details = new LinkedHashMap<>();
        details.put("Medicine Name", medicine.getMedicineName());
        details.put("Supplier Name", medicine.getSupplier().getSupplierName());
        details.put("Batch Number", medicine.getBatchNumber());
        details.put("Quantity", String.valueOf(medicine.getQuantity()));
        details.put("Minimum Stock", String.valueOf(medicine.getMinimumStock()));
        details.put("Expiry Date", String.valueOf(medicine.getExpiryDate()));
        details.put("Direct Link", frontendBaseUrl + "/?view=Medicines&medicineId=" + medicine.getId());
        return details;
    }

    private Specification<Medicine> filters(String search, Long supplierId, String category, String status) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isBlank()) {
                String like = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("medicineName")), like),
                        cb.like(cb.lower(root.get("genericName")), like),
                        cb.like(cb.lower(root.get("brand")), like),
                        cb.like(cb.lower(root.get("batchNumber")), like),
                        cb.like(cb.lower(root.get("barcode")), like)
                ));
            }
            if (supplierId != null) {
                predicates.add(cb.equal(root.get("supplier").get("id"), supplierId));
            }
            if (category != null && !category.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("category").get("name")), category.toLowerCase()));
            }
            Predicate base = cb.and(predicates.toArray(Predicate[]::new));
            if (status == null || status.isBlank()) {
                return base;
            }
            LocalDate today = LocalDate.now();
            Predicate statusPredicate = switch (status.toUpperCase()) {
                case "EXPIRED" -> cb.lessThan(root.get("expiryDate"), today);
                case "OUT_OF_STOCK" -> cb.equal(root.get("quantity"), 0);
                case "LOW_STOCK" -> cb.and(cb.greaterThan(root.get("quantity"), 0), cb.lessThanOrEqualTo(root.get("quantity"), root.get("minimumStock")));
                case "NEAR_EXPIRY" -> cb.between(root.get("expiryDate"), today, today.plusDays(45));
                default -> cb.conjunction();
            };
            return cb.and(base, statusPredicate);
        };
    }
}
