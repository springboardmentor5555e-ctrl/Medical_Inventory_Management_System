package com.medistock.service;

import com.medistock.dto.AuditLogResponse;
import com.medistock.dto.PageResponse;
import com.medistock.entity.AuditLog;
import com.medistock.repository.AuditLogRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void record(String action, String entityType, Object entityId, String details) {
        String actor = SecurityContextHolder.getContext().getAuthentication() == null
                ? "system"
                : SecurityContextHolder.getContext().getAuthentication().getName();
        auditLogRepository.save(AuditLog.builder()
                .action(action)
                .entityType(entityType)
                .entityId(entityId == null ? null : String.valueOf(entityId))
                .actor(actor)
                .details(details)
                .build());
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> findAll(String entityType, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<AuditLog> logs = entityType == null || entityType.isBlank()
                ? auditLogRepository.findAll(pageRequest)
                : auditLogRepository.findByEntityTypeIgnoreCase(entityType, pageRequest);
        return PageResponse.<AuditLogResponse>builder()
                .content(logs.getContent().stream().map(this::toResponse).toList())
                .page(logs.getNumber())
                .size(logs.getSize())
                .totalElements(logs.getTotalElements())
                .totalPages(logs.getTotalPages())
                .last(logs.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> recent(int size) {
        return auditLogRepository.findAll(PageRequest.of(0, size, Sort.by(Sort.Direction.DESC, "createdAt")))
                .getContent()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private AuditLogResponse toResponse(AuditLog log) {
        return AuditLogResponse.builder()
                .id(log.getId())
                .action(log.getAction())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .actor(log.getActor())
                .details(log.getDetails())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
