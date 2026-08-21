package com.medistock.dto;

import com.medistock.entity.NotificationType;
import java.time.Instant;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NotificationResponse {

    private Long id;
    private NotificationType type;
    private String title;
    private String message;
    private Long medicineId;
    private boolean unread;
    private Instant createdAt;
    private Instant readAt;
}
