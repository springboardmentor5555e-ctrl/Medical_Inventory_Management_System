package com.medistock.api.repositories;

import com.medistock.api.models.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    /** Most recent entries first, paginated. */
    Page<ActivityLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    /** Entries by a specific user, newest first. */
    Page<ActivityLog> findByUsernameOrderByCreatedAtDesc(String username, Pageable pageable);

    /** Entries for a specific entity type (e.g., MEDICINE, PURCHASE_ORDER). */
    Page<ActivityLog> findByEntityTypeOrderByCreatedAtDesc(String entityType, Pageable pageable);

    /** Entries since a given timestamp — useful for "last 24h" dashboards. */
    List<ActivityLog> findByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime since);

    /** Count of actions per user in the last N days — for admin analytics. */
    @Query("SELECT a.username, COUNT(a) FROM ActivityLog a " +
           "WHERE a.createdAt >= :since GROUP BY a.username ORDER BY COUNT(a) DESC")
    List<Object[]> countActionsPerUserSince(@Param("since") LocalDateTime since);
}
