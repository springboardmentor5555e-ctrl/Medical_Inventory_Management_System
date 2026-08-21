package com.medistock.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.medistock.entity.Notification;
import com.medistock.entity.NotificationType;
import com.medistock.event.AdminEmailNotificationEvent;
import com.medistock.repository.NotificationRepository;
import java.util.LinkedHashMap;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.context.ApplicationEventPublisher;

class NotificationServiceEmailEventTest {

    private final NotificationRepository notificationRepository = mock(NotificationRepository.class);
    private final ApplicationEventPublisher eventPublisher = mock(ApplicationEventPublisher.class);
    private final NotificationService notificationService = new NotificationService(notificationRepository, eventPublisher);

    @Test
    void publishesAdminEmailEventForEveryConfiguredNotificationType() {
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> {
            Notification notification = invocation.getArgument(0);
            notification.setId(100L);
            return notification;
        });

        Map<NotificationType, String> expectedEventNames = new LinkedHashMap<>();
        expectedEventNames.put(NotificationType.MEDICINE_ADDED, "Medicine Added");
        expectedEventNames.put(NotificationType.MEDICINE_UPDATED, "Medicine Updated");
        expectedEventNames.put(NotificationType.MEDICINE_DELETED, "Medicine Deleted");
        expectedEventNames.put(NotificationType.SUPPLIER_ADDED, "Supplier Added");
        expectedEventNames.put(NotificationType.SUPPLIER_UPDATED, "Supplier Updated");
        expectedEventNames.put(NotificationType.SUPPLIER_DELETED, "Supplier Deleted");
        expectedEventNames.put(NotificationType.LOW_STOCK, "Low Stock Alert");
        expectedEventNames.put(NotificationType.OUT_OF_STOCK, "Out of Stock Alert");
        expectedEventNames.put(NotificationType.NEAR_EXPIRY, "Medicine Expiring within 30 Days");
        expectedEventNames.put(NotificationType.EXPIRED, "Medicine Expired");

        expectedEventNames.forEach((type, eventName) -> notificationService.create(
                type,
                1L,
                eventName,
                eventName + " message",
                true,
                emailDetails()
        ));

        ArgumentCaptor<AdminEmailNotificationEvent> eventCaptor = ArgumentCaptor.forClass(AdminEmailNotificationEvent.class);
        verify(eventPublisher, org.mockito.Mockito.times(expectedEventNames.size())).publishEvent(eventCaptor.capture());

        assertThat(eventCaptor.getAllValues())
                .extracting(AdminEmailNotificationEvent::eventName)
                .containsExactlyElementsOf(expectedEventNames.values());
        eventCaptor.getAllValues().forEach(event -> {
            assertThat(event.details()).containsEntry("Medicine Name", "Test Medicine");
            assertThat(event.details()).containsEntry("Supplier Name", "Test Supplier");
            assertThat(event.details()).containsEntry("Batch Number", "BATCH-1");
            assertThat(event.details()).containsEntry("Quantity", "5");
            assertThat(event.details()).containsEntry("Minimum Stock", "10");
            assertThat(event.details()).containsEntry("Expiry Date", "2026-08-30");
            assertThat(event.details()).containsEntry("Action Performed", event.eventName());
            assertThat(event.details()).containsKey("User");
            assertThat(event.details()).containsKey("Date");
            assertThat(event.details()).containsKey("Time");
        });
    }

    private Map<String, String> emailDetails() {
        Map<String, String> details = new LinkedHashMap<>();
        details.put("Medicine Name", "Test Medicine");
        details.put("Supplier Name", "Test Supplier");
        details.put("Batch Number", "BATCH-1");
        details.put("Quantity", "5");
        details.put("Minimum Stock", "10");
        details.put("Expiry Date", "2026-08-30");
        details.put("Direct Link", "http://localhost:5173/?view=Medicines&medicineId=1");
        return details;
    }
}
