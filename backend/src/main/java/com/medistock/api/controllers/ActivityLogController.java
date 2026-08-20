package com.medistock.api.controllers;

import com.medistock.api.dto.ActivityLogDTO;
import com.medistock.api.services.ActivityLogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * ActivityLogController — REST endpoints for the Admin audit trail dashboard.
 *
 * All endpoints require ADMIN role since activity logs contain sensitive information.
 */
@RestController
@RequestMapping("/api/activity-logs")
@PreAuthorize("hasRole('ADMIN')")
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    public ActivityLogController(ActivityLogService activityLogService) {
        this.activityLogService = activityLogService;
    }

    /**
     * GET /api/activity-logs
     * Returns paginated activity logs (all users, newest first).
     */
    @GetMapping
    public ResponseEntity<Page<ActivityLogDTO>> getAllLogs(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(activityLogService.getAllLogs(pageable));
    }

    /**
     * GET /api/activity-logs/recent
     * Returns all logs from the past 24 hours — for the live activity feed widget.
     */
    @GetMapping("/recent")
    public ResponseEntity<List<ActivityLogDTO>> getRecentLogs() {
        return ResponseEntity.ok(activityLogService.getRecentLogs());
    }

    /**
     * GET /api/activity-logs/user/{username}
     * Returns paginated logs for a specific user.
     */
    @GetMapping("/user/{username}")
    public ResponseEntity<Page<ActivityLogDTO>> getLogsByUser(
            @PathVariable String username,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(activityLogService.getLogsByUser(username, pageable));
    }

    /**
     * GET /api/activity-logs/entity/{entityType}
     * Returns paginated logs for a specific entity type (e.g., MEDICINE, PURCHASE_ORDER).
     */
    @GetMapping("/entity/{entityType}")
    public ResponseEntity<Page<ActivityLogDTO>> getLogsByEntityType(
            @PathVariable String entityType,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(activityLogService.getLogsByEntityType(entityType, pageable));
    }

    /**
     * GET /api/activity-logs/summary?days=7
     * Returns per-user action counts for the last N days.
     * Used by the Admin analytics dashboard "Most Active Users" widget.
     */
    @GetMapping("/summary")
    public ResponseEntity<List<Map<String, Object>>> getUserActivitySummary(
            @RequestParam(defaultValue = "7") int days
    ) {
        List<Object[]> raw = activityLogService.getUserActivitySummary(days);
        List<Map<String, Object>> result = raw.stream()
                .map(row -> Map.<String, Object>of(
                        "username", row[0],
                        "actionCount", row[1]
                ))
                .toList();
        return ResponseEntity.ok(result);
    }
}
