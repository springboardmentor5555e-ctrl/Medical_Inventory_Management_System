package com.medistock.dto;

import java.time.Instant;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuditLogResponse {

    private Long id;
    private String action;
    private String entityType;
    private String entityId;
    private String actor;
    private String details;
    private Instant createdAt;
}
