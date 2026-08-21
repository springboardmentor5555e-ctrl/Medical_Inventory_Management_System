package com.medistock.service;

import com.medistock.dto.NotificationResponse;
import com.medistock.dto.PageResponse;
import com.medistock.entity.Notification;
import com.medistock.entity.NotificationType;
import com.medistock.event.AdminEmailNotificationEvent;
import com.medistock.repository.NotificationRepository;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public void createOnce(NotificationType type, Long medicineId, String title, String message) {
        createOnce(type, medicineId, title, message, Map.of("Details", message));
    }

    @Transactional
    public void createOnce(NotificationType type, Long medicineId, String title, String message, Map<String, String> emailDetails) {
        if (medicineId != null && notificationRepository.findByTypeAndMedicineIdAndReadAtIsNull(type, medicineId).isPresent()) {
            return;
        }
        create(type, medicineId, title, message, shouldEmail(type), emailDetails);
    }

    @Transactional
    public NotificationResponse create(NotificationType type, Long medicineId, String title, String message) {
        return create(type, medicineId, title, message, shouldEmail(type), Map.of("Details", message));
    }

    @Transactional
    public NotificationResponse create(NotificationType type, Long medicineId, String title, String message, boolean sendEmail, Map<String, String> emailDetails) {
        Notification notification = notificationRepository.save(Notification.builder()
                .type(type)
                .medicineId(medicineId)
                .title(title)
                .message(message)
                .build());
        if (sendEmail) {
            Map<String, String> details = new LinkedHashMap<>(emailDetails == null ? Map.of() : emailDetails);
            String eventName = eventName(type);
            LocalDateTime now = LocalDateTime.now();
            details.putIfAbsent("Action Performed", eventName);
            details.putIfAbsent("User", currentActor());
            details.putIfAbsent("Date", String.valueOf(now.toLocalDate()));
            details.putIfAbsent("Time", String.valueOf(now.toLocalTime().truncatedTo(ChronoUnit.SECONDS)));
            try {
                eventPublisher.publishEvent(new AdminEmailNotificationEvent(eventName, details));
                log.info("Published MediStock administrator email event '{}' for notification id {}", eventName, notification.getId());
            } catch (RuntimeException ex) {
                log.warn("Unable to queue MediStock administrator email event for notification type {}", type, ex);
            }
        }
        return toResponse(notification);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST','STAFF')")
    public PageResponse<NotificationResponse> findAll(boolean unreadOnly, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Notification> notifications = unreadOnly
                ? notificationRepository.findByReadAtIsNull(pageRequest)
                : notificationRepository.findAll(pageRequest);
        return PageResponse.<NotificationResponse>builder()
                .content(notifications.getContent().stream().map(this::toResponse).toList())
                .page(notifications.getNumber())
                .size(notifications.getSize())
                .totalElements(notifications.getTotalElements())
                .totalPages(notifications.getTotalPages())
                .last(notifications.isLast())
                .build();
    }

    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST','STAFF')")
    public NotificationResponse markRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new com.medistock.exception.ResourceNotFoundException("Notification not found: " + id));
        notification.setReadAt(Instant.now());
        return toResponse(notificationRepository.save(notification));
    }

    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST','STAFF')")
    public int markAllRead() {
        var unread = notificationRepository.findByReadAtIsNull(Sort.by(Sort.Direction.DESC, "createdAt"));
        unread.forEach(notification -> notification.setReadAt(Instant.now()));
        notificationRepository.saveAll(unread);
        return unread.size();
    }

    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST','STAFF')")
    public void clearAll() {
        notificationRepository.deleteAll();
    }

    @Transactional(readOnly = true)
    public long unreadCount() {
        return notificationRepository.countByReadAtIsNull();
    }

    private NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .medicineId(notification.getMedicineId())
                .unread(notification.getReadAt() == null)
                .createdAt(notification.getCreatedAt())
                .readAt(notification.getReadAt())
                .build();
    }

    private boolean shouldEmail(NotificationType type) {
        return switch (type) {
            case MEDICINE_ADDED, MEDICINE_UPDATED, MEDICINE_DELETED,
                    SUPPLIER_ADDED, SUPPLIER_UPDATED, SUPPLIER_DELETED,
                    LOW_STOCK, OUT_OF_STOCK, NEAR_EXPIRY, EXPIRED -> true;
            default -> false;
        };
    }

    private String eventName(NotificationType type) {
        return switch (type) {
            case MEDICINE_ADDED -> "Medicine Added";
            case MEDICINE_UPDATED -> "Medicine Updated";
            case MEDICINE_DELETED -> "Medicine Deleted";
            case SUPPLIER_ADDED -> "Supplier Added";
            case SUPPLIER_UPDATED -> "Supplier Updated";
            case SUPPLIER_DELETED -> "Supplier Deleted";
            case LOW_STOCK -> "Low Stock Alert";
            case OUT_OF_STOCK -> "Out of Stock Alert";
            case NEAR_EXPIRY -> "Medicine Expiring within 30 Days";
            case EXPIRED -> "Medicine Expired";
            case SYSTEM -> "System";
        };
    }

    private String currentActor() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            return "system";
        }
        return authentication.getName();
    }
}
