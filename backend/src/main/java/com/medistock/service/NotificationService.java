package com.medistock.service;

import com.medistock.entity.Notification;
import com.medistock.entity.User;
import com.medistock.enums.Role;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.NotificationRepository;
import com.medistock.security.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof UserPrincipal) {
            return ((UserPrincipal) principal).getUser().getId();
        }
        return null;
    }

    @Transactional(readOnly = true)
    public List<Notification> getAllNotifications() {
        Long userId = getCurrentUserId();
        if (userId == null) return new ArrayList<>();
        
        // Admin gets all notifications
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal) {
            User u = ((UserPrincipal) auth.getPrincipal()).getUser();
            if (u.getRole() == Role.ADMIN) {
                return notificationRepository.findAllByOrderByCreatedAtDesc();
            }
        }
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<Notification> getUnreadNotifications() {
        Long userId = getCurrentUserId();
        if (userId == null) return new ArrayList<>();
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount() {
        Long userId = getCurrentUserId();
        if (userId == null) return 0;
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + id));
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead() {
        Long userId = getCurrentUserId();
        if (userId != null) {
            List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
            unread.forEach(notification -> notification.setIsRead(true));
            notificationRepository.saveAll(unread);
        }
    }
}
