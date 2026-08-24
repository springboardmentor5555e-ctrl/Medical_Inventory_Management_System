package com.medistock.demo.service;

import com.medistock.demo.entity.Medicine;
import com.medistock.demo.entity.Notification;
import com.medistock.demo.repository.NotificationRepository;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;


@Service
public class NotificationService {


private final NotificationRepository repository;

private final EmailService emailService;

@Value("${spring.mail.username}")
private String notificationEmail;


 public NotificationService(
        NotificationRepository repository,
        EmailService emailService
) {
    this.repository = repository;
    this.emailService = emailService;
}

    // =====================================
    // CREATE GENERAL NOTIFICATION
    // =====================================

    public Notification createNotification(

            String title,

            String message,

            String type

    ){

        return createNotification(
                title,
                message,
                type,
                null
        );

    }


    // =====================================
    // CREATE ROLE BASED NOTIFICATION
    // =====================================

    public Notification createNotification(

            String title,

            String message,

            String type,

            String receiverRole

    ){

        System.out.println(
                "Creating Notification : "
                + title
        );


        /*
         * We intentionally do not block duplicate
         * notifications anymore.
         *
         * Example:
         *
         * Medicine A sold quantity 1
         * Medicine A sold quantity 1
         *
         * Both should create separate notifications.
         */


        Notification notification =
                new Notification();


        notification.setTitle(title);


        notification.setMessage(message);


        notification.setNotificationType(type);


        notification.setIsRead(false);


        notification.setUserId(null);


        notification.setReceiverRole(
                receiverRole
        );


        Notification saved =
        repository.save(notification);

System.out.println(
        "Notification saved ID : "
        + saved.getId()
);

        return saved;

    }


    // =====================================
    // MEDICINE ADDED
    // =====================================

  // =====================================
// MEDICINE ADDED
// =====================================

public Notification medicineAdded(
        Medicine medicine
) {

    Notification notification =
            createNotification(

                    "Medicine Added",

                    medicine.getName()
                            + " added successfully. Quantity : "
                            + medicine.getQuantity(),

                    "SYSTEM",

                    "ADMIN"
            );

    emailService.sendMedicineAddedEmail(
            notificationEmail,
            medicine
    );

    return notification;
}

    // =====================================
    // MEDICINE UPDATED
    // =====================================

    public Notification medicineUpdated(

            String medicineName

    ){

        return createNotification(

                "Medicine Updated",

                medicineName
                        + " details updated successfully",

                "SYSTEM",

                "ADMIN"

        );

    }


    // =====================================
    // MEDICINE DELETED
    // =====================================

    public Notification medicineDeleted(

            String medicineName

    ){

        return createNotification(

                "Medicine Deleted",

                medicineName
                        + " removed from inventory",

                "SYSTEM",

                "ADMIN"

        );

    }


    // =====================================
    // MEDICINE SOLD
    // =====================================

    public Notification medicineSold(

            String medicineName,

            int quantity

    ){

        return createNotification(

                "Medicine Sold",

                medicineName
                        + " sold successfully. Quantity : "
                        + quantity,

                "SALE",

                "PHARMACIST"

        );

    }


    // =====================================
    // SALES HISTORY DOWNLOADED
    // =====================================

    public Notification salesHistoryDownloaded(){

        return createNotification(

                "Sales History Downloaded",

                "Sales history PDF was downloaded successfully.",

                "SYSTEM",

                "PHARMACIST"

        );

    }


    // =====================================
    // STOCK ALERT
    // =====================================

    public Notification createStockAlert(

            String medicineName,

            int quantity

    ){

        return createNotification(

                "Low Stock Alert",

                medicineName
                        + " stock is low. Available quantity : "
                        + quantity,

                "STOCK",

                "PHARMACIST"

        );

    }


    // =====================================
    // EXPIRY ALERT
    // =====================================

    public Notification createExpiryAlert(

            String medicineName,

            long days

    ){

        return createNotification(

                "Expiry Alert",

                medicineName
                        + " expires in "
                        + days
                        + " days",

                "EXPIRY",

                "PHARMACIST"

        );

    }


    // =====================================
    // MEDICINE EXPIRED
    // =====================================

    public Notification medicineExpired(

            String medicineName

    ){

        return createNotification(

                "Medicine Expired",

                medicineName
                        + " has expired",

                "EXPIRY",

                "PHARMACIST"

        );

    }


    // =====================================
    // GET ALL
    // =====================================

    public List<Notification> getAllNotifications(){

        return repository
                .findAllByOrderByCreatedAtDesc();

    }


    // =====================================
    // GET UNREAD
    // =====================================

    public List<Notification> getUnreadNotifications(){

        return repository
                .findByIsReadFalseOrderByCreatedAtDesc();

    }


    // =====================================
    // COUNT UNREAD
    // =====================================

    public long getUnreadCount(){

        return repository.countByIsReadFalse();

    }


    // =====================================
    // GET BY TYPE
    // =====================================

    public List<Notification> getByType(

            String type

    ){

        return repository
                .findByNotificationTypeOrderByCreatedAtDesc(
                        type
                );

    }


    // =====================================
    // USER NOTIFICATIONS
    // =====================================

    public List<Notification> getUserNotifications(

            Long userId

    ){

        return repository
                .findByUserIdOrderByCreatedAtDesc(
                        userId
                );

    }


    // =====================================
    // ROLE NOTIFICATIONS
    // =====================================

    public List<Notification> getRoleNotifications(

            String role

    ){

        return repository
                .findByReceiverRoleOrderByCreatedAtDesc(
                        role
                );

    }


    // =====================================
    // ROLE UNREAD NOTIFICATIONS
    // =====================================

    public List<Notification> getUnreadRoleNotifications(

            String role

    ){

        return repository
                .findByReceiverRoleAndIsReadFalseOrderByCreatedAtDesc(
                        role
                );

    }


    // =====================================
    // ROLE UNREAD COUNT
    // =====================================

    public long getUnreadRoleCount(

            String role

    ){

        return repository
                .countByReceiverRoleAndIsReadFalse(
                        role
                );

    }


    // =====================================
    // MARK AS READ
    // =====================================

    public Notification markAsRead(

            Long id

    ){

        Notification notification =

                repository.findById(id)

                        .orElseThrow(() ->

                                new RuntimeException(
                                        "Notification not found"
                                )

                        );


        notification.setIsRead(true);


        return repository.save(notification);

    }


    // =====================================
    // MARK ALL AS READ
    // =====================================

    public void markAllAsRead(){

        List<Notification> notifications =
                repository.findAll();


        notifications.forEach(notification -> {

            notification.setIsRead(true);

        });


        repository.saveAll(notifications);

    }


    // =====================================
    // DELETE ONE
    // =====================================

    public void deleteNotification(

            Long id

    ){

        repository.deleteById(id);

    }


    // =====================================
    // DELETE TYPE
    // =====================================

    public void deleteByType(

            String type

    ){

        repository.deleteByNotificationType(type);

    }


    // =====================================
    // DELETE BY MEDICINE
    // =====================================

    public void deleteByMedicine(

            Medicine medicine

    ){

        if(medicine != null){

            repository.deleteByMessageContaining(
                    medicine.getName()
            );

        }

    }


    // =====================================
    // DELETE ALL
    // =====================================

    public void deleteAllNotifications(){

        repository.deleteAll();

    }

}