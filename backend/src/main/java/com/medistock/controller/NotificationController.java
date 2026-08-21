package com.medistock.controller;

import com.medistock.dto.NotificationResponse;
import com.medistock.dto.PageResponse;
import com.medistock.service.ExpiryService;
import com.medistock.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final ExpiryService expiryService;

    @GetMapping
    public PageResponse<NotificationResponse> findAll(
            @RequestParam(defaultValue = "false") boolean unreadOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return notificationService.findAll(unreadOnly, page, size);
    }

    @PatchMapping("/{id}/read")
    public NotificationResponse markRead(@PathVariable Long id) {
        return notificationService.markRead(id);
    }

    @PatchMapping("/read-all")
    public String markAllRead() {
        return notificationService.markAllRead() + " notifications marked as read";
    }

    @DeleteMapping
    public void clearAll() {
        notificationService.clearAll();
    }

    @PostMapping("/scan-expiry")
    public String scanExpiry() {
        return expiryService.scanNow() + " alerts scanned";
    }
}
