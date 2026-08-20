package com.medistock.api.services;

import com.medistock.api.dto.NotificationDTO;
import com.medistock.api.models.*;
import com.medistock.api.repositories.*;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {


    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final MedicineRepository medicineRepository;
    private final EmailService emailService;

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository,
                               MedicineRepository medicineRepository,
                               EmailService emailService) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.medicineRepository = medicineRepository;
        this.emailService = emailService;
    }

    // ─── Read ────────────────────────────────────────────────────────────────────

    public List<NotificationDTO> getNotificationsForUser(String username) {
        User user = resolveUser(username);
        return notificationRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(NotificationDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(String username) {
        User user = resolveUser(username);
        return notificationRepository.countByUserAndStatus(user, NotificationStatus.UNREAD);
    }

    // ─── Mark Read ───────────────────────────────────────────────────────────────

    @Transactional
    public NotificationDTO markAsRead(Long id, String username) {
        User user = resolveUser(username);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + id));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied to notification: " + id);
        }
        notification.setStatus(NotificationStatus.READ);
        return NotificationDTO.fromEntity(notificationRepository.save(notification));
    }

    @Transactional
    public void markAllAsRead(String username) {
        User user = resolveUser(username);
        notificationRepository.updateStatusForAllUserNotifications(user, NotificationStatus.READ);
    }

    // ─── Dismiss ─────────────────────────────────────────────────────────────────

    @Transactional
    public void dismiss(Long id, String username) {
        User user = resolveUser(username);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + id));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied to notification: " + id);
        }
        notificationRepository.delete(notification);
    }

    // ─── Scheduler-called generation ─────────────────────────────────────────────

    /**
     * Called by NotificationScheduler. Scans all medicines and creates
     * LOW_STOCK and EXPIRY notifications for every user, with deduplication
     * (one notification per medicine+type per day).
     */
    @Transactional
    public void generateExpiryAndLowStockNotifications() {
        List<User> allUsers = userRepository.findAll();
        LocalDate today = LocalDate.now();
        LocalDate expiryWindow = today.plusDays(90);
        LocalDateTime dedupSince = LocalDateTime.now().minusHours(23);

        // Low-stock medicines (quantity ≤ 10)
        List<Medicine> lowStock = medicineRepository.findByQuantityLessThanEqual(10);

        // Expiring within 3 months (90 days) (and not yet expired)
        List<Medicine> expiring = medicineRepository.findExpiringBetween(today, expiryWindow);

        // Expired medicines
        List<Medicine> expired = medicineRepository.findByExpiryDateBefore(today);

        for (User user : allUsers) {

            // Low-stock notifications
            for (Medicine medicine : lowStock) {
                String msgPattern = "%" + medicine.getName() + "%low stock%";
                boolean alreadySent = notificationRepository.existsRecentNotification(
                        user, NotificationType.LOW_STOCK, msgPattern, dedupSince);
                if (!alreadySent) {
                    String message = String.format(
                            "Low stock alert: '%s' (Batch: %s) has only %d unit(s) remaining.",
                            medicine.getName(), medicine.getBatchNumber(), medicine.getQuantity());
                    notificationRepository.save(
                            new Notification(user, message, NotificationType.LOW_STOCK, NotificationStatus.UNREAD));
                    // Send email alert (best-effort — failure only logged)
                    emailService.sendLowStockAlert(
                            user.getEmail(),
                            medicine.getName(),
                            medicine.getBatchNumber(),
                            medicine.getQuantity());
                }
            }

            // Expiring-soon notifications
            for (Medicine medicine : expiring) {
                long daysLeft = today.until(medicine.getExpiryDate()).getDays();
                String msgPattern = "%" + medicine.getName() + "%expir%";
                boolean alreadySent = notificationRepository.existsRecentNotification(
                        user, NotificationType.EXPIRY, msgPattern, dedupSince);
                if (!alreadySent) {
                    String message = String.format(
                            "Expiry warning: '%s' (Batch: %s) expires in %d day(s) on %s.",
                            medicine.getName(), medicine.getBatchNumber(),
                            daysLeft, medicine.getExpiryDate());
                    notificationRepository.save(
                            new Notification(user, message, NotificationType.EXPIRY, NotificationStatus.UNREAD));
                    // Send email alert (best-effort)
                    emailService.sendExpiryAlert(
                            user.getEmail(),
                            medicine.getName(),
                            medicine.getBatchNumber(),
                            medicine.getExpiryDate().toString(),
                            daysLeft);
                }
            }

            // Expired medicines
            for (Medicine medicine : expired) {
                String msgPattern = "%" + medicine.getName() + "%expired%";
                boolean alreadySent = notificationRepository.existsRecentNotification(
                        user, NotificationType.EXPIRY, msgPattern, dedupSince);
                if (!alreadySent) {
                    String message = String.format(
                            "Expired: '%s' (Batch: %s) expired on %s. Please remove from inventory.",
                            medicine.getName(), medicine.getBatchNumber(), medicine.getExpiryDate());
                    notificationRepository.save(
                            new Notification(user, message, NotificationType.EXPIRY, NotificationStatus.UNREAD));
                    // Send email alert for expired medicine (negative daysLeft = already expired)
                    emailService.sendExpiryAlert(
                            user.getEmail(),
                            medicine.getName(),
                            medicine.getBatchNumber(),
                            medicine.getExpiryDate().toString(),
                            -1L);
                }
            }
        }
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────────

    private User resolveUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }
}
