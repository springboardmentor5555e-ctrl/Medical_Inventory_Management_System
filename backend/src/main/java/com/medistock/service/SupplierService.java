package com.medistock.service;

import com.medistock.dto.SupplierDTO;
import com.medistock.entity.Supplier;
import com.medistock.entity.User;
import com.medistock.enums.Role;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.SupplierRepository;
import com.medistock.security.UserPrincipal;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public SupplierService(SupplierRepository supplierRepository) {
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
                return null;
            }
            if (user.getRole() == Role.STAFF) {
                return user.getOwnerId();
            }
            if (user.getRole() == Role.SUPPLIER) {
                return null; // Supplier context handled separately
            }
            return user.getId();
        }
        return null;
    }

    @Transactional(readOnly = true)
    public List<SupplierDTO> getAllSuppliers() {
        Long ownerId = getCurrentOwnerId();
        List<Supplier> list = (ownerId != null) ? supplierRepository.findByOwnerId(ownerId) : supplierRepository.findAll();
        return list.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SupplierDTO getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + id));
        Long ownerId = getCurrentOwnerId();
        if (ownerId != null && !ownerId.equals(supplier.getOwnerId())) {
            throw new AccessDeniedException("You do not have access to this supplier.");
        }
        return mapToDTO(supplier);
    }

    @Transactional
    public SupplierDTO createSupplier(SupplierDTO dto) {
        Long ownerId = getCurrentOwnerId();
        Supplier supplier = Supplier.builder()
                .name(dto.getName())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .address(dto.getAddress())
                .ownerId(ownerId)
                .status("APPROVED") // Local manual suppliers are immediately active
                .build();

        supplier = supplierRepository.save(supplier);
        return mapToDTO(supplier);
    }

    @Transactional
    public SupplierDTO updateSupplier(Long id, SupplierDTO dto) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + id));
        Long ownerId = getCurrentOwnerId();
        if (ownerId != null && !ownerId.equals(supplier.getOwnerId())) {
            throw new AccessDeniedException("You do not have permission to edit this supplier.");
        }

        supplier.setName(dto.getName());
        supplier.setPhone(dto.getPhone());
        supplier.setEmail(dto.getEmail());
        supplier.setAddress(dto.getAddress());

        supplier = supplierRepository.save(supplier);
        return mapToDTO(supplier);
    }

    @Transactional
    public void deleteSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + id));
        Long ownerId = getCurrentOwnerId();
        if (ownerId != null && !ownerId.equals(supplier.getOwnerId())) {
            throw new AccessDeniedException("You do not have permission to delete this supplier.");
        }
        supplierRepository.delete(supplier);
    }

    private SupplierDTO mapToDTO(Supplier supplier) {
        return SupplierDTO.builder()
                .id(supplier.getId())
                .name(supplier.getName())
                .phone(supplier.getPhone())
                .email(supplier.getEmail())
                .address(supplier.getAddress())
                .build();
    }
}
