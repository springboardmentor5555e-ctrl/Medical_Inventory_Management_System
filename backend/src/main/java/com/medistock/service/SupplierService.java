package com.medistock.service;

import com.medistock.dto.PageResponse;
import com.medistock.dto.SupplierRequest;
import com.medistock.dto.SupplierResponse;
import com.medistock.entity.NotificationType;
import com.medistock.entity.Supplier;
import com.medistock.exception.BadRequestException;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.SupplierRepository;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final MedicineRepository medicineRepository;
    private final InventoryMapper mapper;
    private final AuditService auditService;
    private final NotificationService notificationService;

    @Value("${app.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public PageResponse<SupplierResponse> findAll(String search, int page, int size, String sortBy, String direction) {
        Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
        String cleanedSearch = clean(search);
        PageRequest pageRequest = PageRequest.of(page, size, sort);
        Page<Supplier> suppliers = cleanedSearch == null
                ? supplierRepository.findAll(pageRequest)
                : supplierRepository.search(cleanedSearch, pageRequest);
        return toPageResponse(suppliers);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public SupplierResponse findById(Long id) {
        Supplier supplier = getSupplier(id);
        long activeMedicines = medicineRepository.countBySupplierId(id);
        return mapper.toSupplierResponse(supplier, activeMedicines, 0);
    }

    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public SupplierResponse create(SupplierRequest request) {
        validateUnique(request, null);
        Supplier supplier = new Supplier();
        apply(request, supplier);
        Supplier saved = supplierRepository.save(supplier);
        auditService.record("CREATE", "Supplier", saved.getId(), "Created supplier " + saved.getSupplierName());
        notificationService.create(
                NotificationType.SUPPLIER_ADDED,
                null,
                "Supplier added",
                saved.getSupplierName() + " was added to the supplier network",
                true,
                supplierEmailDetails(saved)
        );
        return mapper.toSupplierResponse(saved, 0, 0);
    }

    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public SupplierResponse update(Long id, SupplierRequest request) {
        Supplier supplier = getSupplier(id);
        validateUnique(request, supplier.getId());
        apply(request, supplier);
        Supplier saved = supplierRepository.save(supplier);
        auditService.record("UPDATE", "Supplier", saved.getId(), "Updated supplier " + saved.getSupplierName());
        notificationService.create(
                NotificationType.SUPPLIER_UPDATED,
                null,
                "Supplier updated",
                saved.getSupplierName() + " details were updated",
                true,
                supplierEmailDetails(saved)
        );
        return mapper.toSupplierResponse(saved, 0, 0);
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(Long id) {
        Supplier supplier = getSupplier(id);
        boolean inUse = medicineRepository.countBySupplierId(id) > 0;
        if (inUse) {
            throw new BadRequestException("Supplier is linked to medicines and cannot be deleted");
        }
        supplierRepository.delete(supplier);
        auditService.record("DELETE", "Supplier", id, "Deleted supplier " + supplier.getSupplierName());
        notificationService.create(
                NotificationType.SUPPLIER_DELETED,
                null,
                "Supplier deleted",
                supplier.getSupplierName() + " was deleted from the supplier network",
                true,
                supplierEmailDetails(supplier)
        );
    }

    public Supplier getSupplier(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found: " + id));
    }

    private void validateUnique(SupplierRequest request, Long currentId) {
        supplierRepository.findByEmailIgnoreCase(request.getEmail())
                .filter(s -> currentId == null || !s.getId().equals(currentId))
                .ifPresent(s -> {
                    throw new BadRequestException("Supplier email already exists");
                });
        if (request.getGstNumber() != null && !request.getGstNumber().isBlank()) {
            supplierRepository.findByGstNumberIgnoreCase(request.getGstNumber())
                    .filter(s -> currentId == null || !s.getId().equals(currentId))
                    .ifPresent(s -> {
                        throw new BadRequestException("GST number already exists");
                    });
        }
    }

    private void apply(SupplierRequest request, Supplier supplier) {
        supplier.setSupplierName(request.getSupplierName().trim());
        supplier.setCompanyName(request.getCompanyName().trim());
        supplier.setEmail(request.getEmail().trim().toLowerCase());
        supplier.setPhone(request.getPhone().trim());
        supplier.setContactPerson(cleanOptional(request.getContactPerson()));
        supplier.setAddress(request.getAddress().trim());
        supplier.setCity(request.getCity().trim());
        supplier.setState(request.getState().trim());
        supplier.setCountry(request.getCountry().trim());
        supplier.setGstNumber(request.getGstNumber() == null ? null : request.getGstNumber().trim().toUpperCase());
    }

    private PageResponse<SupplierResponse> toPageResponse(Page<Supplier> page) {
        return PageResponse.<SupplierResponse>builder()
                .content(page.getContent().stream()
                        .map(supplier -> mapper.toSupplierResponse(supplier, 0, 0))
                        .toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    private String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String cleanOptional(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private Map<String, String> supplierEmailDetails(Supplier supplier) {
        Map<String, String> details = new LinkedHashMap<>();
        details.put("Medicine Name", "Not applicable");
        details.put("Supplier Name", supplier.getSupplierName());
        details.put("Batch Number", "Not applicable");
        details.put("Quantity", "Not applicable");
        details.put("Minimum Stock", "Not applicable");
        details.put("Expiry Date", "Not applicable");
        details.put("Direct Link", frontendBaseUrl + "/?view=Suppliers&supplierId=" + supplier.getId());
        return details;
    }
}
