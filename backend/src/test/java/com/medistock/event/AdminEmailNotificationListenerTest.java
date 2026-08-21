package com.medistock.event;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.medistock.service.EmailService;
import java.util.Map;
import org.junit.jupiter.api.Test;

class AdminEmailNotificationListenerTest {

    @Test
    void listenerExecutesAndCallsEmailService() {
        EmailService emailService = mock(EmailService.class);
        when(emailService.sendAdminEventEmail("Medicine Added", Map.of("Medicine Name", "Test Medicine"))).thenReturn(true);

        AdminEmailNotificationListener listener = new AdminEmailNotificationListener(emailService);
        listener.onAdminEmailNotification(new AdminEmailNotificationEvent("Medicine Added", Map.of("Medicine Name", "Test Medicine")));

        verify(emailService).sendAdminEventEmail("Medicine Added", Map.of("Medicine Name", "Test Medicine"));
    }
}
