package com.medistock.service;

import com.medistock.dto.ReorderRequestDTO;
import com.medistock.entity.*;
import com.medistock.enums.Role;
import com.medistock.enums.ReorderStatus;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.NotificationRepository;
import com.medistock.repository.ReorderRequestRepository;
import com.medistock.repository.SupplierRepository;
import com.medistock.security.UserPrincipal;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReorderRequestService {

    private final ReorderRequestRepository reorderRequestRepository;
    private final MedicineRepository medicineRepository;
    private final SupplierRepository supplierRepository;
    private final NotificationRepository notificationRepository;
    private final TwilioService twilioService;

    public ReorderRequestService(
            ReorderRequestRepository reorderRequestRepository,
            MedicineRepository medicineRepository,
            SupplierRepository supplierRepository,
            NotificationRepository notificationRepository,
            TwilioService twilioService
    ) {
        this.reorderRequestRepository = reorderRequestRepository;
        this.medicineRepository = medicineRepository;
        this.supplierRepository = supplierRepository;
        this.notificationRepository = notificationRepository;
        this.twilioService = twilioService;
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
            return user.getId();
        }
        return null;
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof UserPrincipal) {
            return ((UserPrincipal) principal).getUser().getId();
        }
        return null;
    }

    @Transactional(readOnly = true)
    public List<ReorderRequestDTO> getAllReorders() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return new ArrayList<>();
        }
        User user = ((UserPrincipal) auth.getPrincipal()).getUser();
        List<ReorderRequest> list;
        if (user.getRole() == Role.ADMIN) {
            list = reorderRequestRepository.findAll();
        } else if (user.getRole() == Role.SUPPLIER) {
            list = reorderRequestRepository.findBySupplierId(user.getId());
        } else {
            Long ownerId = getCurrentOwnerId();
            list = reorderRequestRepository.findByOwnerId(ownerId);
        }
        return list.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReorderRequestDTO> getReordersByStatus(ReorderStatus status) {
        Long ownerId = getCurrentOwnerId();
        List<ReorderRequest> list = (ownerId != null) ? reorderRequestRepository.findByOwnerIdAndStatus(ownerId, status) : reorderRequestRepository.findByStatus(status);
        return list.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReorderRequestDTO createReorder(ReorderRequestDTO dto) {
        Long ownerId = getCurrentOwnerId();
        Medicine medicine = medicineRepository.findById(dto.getMedicineId())
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with ID: " + dto.getMedicineId()));

        if (ownerId != null && !ownerId.equals(medicine.getOwnerId())) {
            throw new AccessDeniedException("You do not have access to this medicine.");
        }

        Supplier supplier = null;
        if (dto.getSupplierId() != null) {
            supplier = supplierRepository.findById(dto.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + dto.getSupplierId()));
        } else if (medicine.getSupplier() != null) {
            supplier = medicine.getSupplier();
        }

        ReorderRequest request = ReorderRequest.builder()
                .medicine(medicine)
                .supplier(supplier)
                .quantity(dto.getQuantity())
                .status(ReorderStatus.PENDING)
                .ownerId(ownerId)
                .build();

        request = reorderRequestRepository.save(request);

        String msg = String.format("REORDER REQUEST CREATED: Reorder request generated for %s (Qty: %d) with supplier %s.",
                medicine.getName(),
                dto.getQuantity(),
                supplier != null ? supplier.getName() : "N/A"
        );

        // Save DB Notification for supplier
        if (supplier != null && supplier.getUserId() != null) {
            Notification notification = Notification.builder()
                    .message(msg)
                    .type("REORDER")
                    .isRead(false)
                    .userId(supplier.getUserId())
                    .build();
            notificationRepository.save(notification);
        }

        // WhatsApp Notification
        try {
            twilioService.sendWhatsAppMessage(msg);
        } catch (Exception e) {
            System.err.println("Twilio alert failed to send: " + e.getMessage());
        }

        return mapToDTO(request);
    }

    @Transactional
    public ReorderRequestDTO updateStatus(Long id, ReorderStatus status) {
        ReorderRequest request = reorderRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reorder request not found with ID: " + id));

        ReorderStatus oldStatus = request.getStatus();
        if (oldStatus == ReorderStatus.RECEIVED || oldStatus == ReorderStatus.DELIVERED) {
            throw new IllegalArgumentException("Cannot modify a completed reorder request.");
        }

        request.setStatus(status);
        request = reorderRequestRepository.save(request);

        // If transition to RECEIVED/DELIVERED, increment medicine quantity
        if (status == ReorderStatus.RECEIVED || status == ReorderStatus.DELIVERED) {
            Medicine medicine = request.getMedicine();
            medicine.setQuantity(medicine.getQuantity() + request.getQuantity());
            medicineRepository.save(medicine);

            String restockedMsg = String.format("RESTOCK COMPLETED: Medicine %s has been successfully restocked with %d units. New balance: %d.",
                    medicine.getName(),
                    request.getQuantity(),
                    medicine.getQuantity()
            );

            // DB Notification for Owner
            if (request.getOwnerId() != null) {
                Notification notification = Notification.builder()
                        .message(restockedMsg)
                        .type("REORDER")
                        .isRead(false)
                        .userId(request.getOwnerId())
                        .build();
                notificationRepository.save(notification);
            }

            // WhatsApp Notification
            try {
                twilioService.sendWhatsAppMessage(restockedMsg);
            } catch (Exception e) {
                System.err.println("Twilio alert failed: " + e.getMessage());
            }
        } else {
            String updateMsg = String.format("REORDER STATUS UPDATE: Reorder request for %s (Qty: %d) is now %s.",
                    request.getMedicine().getName(),
                    request.getQuantity(),
                    status.name()
            );
            // DB Notification for Owner
            if (request.getOwnerId() != null) {
                Notification notification = Notification.builder()
                        .message(updateMsg)
                        .type("REORDER")
                        .isRead(false)
                        .userId(request.getOwnerId())
                        .build();
                notificationRepository.save(notification);
            }

            // WhatsApp Notification
            try {
                twilioService.sendWhatsAppMessage(updateMsg);
            } catch (Exception e) {
                System.err.println("Twilio alert failed: " + e.getMessage());
            }
        }

        return mapToDTO(request);
    }

    private ReorderRequestDTO mapToDTO(ReorderRequest request) {
        return ReorderRequestDTO.builder()
                .id(request.getId())
                .medicineId(request.getMedicine().getId())
                .medicineName(request.getMedicine().getName())
                .supplierId(request.getSupplier() != null ? request.getSupplier().getId() : null)
                .supplierName(request.getSupplier() != null ? request.getSupplier().getName() : null)
                .quantity(request.getQuantity())
                .status(request.getStatus())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .build();
    }
}
