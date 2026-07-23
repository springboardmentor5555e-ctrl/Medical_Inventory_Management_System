package com.medistock.service;

import com.medistock.entity.Partnership;
import com.medistock.entity.Supplier;
import com.medistock.entity.User;
import com.medistock.enums.Role;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.PartnershipRepository;
import com.medistock.repository.SupplierRepository;
import com.medistock.repository.UserRepository;
import com.medistock.security.UserPrincipal;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PartnershipService {

    private final PartnershipRepository partnershipRepository;
    private final UserRepository userRepository;
    private final SupplierRepository supplierRepository;

    public PartnershipService(
            PartnershipRepository partnershipRepository,
            UserRepository userRepository,
            SupplierRepository supplierRepository
    ) {
        this.partnershipRepository = partnershipRepository;
        this.userRepository = userRepository;
        this.supplierRepository = supplierRepository;
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new AccessDeniedException("User not authenticated");
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof UserPrincipal) {
            return ((UserPrincipal) principal).getUser();
        }
        throw new AccessDeniedException("User principal not found");
    }

    @Transactional
    public Partnership sendPartnershipRequest(String supplierEmail) {
        User owner = getCurrentUser();
        if (owner.getRole() != Role.PHARMACIST) {
            throw new AccessDeniedException("Only pharmacy owners can send partnership requests");
        }

        User supplierUser = userRepository.findByEmail(supplierEmail.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with email: " + supplierEmail));

        if (supplierUser.getRole() != Role.SUPPLIER) {
            throw new IllegalArgumentException("Target user is not registered as a supplier");
        }

        // Check if partnership already exists
        Optional<Partnership> existing = partnershipRepository.findByPharmacyOwnerIdAndSupplierId(owner.getId(), supplierUser.getId());
        if (existing.isPresent()) {
            Partnership p = existing.get();
            if ("ACCEPTED".equals(p.getStatus())) {
                throw new IllegalArgumentException("Partnership is already active");
            } else if ("PENDING".equals(p.getStatus())) {
                throw new IllegalArgumentException("Partnership request is already pending approval");
            } else {
                p.setStatus("PENDING");
                return partnershipRepository.save(p);
            }
        }

        // Create new
        Partnership partnership = Partnership.builder()
                .pharmacyOwnerId(owner.getId())
                .supplierId(supplierUser.getId())
                .status("PENDING")
                .build();

        return partnershipRepository.save(partnership);
    }

    @Transactional
    public Partnership acceptPartnershipRequest(Long partnershipId) {
        User supplierUser = getCurrentUser();
        if (supplierUser.getRole() != Role.SUPPLIER) {
            throw new AccessDeniedException("Only suppliers can accept partnership requests");
        }

        Partnership partnership = partnershipRepository.findById(partnershipId)
                .orElseThrow(() -> new ResourceNotFoundException("Partnership request not found with ID: " + partnershipId));

        if (!partnership.getSupplierId().equals(supplierUser.getId())) {
            throw new AccessDeniedException("You are not authorized to accept this request");
        }

        partnership.setStatus("ACCEPTED");
        partnership = partnershipRepository.save(partnership);

        // Link supplier record to pharmacy owner as a local supplier
        Optional<User> ownerOpt = userRepository.findById(partnership.getPharmacyOwnerId());
        if (ownerOpt.isPresent()) {
            User owner = ownerOpt.get();
            // Check if local supplier record already exists
            Optional<Supplier> localSupOpt = supplierRepository.findByEmailAndOwnerId(supplierUser.getEmail(), owner.getId());
            if (localSupOpt.isEmpty()) {
                Supplier localSupplier = Supplier.builder()
                        .name(supplierUser.getName())
                        .email(supplierUser.getEmail())
                        .phone(supplierUser.getPhone())
                        .address(supplierUser.getAddress())
                        .gstNumber(supplierUser.getGstNumber())
                        .drugLicenseNumber(supplierUser.getDrugLicenseNumber())
                        .userId(supplierUser.getId())
                        .ownerId(owner.getId())
                        .status("APPROVED")
                        .build();
                supplierRepository.save(localSupplier);
            }
        }

        return partnership;
    }

    @Transactional
    public Partnership rejectPartnershipRequest(Long partnershipId) {
        User supplierUser = getCurrentUser();
        if (supplierUser.getRole() != Role.SUPPLIER) {
            throw new AccessDeniedException("Only suppliers can reject partnership requests");
        }

        Partnership partnership = partnershipRepository.findById(partnershipId)
                .orElseThrow(() -> new ResourceNotFoundException("Partnership request not found with ID: " + partnershipId));

        if (!partnership.getSupplierId().equals(supplierUser.getId())) {
            throw new AccessDeniedException("You are not authorized to reject this request");
        }

        partnership.setStatus("REJECTED");
        return partnershipRepository.save(partnership);
    }

    @Transactional
    public Partnership cancelPartnership(Long partnershipId) {
        User user = getCurrentUser();
        Partnership partnership = partnershipRepository.findById(partnershipId)
                .orElseThrow(() -> new ResourceNotFoundException("Partnership not found with ID: " + partnershipId));

        if (!partnership.getPharmacyOwnerId().equals(user.getId()) && !partnership.getSupplierId().equals(user.getId())) {
            throw new AccessDeniedException("You are not a party to this partnership");
        }

        partnership.setStatus("CANCELLED");
        partnership = partnershipRepository.save(partnership);

        // Delete/Disable local supplier mappings
        if (partnership.getPharmacyOwnerId() != null) {
            Optional<User> supplierUserOpt = userRepository.findById(partnership.getSupplierId());
            if (supplierUserOpt.isPresent()) {
                Optional<Supplier> localSup = supplierRepository.findByEmailAndOwnerId(supplierUserOpt.get().getEmail(), partnership.getPharmacyOwnerId());
                localSup.ifPresent(supplierRepository::delete);
            }
        }

        return partnership;
    }

    @Transactional(readOnly = true)
    public List<Partnership> getPartnerships() {
        User user = getCurrentUser();
        if (user.getRole() == Role.ADMIN) {
            return partnershipRepository.findAll();
        } else if (user.getRole() == Role.SUPPLIER) {
            return partnershipRepository.findBySupplierId(user.getId());
        } else {
            // Pharmacist or Staff
            Long ownerId = (user.getRole() == Role.STAFF) ? user.getOwnerId() : user.getId();
            return partnershipRepository.findByPharmacyOwnerId(ownerId);
        }
    }
}
