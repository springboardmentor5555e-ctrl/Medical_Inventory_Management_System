package com.medistock.repository;

import com.medistock.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findAllByOrderByCreatedAtDesc();

    List<Notification> findByReadFalseOrderByCreatedAtDesc();

    long countByReadFalse();

    Optional<Notification> findFirstByMedicineIdAndTypeAndReadFalse(Long medicineId, Notification.NotificationType type);
}
