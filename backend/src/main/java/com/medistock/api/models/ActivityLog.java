package com.medistock.api.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * ActivityLog — records every significant action a user performs in the system.
 * Used to power the Admin activity log dashboard and audit trail.
 *
 * Examples of actions: MEDICINE_CREATED, STOCK_ADJUSTED, ORDER_RECEIVED, USER_DELETED.
 */
@Entity
@Table(name = "activity_logs", indexes = {
        @Index(name = "idx_activity_user", columnList = "username"),
        @Index(name = "idx_activity_created_at", columnList = "created_at"),
        @Index(name = "idx_activity_entity_type", columnList = "entity_type")
})
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The username of the actor who performed the action. */
    @Column(nullable = false, length = 100)
    private String username;

    /** A short action code, e.g. MEDICINE_CREATED, STOCK_ADJUSTED, ORDER_RECEIVED. */
    @Column(nullable = false, length = 100)
    private String action;

    /** The type of entity affected, e.g. MEDICINE, PURCHASE_ORDER, USER. */
    @Column(name = "entity_type", nullable = false, length = 50)
    private String entityType;

    /** The ID of the affected entity (nullable for non-entity actions). */
    @Column(name = "entity_id")
    private Long entityId;

    /** Human-readable detail, e.g. "Created medicine 'Aspirin' (Batch: B001)". */
    @Column(columnDefinition = "TEXT")
    private String detail;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public ActivityLog() {}

    public ActivityLog(String username, String action, String entityType, Long entityId, String detail) {
        this.username   = username;
        this.action     = action;
        this.entityType = entityType;
        this.entityId   = entityId;
        this.detail     = detail;
        this.createdAt  = LocalDateTime.now();
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
