package com.medistock.api.dto;

import java.time.LocalDateTime;

/**
 * DTO for returning a single ActivityLog entry to the frontend.
 */
public class ActivityLogDTO {

    private Long id;
    private String username;
    private String action;
    private String entityType;
    private Long entityId;
    private String detail;
    private LocalDateTime createdAt;

    public ActivityLogDTO() {}

    public ActivityLogDTO(Long id, String username, String action,
                          String entityType, Long entityId,
                          String detail, LocalDateTime createdAt) {
        this.id         = id;
        this.username   = username;
        this.action     = action;
        this.entityType = entityType;
        this.entityId   = entityId;
        this.detail     = detail;
        this.createdAt  = createdAt;
    }

    public static ActivityLogDTO fromEntity(com.medistock.api.models.ActivityLog log) {
        return new ActivityLogDTO(
                log.getId(),
                log.getUsername(),
                log.getAction(),
                log.getEntityType(),
                log.getEntityId(),
                log.getDetail(),
                log.getCreatedAt()
        );
    }

    // ── Getters & Setters ──────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public Long getEntityId() { return entityId; }
    public void setEntityId(Long entityId) { this.entityId = entityId; }

    public String getDetail() { return detail; }
    public void setDetail(String detail) { this.detail = detail; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
