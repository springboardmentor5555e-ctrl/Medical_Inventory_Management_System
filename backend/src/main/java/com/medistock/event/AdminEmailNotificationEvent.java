package com.medistock.event;

import java.util.Map;

public record AdminEmailNotificationEvent(
        String eventName,
        Map<String, String> details
) {
}
