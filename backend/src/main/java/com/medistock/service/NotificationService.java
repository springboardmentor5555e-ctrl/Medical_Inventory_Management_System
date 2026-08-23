package com.medistock.service;

import com.medistock.entity.Medicine;
import com.medistock.entity.Notification;
import com.medistock.entity.Notification.NotificationType;
import com.medistock.entity.Role;
import com.medistock.entity.User;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.NotificationRepository;
import com.medistock.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final Logger log =
            LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final MedicineRepository medicineRepository;
    private final UserRepository userRepository;
    private final JavaMailSender mailSender;

    @Value("${app.inventory.expiry-warning-days:30}")
    private int expiryWarningDays;

    @Value("${app.notifications.email.enabled:false}")
    private boolean emailEnabled;

    public List<Notification> getAll(boolean unreadOnly) {
        return unreadOnly
                ? notificationRepository.findByReadFalseOrderByCreatedAtDesc()
                : notificationRepository.findAllByOrderByCreatedAtDesc();
    }

    public long unreadCount() {
        return notificationRepository.countByReadFalse();
    }

    public Notification markRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Notification not found: " + id));

        notification.setRead(true);

        return notificationRepository.save(notification);
    }

    public void markAllRead() {
        List<Notification> unread =
                notificationRepository.findByReadFalseOrderByCreatedAtDesc();

        for (Notification notification : unread) {
            notification.setRead(true);
        }

        notificationRepository.saveAll(unread);
    }

    /**
     * Checks low-stock and out-of-stock conditions.
     */
    public void checkStockAlerts(Medicine medicine) {

        if (medicine.isOutOfStock()) {

            createIfNotDuplicate(
                    medicine,
                    NotificationType.OUT_OF_STOCK,
                    medicine.getName() + " is out of stock."
            );

        } else if (medicine.isLowStock()) {

            createIfNotDuplicate(
                    medicine,
                    NotificationType.LOW_STOCK,
                    medicine.getName()
                            + " is low on stock ("
                            + medicine.getQuantity()
                            + " left)."
            );
        }
    }

    /**
     * Checks expired and near-expiry medicines.
     */
    public void checkExpiryAlerts(Medicine medicine) {

        if (medicine.isExpired()) {

            createIfNotDuplicate(
                    medicine,
                    NotificationType.EXPIRED,
                    medicine.getName()
                            + " (batch "
                            + medicine.getBatchNumber()
                            + ") has expired."
            );

        } else if (
                medicine.getExpiryDate() != null
                        && !medicine.getExpiryDate()
                        .isAfter(
                                LocalDate.now()
                                        .plusDays(expiryWarningDays)
                        )
        ) {

            createIfNotDuplicate(
                    medicine,
                    NotificationType.EXPIRING_SOON,
                    medicine.getName()
                            + " (batch "
                            + medicine.getBatchNumber()
                            + ") expires on "
                            + medicine.getExpiryDate()
                            + "."
            );
        }
    }

    /**
     * Runs every day at 06:00.
     *
     * Also runs once 15 seconds after application startup.
     */
    @Scheduled(cron = "0 0 6 * * *")
    @Scheduled(initialDelay = 15000, fixedDelay = Long.MAX_VALUE)
    public void runDailyExpiryAndStockScan() {

        List<Medicine> allMedicines =
                medicineRepository.findAll();

        int before =
                countAllNotifications();

        for (Medicine medicine : allMedicines) {

            checkStockAlerts(medicine);

            checkExpiryAlerts(medicine);
        }

        int after =
                countAllNotifications();

        int newCount = after - before;

        if (newCount > 0) {

            sendEmailDigestIfEnabled(newCount);
        }
    }

    private int countAllNotifications() {

        return (int) notificationRepository.count();
    }

    /**
     * Creates an in-app notification if an unread
     * notification of the same type does not already exist.
     *
     * If a new notification is created, an email is also
     * sent to the ADMIN user's email.
     */
    private void createIfNotDuplicate(
            Medicine medicine,
            NotificationType type,
            String message
    ) {

        boolean alreadyExists =
                notificationRepository
                        .findFirstByMedicineIdAndTypeAndReadFalse(
                                medicine.getId(),
                                type
                        )
                        .isPresent();

        if (alreadyExists) {
            return;
        }

        Notification notification =
                Notification.builder()
                        .type(type)
                        .message(message)
                        .medicine(medicine)
                        .build();

        notificationRepository.save(notification);

        /*
         * Send email immediately when a new alert is created.
         */
        sendEmailToAdmin(type, message);
    }

    /**
     * Finds the ADMIN user from the database and
     * sends the notification email to that user's email.
     */
    private void sendEmailToAdmin(
            NotificationType type,
            String message
    ) {

        if (!emailEnabled) {

            log.debug(
                    "Email notifications are disabled."
            );

            return;
        }

        try {

            Optional<User> adminOptional =
                    userRepository.findFirstByRole(Role.ADMIN);

            if (adminOptional.isEmpty()) {

                log.warn(
                        "No ADMIN user found. Notification email skipped."
                );

                return;
            }

            User admin = adminOptional.get();

            String adminEmail = admin.getEmail();

            if (adminEmail == null
                    || adminEmail.isBlank()) {

                log.warn(
                        "ADMIN user has no email address. "
                                + "Notification email skipped."
                );

                return;
            }

            SimpleMailMessage mail =
                    new SimpleMailMessage();

            mail.setTo(adminEmail);

            mail.setSubject(
                    "MediStock Alert: "
                            + formatNotificationType(type)
            );

            mail.setText(
                    "Hello Admin,\n\n"
                            + "MediStock has detected a new inventory alert.\n\n"
                            + "Alert Type: "
                            + formatNotificationType(type)
                            + "\n\n"
                            + "Details:\n"
                            + message
                            + "\n\n"
                            + "Please log in to MediStock to review the inventory.\n\n"
                            + "Regards,\n"
                            + "MediStock"
            );

            mailSender.send(mail);

            log.info(
                    "Notification email sent successfully to ADMIN: {}",
                    adminEmail
            );

        } catch (Exception ex) {

            /*
             * Email failure must not break inventory operations.
             */
            log.warn(
                    "Could not send notification email to ADMIN: {}",
                    ex.getMessage()
            );
        }
    }

    /**
     * Sends a summary email after the scheduled daily scan.
     */
    private void sendEmailDigestIfEnabled(int newCount) {

        if (!emailEnabled) {
            return;
        }

        try {

            Optional<User> adminOptional =
                    userRepository.findFirstByRole(Role.ADMIN);

            if (adminOptional.isEmpty()) {

                log.warn(
                        "No ADMIN user found. Daily email digest skipped."
                );

                return;
            }

            User admin = adminOptional.get();

            String adminEmail = admin.getEmail();

            if (adminEmail == null
                    || adminEmail.isBlank()) {

                log.warn(
                        "ADMIN email is empty. Daily email digest skipped."
                );

                return;
            }

            SimpleMailMessage mail =
                    new SimpleMailMessage();

            mail.setTo(adminEmail);

            mail.setSubject(
                    "MediStock: "
                            + newCount
                            + " new inventory alert(s)"
            );

            mail.setText(
                    "Hello Admin,\n\n"
                            + "MediStock's daily inventory scan found "
                            + newCount
                            + " new alert(s).\n\n"
                            + "Please log in to MediStock to review:\n"
                            + "- Low-stock medicines\n"
                            + "- Out-of-stock medicines\n"
                            + "- Near-expiry medicines\n"
                            + "- Expired medicines\n\n"
                            + "Regards,\n"
                            + "MediStock"
            );

            mailSender.send(mail);

            log.info(
                    "Daily inventory email sent to ADMIN: {}",
                    adminEmail
            );

        } catch (Exception ex) {

            log.warn(
                    "Could not send daily inventory email: {}",
                    ex.getMessage()
            );
        }
    }

    /**
     * Converts enum names into readable notification titles.
     */
    private String formatNotificationType(
            NotificationType type
    ) {

        switch (type) {

            case LOW_STOCK:
                return "Low Stock";

            case OUT_OF_STOCK:
                return "Out of Stock";

            case EXPIRING_SOON:
                return "Expiring Soon";

            case EXPIRED:
                return "Expired Medicine";

            default:
                return type.name();
        }
    }
}