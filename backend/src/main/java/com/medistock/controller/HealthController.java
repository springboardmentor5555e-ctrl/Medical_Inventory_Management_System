package com.medistock.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

/**
 * Simple, unauthenticated health check.
 * Visit http://localhost:8080/api/health in your browser — if you see JSON back,
 * the backend is running and reachable.
 */
@RestController
public class HealthController {

    @GetMapping("/api/health")
    public Map<String, Object> health() {
        return Map.of(
                "status", "UP",
                "service", "medistock-backend",
                "timestamp", Instant.now().toString()
        );
    }
}
