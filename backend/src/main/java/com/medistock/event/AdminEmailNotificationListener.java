package com.medistock.event;

import com.medistock.service.EmailService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminEmailNotificationListener {

    private final EmailService emailService;

    @PostConstruct
    void logRegistration() {
        log.info("AdminEmailNotificationListener registered as a Spring bean");
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onAdminEmailNotification(AdminEmailNotificationEvent event) {
        log.info("AdminEmailNotificationListener executing event '{}' on thread '{}'", event.eventName(), Thread.currentThread().getName());
        try {
            if (emailService.sendAdminEventEmail(event.eventName(), event.details())) {
                log.info("MediStock administrator email completed for event '{}'", event.eventName());
            }
        } catch (RuntimeException ex) {
            log.warn("Failed to send MediStock administrator email for event '{}'", event.eventName(), ex);
        }
    }
}
