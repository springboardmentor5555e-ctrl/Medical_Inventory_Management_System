package com.medistock.api.services;

import com.medistock.api.dto.ActivityLogDTO;
import com.medistock.api.models.ActivityLog;
import com.medistock.api.repositories.ActivityLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * ActivityLogService — records and queries user actions for the admin audit trail.
 *
 * Call {@link #log(String, String, String, Long, String)} from any service after
 * a significant state-changing operation (create, update, delete, status change).
 */
@Service
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    public ActivityLogService(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    // ── Write ────────────────────────────────────────────────────────────────────

    /**
     * Records a new activity entry. Should be called from service-layer methods
     * after a successful state-changing operation.
     *
     * @param username   the user performing the action
     * @param action     action code, e.g. MEDICINE_CREATED, STOCK_ADJUSTED
     * @param entityType entity type, e.g. MEDICINE, PURCHASE_ORDER, USER
     * @param entityId   ID of the affected entity (nullable)
     * @param detail     human-readable detail string
     */
    public void log(String username, String action, String entityType, Long entityId, String detail) {
        activityLogRepository.save(new ActivityLog(username, action, entityType, entityId, detail));
    }

    // ── Read ─────────────────────────────────────────────────────────────────────

    /** Returns all activity logs, newest first, paginated. */
    public Page<ActivityLogDTO> getAllLogs(Pageable pageable) {
        return activityLogRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(ActivityLogDTO::fromEntity);
    }

    /** Returns activity logs filtered by username, newest first, paginated. */
    public Page<ActivityLogDTO> getLogsByUser(String username, Pageable pageable) {
        return activityLogRepository.findByUsernameOrderByCreatedAtDesc(username, pageable)
                .map(ActivityLogDTO::fromEntity);
    }

    /** Returns activity logs filtered by entity type, newest first, paginated. */
    public Page<ActivityLogDTO> getLogsByEntityType(String entityType, Pageable pageable) {
        return activityLogRepository.findByEntityTypeOrderByCreatedAtDesc(entityType, pageable)
                .map(ActivityLogDTO::fromEntity);
    }

    /** Returns all logs from the past 24 hours for the live dashboard. */
    public List<ActivityLogDTO> getRecentLogs() {
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        return activityLogRepository.findByCreatedAtAfterOrderByCreatedAtDesc(since)
                .stream()
                .map(ActivityLogDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Returns per-user action counts for the past N days — used by the
     * Admin analytics dashboard to show "most active users".
     *
     * @param days number of days to look back
     * @return list of [username (String), count (Long)] pairs
     */
    public List<Object[]> getUserActivitySummary(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        return activityLogRepository.countActionsPerUserSince(since);
    }
}
