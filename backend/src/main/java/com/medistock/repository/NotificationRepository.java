package com.medistock.repository;

import com.medistock.entity.Notification;
import com.medistock.entity.NotificationType;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    long countByReadAtIsNull();

    Page<Notification> findByReadAtIsNull(Pageable pageable);

    java.util.List<Notification> findByReadAtIsNull(Sort sort);

    Optional<Notification> findByTypeAndMedicineIdAndReadAtIsNull(NotificationType type, Long medicineId);
}
