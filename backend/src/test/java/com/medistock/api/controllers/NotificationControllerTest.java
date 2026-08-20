package com.medistock.api.controllers;

import com.medistock.api.dto.NotificationDTO;
import com.medistock.api.models.NotificationStatus;
import com.medistock.api.models.NotificationType;
import com.medistock.api.services.NotificationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class NotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private NotificationService notificationService;

    private NotificationDTO buildDTO() {
        return new NotificationDTO(
                1L,
                "Low stock alert: 'Aspirin' has only 3 unit(s) remaining.",
                NotificationType.LOW_STOCK,
                NotificationStatus.UNREAD,
                LocalDateTime.now()
        );
    }

    @Test
    @WithMockUser(username = "pharmacist", roles = "PHARMACIST")
    void getNotifications_returns200WithList() throws Exception {
        when(notificationService.getNotificationsForUser("pharmacist"))
                .thenReturn(List.of(buildDTO()));

        mockMvc.perform(get("/api/notifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].message").value("Low stock alert: 'Aspirin' has only 3 unit(s) remaining."))
                .andExpect(jsonPath("$[0].type").value("LOW_STOCK"))
                .andExpect(jsonPath("$[0].status").value("UNREAD"));
    }

    @Test
    @WithMockUser(username = "staff", roles = "STAFF")
    void getUnreadCount_returnsCount() throws Exception {
        when(notificationService.getUnreadCount("staff")).thenReturn(5L);

        mockMvc.perform(get("/api/notifications/unread-count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(5));
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void markAsRead_returns200() throws Exception {
        NotificationDTO updated = buildDTO();
        updated.setStatus(NotificationStatus.READ);

        when(notificationService.markAsRead(1L, "admin")).thenReturn(updated);

        mockMvc.perform(put("/api/notifications/1/read"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("READ"));
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void markAllAsRead_returns200() throws Exception {
        doNothing().when(notificationService).markAllAsRead("admin");

        mockMvc.perform(put("/api/notifications/read-all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("All notifications marked as read"));
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void dismiss_returns200() throws Exception {
        doNothing().when(notificationService).dismiss(1L, "admin");

        mockMvc.perform(delete("/api/notifications/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Notification dismissed"));
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void triggerScan_asAdmin_returns200() throws Exception {
        doNothing().when(notificationService).generateExpiryAndLowStockNotifications();

        mockMvc.perform(post("/api/notifications/trigger-scan"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Notification scan triggered successfully"));
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void triggerScan_asStaff_returns403() throws Exception {
        mockMvc.perform(post("/api/notifications/trigger-scan"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void markAsRead_notFound_returns400() throws Exception {
        when(notificationService.markAsRead(99L, "admin"))
                .thenThrow(new RuntimeException("Notification not found: 99"));

        mockMvc.perform(put("/api/notifications/99/read"))
                .andExpect(status().isBadRequest());
    }
}
